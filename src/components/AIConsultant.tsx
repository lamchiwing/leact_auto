import React, { useMemo, useState } from "react";
import { consultAI } from "../services/geminiService";

const WHATSAPP_LINK =
  "https://wa.me/85290858188?text=" + encodeURIComponent("你好，我想了解 LEACT 自動化方案");

type Msg = { role: "user" | "assistant"; content: string };

export default function AIConsultant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const isDev = useMemo(() => {
    // Vite：import.meta.env.DEV 只可在 module 內用（而家係 TSX module ok）
    try {
      return Boolean((import.meta as any).env?.DEV);
    } catch {
      return false;
    }
  }, []);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);

  const removeThinkingBubble = () => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role === "assistant" && last.content === "處理中…") {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    setInput("");
    push({ role: "user", content: text });

    // ✅ 顯示「處理中…」
    push({ role: "assistant", content: "處理中…" });

    // ✅ 更短、更穩、更貼廣東話
    const prompt =
      `你係 LEACT 自動化顧問，用廣東話答。回答要精簡（<=100字）。` +
      `先問 1 個關鍵問題 或 直接推薦 1 個方案。\n\n` +
      `用戶：${text}\n顧問：`;

    let result: any;
    try {
      result = await consultAI(prompt);
    } catch (e: any) {
      result = { ok: false, level: "hard", message: "Unexpected error", details: String(e?.message || e) };
    } finally {
      // ✅ 無論成功/失敗都先移除「處理中…」bubble
      removeThinkingBubble();
      setBusy(false);
    }

    // 1) ✅ 正常
    if (result?.ok) {
      const reply = String(result.reply || "").trim();
      push({ role: "assistant", content: reply || "收到。我想了解：你而家最想自動化邊個流程？" });
      return;
    }

    // 2) 🟡 Soft fallback（AI 有回但怪 / 502 / 空 reply）
    if (result?.level === "soft") {
      push({
        role: "assistant",
        content:
          `我未完全理解你嘅意思 🙏\n` +
          `你可唔可以補充：你想自動化「入線 / 客服 / 內部流程 / 報表」邊一部分？\n\n` +
          `（或者你都可以直接 WhatsApp 我哋，會快好多）`,
      });
      return;
    }

    // 3) 🔴 Hard fallback（network / timeout / worker 掛）
    // ✅ Dev 時把原因放入 console（production 不顯示）
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn("[consultAI hard error]", result);
    }

    push({
      role: "assistant",
      content: `哎呀，系統繁忙中 😅 不如你直接 WhatsApp 我哋？`,
    });
  };

  return (
    <div>
      {/* messages */}
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className="inline-block max-w-[85%] rounded-2xl px-4 py-3 bg-white/20">
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* input + send */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl px-3 py-2"
          placeholder={busy ? "處理中..." : "輸入訊息…"}
          disabled={busy}
          onKeyDown={(e) => {
            // ✅ 避免中文輸入法 composing 時誤送
            if ((e as any).isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          onClick={send}
          disabled={busy}
          className="rounded-xl px-4 py-2 bg-black text-white font-bold"
        >
          Send
        </button>
      </div>

      {/* WhatsApp CTA */}
      <div className="mt-3">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-bold underline"
        >
          即刻 WhatsApp 我哋
        </a>
      </div>
    </div>
  );
}
