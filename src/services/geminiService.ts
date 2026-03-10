export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const env = (import.meta as any).env || {};
const DEBUG = String(env.VITE_DEBUG || "") === "1";

function getTenantId(): string {
  try {
    const url = new URL(window.location.href);

    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    if (path && path !== "index.html") return path;

    const fromQuery =
      url.searchParams.get("t") ||
      url.searchParams.get("tenant");
    if (fromQuery) return String(fromQuery).trim();
  } catch {}

  return String(env.VITE_TENANT_ID || "").trim();
}

export async function consultAI(prompt: string): Promise<ConsultResult> {
  const tenant_id = getTenantId();
  const cleanPrompt = String(prompt || "").trim();

  if (!tenant_id) {
    return {
      ok: false,
      level: "hard",
      message: "Missing tenant_id",
      details: "Use ?t=ppaycrejia or set VITE_TENANT_ID",
    };
  }

  if (!cleanPrompt) {
    return {
      ok: false,
      level: "soft",
      message: "Missing prompt",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    if (DEBUG) {
      console.log("[consultAI] request", {
        tenant_id,
        prompt: cleanPrompt,
      });
    }

    const res = await fetch("/api/consult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenant_id,
        prompt: cleanPrompt,
      }),
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { raw: text };
    }

    if (DEBUG) {
      console.log("[consultAI] response", {
        status: res.status,
        data,
      });
    }

    const reply = String(data?.reply || "").trim();

    if (res.ok && reply) {
      return { ok: true, reply };
    }

    return {
      ok: false,
      level: "soft",
      message:
        String(data?.error || "").trim() ||
        "我未完全理解你嘅問題，可以再講清楚少少嗎？",
      details: data,
    };
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    return {
      ok: false,
      level: "hard",
      message: isAbort ? "請求超時（12s）" : "Network error",
      details: String(err?.message || err),
    };
  } finally {
    clearTimeout(timeout);
  }
}
