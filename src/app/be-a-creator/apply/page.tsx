/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { post_exclusive_docs } from "@/store/creatorSlice";
import { checkApplicationStatus } from "@/store/profile";
import { useAuth } from "@/lib/context/auth-context";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { toast, ToastContainer } from "react-toastify";
import { RootState, AppDispatch } from "@/store/store";
import { formVerificationConstants } from "@/constants/formVerificationConstants";
import ClockLoader from "react-spinners/ClockLoader";

/* ─── colour tokens ─── */
const S = {
  bg:     "#080b14", bg2: "#0b0f1c", bg3: "#0e1220",
  card:   "#111624", card2: "#161b2e",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.04)",
  accent: "#6c63ff", accent2: "#9b59f5",
  teal:   "#2dd4bf", success: "#22c55e",
  text:   "#f1f5f9", text2: "#94a3b8", text3: "#475569",
};
const css = (obj: React.CSSProperties) => obj;

/* ─── sub-components ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={css({ display:"flex", alignItems:"center", gap:8, fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:S.text3, marginBottom:14 })}>
      <span style={{ display:"block", width:16, height:2, background:S.accent, borderRadius:2 }} />
      {children}
    </div>
  );
}

function FormInput({ label, required: req, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
      <label style={{ fontSize:12.5, fontWeight:600, color:S.text2 }}>
        {label} {req && <span style={{ color:"#ef4444", fontSize:11 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = css({
  background: S.card, border: `1px solid ${S.border}`, borderRadius:10,
  padding:"12px 14px", fontSize:13.5, color: S.text, fontFamily:"inherit",
  outline:"none", width:"100%", transition:"border-color .2s",
});

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

function UploadSlot({ label, sub, icon, imgSrc, name, filled, onChange }: {
  label: string; sub: string; icon: string; imgSrc?: string; name: string; filled: boolean; onChange: (e:any)=>void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      style={{
        background: filled ? "rgba(34,197,94,.03)" : S.card,
        border: `1.5px ${filled?"solid":"dashed"} ${filled?"rgba(34,197,94,.3)":"rgba(108,99,255,.25)"}`,
        borderRadius:14, padding:"24px 20px", display:"flex", flexDirection:"column",
        alignItems:"center", gap:10, textAlign:"center", cursor:"pointer",
        marginBottom:14, position:"relative", transition:"border-color .2s, background .2s",
      }}
    >
      {filled && (
        <div style={{ position:"absolute", top:12, right:12, width:22, height:22, borderRadius:"50%", background:S.success, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"white" }}>✓</div>
      )}
      <div style={{ width:60, height:60, borderRadius:12, background: filled?"rgba(34,197,94,.1)":"rgba(108,99,255,.1)", border:`1px solid ${filled?"rgba(34,197,94,.2)":"rgba(108,99,255,.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, overflow:"hidden" }}>
        {filled ? "✓" : imgSrc ? <img src={imgSrc} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:11 }}/> : icon}
      </div>
      <div style={{ fontSize:14, fontWeight:700 }}>{label}</div>
      <div style={{ fontSize:11.5, color:S.text3, lineHeight:1.5 }}>{sub}</div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); ref.current?.click(); }}
        style={{ padding:"8px 20px", borderRadius:8, background: filled?"rgba(34,197,94,.1)":"rgba(108,99,255,.1)", border:`1px solid ${filled?"rgba(34,197,94,.2)":"rgba(108,99,255,.2)"}`, color: filled?S.success:"#a89cff", fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}
      >
        {filled ? "Uploaded ✓" : "Choose File"}
      </button>
      <input ref={ref} type="file" name={name} accept="image/png,image/jpeg" style={{ display:"none" }} onChange={onChange} />
    </div>
  );
}

/* ─── progress step labels ─── */
const STEPS = ["Profile", "Verification", "Review"];

