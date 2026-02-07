"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const searchParams = useSearchParams();

  // --- CONFIGURATION ---
  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";
  const AD_LINK = "https://link-center.net/1308535/W5CwvHlC6zla";
  const MY_SITE_URL = "https://oblivionxkey.netlify.app/verify";

  // handleAction logic
  const handleAction = useCallback(async () => {
    // Prevent double-clicking
    if (status === "loading") return;

    let sid = localStorage.getItem("oblivion_sid");
    
    // Generate new SID if one doesn't exist
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

      // If ad is not finished, the API returns 403
      if (response.status === 403) {
        // ENCODE the return URL so the SID doesn't get stripped
        const target = `${MY_SITE_URL}?sid=${sid}`;
        window.location.href = `${AD_LINK}?url=${encodeURIComponent(target)}`;
        return;
      }

      if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        throw new Error(data.message || "Ad not finished yet.");
      }
    } catch (error: any) {
      // If "Ad not finished", we show an alert but keep the button active
      alert(error.message);
      setStatus("idle");
    }
  }, [status]);

  // --- AUTO-DETECTION EFFECT ---
  useEffect(() => {
    const urlSid = searchParams.get('sid');
    
    if (urlSid) {
      // Save the SID from the URL to memory
      localStorage.setItem("oblivion_sid", urlSid);
      
      // Immediately trigger the check so the user doesn't have to click again
      handleAction();
    }
  }, [searchParams, handleAction]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C5AFF] to-transparent" />
        
        <h1 className="text-3xl font-black text-[#8C5AFF] tracking-tight mb-2 italic">OBLIVION X</h1>
        <p className="text-gray-400 text-[10px] mb-8 tracking-[0.3em] uppercase font-bold">Key Authentication</p>

        {status !== "success" ? (
          <div className="space-y-4">
            <button 
              onClick={handleAction}
              disabled={status === "loading"}
              className="w-full bg-[#8C5AFF] hover:bg-[#7a49e6] py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#8C5AFF]/20 active:scale-95"
            >
              {status === "loading" ? "VERIFYING..." : "GET ACCESS KEY"}
            </button>
            {status === "idle" && (
              <p className="text-[10px] text-gray-500">Finish the ad to unlock your script access.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border-2 border-dashed border-[#8C5AFF]/40 relative">
              <code className="text-[#8C5AFF] text-xl font-mono tracking-widest block break-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Key copied!"); }}
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
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center font-mono">Loading Portal...</div>}>
      <GetKeyContent />
    </Suspense>
  );
}