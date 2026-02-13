export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

// ✅ Default to your Worker URL, but allow override via VITE_WORKER_URL
const DEFAULT_WORKER_BASE = "https://dry-violet-a862.alisonlam0703.workers.dev";
const WORKER_BASE =
  (import.meta as any).env?.VITE_WORKER_URL?.trim() || DEFAULT_WORKER_BASE;

// ✅ Tenant auth headers required by your Worker
const TENANT_ID = (import.meta as any).env?.VITE_TENANT_ID?.trim() || "";
const TENANT_KEY = (import.meta as any).env?.VITE_TENANT_KEY?.trim() || "";

function normalizeBase(base: string) {
  return base.replace(/\/+$/, "");
}

export async function consultAI(prompt: string): Promise<ConsultResult> {
  const base = normalizeBase(WORKER_BASE);

  if (!base) {
    return { ok: false, level: "hard", message: "Missing worker base URL" };
  }

  if (!TENANT_ID || !TENANT_KEY) {
    return {
      ok: false,
      level: "hard",
      message: `Missing tenant credentials: ${
        !TENANT_ID && !TENANT_KEY
          ? "VITE_TENANT_ID + VITE_TENANT_KEY"
          : !TENANT_ID
          ? "VITE_TENANT_ID"
          : "VITE_TENANT_KEY"
      }`,
    };
  }

  const cleanPrompt = String(prompt || "").trim();
  if (!cleanPrompt) {
    return { ok: false, level: "soft", message: "請輸入內容先再提交" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${base}/api/consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": TENANT_ID,
        "X-Tenant-Key": TENANT_KEY,
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
      signal: controller.signal,
    });

    const data: any = await res.json().catch(() => ({}));

    // ✅ 1) Any usable reply => success
    const reply = String(data?.reply || "").trim();
    if (reply.length > 0) {
      return { ok: true, reply };
    }

    // ✅ 2) Worker returned OK but no reply => soft fallback
    if (res.ok) {
      return {
        ok: false,
        level: "soft",
        message: "我未完全理解你嘅問題，可以再講清楚少少嗎？",
        details: data,
      };
    }

    // ✅ 3) Non-OK status from Worker => map common cases
    if (res.status === 401) {
      return {
        ok: false,
        level: "hard",
        message: "Tenant 驗證失敗（請檢查 Tenant ID / Key）",
        details: data,
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        level: "soft",
        message: "而家太多人用緊，請稍後再試一次。",
        details: data,
      };
    }

    if (res.status === 402) {
      return {
        ok: false,
        level: "hard",
        message: "本月用量已達上限（quota exceeded）。",
        details: data,
      };
    }

    // Generic error
    return {
      ok: false,
      level: "soft",
      message:
        String(data?.error || "").trim() ||
        `系統暫時未能處理你嘅問題（HTTP ${res.status}），可以再試一次嗎？`,
      details: data,
    };
  } catch (err: any) {
    // ✅ 4) Real network / timeout
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
