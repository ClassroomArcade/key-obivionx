"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    // 1. Try to grab SID from URL: ?sid=SID-XYZ
    const urlSid = searchParams.get('sid');
    
    // 2. Try to grab SID from LocalStorage (backup)
    const storedSid = localStorage.getItem("oblivion_sid");

    // 3. Decide which SID to use
    const activeSid = urlSid || storedSid;

    if (!activeSid) {
      setStatus("error");
      return;
    }

    // If it was in the URL but not storage, sync it
    if (urlSid && !storedSid) {
      localStorage.setItem("oblivion_sid", urlSid);
    }

    // 4. Auto-verify with your API
    const verifySession = async () => {
      try {
        const res = await fetch(`https://api-kn3m.onrender.com/api/check-key`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: activeSid })
        });
        
        const data = await res.json();
        
        if (data.hasKey) {
          // Success! Send them back to the home page to see their key
          router.push('/');
        } else {
          setStatus("incomplete");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    verifySession();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white flex items-center justify-center p-6">
      <div className="bg-[#17191C] border border-[#2A2D36] p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 italic tracking-tight">OBLIVION VERIFIER</h2>
        
        {status === "verifying" && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-[#8C5AFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 text-sm animate-pulse">Checking ad completion...</p>
          </div>
        )}

        {status === "incomplete" && (
          <p className="text-yellow-500 text-sm">Ad not finished. Please try again.</p>
        )}

        {status === "error" && (
          <p className="text-red-500 text-sm">No session found. Return home.</p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}