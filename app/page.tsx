"use client";
import { useState, useEffect, Suspense, type MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const [serverOnline, setServerOnline] = useState<"checking" | "online" | "sleeping">("checking");
  const searchParams = useSearchParams();

  // 1. Monitor Server Health
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("https://api-kn3m.onrender.com/");
        if (res.ok) setServerOnline("online");
        else setServerOnline("sleeping");
      } catch {
        setServerOnline("sleeping");
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  function handleAction(event: MouseEvent<HTMLButtonElement>): void {
    throw new Error('Function not implemented.');
  }

  // ... (Keep your previous handleAction and useEffect logic here) ...

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            serverOnline === "online" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : 
            serverOnline === "sleeping" ? "bg-yellow-500 animate-pulse" : "bg-gray-500"
          }`} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
            {serverOnline === "online" ? "Server API: Ready" : "Server API: Waking Up"}
          </span>
        </div>

        <h1 className="text-3xl font-black text-[#8C5AFF] tracking-tight mb-2 italic">OBLIVION X</h1>
        
        {/* ... (Keep your existing button and key display logic here) ... */}
        
        <button 
          onClick={handleAction}
          disabled={status === "loading" || serverOnline === "checking"}
          className="w-full bg-[#8C5AFF] hover:bg-[#7a49e6] py-4 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {serverOnline === "sleeping" ? "WAIT FOR SERVER..." : "GET ACCESS KEY"}
        </button>
      </div>
    </div>
  );
}

export default function GetKey() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <GetKeyContent />
    </Suspense>
  );
}