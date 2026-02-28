// functions/api/consult.ts

type Env = {
  WORKER_URL: string;  // e.g. https://dry-violet-a862....workers.dev
  TENANT_ID: string;   // server-side tenant id (single-tenant phase)
  TENANT_KEY: string;  // server-side tenant key (secret)
};

type CFContext = {
  request: Request;
  env: Env;
};

function corsHeaders(origin?: string) {
  // 如果你同源（Pages 同域名），其實唔一定要 "*"；
  // 但用 "*" 方便你 local / preview / 其他域測試。
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(obj: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function normalizeBaseUrl(raw: string) {
  let s = String(raw || "").trim();
  if (!s) return "";
  s = s.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }: CFContext) => {
  const origin = request.headers.get("Origin") || undefined;
  const headers = corsHeaders(origin);

  // Handle OPTIONS (preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Only allow POST
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, headers);
  }

  try {
    const WORKER_URL = normalizeBaseUrl(env.WORKER_URL);
    const TENANT_ID = String(env.TENANT_ID || "").trim();
    const TENANT_KEY = String(env.TENANT_KEY || "").trim();

    if (!WORKER_URL || !TENANT_ID || !TENANT_KEY) {
      return json(
        {
          ok: false,
          error: "Missing server env vars (WORKER_URL / TENANT_ID / TENANT_KEY)",
          details: {
            hasWorkerUrl: !!WORKER_URL,
            hasTenantId: !!TENANT_ID,
            hasTenantKey: !!TENANT_KEY,
          },
        },
        500,
        headers
      );
    }

    const body = await request.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();

    if (!prompt) {
      return json({ ok: false, error: "Missing prompt" }, 400, headers);
    }

    // timeout 12s
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);

    let res: Response;
    try {
      res = await fetch(`${WORKER_URL}/api/consult`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": TENANT_ID,
          "X-Tenant-Key": TENANT_KEY,
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(t);
    }

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { reply: text };
    }

    const reply = String(data?.reply || "").trim();

    // Worker success
    if (res.ok) {
      if (reply) {
        return json({ ok: true, reply }, 200, headers);
      }
      // 200 but empty reply -> soft error
      return json(
        {
          ok: false,
          level: "soft",
          error: "Empty reply from worker",
          details: data,
        },
        200,
        headers
      );
    }

    // Worker error
    return json(
      {
        ok: false,
        level: "soft",
        error: String(data?.error || "").trim() || `Worker error (HTTP ${res.status})`,
        status: res.status,
        details: data,
      },
      502,
      headers
    );
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
    return json(
      {
        ok: false,
        level: "hard",
        error: isAbort ? "Proxy timeout (12s)" : "Proxy error",
        details: String(e?.message || e),
      },
      502,
      headers
    );
  }
};
