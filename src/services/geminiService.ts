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
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${WORKER_BASE}/api/consult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    // ✅ 1️⃣ 只要有任何可用 reply，就當成功（最重要）
    const reply = String(data?.reply || "").trim();
    if (reply.length > 0) {
      return { ok: true, reply };
    }

    // 🟡 2️⃣ Worker 有回，但真係冇內容（AI 回唔到）
    if (res.ok) {
      return {
        ok: false,
        level: "soft",
        message: "我未完全理解你嘅問題，可以再講清楚少少嗎？",
        details: data,
      };
    }

    // 🟡 3️⃣ Worker / Gemini error（但非 network）
    return {
      ok: false,
      level: "soft",
      message:
        String(data?.error || "").trim() ||
        "系統暫時未能處理你嘅問題，可以再試一次嗎？",
      details: data,
    };
  } catch (err: any) {
    // 🔴 4️⃣ 真・network / timeout
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
