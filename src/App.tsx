
import React, { useState } from 'react';
import Header from "./components/Header";
import Hero from './components/Hero';
import ToolSection from './components/ToolSection';
import AIConsultant from './components/AIConsultant';
import CheckoutModal from './components/CheckoutModal';
import { Tool } from './types';

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  return (
    <div className="min-h-screen relative">
      <Header />
      <main>
        <Hero />
        
        {/* Dynamic Ticker Section */}
        <div className="bg-black py-4 overflow-hidden whitespace-nowrap border-y-2 border-[#e0b81f] flex">
          <div className="animate-marquee flex gap-12 text-[#e0b81f] font-black text-xl uppercase italic">
            {[...Array(10)].map((_, i) => (
              <span key={i}>🚀 Efficiency Guaranteed • Automated Workflow • KACH & Partner • 0 Human Error • Scalable Ops • </span>
            ))}
          </div>
        </div>

        <ToolSection onSelectTool={(tool) => setSelectedTool(tool)} />

        <AIConsultant />

        {/* Pricing/Closing Section */}
        <section id="pricing" className="py-24 px-6 bg-gradient-to-t from-[#ff4dc9] to-[#ff5ec4] text-center">
          <div className="max-w-4xl mx-auto glass-card p-12 rounded-[3rem] border-4 border-black shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-black text-[#e0b81f] font-black px-6 py-2 rounded-bl-3xl">LIMITED TIME OFFER</div>
            <h2 className="text-5xl font-black mb-8">Ready to Scale?</h2>
            <p className="text-2xl font-bold mb-10 leading-relaxed">
              所有工具均以<span className="text-black bg-[#e0b81f] px-2 ml-1 mr-1">月租形式</span>提供。<br/>
              無須高昂開發費，彈性訂閱，隨時擴張。
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <button 
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-black text-white text-2xl font-black px-12 py-5 rounded-2xl hover:scale-105 transition-transform shadow-xl"
              >
                立即挑選方案
              </button>
              <button className="bg-white text-black text-2xl font-black px-12 py-5 rounded-2xl border-4 border-black hover:bg-black hover:text-white transition-all shadow-xl">
                聯絡專員
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-2xl font-black mb-2">KACH & Partner</div>
            <p className="opacity-50 font-bold">© 2024 KACH & Partner Automation Group. All rights reserved.</p>
          </div>
          <div className="flex gap-8 opacity-70 font-bold">
            <a href="#" className="hover:text-[#e0b81f]">Privacy</a>
            <a href="#" className="hover:text-[#e0b81f]">Terms</a>
            <a href="#" className="hover:text-[#e0b81f]">WhatsApp</a>
          </div>
        </div>
      </footer>

      {/* Subscription Modal */}
      {selectedTool && (
        <CheckoutModal 
          tool={selectedTool} 
          onClose={() => setSelectedTool(null)} 
        />
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in {
          animation-fill-mode: forwards;
        }
        .fade-in { animation-name: fade-in; }
        .zoom-in { animation-name: zoom-in; }
        .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom; }
      `}</style>
    </div>
  );
};

export default App;
