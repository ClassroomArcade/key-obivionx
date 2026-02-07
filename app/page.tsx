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

  const handleAction = useCallback(async () => {
    if (status === "loading") return;

    // 1. Check storage first so we don't lose progress
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
        // ENCODE THE URL: This prevents shorteners from stripping the SID
        const target = `${MY_SITE_URL}?sid=${sid}`;
        window.location.href = `${AD_LINK}?url=${encodeURIComponent(target)}`;
        return;
      }

      if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        throw new Error(data.message || "Please complete the ad first.");
      }
    } catch (error: any) {
      alert(error.message);
      setStatus("idle");
    }
  }, [status]);

  // Handle returning users with a SID in the URL
  useEffect(() => {
    const urlSid = searchParams.get('sid');
    if (urlSid) {
      localStorage.setItem("oblivion_sid", urlSid);
      handleAction();
    }
  }, [searchParams, handleAction]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-2">OBLIVION X</h1>
        <p className="text-gray-400 text-[10px] mb-8 uppercase tracking-widest font-bold">Portal Access</p>

        {status !== "success" ? (
          <button 
            onClick={handleAction}
            disabled={status === "loading"}
            className="w-full bg-[#8C5AFF] py-4 rounded-xl font-bold shadow-lg shadow-[#8C5AFF]/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {status === "loading" ? "VERIFYING..." : "GET ACCESS KEY"}
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <code className="text-[#8C5AFF] text-xl font-mono block break-all">{key}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} className="w-full py-3 bg-[#252830] rounded-lg text-[10px] font-bold tracking-widest">COPY KEY</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><GetKeyContent /></Suspense>;
}