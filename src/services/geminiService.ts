// src/services/geminiService.ts

export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const env = (import.meta as any).env || {};

const WORKER_BASE_RAW: string = env.VITE_WORKER_URL || "";
const TENANT_ID: string = env.VITE_TENANT_ID || "";
const TENANT_KEY: string = env.VITE_TENANT_KEY || "";

// Optional debug flag (set VITE_DEBUG=1 in Pages variables if needed)
const DEBUG: boolean = String(env.VITE_DEBUG || "") === "1";

// normalize: remove trailing slash
let WORKER_BASE = WORKER_BASE_RAW.replace(/\/+$/, "").trim();

// ensure scheme
if (WORKER_BASE && !/^https?:\/\//i.test(WORKER_BASE)) {
  WORKER_BASE = `https://${WORKER_BASE}`;
}

function missingVars() {
  const missing: string[] = [];
  if (!WORKER_BASE) missing.push("VITE_WORKER_URL");
  if (!TENANT_ID) missing.push("VITE_TENANT_ID");
  if (!TENANT_KEY) missing.push("VITE_TENANT_KEY");
  return missing;
}

export async function consultAI(prompt: string): Promise<ConsultResult> {
  const missing = missingVars();
  if (missing.length) {
    if (DEBUG) {
      console.log("[consultAI] missing vars:", missing, {
        hasWorkerUrl: !!WORKER_BASE,
        hasTenantId: !!TENANT_ID,
        hasTenantKey: !!TENANT_KEY,
      });
    }
    return {
      ok: false,
      level: "hard",
      message: `Missing ${missing.join(", ")}`,
      details: {
        hasWorkerUrl: !!WORKER_BASE,
        hasTenantId: !!TENANT_ID,
        hasTenantKey: !!TENANT_KEY,
      },
    };
  }

  if (DEBUG) {
    console.log("[consultAI] request ->", {
      url: `${WORKER_BASE}/api/consult`,
      hasTenantId: !!TENANT_ID,
      hasTenantKey: !!TENANT_KEY, // do NOT print key
      promptLen: String(prompt || "").length,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${WORKER_BASE}/api/consult`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": TENANT_ID,
        "X-Tenant-Key": TENANT_KEY,
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { reply: text };
    }

    if (DEBUG) {
      console.log("[consultAI] response <-", {
        ok: res.ok,
        status: res.status,
        contentType,
        hasReply: !!String(data?.reply || "").trim(),
      });
    }

    const reply = String(data?.reply || "").trim();
    if (reply) return { ok: true, reply };

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
