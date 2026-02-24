import React, { useState, useEffect } from 'react';
import { Terminal, Code2, Cpu, Database, Wifi, ShieldCheck, Binary } from 'lucide-react';

interface AcademyLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const MESSAGES = [
  "Booting Veleon OS...",
  "Initializing neural networks...",
  "Syncing digital curriculum...",
  "Compiling student resources...",
  "Securing academic terminal...",
  "Optimizing knowledge base...",
  "Connecting to global clusters...",
];

export const AcademyLoader: React.FC<AcademyLoaderProps> = ({ 
  message: initialMessage, 
  fullScreen = true 
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f18] backdrop-blur-xl"
    : "relative w-full h-64 flex flex-col items-center justify-center bg-[#0a0f18]/80 rounded-[2rem] overflow-hidden border border-white/5";

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes tech-float {
          0% { transform: translateY(10px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-60px) rotate(10deg); opacity: 0; }
        }
        @keyframes circuit-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-tech-float { animation: tech-float 2.5s infinite ease-in-out; }
        .animate-circuit { animation: circuit-pulse 3s infinite ease-in-out; }
        .animate-scan-line { animation: scan-line 4s infinite linear; }
        .animate-glitch { animation: glitch 0.3s infinite linear; }
        
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.8s; }
        .delay-3 { animation-delay: 1.4s; }
        .delay-4 { animation-delay: 2s; }
      `}</style>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Digital Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#00a9c0_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        
        {/* Scanning Beam */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#00a9c0]/20 to-transparent animate-scan-line z-10" />

        {/* Central Component */}
        <div className="relative z-20 group">
          <div className="absolute -inset-4 bg-[#00a9c0]/20 rounded-full blur-2xl animate-circuit" />
          <div className="bg-slate-900 p-8 rounded-3xl border border-[#00a9c0]/30 shadow-[0_0_50px_-12px_rgba(0,169,192,0.5)]">
            <Cpu className="w-16 h-16 text-[#00a9c0]" />
          </div>
          
          {/* Binary Rain bits */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[#00a9c0]/40 font-mono text-[10px] space-y-1">
            <div className="animate-pulse">101101</div>
            <div className="animate-pulse delay-2">010010</div>
          </div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-1/2 animate-tech-float delay-1">
            <Code2 className="w-6 h-6 text-[#00a9c0]/60" />
          </div>
          <div className="absolute right-1/4 top-2/3 animate-tech-float delay-2">
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="absolute left-1/2 -top-4 animate-tech-float delay-3">
            <ShieldCheck className="w-6 h-6 text-[#d11c07]/60" />
          </div>
          <div className="absolute right-1/3 top-0 animate-tech-float delay-4">
            <Wifi className="w-6 h-6 text-[#00a9c0]/40" />
          </div>
          <div className="absolute left-2/3 bottom-0 animate-tech-float delay-2">
            <Binary className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Data Orbits */}
        <div className="absolute w-full h-full border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-[80%] h-[80%] border border-white/5 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
      </div>

      <div className="mt-12 text-center space-y-4 max-w-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
           <div className="w-1.5 h-1.5 rounded-full bg-[#00a9c0] animate-ping" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00a9c0]">System Status</span>
        </div>
        
        <h3 className="text-xl font-black text-white tracking-tight uppercase transition-all duration-500 min-h-[1.5rem]">
          {initialMessage || MESSAGES[messageIndex]}
        </h3>
        
        <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
           <Terminal className="h-3 w-3" /> 
           <span>node v20.x: initializing_handshake</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-10 w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-transparent via-[#00a9c0] to-transparent animate-[shimmer_1.5s_infinite_linear]" 
          style={{
            width: '100%',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

// Also export as FashionLoader for backward compatibility
export const FashionLoader = AcademyLoader;
