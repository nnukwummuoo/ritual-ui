"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const DISMISS_KEY = "promotionalBannerDismissed";

const PromotionalBanner: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();
  const isFanVerified = useSelector((s: RootState) => (s.profile as any).fan_verified === true);
  const [visible, setVisible] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setVisible(!localStorage.getItem(DISMISS_KEY)); } catch { setVisible(true); }
  }, []);

  if (session?.creator_verified) return null;
  if (isFanVerified) return null;
  if (!visible) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "true"); } catch {}
    setVisible(false);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden mx-auto w-full"
      style={{
        background: "linear-gradient(135deg,#13192e,#0f1428)",
        border: "1px solid rgba(108,99,255,0.25)",
        animation: "sgr-slide-down .4s cubic-bezier(.16,1,.3,1) both",
      }}
    >
      <style>{`@keyframes sgr-slide-down{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#6c63ff,#9b59f5)" }} />
  
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 0%,rgba(108,99,255,.07),transparent 70%)" }} />

      <button
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 w-[18px] h-[18px] rounded-full flex items-center justify-center z-10 transition-all"
        style={{ background: "rgba(255,255,255,0.06)", color: "#475569", fontSize: 9, border: "none" }}
      >✕</button>

      <div className="relative z-[1] flex items-center gap-3.5 px-4 py-3.5">
       
        <div
          className="w-[42px] h-[42px] flex-shrink-0 rounded-xl flex items-center justify-center relative"
          style={{ background: "linear-gradient(135deg,rgba(108,99,255,.2),rgba(155,89,245,.15))", border: "1px solid rgba(108,99,255,.3)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starG)" stroke="rgba(108,99,255,.3)" strokeWidth=".5"/>
            <defs><linearGradient id="starG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#9b59f5"/></linearGradient></defs>
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-bold border-2" style={{ background: "#22c55e", borderColor: "#0b0f1c", fontSize: 7 }}>✓</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[#f1f5f9] leading-snug tracking-tight mb-0.5">Become a Verified Creator</p>
          <p className="text-[11px] text-[#64748b] leading-snug">Get verified in <span className="text-[#22c55e] font-semibold">under 10 minutes</span> — start getting fan requests today</p>
        </div>

        <button
          onClick={() => { setApplied(true); router.push("/be-a-creator/apply"); }}
          className="flex-shrink-0 text-white font-bold rounded-[10px] transition-all active:scale-95"
          style={{
            padding: "9px 16px", fontSize: 12, letterSpacing: ".01em",
            background: "linear-gradient(135deg,#6c63ff,#9b59f5)",
            boxShadow: "0 4px 14px rgba(108,99,255,.35)",
            border: "none",
          }}
        >
          {applied ? "✓ Done!" : "Apply Now"}
        </button>
      </div>
    </div>
  );
};

export default PromotionalBanner;