"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const searchParams = useSearchParams();

  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const checkKeyStatus = useCallback(async (isManual = false) => {
    const sid = searchParams.get('sid') || localStorage.getItem("oblivion_sid");

    if (!sid) {
      setStatus("no-session");
      return false;
    }

    // If the user clicks manually, show the spinner again
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
      console.error("Fetch error:", err);
      setStatus("incomplete");
      return false;
    }
  }, [searchParams]);

  useEffect(() => {
    checkKeyStatus();

    const interval = setInterval(async () => {
      if (status !== "success") {
        const found = await checkKeyStatus();
        if (found) clearInterval(interval);
      }
    }, 3000); // Polling every 3 seconds

    return () => clearInterval(interval);
  }, [checkKeyStatus, status]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-6">VERIFYING</h1>

        {status === "loading" ? (
          <div className="space-y-6">
            <div className="w-12 h-12 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-300 animate-pulse">CHECKING SERVER...</p>
          </div>
        ) : status === "incomplete" ? (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
               <p className="text-yellow-500 text-xs font-bold">AWAITING AD SIGNAL</p>
            </div>
            <button 
              onClick={() => checkKeyStatus(true)} 
              className="w-full py-4 bg-[#8C5AFF] hover:bg-[#7a49e6] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#8C5AFF]/10"
            >
              FORCE RE-CHECK NOW
            </button>
            <p className="text-[10px] text-gray-500">The ad network can take up to 60 seconds to sync.</p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold">Access Key</p>
              <code className="text-[#8C5AFF] text-2xl font-mono block break-all select-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} 
              className="w-full py-4 bg-[#8C5AFF] rounded-xl text-xs font-bold transition-all"
            >
              COPY TO CLIPBOARD
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-400 text-xs">NO SESSION FOUND</p>
            <button onClick={() => window.location.href = "/"} className="w-full bg-[#2A2D36] py-3 rounded-xl font-bold">RESTART</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() {
  return <Suspense><VerifyContent /></Suspense>;
}