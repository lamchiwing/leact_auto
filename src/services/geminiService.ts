const SYSTEM_INSTRUCTION = `
你是 KACH & Partner 的自動化專家顧問。你的目標是根據用戶的業務痛點，推薦我們 5 套自動化工具中的其中一套：
1. Lead Intake & Routing
2. Internal Ops Automation
3. Customer Support Automation
4. Reporting & Monitoring Automation
5. Compliance / Process Guardrails
請用生動、專業且具備親和力的方式對話。保持回答精簡，每次不超過 100 字。
`;

// ✅ 建議用 Vite env：VITE_WORKER_URL
const WORKER_BASE = (import.meta as any).env?.VITE_WORKER_URL || "";

export async function getConsultationResponse(
  userMessage: string,
  history: { role: "user" | "model"; content: string }[]
) {
  if (!WORKER_BASE) throw new Error("Missing VITE_WORKER_URL");

  // 簡單把最近幾句對話帶埋（可選）
  const lastTurns = history.slice(-6).map(m => `${m.role === "user" ? "用戶" : "顧問"}：${m.content}`).join("\n");

  const prompt = `${SYSTEM_INSTRUCTION}\n\n${lastTurns}\n用戶：${userMessage}\n顧問：`;

  const res = await fetch(`${WORKER_BASE}/api/consult`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Worker error");
  return data.reply as string;
}
