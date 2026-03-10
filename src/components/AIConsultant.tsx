import React, { useState } from "react";
import { consultAI } from "../services/geminiService";

const WHATSAPP_LINK =
  "https://wa.me/85290858188?text=" +
  encodeURIComponent("你好，我想了解 LEACT 自動化方案");

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
    push({ role: "assistant", content: "處理中…" });

    let result: any;
    try {
      result = await consultAI(text);
    } catch (e) {
      result = {
        ok: false,
        level: "hard",
        message: "Unexpected error",
        details: String(e),
      };
    }

    setMessages((prev) => prev.slice(0, -1));

    if (result?.ok) {
      push({
        role: "assistant",
        content: String(result.reply || "").trim(),
      });
      setBusy(false);
      return;
    }

      if (result?.level === "soft") {
        push({
          role: "assistant",
          content:
            result?.message ||
            `我未完全理解你嘅意思 🙏\n` +
            `你可唔可以補充：你想自動化「入線 / 客服 / 內部流程 / 報表」邊一部分？\n\n` +
            `（或者你都可以直接 WhatsApp 我哋，會快好多）`,
      });
      setBusy(false);
      return;
    }

    push({
      role: "assistant",
      content: `哎呀，系統繁忙中 😅 不如你直接 WhatsApp 我哋？`,
    });
    setBusy(false);
  };

  return (
    <div>
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className="inline-block max-w-[85%] rounded-2xl px-4 py-3 bg-white/20">
              {m.content}
            </div>
          </div>
        ))}
      </div>

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
