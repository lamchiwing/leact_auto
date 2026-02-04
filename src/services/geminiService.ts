export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const WORKER_BASE = (import.meta as any).env?.VITE_WORKER_URL || "";

export async function consultAI(prompt: string): Promise<ConsultResult> {
  if (!WORKER_BASE) {
    return { ok: false, level: "hard", message: "Missing VITE_WORKER_URL" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch(`${WORKER_BASE}/api/consult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    // ✅ 正常
    const reply = String(data?.reply || "").trim();
    if (res.ok && reply.length > 0) {
      return { ok: true, reply };
    }

    // 🟡 Soft：Worker 有回應，但 Gemini/格式/內容有問題
    // （例如 502 Gemini error、Empty reply、或者 reply 為空）
    if (res.status >= 400 && res.status < 600) {
      const msg =
        String(data?.error || "").trim() ||
        "多謝查詢，我未完全理解你嘅問題，可以換個方法講一次嗎？";
      return { ok: false, level: "soft", message: msg, details: data };
    }

    // 🟡 其他不明但仍屬 soft
    return {
      ok: false,
      level: "soft",
      message: "我未完全理解你嘅問題，可以再講清楚少少嗎？",
      details: data,
    };
  } catch (err: any) {
    // 🔴 Hard：Network/timeout/被 abort
    const isAbort = err?.name === "AbortError";
    return {
      ok: false,
      level: "hard",
      message: isAbort ? "請求超時" : "Network error",
      details: String(err?.message || err),
    };
  } finally {
    clearTimeout(timeout);
  }
}
