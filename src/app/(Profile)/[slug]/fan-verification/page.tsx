/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { post_fan_verification, checkApplicationStatus } from "@/store/profile";
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
  dispatch(checkApplicationStatus({ userid: userId, token }))
    .unwrap()
    .then(r => {
      console.log("🔍 checkApplicationStatus response:", r);  // ADD THIS
      if (r.status === "approved") setAppStatus("approved");
      else if (r.status === "pending") setAppStatus("pending");
    })
    .catch((err) => {
      console.log("❌ checkApplicationStatus error:", err);  // ADD THIS
    });
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
  <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center", color:S.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
    <ToastContainer position="top-center" theme="dark"/>
    <div style={{ background:S.card, border:`1px solid rgba(34,197,94,.2)`, borderRadius:20, padding:"40px 32px", textAlign:"center", maxWidth:360 }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 20px" }}>✅</div>
      <h2 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>You&apos;re Verified!</h2>
      <p style={{ color:S.text2, fontSize:13.5, lineHeight:1.65, marginBottom:24 }}>Your identity has been confirmed. You now have full verified fan status.</p>
      <button onClick={() => router.back()} style={{ padding:"12px 28px", borderRadius:10, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, border:"none", color:"white", fontWeight:700, fontSize:14, fontFamily:"inherit", cursor:"pointer" }}>Go Back</button>
    </div>
  </div>
);

  /* ─── pending state screen ─── */
  if (appStatus === "pending") return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center", color:S.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <ToastContainer position="top-center" theme="dark"/>
      <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:20, padding:"40px 32px", textAlign:"center", maxWidth:360 }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(234,179,8,.15)", border:"1px solid rgba(234,179,8,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 20px" }}>⏳</div>
        <h2 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Verification Pending</h2>
        <p style={{ color:S.text2, fontSize:13.5, lineHeight:1.65, marginBottom:24 }}>Your documents are under review. You&apos;ll hear from us within a few hours.</p>
        <button onClick={() => router.back()} style={{ padding:"12px 28px", borderRadius:10, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, border:"none", color:"white", fontWeight:700, fontSize:14, fontFamily:"inherit", cursor:"pointer" }}>Go Back</button>
      </div>
    </div>
  );

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

        <UploadSlot icon="🪪" title="Government-issued ID"
          sub="Passport, driver's licence, or national ID card.<br/>Must be valid and clearly readable."
          accept="image/*,.pdf" filled={!!idFile} onChange={setIdFile}/>
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