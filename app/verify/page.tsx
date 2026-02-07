"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading"); // Start in loading to check URL immediately
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();

  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";
  const AD_LINK = "https://link-center.net/1308535/W5CwvHlC6zla";

  const checkKeyStatus = useCallback(async (incomingSid?: string) => {
    // 1. Get SID from argument (URL) or LocalStorage
    const sid = incomingSid || localStorage.getItem("oblivion_sid");

    if (!sid) {
      setStatus("no-session");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });

      const data = await response.json();

      if (response.status === 403) {
        // API says ad not finished
        setStatus("incomplete");
        setErrorMsg(data.message || "Ad completion not detected yet.");
      } else if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        throw new Error(data.message || "Verification failed.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }, []);

  // Check immediately if 'sid' is in URL
  useEffect(() => {
  const urlSid = searchParams.get('sid');
  if (urlSid) localStorage.setItem("oblivion_sid", urlSid);

  // Initial check
  checkKeyStatus();

  // Polling: Check every 3 seconds if status is 'incomplete'
  const interval = setInterval(() => {
    if (status === "incomplete") {
      console.log("Polling API for completion...");
      checkKeyStatus();
    }
  }, 3000);

  return () => clearInterval(interval);
}, [searchParams, status, checkKeyStatus]);
  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-2">OBLIVION X</h1>
        <p className="text-gray-400 text-[10px] mb-8 tracking-[0.3em] uppercase font-bold">Verification Center</p>

        {/* --- LOADING STATE --- */}
        {status === "loading" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 animate-pulse">Checking ad status...</p>
          </div>
        )}

        {/* --- INCOMPLETE / AD NOT FINISHED --- */}
        {status === "incomplete" && (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
              <p className="text-yellow-500 text-sm font-medium">Ad Not Finished</p>
              <p className="text-[10px] text-gray-400 mt-1">{errorMsg}</p>
            </div>
            <button 
              onClick={() => checkKeyStatus()}
              className="w-full bg-[#8C5AFF] py-4 rounded-xl font-bold shadow-lg hover:bg-[#7a49e6] transition-all"
            >
              RETRY VERIFICATION
            </button>
            <p className="text-[10px] text-gray-500 italic">
              Note: It can take 10-30 seconds for the ad network to sync.
            </p>
          </div>
        )}

        {/* --- SUCCESS STATE --- */}
        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border-2 border-dashed border-[#8C5AFF]/40">
              <p className="text-[10px] text-gray-500 uppercase mb-2">Your Access Key</p>
              <code className="text-[#8C5AFF] text-xl font-mono block break-all select-all">{key}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }}
              className="w-full py-3 bg-[#252830] rounded-lg text-[10px] font-bold tracking-widest hover:bg-[#2d313b] transition-colors"
            >
              COPY TO CLIPBOARD
            </button>
          </div>
        )}

        {/* --- NO SESSION / ERROR --- */}
        {(status === "no-session" || status === "error") && (
          <div className="space-y-4">
            <p className="text-red-400 text-xs">{errorMsg || "No active session found."}</p>
            <button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-[#2A2D36] py-4 rounded-xl font-bold"
            >
              GO TO MAIN PORTAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}