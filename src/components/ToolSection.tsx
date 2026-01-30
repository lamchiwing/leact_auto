
import React from 'react';
import { TOOLS } from '../constants';
import { Tool } from '../types';

interface ToolSectionProps {
  onSelectTool: (tool: Tool) => void;
}

const ToolSection: React.FC<ToolSectionProps> = ({ onSelectTool }) => {
  return (
    <section id="tools" className="py-24 px-6 md:px-12 bg-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">5 大自動化動力包</h2>
          <div className="h-2 w-24 bg-[#e0b81f] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOOLS.map((tool) => (
            <div key={tool.id} className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300 shadow-xl flex flex-col h-full border-2 border-transparent hover:border-black/10">
              <div className="flex justify-between items-start mb-6">
                <div className="text-5xl float-anim inline-block">{tool.icon}</div>
                <div className="bg-black text-[#e0b81f] px-3 py-1 rounded-full text-xs font-black">
                  HKD ${tool.price}/mo
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 text-black group-hover:text-[#ff5ec4] transition-colors">{tool.title}</h3>
              <p className="font-bold text-gray-700 mb-6 flex-grow">{tool.description}</p>
              
              <ul className="space-y-2 mb-8 border-t border-black/5 pt-4">
                {tool.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-[#ff5ec4] rounded-full"></span>
                    {detail}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onSelectTool(tool)}
                className="w-full bg-black text-white py-4 rounded-xl font-black text-lg hover:bg-[#e0b81f] hover:text-black transition-all shadow-lg active:scale-95"
              >
                立即租用
              </button>
            </div>
          ))}
          
          {/* A special card for "Talk to Expert" */}
          <div className="bg-[#e0b81f] p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center border-4 border-black border-dashed opacity-90">
            <div className="text-4xl mb-4 font-black">AI</div>
            <h3 className="text-2xl font-black mb-4 text-black">唔知邊款岩你？</h3>
            <p className="font-bold mb-6 text-black/80">話比我哋嘅 AI 專家聽，即刻為你推薦最合適方案。</p>
            <button 
              onClick={() => document.getElementById('consultant')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-black text-white px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform"
            >
              即刻咨詢
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolSection;
