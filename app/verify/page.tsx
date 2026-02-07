"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const searchParams = useSearchParams();

  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const checkKeyStatus = useCallback(async () => {
    // Get SID from URL or fallback to LocalStorage
    const sid = searchParams.get('sid') || localStorage.getItem("oblivion_sid");

    if (!sid) {
      setStatus("no-session");
      return;
    }

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });

      const data = await response.json();

      // KEY FIX: If success is true, update state immediately
      if (data.success && data.key) {
        setKey(data.key);
        setStatus("success");
        return true; // Stop polling
      } 
      
      setStatus("incomplete");
      return false;
    } catch (err) {
      console.error("Fetch error:", err);
      return false;
    }
  }, [searchParams]);

  useEffect(() => {
    // Run the check immediately on mount
    checkKeyStatus();

    // Set up a fast interval to catch the postback signal
    const interval = setInterval(async () => {
      // Only keep checking if we haven't succeeded yet
      if (status !== "success") {
        const found = await checkKeyStatus();
        if (found) clearInterval(interval);
      }
    }, 2000); // Check every 2 seconds for a faster response

    return () => clearInterval(interval);
  }, [checkKeyStatus, status]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-6">VERIFYING</h1>

        {status === "loading" || status === "incomplete" ? (
          <div className="space-y-6">
            <div className="w-12 h-12 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-300">WAITING FOR AD COMPLETION...</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">The key will appear here automatically</p>
            </div>
            <button 
              onClick={() => checkKeyStatus()} 
              className="text-[10px] text-[#8C5AFF] hover:underline"
            >
              Click here if it takes too long
            </button>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40 shadow-[0_0_15px_rgba(140,90,255,0.1)]">
              <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold tracking-tighter">Access Key Generated</p>
              <code className="text-[#8C5AFF] text-2xl font-mono block break-all select-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} 
              className="w-full py-4 bg-[#8C5AFF] hover:bg-[#7a49e6] rounded-xl text-xs font-bold tracking-widest transition-all active:scale-95"
            >
              COPY TO CLIPBOARD
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-red-400 text-xs font-bold uppercase">No Active Session</p>
            <button onClick={() => window.location.href = "/"} className="w-full bg-[#2A2D36] py-3 rounded-xl font-bold">RESTART PORTAL</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() {
  return <Suspense><VerifyContent /></Suspense>;
}