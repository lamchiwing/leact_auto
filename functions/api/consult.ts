interface Env {
  WORKER_URL: string;
  TENANTS: KVNamespace;
  USAGE: KVNamespace;
}

type CFContext = {
  request: Request;
  env: Env;
};

type TenantRecord = {
  key?: string;
  plan?: string;
  name?: string;
};

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const onRequest: PagesFunction<Env> = async ({ request, env }: CFContext) => {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const prompt = String(body?.prompt || "").trim();
    const tenantId = String(body?.tenant_id || "").trim();

    if (!tenantId) {
      return json({ ok: false, error: "Missing tenant_id" }, 400);
    }

    if (!prompt) {
      return json({ ok: false, error: "Missing prompt" }, 400);
    }

    // 讀 KV：key = tenantId
    const tenant = await env.TENANTS.get<TenantRecord>(tenantId, "json");

    if (!tenant) {
      return json({ ok: false, error: "Invalid tenant" }, 403);
    }

    if (!tenant.key) {
      return json(
        {
          ok: false,
          error: "Tenant key missing in KV",
          details: { tenantId, tenant },
        },
        500
      );
    }

    const workerUrl = String(env.WORKER_URL || "").trim().replace(/\/+$/, "");
    if (!workerUrl) {
      return json({ ok: false, error: "Missing WORKER_URL" }, 500);
    }

    const res = await fetch(`${workerUrl}/api/consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
        "X-Tenant-Key": tenant.key,
      },
      body: JSON.stringify({ prompt }),
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { raw: text };
    }

    return json(
      {
        ok: res.ok,
        status: res.status,
        ...data,
      },
      res.status
    );
  } catch (e: any) {
    return json(
      {
        ok: false,
        error: "Proxy error",
        details: String(e?.message || e),
      },
      500
    );
  }
};
