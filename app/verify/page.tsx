"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const searchParams = useSearchParams();

  // REPLACE with your actual Linkvertise/Lootlabs link
  // The 'target' should be your Netlify verify URL
  const AD_LINK = "https://link-to-your-shortener.com/?url=https://your-site.netlify.app/verify?sid=";

  useEffect(() => {
    const urlSid = searchParams.get('sid');
    if (urlSid) {
      localStorage.setItem("oblivion_sid", urlSid);
    }
  }, [searchParams]);

  const handleAction = async () => {
    let sid = localStorage.getItem("oblivion_sid");
    
    if (!sid) {
      sid = "SID-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("oblivion_sid", sid);
    }

    setStatus("loading");

    try {
      const response = await fetch("https://api-kn3m.onrender.com/api/generate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });

      const data = await response.json();

      if (response.status === 403) {
        // Redirect to Linkvertise with the SID attached
        window.location.href = AD_LINK + sid;
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
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl">
        <h1 className="text-3xl font-black text-[#8C5AFF] tracking-tight mb-2 italic">OBLIVION X</h1>
        <p className="text-gray-400 text-sm mb-8 tracking-widest uppercase">Key Portal</p>

        {status !== "success" ? (
          <button 
            onClick={handleAction}
            disabled={status === "loading"}
            className="w-full bg-[#8C5AFF] hover:bg-[#7a49e6] py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#8C5AFF]/20"
          >
            {status === "loading" ? "CHECKING STATUS..." : "GET ACCESS KEY"}
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#1E2026] p-5 rounded-lg border border-[#8C5AFF]/30">
              <p className="text-[10px] text-gray-500 uppercase mb-2">Key Generated</p>
              <code className="text-[#8C5AFF] text-xl font-mono tracking-widest select-all">{key}</code>
            </div>
            <button 
                onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} 
                className="text-xs text-gray-500 hover:text-white transition-colors"
            >
                Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetKey() {
  return (
    <Suspense fallback={<div className="text-white">Initializing Portal...</div>}>
      <GetKeyContent />
    </Suspense>
  );
}
