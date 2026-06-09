"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const DISMISS_KEY = "sgr_banner_dismissed";

export default function StartGettingRequestsBanner() {
  const username = useSelector((s: RootState) => s.profile.username);
  const isFanVerified = useSelector((s: RootState) => (s.profile as any).fan_verified === true);
  const hasPortfolio = useSelector((s: RootState) => !!(s.profile as any).creator_portfolio_id);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [showNoPortfolioPopup, setShowNoPortfolioPopup] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;
  if (isFanVerified) return null;



  const cleanUsername = (username || "").replace(/^@+/, "");
const profileUrl = `https://mmeko.com/@${cleanUsername}`;
const portfolioUrl = `https://mmeko.com/portfolio/${cleanUsername}`;
 const handleCopy = () => {
  if (!hasPortfolio) {
    setShowNoPortfolioPopup(true);
    return;
  }
  navigator.clipboard.writeText(portfolioUrl).catch(() => {});
  setCopied(true);
  setTimeout(() => setCopied(false), 2500);
};

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{
      background: "#161b2e",
      border: "1px solid rgba(108,99,255,0.2)",
    }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)" }} />
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(108,99,255,.06),transparent 70%)" }} />

      <div className="relative p-4 pb-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[13px] flex-shrink-0" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", boxShadow: "0 2px 8px rgba(108,99,255,.35)" }}>⚡</div>
            <span className="text-[14px] font-extrabold text-white tracking-tight">Start Getting Fan Requests</span>
          </div>
          <button onClick={handleDismiss} className="text-[#475569] hover:text-[#94a3b8] transition-colors text-xs leading-none p-1">✕</button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2.5 mb-3.5">
          {[
            ["Set up your Fan Meet or Fan Call portfolio", "add your availability, price and location"],
            ["Copy your portfolio link", "your unique mmeko link is ready instantly"],
            ["Share it with your fans", "on your other platforms"],
          ].map(([bold, rest], i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", boxShadow: "0 2px 6px rgba(108,99,255,.3)" }}>{i + 1}</div>
              <p className="text-[12.5px] text-[#94a3b8] leading-[1.5] font-medium">
                <strong className="text-white font-bold">{bold}</strong>{i < 2 ? ` — ${rest}` : ` ${rest}`}
              </p>
            </div>
          ))}
        </div>

        {/* Platform tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5 pl-[30px]">
          {[["TikTok", "T"], ["Instagram", "I"], ["Twitter", "X"], ["🔗 Anywhere", ""]].map(([label]) => (
            <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#475569]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>{label}</span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px -mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-bold text-white tracking-tight transition-all duration-200 active:scale-[0.98]"
        style={{ background: copied ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#6c63ff,#9b59f5)" }}
      >
        {copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Link Copied!
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="white" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            Copy Portfolio Link
          </>
        )}
      </button>

      {showNoPortfolioPopup && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4" onClick={() => setShowNoPortfolioPopup(false)}>
    <div className="bg-[#111624] rounded-2xl p-6 max-w-sm w-full border border-white/10" onClick={e => e.stopPropagation()}>
      <h3 className="text-white font-bold text-base mb-3">No portfolio yet 📋</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-5">
        You haven't created a portfolio yet. Please create your portfolio first before copying the link.
        <br/><br/>
        For exclusive content and PPVs, creating a portfolio is not required — in that case you can copy your profile link instead.
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => {
            setShowNoPortfolioPopup(false);
            navigator.clipboard.writeText(profileUrl).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)" }}
        >
          Copy Profile Link Instead
        </button>
        <button
          onClick={() => setShowNoPortfolioPopup(false)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#94a3b8] border border-white/10 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}