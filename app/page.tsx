"use client";
import { useState, useCallback, Suspense } from 'react';

function GetKeyContent() {
  const [status, setStatus] = useState("idle");
  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";
  const AD_LINK = "https://link-center.net/1308535/W5CwvHlC6zla";

  const handleAction = useCallback(async () => {
    if (status === "loading") return;

    // 1. Generate/Get SID and SAVE it locally
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

      if (response.status === 403) {
        // 2. Redirect to Linkvertise WITHOUT the SID in the URL
        // Linkvertise will use your account's Postback to tell the API that this IP finished
        window.location.href = AD_LINK;
        return;
      }

      const data = await response.json();
      if (data.success) {
        window.location.href = "/verify";
      }
    } catch (error) {
      alert("Connection error. Try again.");
      setStatus("idle");
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-6">OBLIVION X</h1>
        <button 
          onClick={handleAction}
          disabled={status === "loading"}
          className="w-full bg-[#8C5AFF] py-4 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50"
        >
          {status === "loading" ? "INITIALIZING..." : "GET ACCESS KEY"}
        </button>
      </div>
    </div>
  );
}

export default function Page() { return <Suspense><GetKeyContent /></Suspense>; }