"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const searchParams = useSearchParams();
  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const checkStatus = useCallback(async (isManual = false) => {
    const sid = searchParams.get('sid') || localStorage.getItem("oblivion_sid");
    if (!sid) { setStatus("no-session"); return; }
    if (isManual) setStatus("loading");

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });
      const data = await response.json();

      if (data.success && data.key) {
        setKey(data.key);
        setStatus("success");
        return true;
      }
      setStatus("incomplete");
      return false;
    } catch (err) {
      return false;
    }
  }, [searchParams]);

  useEffect(() => {
    checkStatus(); // Initial check
    const interval = setInterval(async () => {
      if (status !== "success") {
        const finished = await checkStatus();
        if (finished) clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [checkStatus, status]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-2xl font-black text-[#8C5AFF] italic mb-6">VERIFICATION</h1>

        {status === "loading" ? (
          <div className="space-y-6 py-4">
            <div className="w-10 h-10 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Checking ad completion...</p>
          </div>
        ) : status === "incomplete" ? (
          <div className="space-y-6">
            <div className="p-4 bg-[#8C5AFF]/10 border border-[#8C5AFF]/20 rounded-xl">
               <p className="text-[#8C5AFF] text-xs font-bold">WAITING FOR AD SIGNAL</p>
            </div>
            <button onClick={() => checkStatus(true)} className="w-full py-4 bg-[#2A2D36] hover:bg-[#353945] rounded-xl text-[10px] font-bold tracking-widest transition-all">
              FORCE RE-CHECK
            </button>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold tracking-tighter">Your Key</p>
              <code className="text-[#8C5AFF] text-xl font-mono block break-all select-all">{key}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} className="w-full py-4 bg-[#8C5AFF] rounded-xl text-xs font-bold tracking-widest">
              COPY TO CLIPBOARD
            </button>
          </div>
        ) : (
          <p className="text-red-500 text-xs font-bold">SESSION NOT FOUND</p>
        )}
      </div>
    </div>
  );
}

export default function Verify() {
  return <Suspense><VerifyContent /></Suspense>;
}