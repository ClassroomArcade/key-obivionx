"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const searchParams = useSearchParams();
  
  // Update these to match your actual backend routes
  const API_POSTBACK = "https://api-kn3m.onrender.com/api/postback";
  const API_VERIFY = "https://api-kn3m.onrender.com/api/generate-key";

  const handleVerification = useCallback(async () => {
    setStatus("loading");

    // 1. Generate/Retrieve the OX Key format
    let finalKey = localStorage.getItem("oblivion_active_key");
    if (!finalKey) {
      finalKey = "OX-" + Math.random().toString(36).substring(2, 12).toUpperCase();
      localStorage.setItem("oblivion_active_key", finalKey);
    }

    const tryActivate = async (attempts = 5) => {
      for (let i = 0; i < attempts; i++) {
        try {
          // 2. SILENT PING: Tell the API to activate this specific OX- key
          const res = await fetch(`${API_POSTBACK}?sid=${finalKey}`);
          
          if (res.ok) {
            // 3. CONFIRM: Ask the API if it's actually in memory now
            const check = await fetch(API_VERIFY, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: finalKey }) // API expects sessionId
            });

            const data = await check.json();
            if (data.success) {
              setKey(finalKey);
              setStatus("success");
              return true;
            }
          }
        } catch (err) {
          console.log(`Attempt ${i + 1}: Server waking up...`);
        }
        // Wait 2 seconds before retrying (Crucial for Render Free Tier)
        await new Promise(r => setTimeout(r, 2000));
      }
      return false;
    };

    const success = await tryActivate();
    if (!success) setStatus("error");

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
            <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Waking Server & Activating Key...</p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold opacity-50">Authorized Key</p>
              <code className="text-[#8C5AFF] text-xl font-mono block break-all select-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} 
              className="w-full py-4 bg-[#8C5AFF] rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              COPY KEY
            </button>
            <p className="text-[9px] text-gray-600 uppercase">Status: Verified & Synced</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-500 text-xs font-bold">VERIFICATION TIMEOUT</p>
            <p className="text-gray-500 text-[10px]">The server took too long to wake up.</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#2A2D36] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#323641]">Retry Connection</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() { return <Suspense><VerifyContent /></Suspense>; }