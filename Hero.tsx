
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[80vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      {/* Background blobs for dynamism */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e0b81f]/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/20 blur-3xl rounded-full"></div>
      
      <h1 className="text-6xl md:text-8xl font-black text-[#e0b81f] drop-shadow-2xl leading-tight mb-6">
        STOP REPEATING<br/>
        START AUTOMATING
      </h1>
      <p className="max-w-2xl text-xl md:text-2xl font-bold text-black opacity-90 mb-10 leading-relaxed">
        KACH & Partner 為企業打造全方位自動化工作流。<br/>
        讓科技處理瑣碎事，讓你專注於真正嘅增長。
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <button className="bg-black text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-white hover:text-black transition-all shadow-xl">
          查看解決方案
        </button>
        <button className="bg-white/30 backdrop-blur-md text-black border-2 border-white/50 px-10 py-4 rounded-xl font-black text-lg hover:bg-white transition-all">
          免費咨詢
        </button>
      </div>

      <div className="absolute bottom-10 animate-bounce cursor-pointer" onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </section>
  );
};

export default Hero;
