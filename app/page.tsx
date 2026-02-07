"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GetKeyContent() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [serverOnline, setServerOnline] = useState<"checking" | "online" | "sleeping">("checking");
  const [expiry, setExpiry] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // CONFIGURATION
  const API_BASE = "https://api-kn3m.onrender.com";
  const AD_LINK = "https://link-to-your-shortener.com/?url=https://your-site.netlify.app/verify?sid=";

  // 1. Monitor Server Health & Load SID
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/`);
        if (res.ok) setServerOnline("online");
        else setServerOnline("sleeping");
      } catch {
        setServerOnline("sleeping");
      }
    };

    const urlSid = searchParams.get('sid');
    if (urlSid) localStorage.setItem("oblivion_sid", urlSid);

    checkServer();
    checkExistingKey();
    
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, [searchParams]);

  // 2. Check if user already has a valid key
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
    } catch (e) { console.log("No existing session found."); }
  };

  // 3. The Main Logic
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

      // Handle HTML error pages from Render spin-up
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Server is still waking up. Please wait 10 seconds and try again.");
      }

      const data = await response.json();

      if (response.status === 403) {
        // User needs to go through Linkvertise
        window.location.href = AD_LINK + sid;
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
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-[#17191C] border border-[#2A2D36] p-8 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8C5AFF] to-transparent" />

        {/* Server Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            serverOnline === "online" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : 
            serverOnline === "sleeping" ? "bg-yellow-500 animate-pulse" : "bg-gray-500"
          }`} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
            {serverOnline === "online" ? "API Online" : "API Waking Up"}
          </span>
        </div>

        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-b from-[#A066FF] to-[#6A1BFF] mb-2 italic tracking-tighter">
          OBLIVION X
        </h1>
        <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-8 font-semibold">User Authentication</p>

        {status !== "success" ? (
          <div className="space-y-4">
            <div className="bg-[#1E2026] p-4 rounded-lg border border-[#2A2D36] text-sm text-gray-400">
              Access is currently restricted. Please generate a temporary session key to continue.
            </div>
            <button 
              onClick={handleAction}
              disabled={status === "loading" || serverOnline === "checking"}
              className="w-full bg-[#8C5AFF] hover:bg-[#7a49e6] py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#8C5AFF]/20 transform active:scale-95"
            >
              {status === "loading" ? "PROCESSING..." : "GET ACCESS KEY"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-[#1E2026] p-6 rounded-xl border-2 border-dashed border-[#8C5AFF]/30 relative">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Your Key</p>
              <code className="text-[#8C5AFF] text-xl font-mono tracking-widest block break-all">{key}</code>
            </div>
            {expiry && (
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
                Status: Verified • {expiry}
              </p>
            )}
            <button 
              onClick={() => { navigator.clipboard.writeText(key); alert("Copied to clipboard!"); }}
              className="w-full py-3 bg-[#252830] hover:bg-[#2d313b] border border-[#3a3f4b] rounded-lg text-xs font-semibold transition-colors"
            >
              COPY TO CLIPBOARD
            </button>
          </div>
        )}

        <p className="mt-8 text-[10px] text-gray-600">
          Keys are bound to your HWID and expire after 24 hours.
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense to prevent build errors with searchParams
export default function GetKey() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center font-mono uppercase tracking-widest">Loading Oblivion...</div>}>
      <GetKeyContent />
    </Suspense>
  );
}