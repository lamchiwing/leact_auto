// functions/api/consult.ts
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // CORS preflight handled above; still keep safe headers
  const headers = corsHeaders();

  try {
    const WORKER_URL = String(env.WORKER_URL || "").trim().replace(/\/+$/, "");
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

    // always return JSON to frontend
    if (res.ok) {
      return json({ reply: String(data?.reply || "").trim() }, 200, headers);
    }

    return json(
      {
        ok: false,
        error: String(data?.error || "").trim() || `Worker error (HTTP ${res.status})`,
        details: data,
      },
      502,
      headers
    );
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
    return json(
      { ok: false, error: isAbort ? "Proxy timeout (12s)" : "Proxy error", details: String(e?.message || e) },
      502,
      headers
    );
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

// Cloudflare Pages Env typing (optional)
type Env = {
  WORKER_URL: string;
  TENANT_ID: string;
  TENANT_KEY: string;
};