export default function VerifiedUserForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const userId   = useSelector((s: RootState) => s.profile.userId);
  const { session } = useAuth();
  const token    = useAuthToken() || session?.token;
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading]   = useState(false);
  const [termsAgreed, setTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [appStatus, setAppStatus] = useState<"pending"|"rejected"|"none">("none");

  const [form, setForm] = useState<formVerificationConstants>({
    firstName:"", lastName:"", email:"", dob:"", country:"",
    city:"", address:"", idPhotofile:null, holdingIdPhotofile:null,
    userid: userId||"", documentType:"", idexpire:"",
  });

  /* check existing application */
  useEffect(() => {
    if (!userId || !token) { toast.error("Please log in again."); router.push("/"); return; }
    dispatch(checkApplicationStatus({ userid:userId, token })).unwrap()
      .then(r => { setAppStatus(r.status); if(r.status==="pending") setShowModal(true); })
      .catch(e => { toast.error(e.message||"Failed to check application status"); setAppStatus("none"); });
  }, [userId, token, dispatch, router]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, files } = e.target;
    setForm(p => ({ ...p, [name]: type==="file" ? files[0] : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!(form.idPhotofile instanceof File) || !(form.holdingIdPhotofile instanceof File))
      return toast.error("Please upload both ID photo and selfie with ID.");
    const req = ["firstName","lastName","email","dob","country","city","address","documentType","idexpire"];
    if (req.some(k => !(form as any)[k])) return toast.error("Please fill in all required fields.");
    const today = new Date(), dob = new Date(form.dob), exp = new Date(form.idexpire);
    if (dob > new Date(today.getFullYear()-18, today.getMonth(), today.getDate())) return toast.error("You must be at least 18 years old.");
    if (exp < today) return toast.error("ID expiration date must be in the future.");
    setLoading(true);
    try {
      await dispatch(post_exclusive_docs(form)).unwrap();
      toast.success("Application submitted!"); setAppStatus("pending"); setShowModal(true);
    } catch(err:any) { toast.error(err || "Failed to submit. Please try again."); }
    finally { setLoading(false); }
  };

  /* ─── pending screen ─── */
  if (appStatus === "pending") return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center", color:S.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <ToastContainer position="top-center" theme="dark"/>
      <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:20, padding:"40px 32px", textAlign:"center", maxWidth:360 }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(234,179,8,.15)", border:"1px solid rgba(234,179,8,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 20px" }}>⏳</div>
        <h2 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Application Pending</h2>
        <p style={{ color:S.text2, fontSize:13.5, lineHeight:1.65, marginBottom:24 }}>Your application is now under review. You&apos;ll hear from us within a few hours.</p>
        <button onClick={() => router.push("/")} style={{ padding:"12px 28px", borderRadius:10, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, border:"none", color:"white", fontWeight:700, fontSize:14, fontFamily:"inherit", cursor:"pointer" }}>Back to Home</button>
      </div>
    </div>
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

  /* ─── main render ─── */
  return (
    <div ref={containerRef} style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:S.text, background:S.bg, minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input[type=date]::-webkit-calendar-picker-indicator { filter:invert(.5); }
        .vf-input:focus { border-color:rgba(108,99,255,.45) !important; }
        .vf-slot:hover  { border-color:rgba(108,99,255,.5)  !important; background:rgba(108,99,255,.03) !important; }
        .vf-nav-back:hover  { color:#f1f5f9 !important; }
        .vf-btn-submit:not(:disabled):hover { box-shadow:0 8px 28px rgba(108,99,255,.5) !important; transform:translateY(-2px); }
        .vf-cancel:hover { background:rgba(255,255,255,.04) !important; color:#f1f5f9 !important; }
      `}</style>

      <ToastContainer position="top-center" theme="dark"/>

      {/* NAV */}
      <div style={{ position:"sticky", top:0, zIndex:80, background:"rgba(8,11,20,.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${S.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"white" }}>M</div>
          <span style={{ fontSize:15, fontWeight:700, color:S.text }}>mmeko</span>
        </a>
        <button className="vf-nav-back" onClick={() => router.back()} style={{ display:"flex", alignItems:"center", gap:6, color:S.text2, fontSize:13, fontWeight:600, background:"none", border:"none", fontFamily:"inherit", cursor:"pointer", transition:"color .2s" }}>← Back</button>
      </div>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"32px 20px 80px" }}>

        {/* HEADER */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(108,99,255,.1)", border:"1px solid rgba(108,99,255,.2)", borderRadius:100, padding:"5px 12px", marginBottom:14, fontSize:11, fontWeight:700, color:"#a89cff", letterSpacing:".06em", textTransform:"uppercase" as const }}>
          ✦ Creator Verification
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.02em", marginBottom:8 }}>Verify Your Identity</h1>
        <p style={{ fontSize:13.5, color:S.text2, lineHeight:1.65, marginBottom:32 }}>Complete identity verification to start accepting fan requests. Your information is encrypted and never shared.</p>

        {/* PROGRESS — Profile done, Verification active, Review upcoming */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center" }}>
            {STEPS.map((label, i) => {
              const sn     = i + 1;
              // Profile (1) is always done; Verification (2) is always active; Review (3) is always upcoming
              const done   = sn === 1;
              const active = sn === 2;
              return (
                <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position:"absolute", top:14, left:"50%", width:"100%", height:2, background: done ? "rgba(108,99,255,.3)" : S.border2, zIndex:0 }} />
                  )}
                  <div style={{
                    width:28, height:28, borderRadius:"50%", zIndex:1,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700,
                    background: done  ? "rgba(108,99,255,.15)"
                               : active ? `linear-gradient(135deg,${S.accent},${S.accent2})`
                               : S.bg3,
                    border: done  ? "1px solid rgba(108,99,255,.3)"
                           : active ? "none"
                           : `1px solid ${S.border}`,
                    color: done ? "#a89cff" : active ? "white" : S.text3,
                  }}>
                    {done ? "✓" : sn}
                  </div>
                  <div style={{ fontSize:10, fontWeight:600, marginTop:6, color: active ? "#a89cff" : done ? S.text2 : S.text3 }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <fieldset disabled={loading} style={{ border:"none", padding:0 }}>
          <form onSubmit={handleSubmit}>

            {/* ── PERSONAL INFORMATION ── */}
            <SectionLabel>Personal Information</SectionLabel>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FormInput label="First Name" required>
                <input className="vf-input" style={inputStyle} name="firstName" placeholder="e.g. Sofia" value={form.firstName} onChange={handleChange}/>
              </FormInput>
              <FormInput label="Last Name" required>
                <input className="vf-input" style={inputStyle} name="lastName" placeholder="e.g. Rodriguez" value={form.lastName} onChange={handleChange}/>
              </FormInput>
            </div>

            <FormInput label="Email Address" required>
              <input className="vf-input" style={inputStyle} type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange}/>
            </FormInput>

            <FormInput label="Date of Birth" required>
              <input className="vf-input" style={inputStyle} type="date" name="dob" value={form.dob} onChange={handleChange}/>
            </FormInput>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FormInput label="Country" required>
                <select className="vf-input" name="country" value={form.country} onChange={handleChange}
                  style={{ ...inputStyle, cursor:"pointer", appearance:"none" as any, backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23475569' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:36 }}>
                  <option value="">Select country</option>
                  {["United States","United Kingdom","Nigeria","Canada","Australia","Ghana","South Africa","Kenya","Germany","France","Philippines","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </FormInput>
              <FormInput label="City" required>
                <input className="vf-input" style={inputStyle} name="city" placeholder="e.g. Lagos" value={form.city} onChange={handleChange}/>
              </FormInput>
            </div>

            <FormInput label="Residential Address" required>
              <input className="vf-input" style={inputStyle} name="address" placeholder="Street address" value={form.address} onChange={handleChange}/>
            </FormInput>

            {/* ── DIVIDER ── */}
            <div style={{ height:1, background:S.border, margin:"28px 0" }} />

            {/* ── IDENTITY DOCUMENTS ── */}
            <SectionLabel>Identity Documents</SectionLabel>

            {/* Document type + expiry */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:4 }}>
              <FormInput label="Document Type" required>
                <select className="vf-input" name="documentType" value={form.documentType} onChange={handleChange}
                  style={{ ...inputStyle, cursor:"pointer", appearance:"none" as any, backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23475569' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:36 }}>
                  <option value="">Select type</option>
                  <option value="passport">Passport</option>
                  <option value="nationalId">ID Card</option>
                  <option value="driversLicense">Driver&apos;s License</option>
                </select>
              </FormInput>
              <FormInput label="ID Expiry Date" required>
                <input className="vf-input" style={inputStyle} type="date" name="idexpire" value={form.idexpire} onChange={handleChange}/>
              </FormInput>
            </div>

            <div style={{ height:1, background:S.border, margin:"20px 0" }} />

           <InstrCard icon="🪪" title="Government ID — Requirements" items={idRules} color={S.accent}/>
<UploadSlot
  label="Upload Government-issued ID"
  sub="Passport, driver's licence, or national ID card"
  icon="🪪" name="idPhotofile"
  filled={form.idPhotofile instanceof File}
  onChange={handleChange}
/>



<InstrCard icon="🤳" title="Selfie with ID — Requirements" items={selfieRules} color={S.teal}/>
    <img
  src="/icons/verificationImage2.jpeg"
  alt="ID verification example"
style={{ width: "100%", height: 380, borderRadius: 12, objectFit: "cover", margin: "8px 0 20px" }}/>
<UploadSlot
  label="Upload photo holding your ID"
  sub="Your face and ID must both be clearly visible"
  icon="🤳" name="holdingIdPhotofile"
  filled={form.holdingIdPhotofile instanceof File}
  onChange={handleChange}
/>

            {/* Privacy note */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:S.bg3, border:`1px solid ${S.border2}`, borderRadius:10, padding:"12px 14px", marginTop:4, marginBottom:28 }}>
              <div style={{ fontSize:14, flexShrink:0, marginTop:1 }}>🔒</div>
              <div style={{ fontSize:11.5, color:S.text3, lineHeight:1.6 }}>Your documents are encrypted end-to-end and used solely for identity verification. They are never visible to fans, other creators, or third parties.</div>
            </div>

            {/* Terms checkbox */}
            <div
              onClick={() => setTerms(t => !t)}
              style={{ display:"flex", alignItems:"flex-start", gap:12, background: termsAgreed?"rgba(108,99,255,.04)":S.card, border:`1px solid ${termsAgreed?"rgba(108,99,255,.3)":S.border}`, borderRadius:12, padding:16, marginBottom:24, cursor:"pointer", transition:"border-color .2s" }}
            >
              <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, marginTop:1, border: termsAgreed?"none":`1.5px solid ${S.border}`, background: termsAgreed?S.accent:S.bg3, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"white", transition:"all .2s" }}>
                {termsAgreed && "✓"}
              </div>
              <div style={{ fontSize:12.5, color:S.text2, lineHeight:1.6 }}>
                I confirm that all information provided is accurate and the documents submitted are genuine and belong to me. I agree to mmeko&apos;s{" "}
                <a href="#" style={{ color:"#a89cff", textDecoration:"none" }} onClick={e=>e.stopPropagation()}>Terms of Service</a> and{" "}
                <a href="#" style={{ color:"#a89cff", textDecoration:"none" }} onClick={e=>e.stopPropagation()}>Privacy Policy</a>.
              </div>
            </div>

            {/* Submit + Cancel */}
            <button
              type="submit"
              className="vf-btn-submit"
              disabled={loading || !termsAgreed}
              style={{ width:"100%", padding:15, borderRadius:12, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, border:"none", color:"white", fontWeight:700, fontSize:14, fontFamily:"inherit", cursor: loading||!termsAgreed?"not-allowed":"pointer", opacity: loading||!termsAgreed ? .45 : 1, boxShadow:"0 4px 20px rgba(108,99,255,.35)", transition:"all .25s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:12 }}
            >
              {loading ? <><ClockLoader color="#fff" size={16}/> Submitting…</> : "Submit for Verification"}
            </button>

            <button
              type="button"
              className="vf-cancel"
              onClick={() => router.back()}
              style={{ width:"100%", padding:14, borderRadius:12, background:"transparent", border:`1px solid ${S.border}`, color:S.text2, fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer", transition:"all .2s" }}
            >
              Cancel
            </button>

          </form>
        </fieldset>

        {/* SUCCESS MODAL */}
        {showModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
            <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:20, padding:"40px 32px", textAlign:"center", maxWidth:360, width:"90%" }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 20px" }}>✓</div>
              <h2 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Application Submitted</h2>
              <p style={{ color:S.text2, fontSize:13.5, lineHeight:1.65, marginBottom:24 }}>Your application is now under review. You will hear from us within a few hours.</p>
              <button onClick={() => { setShowModal(false); router.push("/"); }}
                style={{ padding:"12px 28px", borderRadius:10, background:`linear-gradient(135deg,${S.accent},${S.accent2})`, border:"none", color:"white", fontWeight:700, fontSize:14, fontFamily:"inherit", cursor:"pointer" }}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}