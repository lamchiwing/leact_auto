interface Env {
  WORKER_URL: string;
  TENANTS: KVNamespace;
  USAGE: KVNamespace;
}

type CFContext = {
  request: Request;
  env: Env;
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

    const body = await request.json();
    const prompt = String(body?.prompt || "").trim();
    const tenantId = String(body?.tenant_id || "").trim();

    if (!tenantId) {
      return json({ ok: false, error: "Missing tenant_id" }, 400);
    }

    if (!prompt) {
      return json({ ok: false, error: "Missing prompt" }, 400);
    }

    // 🔐 從 KV 取得 tenant
    const tenant = await env.TENANTS.get(tenantId, { type: "json" });

    if (!tenant) {
      return json({ ok: false, error: "Invalid tenant" }, 403);
    }

    const workerUrl = env.WORKER_URL.replace(/\/$/, "");

    const res = await fetch(`${workerUrl}/api/consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
        "X-Tenant-Key": tenant.key,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    return json(data, res.status);

  } catch (e: any) {

    return json({
      ok: false,
      error: "Proxy error",
      details: String(e?.message || e),
    }, 500);

  }
};
