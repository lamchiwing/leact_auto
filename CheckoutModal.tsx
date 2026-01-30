
import React, { useState, useEffect } from 'react';
import { Tool } from '../types';

interface CheckoutModalProps {
  tool: Tool | null;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ tool, onClose }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('success'), 600);
            return 100;
          }
          return prev + 4;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!tool) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="glass-card relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-black animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-black hover:rotate-90 transition-transform p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="p-10">
          {step === 'details' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#e0b81f] text-black text-xs font-black px-3 py-1 rounded-full inline-block mb-4">CONFIRM ORDER</div>
              <h3 className="text-3xl font-black mb-1">{tool.title}</h3>
              <p className="font-bold text-gray-500 mb-8">正在啟動企業級自動化流程</p>
              
              <div className="bg-black text-white rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="opacity-60 font-bold">訂閱方案</span>
                    <span className="font-black">Monthly Professional</span>
                  </div>
                  <div className="h-px bg-white/10 w-full mb-4"></div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-xl text-[#e0b81f]">應付總額</span>
                    <div className="text-right">
                      <span className="text-sm block opacity-50 font-bold">HKD / 每月</span>
                      <span className="text-4xl font-black">${tool.price}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 text-white/5 text-9xl font-black pointer-events-none">KACH</div>
              </div>

              <button 
                onClick={() => setStep('processing')}
                className="w-full bg-[#ff5ec4] text-black py-5 rounded-2xl font-black text-2xl hover:bg-[#e0b81f] transition-all shadow-xl active:scale-95"
              >
                確認並立即支付
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-10 animate-in fade-in duration-500">
              <div className="relative w-32 h-32 mx-auto mb-10">
                <div className="absolute inset-0 border-8 border-black/5 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-8 border-t-[#ff5ec4] border-r-[#e0b81f] rounded-full animate-spin"
                  style={{ animationDuration: '1s' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
                  {progress}%
                </div>
              </div>
              <h3 className="text-2xl font-black mb-2 italic">INITIALIZING AUTOMATION</h3>
              <p className="font-bold opacity-60">正在串接您的 API 及資料庫...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-10 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h3 className="text-4xl font-black mb-4">訂閱已成功！</h3>
              <p className="font-bold text-lg mb-8 leading-relaxed px-4 text-gray-600">
                系統已開始為您部署 <span className="text-black underline underline-offset-4 decoration-[#ff5ec4] decoration-4">{tool.title}</span>。<br/>
                技術團隊將在 15 分鐘內與您聯繫。
              </p>
              <button 
                onClick={onClose}
                className="bg-black text-white px-12 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
              >
                返回控制台
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
