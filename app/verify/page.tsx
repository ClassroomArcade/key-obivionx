"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("loading");
  const searchParams = useSearchParams();
  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";

  const getOrGenerateSid = () => {
    let sid = searchParams.get('sid') || localStorage.getItem("oblivion_sid");
    if (!sid) {
      sid = "SID-AUTO-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("oblivion_sid", sid);
    }
    return sid;
  };

  const forceGenerateKey = useCallback(async () => {
    const sid = getOrGenerateSid();
    setStatus("loading");

    try {
      // We send a request to the API. 
      // Note: If your API still strictly requires a postback, 
      // this might return 403. If so, we'll need to hit the postback endpoint first.
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
        // IF THE API SAYS NO: We try to 'fake' a postback signal 
        // then try one more time.
        await fetch(`https://api-kn3m.onrender.com/api/postback?sid=${sid}`);
        const retry = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid, system: "standard" })
        });
        const retryData = await retry.json();
        if (retryData.success) {
          setKey(retryData.key);
          setStatus("success");
        } else {
          setStatus("error");
        }
      }
    } catch (err) {
      setStatus("error");
    }
  }, [API_BASE]);

  useEffect(() => {
    forceGenerateKey();
  }, [forceGenerateKey]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-2xl font-black text-[#8C5AFF] italic mb-6">ACCESS GRANTED</h1>

        {status === "loading" ? (
          <div className="space-y-4">
            <div className="w-8 h-8 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Generating Secure Key...</p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border border-[#8C5AFF]/40">
              <code className="text-[#8C5AFF] text-xl font-mono block break-all">{key}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} 
                    className="w-full py-4 bg-[#8C5AFF] rounded-xl font-bold hover:brightness-110 transition-all">
              COPY KEY
            </button>
          </div>
        ) : (
          <div className="text-red-500 text-xs font-bold">
            FAILED TO GENERATE KEY. <br/>
            <button onClick={() => window.location.reload()} className="mt-4 text-white underline">RETRY</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() { return <Suspense><VerifyContent /></Suspense>; }