// src/services/geminiService.ts

export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const env = (import.meta as any).env || {};
const DEBUG = String(env.VITE_DEBUG || "") === "1";

export async function consultAI(prompt: string): Promise<ConsultResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    if (DEBUG) console.log("[consultAI] POST /api/consult", { promptLen: prompt.length });

    const res = await fetch(`/api/consult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const data =
      contentType.includes("application/json")
        ? await res.json().catch(() => ({}))
        : { reply: await res.text().catch(() => "") };

    const reply = String(data?.reply || "").trim();
    if (reply) return { ok: true, reply };

    // res ok but empty
    if (res.ok) {
      return {
        ok: false,
        level: "soft",
        message: "我未完全理解你嘅問題，可以再講清楚少少嗎？",
        details: data,
      };
    }

    // error from proxy
    return {
      ok: false,
      level: "soft",
      message: String(data?.error || "").trim() || `系統暫時未能處理（HTTP ${res.status}）`,
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
