"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();
  const pollCount = useRef(0);

  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const checkKeyStatus = useCallback(async () => {
    // Check URL first, then fall back to LocalStorage
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

      if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        setStatus("incomplete");
        setErrorMsg(data.message || "Waiting for ad network signal...");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Connection error. Retrying...");
    }
  }, [searchParams]);

  // AUTO-POLLING LOOP
  useEffect(() => {
    checkKeyStatus(); // Run immediately

    const interval = setInterval(() => {
      // Only poll if the ad isn't finished yet
      setStatus((current) => {
        if (current === "incomplete" || current === "loading") {
          checkKeyStatus();
        }
        return current;
      });
    }, 4000); // Check every 4 seconds

    return () => clearInterval(interval);
  }, [checkKeyStatus]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-6">VERIFICATION</h1>

        {status === "loading" && <div className="animate-pulse text-gray-400">Initializing...</div>}

        {status === "incomplete" && (
          <div className="space-y-4">
            <div className="w-10 h-10 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Waiting for ad completion...</p>
            <p className="text-[10px] text-gray-500 uppercase">Do not close this page</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <code className="text-[#8C5AFF] text-xl font-mono block break-all select-all">{key}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} className="w-full py-3 bg-[#252830] rounded-lg text-[10px] font-bold tracking-widest">COPY KEY</button>
          </div>
        )}

        {status === "no-session" && (
          <div className="space-y-4">
            <p className="text-red-400 text-xs">No session detected. Please restart.</p>
            <button onClick={() => window.location.href = "/"} className="w-full bg-[#2A2D36] py-3 rounded-xl font-bold">GO BACK</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() {
  return <Suspense><VerifyContent /></Suspense>;
}