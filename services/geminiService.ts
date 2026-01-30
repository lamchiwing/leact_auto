
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
你家是 KACH & Partner 的自動化專家顧問。你的目標是根據用戶的業務痛點，推薦我們 5 套自動化工具中的其中一套：
1. Lead Intake & Routing (針對查詢混亂)
2. Internal Ops Automation (針對行政重覆)
3. Customer Support Automation (針對客服壓力)
4. Reporting & Monitoring Automation (針對數據不透明)
5. Compliance / Process Guardrails (針對人為出錯)

請用生動、專業且具備親和力的方式對話。如果用戶提供具體情況，請解釋該工具如何幫到他們。
保持回答精簡，每次回答不超過 100 字。
`;

export async function getConsultationResponse(userMessage: string, history: { role: 'user' | 'model', content: string }[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  // Reconstruct history if needed, but for simplicity we can just send the current message
  // since this is a lightweight landing page consultant.
  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}
