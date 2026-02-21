// src/services/geminiService.ts

export type ConsultResult =
  | { ok: true; reply: string }
  | { ok: false; level: "soft"; message: string; details?: any }
  | { ok: false; level: "hard"; message: string; details?: any };

const env = (import.meta as any).env || {};

const WORKER_BASE_RAW: string = env.VITE_WORKER_URL || "";
const TENANT_ID: string = env.VITE_TENANT_ID || "";
const TENANT_KEY: string = env.VITE_TENANT_KEY || "";

// normalize: remove trailing slash
const WORKER_BASE = WORKER_BASE_RAW.replace(/\/+$/, "");

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${WORKER_BASE}/api/consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": TENANT_ID,
        "X-Tenant-Key": TENANT_KEY,
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    // Try JSON first, fallback to text
    const contentType = res.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      // if worker returned plain text, wrap it
      data = { reply: text };
    }

    const reply = String(data?.reply || "").trim();
    if (reply) return { ok: true, reply };

    // Worker ok but no reply
    if (res.ok) {
      return {
        ok: false,
        level: "soft",
        message: "我未完全理解你嘅問題，可以再講清楚少少嗎？",
        details: data,
      };
    }

    // Worker returned error
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
