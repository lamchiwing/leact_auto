import React, { useState, useRef, useEffect } from 'react';
import { getConsultationResponse } from "../services/geminiService";
import { ChatMessage } from '../types';

const AIConsultant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: '你好！我係 KACH & Partner 嘅自動化專員。你想解決邊方面嘅業務痛點？係查詢太多、行政太亂，定係數據唔清楚？' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getConsultationResponse(input, messages);
      setMessages(prev => [...prev, { role: 'model', content: response || '抱歉，暫時無法連接專家。' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: '哎呀，系統繁忙中。不如你直接 WhatsApp 我哋？' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="consultant" className="py-24 px-6 md:px-12 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black text-[#e0b81f] mb-6">AI 自動化顧問</h2>
            <p className="text-lg opacity-80 leading-relaxed mb-6">
              唔確定邊套系統最幫到你？<br/>
              直接話比我哋聽你每日最煩嘅事，我哋會為你揀選最合適嘅自動化工具。
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i+10}/100`} className="w-10 h-10 rounded-full border-2 border-black" />
                ))}
              </div>
              <span className="text-sm font-bold opacity-60">50+ 企業已使用</span>
            </div>
          </div>
          
          <div className="md:w-2/3 w-full glass-card bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col h-[500px]">
            <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl font-bold text-sm ${msg.role === 'user' ? 'bg-[#ff5ec4] text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-2xl text-xs animate-pulse">正在思考解決方案...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="話比我聽你嘅困難..."
                className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-[#e0b81f] transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-[#e0b81f] text-black px-6 py-3 rounded-xl font-black hover:scale-105 active:scale-95 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConsultant;
