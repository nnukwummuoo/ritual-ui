/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { post_fan_verification, checkFanApplicationStatus } from "@/store/profile";
import { useAuth } from "@/lib/context/auth-context";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { toast, ToastContainer } from "react-toastify";
import ClockLoader from "react-spinners/ClockLoader";

/* ─── design tokens ─── */
const S = {
  bg:"#080b14", bg3:"#0e1220",
  card:"#111624", card2:"#161b2e",
  border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.04)",
  accent:"#6c63ff", accent2:"#9b59f5",
  teal:"#2dd4bf", success:"#22c55e",
  text:"#f1f5f9", text2:"#94a3b8", text3:"#475569",
};

/* ─── upload slot ─── */
function UploadSlot({ icon, title, sub, accept, filled, onChange }: {
  icon:string; title:string; sub:string; accept:string; filled:boolean; onChange:(f:File)=>void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => ref.current?.click()} className="fv-slot"
      style={{ background: filled?"rgba(34,197,94,.04)":S.card, border:`1.5px ${filled?"solid":"dashed"} ${filled?"rgba(34,197,94,.3)":"rgba(108,99,255,.25)"}`, borderRadius:14, padding:"28px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center", cursor:"pointer", marginBottom:14, position:"relative", transition:"border-color .2s, background .2s" }}
    >
      {filled && <div style={{ position:"absolute", top:12, right:12, width:22, height:22, borderRadius:"50%", background:S.success, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"white" }}>✓</div>}
      <div style={{ width:48, height:48, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, background:filled?"rgba(34,197,94,.1)":"rgba(108,99,255,.1)", border:`1px solid ${filled?"rgba(34,197,94,.2)":"rgba(108,99,255,.2)"}` }}>{filled?"✓":icon}</div>
      <div style={{ fontSize:14, fontWeight:700 }}>{title}</div>
      <div style={{ fontSize:11.5, color:S.text3, lineHeight:1.5 }} dangerouslySetInnerHTML={{ __html: sub }}/>
      <button type="button" onClick={e=>{e.stopPropagation();ref.current?.click();}}
        style={{ padding:"8px 20px", borderRadius:8, fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s", background:filled?"rgba(34,197,94,.1)":"rgba(108,99,255,.1)", border:`1px solid ${filled?"rgba(34,197,94,.2)":"rgba(108,99,255,.2)"}`, color:filled?S.success:"#a89cff" }}>
        {filled?"Uploaded ✓":"Choose File"}
      </button>
      <input ref={ref} type="file" accept={accept} style={{ display:"none" }} onChange={e => { if(e.target.files?.[0]) onChange(e.target.files[0]); }}/>
    </div>
  );
}

const BENEFITS = [
  { icon:"⚡", bg:"rgba(34,197,94,.1)",    title:"Requests accepted faster",       desc:"Creators prioritise verified fans — your request moves to the top of their queue.",                           badge:"↑ Higher priority",        badgeStyle:{ background:"rgba(34,197,94,.1)",   color:"#22c55e" } },
  { icon:"📈", bg:"rgba(108,99,255,.12)",  title:"2× more likely to be accepted",  desc:"Verified fan requests are accepted twice as often compared to unverified accounts.",                           badge:"2× acceptance rate",       badgeStyle:{ background:"rgba(108,99,255,.1)", color:"#a89cff" } },
  { icon:"✅", bg:"rgba(45,212,191,.1)",   title:"Trusted on the platform",        desc:"A verified badge on your profile shows creators and the community you're genuine.",                            badge:"✓ Verified badge",         badgeStyle:{ background:"rgba(45,212,191,.1)", color:"#2dd4bf" } },
  { icon:"🔓", bg:"rgba(212,168,83,.1)",   title:"Access to exclusive creators",   desc:"Some creators only accept meet requests from verified fans. Verification unlocks them.",                      badge:"More creators available",  badgeStyle:{ background:"rgba(212,168,83,.1)", color:"#d4a853" } },
];

function InstrCard({ icon, imgSrc, title, items, color }: { icon:string; imgSrc?:string; title:string; items:string[]; color:string }) {
  return (
    <div style={{ background:S.card2, border:`1px solid ${S.border}`, borderRadius:14, overflow:"hidden", marginBottom:20 }}>
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${S.border2}`, display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700 }}>
        {imgSrc
          ? <img src={imgSrc} alt="" style={{ width:36, height:36, objectFit:"cover", borderRadius:4 }}/>
          : <span style={{ fontSize:16 }}>{icon}</span>
        } {title}
      </div>
      <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
        {items.map((txt, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, background:`${color}20`, color }}>&nbsp;✓</div>
            <div style={{ fontSize:12, color:S.text2, lineHeight:1.5 }} dangerouslySetInnerHTML={{ __html: txt }} />
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── page ─── */
export default function FanVerificationPage() {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const userId   = useSelector((s: RootState) => s.profile.userId);
  const { session } = useAuth();
  const token    = useAuthToken() || session?.token;

  const [idFile,      setIdFile]      = useState<File|null>(null);
  const [selfieFile,  setSelfieFile]  = useState<File|null>(null);
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [appStatus, setAppStatus] = useState<"pending"|"none"|"rejected"|"approved">("none");


  const count = [idFile, selfieFile].filter(Boolean).length;

  /* check if already pending */
useEffect(() => {
  if (!userId || !token) return;
  dispatch(checkFanApplicationStatus({ userid: userId, token }))
    .unwrap()
    .then(r => {
      if (r.status === "approved") setAppStatus("approved");
      else if (r.status === "pending") setAppStatus("pending");
    })
    .catch(() => {});
}, [userId, token, dispatch]);

  const handleSubmit = async () => {
    if (!idFile || !selfieFile) return toast.error("Please upload both documents.");
    if (!userId || !token)      return toast.error("Please log in again.");
    setLoading(true);
    try {
      await dispatch(post_fan_verification({ userid: userId, token, idPhotofile: idFile, holdingIdPhotofile: selfieFile })).unwrap();
      toast.success("Verification submitted!");
      setSubmitted(true);
      setAppStatus("pending");
    } catch(err: any) {
      toast.error(err?.message || err || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (appStatus === "approved") return (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>{`
      .fva-nav { position: sticky; top: 0; z-index: 40; background: rgba(8,11,20,.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
      .fva-nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
      .fva-nav-logo-icon { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg,#6c63ff,#9b59f5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; }
      .fva-nav-logo-name { font-size: 15px; font-weight: 700; color: #f1f5f9; }
      .fva-page { max-width: 480px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; align-items: center; text-align: center; }
      .fva-status-visual { position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
      .fva-ring-1 { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(34,197,94,.25); animation: fvaPulse 2.6s ease-in-out infinite; }
      .fva-ring-2 { position: absolute; inset: 12px; border-radius: 50%; border: 1px solid rgba(34,197,94,.18); animation: fvaPulse 2.6s ease-in-out infinite .4s; }
      @keyframes fvaPulse { 0%,100%{opacity:.35;transform:scale(.96);} 50%{opacity:1;transform:scale(1.04);} }
      .fva-status-center { width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg,rgba(34,197,94,.22),rgba(34,197,94,.08)); border: 1px solid rgba(34,197,94,.4); display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; box-shadow: 0 0 28px rgba(34,197,94,.25); animation: fvaPop .5s cubic-bezier(.34,1.56,.64,1); }
      @keyframes fvaPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
      .fva-status-center svg { filter: drop-shadow(0 0 8px rgba(34,197,94,.5)); }
      .fva-status-tag { display: inline-flex; align-items: center; gap: 7px; background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.25); border-radius: 100px; padding: 5px 14px; margin-bottom: 18px; font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: .08em; text-transform: uppercase; }
      .fva-status-title { font-size: 24px; font-weight: 800; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 12px; color: #f1f5f9; }
      .fva-status-sub { font-size: 14px; color: #94a3b8; line-height: 1.75; max-width: 340px; margin-bottom: 32px; }
      .fva-timeline { width: 100%; margin-bottom: 32px; }
      .fva-timeline-step { display: flex; align-items: flex-start; gap: 14px; text-align: left; padding: 14px 0; position: relative; }
      .fva-timeline-step:not(:last-child)::after { content: ''; position: absolute; left: 15px; top: 46px; width: 2px; height: calc(100% - 14px); background: rgba(34,197,94,.2); }
      .fva-step-dot { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; position: relative; z-index: 1; border: 1px solid rgba(34,197,94,.3); background: rgba(34,197,94,.1); color: #22c55e; }
      .fva-step-title { font-size: 13.5px; font-weight: 700; margin-bottom: 3px; color: #f1f5f9; }
      .fva-step-sub { font-size: 12px; color: #94a3b8; line-height: 1.5; }
      .fva-step-time { font-size: 11px; color: #475569; margin-top: 4px; font-weight: 500; }
      .fva-next-card { width: 100%; background: #111624; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 28px; text-align: left; }
      .fva-next-card-title { font-size: 13px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; color: #f1f5f9; }
      .fva-next-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
      .fva-next-item:last-child { margin-bottom: 0; }
      .fva-next-item-icon { width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; }
      .fva-ni-green { background: rgba(34,197,94,.1); } .fva-ni-teal { background: rgba(45,212,191,.1); } .fva-ni-gold { background: rgba(212,168,83,.1); }
      .fva-next-item-text { font-size: 12.5px; color: #94a3b8; line-height: 1.55; padding-top: 4px; }
      .fva-next-item-text strong { color: #f1f5f9; font-weight: 600; }
      .fva-btn-explore { width: 100%; padding: 15px; border-radius: 12px; background: linear-gradient(135deg,#22c55e,#16a34a); border: none; color: white; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(34,197,94,.35); transition: all .25s; margin-bottom: 12px; }
      .fva-btn-explore:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(34,197,94,.5); }
      .fva-btn-home { width: 100%; padding: 13px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.07); color: #94a3b8; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
      .fva-btn-home:hover { background: rgba(255,255,255,.04); color: #f1f5f9; }
    `}</style>
    <ToastContainer position="top-center" theme="dark"/>
    <div style={{ background: "#080b14", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#f1f5f9" }}>
      <nav className="fva-nav">
        <a href="/" className="fva-nav-logo">
          <div className="fva-nav-logo-icon">M</div>
          <span className="fva-nav-logo-name">mmeko</span>
        </a>
        <div style={{ width: 60 }} />
      </nav>
      <div className="fva-page">
        <div className="fva-status-visual">
          <div className="fva-ring-1" />
          <div className="fva-ring-2" />
          <div className="fva-status-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(34,197,94,.15)" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="fva-status-tag">✓ Verified</div>
        <div className="fva-status-title">You&apos;re a verified<br/>fan</div>
        <p className="fva-status-sub">Your identity has been confirmed. Your verified badge is now live, and your requests get top priority with creators.</p>
        <div className="fva-timeline">
          <div className="fva-timeline-step">
            <div className="fva-step-dot">✓</div>
            <div><div className="fva-step-title">Documents submitted</div><div className="fva-step-sub">Your ID and selfie were received successfully.</div></div>
          </div>
          <div className="fva-timeline-step">
            <div className="fva-step-dot">✓</div>
            <div><div className="fva-step-title">Review complete</div><div className="fva-step-sub">Our team confirmed your documents.</div></div>
          </div>
          <div className="fva-timeline-step">
            <div className="fva-step-dot">✓</div>
            <div><div className="fva-step-title">Verified badge active</div><div className="fva-step-sub">Live on your profile right now.</div></div>
          </div>
        </div>
        <div className="fva-next-card">
          <div className="fva-next-card-title">✨ What&apos;s different now</div>
          <div className="fva-next-item"><div className="fva-next-item-icon fva-ni-green">⚡</div><div className="fva-next-item-text"><strong>Faster acceptances</strong> — creators prioritise verified fans, so your requests move to the top of their queue.</div></div>
          <div className="fva-next-item"><div className="fva-next-item-icon fva-ni-teal">🛡️</div><div className="fva-next-item-text"><strong>Verified badge</strong> — visible on your profile, showing creators and the community you&apos;re genuine.</div></div>
          <div className="fva-next-item"><div className="fva-next-item-icon fva-ni-gold">🔓</div><div className="fva-next-item-text"><strong>More creators unlocked</strong> — some creators only accept requests from verified fans. They&apos;re open to you now.</div></div>
        </div>
        <button className="fva-btn-explore" onClick={() => router.push("/")}>Explore Creators</button>
        <button className="fva-btn-home" onClick={() => router.back()}>Go Back</button>
      </div>
    </div>
  </>
);

  /* ─── pending state screen ─── */
 if (appStatus === "pending") return (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>{`
      .fvp-nav { position: sticky; top: 0; z-index: 40; background: rgba(8,11,20,.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
      .fvp-nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
      .fvp-nav-logo-icon { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg,#6c63ff,#9b59f5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; }
      .fvp-nav-logo-name { font-size: 15px; font-weight: 700; color: #f1f5f9; }
      .fvp-page { max-width: 480px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; align-items: center; text-align: center; }
      .fvp-status-visual { position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 36px; }
      .fvp-spin-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: #6c63ff; border-right-color: rgba(108,99,255,.3); animation: fvpSpin 2s linear infinite; }
      @keyframes fvpSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      .fvp-pulse-ring { position: absolute; inset: 12px; border-radius: 50%; border: 1px solid rgba(108,99,255,.2); animation: fvpPulsate 3s ease-in-out infinite; }
      @keyframes fvpPulsate { 0%,100%{opacity:.3;transform:scale(.95);} 50%{opacity:1;transform:scale(1.05);} }
      .fvp-status-center { width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg,rgba(108,99,255,.2),rgba(155,89,245,.15)); border: 1px solid rgba(108,99,255,.3); display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
      .fvp-status-center svg { filter: drop-shadow(0 0 10px rgba(108,99,255,.6)); animation: fvpFloat 4s ease-in-out infinite; }
      @keyframes fvpFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
      .fvp-status-tag { display: inline-flex; align-items: center; gap: 7px; background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); border-radius: 100px; padding: 5px 14px; margin-bottom: 18px; font-size: 11px; font-weight: 700; color: #f59e0b; letter-spacing: .08em; text-transform: uppercase; }
      .fvp-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 6px #f59e0b; animation: fvpBlink 2s ease-in-out infinite; }
      @keyframes fvpBlink { 0%,100%{opacity:1;} 50%{opacity:.3;} }
      .fvp-status-title { font-size: 24px; font-weight: 800; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 12px; color: #f1f5f9; }
      .fvp-status-sub { font-size: 14px; color: #94a3b8; line-height: 1.75; max-width: 340px; margin-bottom: 36px; }
      .fvp-timeline { width: 100%; margin-bottom: 32px; }
      .fvp-timeline-step { display: flex; align-items: flex-start; gap: 14px; text-align: left; padding: 14px 0; position: relative; }
      .fvp-timeline-step:not(:last-child)::after { content: ''; position: absolute; left: 15px; top: 46px; width: 2px; height: calc(100% - 14px); background: rgba(255,255,255,0.04); }
      .fvp-timeline-step.done::after { background: rgba(34,197,94,.2); }
      .fvp-timeline-step.active::after { background: linear-gradient(180deg,rgba(108,99,255,.4),rgba(255,255,255,0.04)); }
      .fvp-step-dot { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; position: relative; z-index: 1; border: 1px solid rgba(255,255,255,0.07); background: #0e1220; color: #475569; }
      .fvp-timeline-step.done .fvp-step-dot { background: rgba(34,197,94,.1); border-color: rgba(34,197,94,.3); color: #22c55e; }
      .fvp-timeline-step.active .fvp-step-dot { background: rgba(108,99,255,.12); border-color: rgba(108,99,255,.3); color: #a89cff; animation: fvpStepPulse 2s ease-in-out infinite; }
      @keyframes fvpStepPulse { 0%,100%{box-shadow:0 0 0 0 rgba(108,99,255,.3);} 50%{box-shadow:0 0 0 6px rgba(108,99,255,0);} }
      .fvp-step-title { font-size: 13.5px; font-weight: 700; margin-bottom: 3px; color: #f1f5f9; }
      .fvp-step-sub { font-size: 12px; color: #94a3b8; line-height: 1.5; }
      .fvp-step-time { font-size: 11px; color: #475569; margin-top: 4px; font-weight: 500; }
      .fvp-next-card { width: 100%; background: #111624; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left; }
      .fvp-next-card-title { font-size: 13px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; color: #f1f5f9; }
      .fvp-next-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
      .fvp-next-item:last-child { margin-bottom: 0; }
      .fvp-next-item-icon { width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; }
      .fvp-ni-purple { background: rgba(108,99,255,.12); } .fvp-ni-teal { background: rgba(45,212,191,.1); } .fvp-ni-green { background: rgba(34,197,94,.1); }
      .fvp-next-item-text { font-size: 12.5px; color: #94a3b8; line-height: 1.55; padding-top: 4px; }
      .fvp-next-item-text strong { color: #f1f5f9; font-weight: 600; }
      .fvp-btn-explore { width: 100%; padding: 15px; border-radius: 12px; background: linear-gradient(135deg,#6c63ff,#9b59f5); border: none; color: white; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(108,99,255,.3); transition: all .25s; margin-bottom: 12px; }
      .fvp-btn-explore:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(108,99,255,.45); }
      .fvp-btn-home { width: 100%; padding: 13px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.07); color: #94a3b8; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
      .fvp-btn-home:hover { background: rgba(255,255,255,.04); color: #f1f5f9; }
    `}</style>
    <ToastContainer position="top-center" theme="dark"/>
    <div style={{ background: "#080b14", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#f1f5f9" }}>
      <nav className="fvp-nav">
        <a href="/" className="fvp-nav-logo">
          <div className="fvp-nav-logo-icon">M</div>
          <span className="fvp-nav-logo-name">mmeko</span>
        </a>
        <div style={{ width: 60 }} />
      </nav>
      <div className="fvp-page">
        <div className="fvp-status-visual">
          <div className="fvp-spin-ring" />
          <div className="fvp-pulse-ring" />
          <div className="fvp-status-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="fvp-status-tag"><div className="fvp-tag-dot" />Under Review</div>
        <div className="fvp-status-title">Your verification<br/>is being reviewed</div>
        <p className="fvp-status-sub">We&apos;ve received your documents and our team is reviewing them. This usually takes less than 24 hours.</p>
        <div className="fvp-timeline">
          <div className="fvp-timeline-step done">
            <div className="fvp-step-dot">✓</div>
            <div><div className="fvp-step-title">Documents submitted</div><div className="fvp-step-sub">Your ID and selfie were received successfully.</div><div className="fvp-step-time">Just now</div></div>
          </div>
          <div className="fvp-timeline-step active">
            <div className="fvp-step-dot">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#a89cff" strokeWidth="2"/>
                <path d="M12 7v5l3 3" stroke="#a89cff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div><div className="fvp-step-title">Review in progress</div><div className="fvp-step-sub">Our team is checking your documents.</div><div className="fvp-step-time">Usually within 24 hours</div></div>
          </div>
          <div className="fvp-timeline-step">
            <div className="fvp-step-dot">🛡</div>
            <div><div className="fvp-step-title">Verification complete</div><div className="fvp-step-sub">You&apos;ll receive a notification once reviewed.</div><div className="fvp-step-time">Pending</div></div>
          </div>
        </div>
        <div className="fvp-next-card">
          <div className="fvp-next-card-title">🔔 What happens next</div>
          <div className="fvp-next-item"><div className="fvp-next-item-icon fvp-ni-purple">📩</div><div className="fvp-next-item-text"><strong>You&apos;ll get notified</strong> — we&apos;ll send you a notification the moment your verification is approved or if we need anything else.</div></div>
          <div className="fvp-next-item"><div className="fvp-next-item-icon fvp-ni-green">✅</div><div className="fvp-next-item-text"><strong>Verified badge</strong> — once approved, a verified badge appears on your profile and your requests get 2× priority.</div></div>
          <div className="fvp-next-item"><div className="fvp-next-item-icon fvp-ni-teal">🔓</div><div className="fvp-next-item-text"><strong>More creators unlocked</strong> — some creators only accept requests from verified fans. Approval opens them up to you.</div></div>
        </div>
        <button className="fvp-btn-explore" onClick={() => router.push("/")}>Explore Creators</button>
        <button className="fvp-btn-home" onClick={() => router.push("/")}>Go to Home</button>
      </div>
    </div>
  </>
);

 /* ─── instruction content ─── */
  const idRules = [
    "<strong>Image must be clear</strong> — no blur, shadows or glare",
    "<strong>ID must be fully in frame</strong> — all four corners visible",
    "<strong>Must be in color</strong> — black and white photos are not accepted",
    "<strong>Text must be clearly visible</strong> — name, date of birth and expiry must be readable",
    "<strong>Background must be minimal</strong> — plain surface preferred",
    "<strong>Image must not be edited, resized or rotated</strong> — original capture only",
    "<strong>File must be PNG or JPG</strong> — under 7MB in size",
    "<strong>ID must be valid and not expired</strong> — we do not accept expired documents",
  ];
  const selfieRules = [
    "<strong>Photo must be clear and in color</strong> — good lighting, no filters",
    "<strong>ID must be fully in frame</strong> — held next to your face, both clearly visible",
    "<strong>Facial verification required</strong> — your face must be clear, unobscured and looking at the camera",
    "<strong>Image must not be edited</strong> — no cropping, filters or adjustments of any kind",
    "<strong>File must be PNG or JPG</strong> — under 7MB in size",
  ];


  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:S.text, background:S.bg, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .fv-nav-back:hover { color:#f1f5f9 !important; }
        .fv-slot:hover { border-color:rgba(108,99,255,.5) !important; background:rgba(108,99,255,.04) !important; }
        .fv-benefit:hover { border-color:rgba(108,99,255,.2) !important; }
        .fv-submit:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(108,99,255,.5) !important; }
        .fv-cancel:hover { background:rgba(255,255,255,.04) !important; color:#f1f5f9 !important; }
      `}</style>

      <ToastContainer position="top-center" theme="dark"/>

      {/* NAV */}
      <div style={{ position:"sticky", top:0, zIndex:2, background:"rgba(8,11,20,.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${S.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"white" }}>M</div>
          <span style={{ fontSize:15, fontWeight:700, color:S.text }}>mmeko</span>
        </a>
        <button className="fv-nav-back" onClick={() => router.back()} style={{ display:"flex", alignItems:"center", gap:6, color:S.text2, fontSize:13, fontWeight:600, background:"none", border:"none", fontFamily:"inherit", cursor:"pointer", transition:"color .2s" }}>← Back</button>
      </div>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"32px 20px 60px" }}>

        {/* HEADER */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(108,99,255,.1)", border:"1px solid rgba(108,99,255,.2)", borderRadius:100, padding:"5px 12px", marginBottom:14, fontSize:11, fontWeight:700, color:"#a89cff", letterSpacing:".06em", textTransform:"uppercase" as const }}>🛡 Fan Verification</div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-.02em", marginBottom:8 }}>Verify Your Identity</div>
          <div style={{ fontSize:13.5, color:S.text2, lineHeight:1.65 }}>This is fan verification — it shows creators you&apos;re a real, serious fan. Verified fans get priority on meet &amp; greet requests.</div>
        </div>

        {/* INFO CARD */}
        <div style={{ background:"linear-gradient(135deg,rgba(108,99,255,.08),rgba(155,89,245,.05))", border:"1px solid rgba(108,99,255,.18)", borderRadius:16, padding:"18px 20px", marginBottom:24, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)" }}/>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:6, display:"flex", alignItems:"center", gap:7 }}><span style={{ fontSize:15 }}>💡</span> What is fan verification?</div>
          <div style={{ fontSize:12.5, color:S.text2, lineHeight:1.65 }}>Fan verification confirms you are who you say you are. Creators feel more confident accepting requests from verified fans — making it easier and faster for you to connect with them.</div>
        </div>

        {/* BENEFITS */}
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" as const, color:S.text3, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ display:"block", width:16, height:2, background:S.accent, borderRadius:2 }}/>
          Why get verified
        </div>
        {BENEFITS.map(b => (
          <div key={b.title} className="fv-benefit" style={{ display:"flex", alignItems:"flex-start", gap:12, background:S.card, border:`1px solid ${S.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, transition:"border-color .2s" }}>
            <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, background:b.bg }}>{b.icon}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{b.title}</div>
              <div style={{ fontSize:12, color:S.text2, lineHeight:1.5 }}>{b.desc}</div>
              <div style={{ display:"inline-flex", alignItems:"center", marginTop:6, padding:"3px 9px", borderRadius:6, fontSize:10, fontWeight:700, ...b.badgeStyle }}>{b.badge}</div>
            </div>
          </div>
        ))}

        <div style={{ height:1, background:S.border, margin:"28px 0" }}/>

        {/* UPLOAD */}
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" as const, color:S.text3, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ display:"block", width:16, height:2, background:S.accent, borderRadius:2 }}/>
          Upload your documents
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:12, color:S.text3, marginBottom:20 }}>
          {[0,1].map(i => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", transition:"background .3s",
              background: (i===0?idFile:selfieFile) ? S.success : count===i ? S.accent : S.border
            }}/>
          ))}
          <span style={{ marginLeft:6 }}>{count} of 2 uploaded</span>
        </div>

        <InstrCard icon="🪪" title="Government ID — Requirements" items={idRules} color={S.accent}/>

        <UploadSlot icon="🪪" title="Government-issued ID"
          sub="Passport, driver's licence, or national ID card.<br/>Must be valid and clearly readable."
          accept="image/*,.pdf" filled={!!idFile} onChange={setIdFile}/>

          <InstrCard icon="🤳" title="Selfie with ID — Requirements" items={selfieRules} color={S.teal}/>
          <img
  src="/icons/verificationImage2.jpeg"
  alt="ID verification example"
style={{ width: "100%", height: 380, borderRadius: 12, objectFit: "cover", margin: "8px 0 14px" }}/>

        <UploadSlot icon="🤳" title="Photo holding your ID"
          sub="Take a clear photo of yourself holding your ID next to your face. Both must be visible."
          accept="image/*" filled={!!selfieFile} onChange={setSelfieFile}/>

        {/* Privacy note */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:S.bg3, border:`1px solid ${S.border2}`, borderRadius:10, padding:"12px 14px", marginTop:6 }}>
          <div style={{ fontSize:14, flexShrink:0, marginTop:1 }}>🔒</div>
          <div style={{ fontSize:11.5, color:S.text3, lineHeight:1.55 }}>Your documents are encrypted and only used for identity verification. They are never shared with creators or third parties.</div>
        </div>

        {/* ACTIONS */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:28 }}>
          <button className="fv-submit" disabled={count < 2 || loading || submitted} onClick={handleSubmit}
            style={{ width:"100%", padding:15, borderRadius:12, border:"none", fontFamily:"inherit", fontSize:14, fontWeight:700,
              cursor: count<2||loading||submitted ? "not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              background: submitted ? "linear-gradient(135deg,#22c55e,#16a34a)" : `linear-gradient(135deg,${S.accent},${S.accent2})`,
              color:"white", boxShadow:"0 4px 20px rgba(108,99,255,.35)", transition:"all .25s",
              opacity: count<2 && !submitted ? .4 : 1,
            }}>
            {loading ? <><ClockLoader color="#fff" size={16}/> Submitting…</> : submitted ? "✓ Submitted — under review" : "Submit for Verification"}
          </button>
          <button className="fv-cancel" onClick={() => router.back()}
            style={{ width:"100%", padding:14, borderRadius:12, background:"transparent", border:`1px solid ${S.border}`, color:S.text2, fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer", transition:"all .2s" }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}