// functions/api/admin/create-tenant.ts

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = cors();

  // auth
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (!env.ADMIN_API_KEY || adminKey !== env.ADMIN_API_KEY) {
    return json({ ok: false, error: "unauthorized" }, 401, headers);
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const plan = String(body?.plan || "starter").toLowerCase();

  if (!name) return json({ ok: false, error: "name required" }, 400, headers);
  if (!["starter", "growth", "pro", "enterprise"].includes(plan)) {
    return json({ ok: false, error: "invalid plan" }, 400, headers);
  }

  const tenant_id = uid(10);
  const tenant_key = uid(24);

  const record: TenantRecord = {
    tenant_id,
    tenant_key,
    name,
    plan: plan as any,
    status: "active",
    brand_prompt:
      "你是 LEACT 的 AI 自動化顧問。這是一個 SaaS 平台，不是課程，不是法律服務。",
    created_at: new Date().toISOString(),
  };

  await env.TENANTS.put(`tenant:${tenant_id}`, JSON.stringify(record));

  // ✅ 只返一次 key
  return json(
    {
      ok: true,
      tenant_id,
      tenant_key,
      note: "Save this key now. It will not be shown again.",
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
  TENANTS: KVNamespace; // binding TENANTS -> leact-tenants
};

type TenantRecord = {
  tenant_id: string;
  tenant_key: string;
  name: string;
  plan: "starter" | "growth" | "pro" | "enterprise";
  status: "active" | "suspended";
  brand_prompt: string;
  created_at: string;
};
