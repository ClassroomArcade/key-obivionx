"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [serverOnline, setServerOnline] = useState<"checking" | "online" | "sleeping">("checking");
  const [expiry, setExpiry] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // --- CONFIGURATION ---
  const API_BASE = "https://api-kn3m.onrender.com";
  const MY_SITE_URL = "https://your-site.netlify.app/verify"; 
  const AD_SHORTENER_URL = "https://link-to-your-shortener.com/?url=";

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/`);
        setServerOnline(res.ok ? "online" : "sleeping");
      } catch {
        setServerOnline("sleeping");
      }
    };

    // Grab SID from URL if returning from an ad
    const urlSid = searchParams.get('sid');
    if (urlSid) localStorage.setItem("oblivion_sid", urlSid);

    checkServer();
    checkExistingKey();
    
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, [searchParams]);

  const checkExistingKey = async () => {
    const sid = localStorage.getItem("oblivion_sid");
    if (!sid) return;

    try {
      const response = await fetch(`${API_BASE}/api/check-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid })
      });
      const data = await response.json();
      if (data.hasKey && !data.expired) {
        setKey(data.key);
        setStatus("success");
        setExpiry(`${data.expiresIn}h remaining`);
      }
    } catch (e) { console.log("Session check failed."); }
  };

  const handleAction = async () => {
    let sid = localStorage.getItem("oblivion_sid");
    if (!sid) {
      sid = "SID-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("oblivion_sid", sid);
    }

    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE}/api/generate-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, system: "standard" })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("API is waking up. Please try again in 10 seconds.");
      }

      const data = await response.json();

      if (response.status === 403) {
        // DYNAMIC LINK: Construct the verify URL + SID, then encode it for the shortener
        const verifyUrl = `${MY_SITE_URL}?sid=${sid}`;
        window.location.href = `${AD_SHORTENER_URL}${encodeURIComponent(verifyUrl)}`;
        return;
      }

      if (data.success) {
        setKey(data.key);
        setStatus("success");
      } else {
        throw new Error(data.message || "Failed to generate key.");
      }
    } catch (error: any) {
      alert(error.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${serverOnline === "online" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
          <span className="text-[10px] text-gray-500 font-bold uppercase">
            {serverOnline === "online" ? "API Online" : "API Waking Up"}
          </span>
        </div>

        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-b from-[#A066FF] to-[#6A1BFF] mb-2 italic">OBLIVION X</h1>
        
        {status !== "success" ? (
          <div className="space-y-4 mt-8">
            <button 
              onClick={handleAction}
              disabled={status === "loading" || serverOnline === "checking"}
              className="w-full bg-[#8C5AFF] py-4 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {status === "loading" ? "PROCESSING..." : "GET ACCESS KEY"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-8 animate-in fade-in zoom-in">
            <div className="bg-[#1E2026] p-6 rounded-xl border-2 border-dashed border-[#8C5AFF]/30">
              <code className="text-[#8C5AFF] text-xl font-mono block break-all">{key}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); alert("Copied!"); }} className="w-full py-3 bg-[#252830] rounded-lg text-xs">COPY KEY</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetKey() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center">Loading...</div>}>
      <GetKeyContent />
    </Suspense>
  );
}