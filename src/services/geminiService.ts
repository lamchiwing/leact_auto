// src/services/geminiService.ts

export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const env = (import.meta as any).env || {};
const DEBUG = String(env.VITE_DEBUG || "") === "1";

function getTenantId(): string {
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get("t") || url.searchParams.get("tenant");
    if (fromQuery) return String(fromQuery).trim();
  } catch {}

  const fromEnv = String(env.VITE_TENANT_ID || "").trim();
  return fromEnv;
}

export async function consultAI(prompt: string): Promise<ConsultResult> {
  const tenant_id = getTenantId();

  if (!tenant_id) {
    return {
      ok: false,
      level: "hard",
      message: "Missing tenant_id",
      details: "Use ?t=ppaycrejia or set VITE_TENANT_ID",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    if (DEBUG) {
      console.log("[consultAI] request", { tenant_id, promptLen: prompt.length });
    }

    const res = await fetch("/api/consult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenant_id, prompt }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (DEBUG) {
      console.log("[consultAI] response", data);
    }

    const reply = String(data?.reply || "").trim();
    if (reply) {
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
