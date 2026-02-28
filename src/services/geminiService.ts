// src/services/geminiService.ts

export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const env = (import.meta as any).env || {};
const DEBUG: boolean = String(env.VITE_DEBUG || "") === "1";

/**
 * tenant_id:
 * - 建議：用 URL query ?t=xxxx（embed/客戶網站最好）
 * - 備用：用 VITE_TENANT_ID（你自己站 demo 可以）
 */
function getTenantId(): string {
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get("t") || url.searchParams.get("tenant");
    if (fromQuery) return String(fromQuery).trim();
  } catch {}

  const fromEnv = String(env.VITE_TENANT_ID || "").trim();
  return fromEnv;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function consultAI(prompt: string): Promise<ConsultResult> {
  const tenant_id = getTenantId();
  if (!tenant_id) {
    return {
      ok: false,
      level: "hard",
      message: "Missing tenant_id (use ?t=TENANT_ID or set VITE_TENANT_ID)",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    if (DEBUG) {
      console.log("[consultAI] request ->", {
        url: "/api/consult",
        tenant_id,
        promptLen: String(prompt || "").length,
      });
    }

    const res = await fetch("/api/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant_id, prompt }),
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = safeJsonParse(text) || { reply: text };
    }

    if (DEBUG) {
      console.log("[consultAI] response <-", {
        ok: res.ok,
        status: res.status,
        contentType,
        hasReply: !!String(data?.reply || "").trim(),
        hasError: !!String(data?.error || "").trim(),
      });
    }

    // ✅ Success path
    const reply = String(data?.reply || "").trim();
    if (reply) return { ok: true, reply };

    // ✅ Soft errors (worker ok but empty / or returned error text)
    if (res.ok) {
      return {
        ok: false,
        level: "soft",
        message: "我未完全理解你嘅問題，可以再講清楚少少嗎？",
        details: data,
      };
    }

    return {
      ok: false,
      level: "soft",
      message:
        String(data?.error || "").trim() ||
        `系統暫時未能處理你嘅問題（HTTP ${res.status}），可以再試一次嗎？`,
      details: data,
    };
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    if (DEBUG) console.warn("[consultAI] fetch error:", err);
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
