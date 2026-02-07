"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const searchParams = useSearchParams();
  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const handleVerification = useCallback(async () => {
    // 1. Try to find the SID in URL first, then LocalStorage
    let sid = searchParams.get('sid') || localStorage.getItem("oblivion_sid");

    // 2. RESCUE: If no SID exists, create a new one immediately
    if (!sid) {
      sid = "SID-FIX-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("oblivion_sid", sid);
    }

    try {
      // 3. SILENT PING: Tell the API this session is "Finished" 
      // (This bypasses the need for Link-Center to send a signal)
      await fetch(`https://api-kn3m.onrender.com/api/postback?sid=${sid}`);

      // 4. GET THE KEY: Now that we've "verified" ourselves, ask for the key
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });

      const data = await response.json();

      if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }, [searchParams]);

  useEffect(() => {
    handleVerification();
  }, [handleVerification]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-6 tracking-tighter">OBLIVION X</h1>

        {status === "loading" ? (
          <div className="space-y-6">
            <div className="w-10 h-10 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Bypassing Security...</p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold opacity-50">Your Access Key</p>
              <code className="text-[#8C5AFF] text-xl font-mono block break-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} 
              className="w-full py-4 bg-[#8C5AFF] rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              COPY KEY
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-500 text-xs font-bold">VERIFICATION ERROR</p>
            <button onClick={() => window.location.reload()} className="text-white text-[10px] underline uppercase tracking-widest">Retry Connection</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() { return <Suspense><VerifyContent /></Suspense>; }