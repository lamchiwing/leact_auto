
import React from 'react';

const Header: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-pink-vibrant/90 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-lg border-b border-white/20">
      <div className="text-2xl font-black tracking-tighter text-black flex items-center gap-2">
        <span className="bg-black text-white px-2 py-0.5 rounded">KACH</span>
        <span>& Partner</span>
      </div>
      <div className="hidden md:flex gap-8 font-bold text-sm uppercase tracking-widest">
        <a href="#tools" className="hover:text-gold transition-colors">Tools</a>
        <a href="#consultant" className="hover:text-gold transition-colors">Consultant</a>
        <a href="#pricing" className="hover:text-gold transition-colors">Pricing</a>
      </div>
      <button className="bg-[#e0b81f] text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-md">
        Get Started
      </button>
    </nav>
  );
};

export default Header;
