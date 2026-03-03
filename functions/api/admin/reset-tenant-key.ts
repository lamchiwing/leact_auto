// functions/api/admin/reset-tenant-key.ts

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = cors();

  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (!env.ADMIN_API_KEY || adminKey !== env.ADMIN_API_KEY) {
    return json({ ok: false, error: "unauthorized" }, 401, headers);
  }

  const body = await request.json().catch(() => ({}));
  const tenant_id = String(body?.tenant_id || "").trim();
  if (!tenant_id) return json({ ok: false, error: "tenant_id required" }, 400, headers);

  const raw = await env.TENANTS.get(`tenant:${tenant_id}`);
  if (!raw) return json({ ok: false, error: "tenant not found" }, 404, headers);

  const record = JSON.parse(raw);
  const newKey = uid(24);
  record.tenant_key = newKey;
  record.key_rotated_at = new Date().toISOString();

  await env.TENANTS.put(`tenant:${tenant_id}`, JSON.stringify(record));

  return json(
    {
      ok: true,
      tenant_id,
      tenant_key: newKey,
      note: "Old key is now invalid.",
    },
    200,
    headers
  );
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj: any, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

function uid(len = 16) {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

type Env = {
  ADMIN_API_KEY: string;
  TENANTS: KVNamespace;
};
