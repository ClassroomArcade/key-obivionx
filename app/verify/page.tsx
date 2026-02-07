"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const checkStatus = useCallback(async () => {
    // Look for the SID we saved on the first page
    const sid = localStorage.getItem("oblivion_sid");

    if (!sid) {
      setStatus("no-session");
      return false;
    }

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
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(async () => {
      if (status !== "success") {
        const finished = await checkStatus();
        if (finished) clearInterval(interval);
      }
    }, 4000); // Check every 4 seconds
    return () => clearInterval(interval);
  }, [checkStatus, status]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-2xl font-black text-[#8C5AFF] italic mb-6 tracking-tighter">VERIFICATION</h1>

        {status === "loading" || status === "incomplete" ? (
          <div className="space-y-6">
            <div className="w-10 h-10 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 uppercase tracking-widest">Awaiting Ad Completion...</p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <code className="text-[#8C5AFF] text-xl font-mono block break-all">{key}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} className="w-full py-4 bg-[#8C5AFF] rounded-xl font-bold">COPY KEY</button>
          </div>
        ) : (
          <div className="text-red-500 text-xs font-bold">SESSION EXPIRED. RESTART FROM MAIN PAGE.</div>
        )}
      </div>
    </div>
  );
}

export default function Verify() { return <Suspense><VerifyContent /></Suspense>; }