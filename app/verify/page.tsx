"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const searchParams = useSearchParams();

  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";
  const AD_LINK = "https://link-center.net/1308535/W5CwvHlC6zla";
  const MY_SITE_URL = "https://oblivionxkey.netlify.app/verify";

  // We wrap handleAction in useCallback so it can be safely called inside useEffect
  const handleAction = useCallback(async () => {
    if (status === "loading") return;

    let sid = localStorage.getItem("oblivion_sid");
    
    if (!sid) {
      sid = "SID-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("oblivion_sid", sid);
    }

    setStatus("loading");

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });

      const data = await response.json();

      if (response.status === 403) {
        // ENCODED REDIRECT: Prevents the SID from being stripped by the shortener
        const target = `${MY_SITE_URL}?sid=${sid}`;
        window.location.href = `${AD_LINK}?url=${encodeURIComponent(target)}`;
        return;
      }

      if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        throw new Error(data.message || "Failed to get key");
      }
    } catch (error: any) {
      alert(error.message);
      setStatus("error");
    }
  }, [status]); // Status dependency prevents multiple triggers

  // --- YOUR UPDATED EFFECT ---
  useEffect(() => {
    const urlSid = searchParams.get('sid');
    
    if (urlSid) {
      // Sync the URL SID to memory
      localStorage.setItem("oblivion_sid", urlSid);
      console.log("SID detected from URL, auto-verifying...");
      
      // Fire the check automatically so the user doesn't have to click again
      handleAction();
    }
  }, [searchParams, handleAction]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        
        <h1 className="text-3xl font-black text-[#8C5AFF] tracking-tight mb-2 italic">OBLIVION X</h1>
        <p className="text-gray-400 text-xs mb-8 tracking-[0.3em] uppercase font-semibold">Security Portal</p>

        {status !== "success" ? (
          <div className="space-y-4">
            <div className="bg-[#1E2026] p-4 rounded-lg border border-[#2A2D36] text-xs text-gray-400">
              {status === "loading" ? "Validating session with server..." : "Authentication required to access script."}
            </div>
            <button 
              onClick={handleAction}
              disabled={status === "loading"}
              className="w-full bg-[#8C5AFF] hover:bg-[#7a49e6] py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#8C5AFF]/20 active:scale-95"
            >
              {status === "loading" ? "PROCESSING..." : "GET ACCESS KEY"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border-2 border-dashed border-[#8C5AFF]/40 relative">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Your Private Key</p>
              <code className="text-[#8C5AFF] text-xl font-mono tracking-widest block break-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied to clipboard!"); }}
              className="w-full py-3 bg-[#252830] hover:bg-[#2d313b] border border-[#3a3f4b] rounded-lg text-[10px] font-bold tracking-widest transition-colors"
            >
              COPY TO CLIPBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetKey() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center font-mono uppercase tracking-widest animate-pulse">Initializing...</div>}>
      <GetKeyContent />
    </Suspense>
  );
}