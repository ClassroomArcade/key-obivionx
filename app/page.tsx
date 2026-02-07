"use client";
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [status, setStatus] = useState("idle");
  const searchParams = useSearchParams();

  const API_BASE = "https://api-kn3m.onrender.com/api/generate-key";
  const AD_LINK = "https://link-center.net/1308535/W5CwvHlC6zla";
  const MY_SITE_URL = "https://oblivionxkey.netlify.app/verify"; 

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

      // If ad isn't finished, the API returns 403
      if (response.status === 403) {
        // We pass the SID to Link-Center so it can return it to us
        const target = `${MY_SITE_URL}?sid=${sid}`;
        window.location.href = `${AD_LINK}?sid=${sid}&url=${encodeURIComponent(target)}`;
        return;
      }

      if (data.success) {
        // Redirect to verify page if key is already ready
        window.location.href = `/verify?sid=${sid}`;
      }
    } catch (error: any) {
      alert("Server error. Try again later.");
      setStatus("idle");
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4 font-sans">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8C5AFF] to-transparent" />
        <h1 className="text-3xl font-black text-[#8C5AFF] italic mb-2 tracking-tighter">OBLIVION X</h1>
        <p className="text-gray-500 text-[10px] mb-8 uppercase tracking-[0.2em] font-bold">Portal Access</p>

        <button 
          onClick={handleAction}
          disabled={status === "loading"}
          className="w-full bg-[#8C5AFF] py-4 rounded-xl font-bold shadow-lg shadow-[#8C5AFF]/20 active:scale-95 transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
        >
          {status === "loading" ? "INITIALIZING..." : "GET ACCESS KEY"}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><GetKeyContent /></Suspense>;
}