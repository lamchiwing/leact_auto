import React, { useState } from "react";
import { consultAI } from "../services/geminiService";

const WHATSAPP_LINK =
  "https://wa.me/85290858188?text=" + encodeURIComponent("你好，我想了解 LEACT 自動化方案");

type Msg = { role: "user" | "assistant"; content: string };

export default function AIConsultant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    setInput("");
    push({ role: "user", content: text });

    // 你可以加 system prompt（品牌顧問語氣）
    const prompt =
      `你是 LEACT 自動化顧問。回答要精簡（<=100字），先問1個關鍵問題或直接推薦1個方案。\n\n用戶：${text}\n顧問：`;

    const result = await consultAI(prompt);

    // ✅ 1) 正常：直接顯示 AI 回覆
    if (result.ok) {
      push({ role: "assistant", content: result.reply });
      setBusy(false);
      return;
    }

    // 🟡 2) Soft fallback：AI 回覆怪/空/502（仍可繼續對話）
    if (result.level === "soft") {
      push({
        role: "assistant",
        content:
          `我未完全理解你嘅意思 🙏\n` +
          `你可唔可以補充：你想自動化「入線/客服/內部流程/報表」邊一部分？\n\n` +
          `（或者你都可以直接 WhatsApp 我哋，會快好多）`,
      });
      setBusy(false);
      return;
    }

    // 🔴 3) Hard fallback：network/timeout/worker 掛
    push({
      role: "assistant",
      content: `哎呀，系統繁忙中 😅 不如你直接 WhatsApp 我哋？`,
    });
    setBusy(false);
  };

  return (
    <div>
      {/* messages render (你原本點 render 就沿用) */}
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
            if (e.key === "Enter") send();
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

      {/* ✅ WhatsApp CTA（只係提示位；soft/hard 時都有引導） */}
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
