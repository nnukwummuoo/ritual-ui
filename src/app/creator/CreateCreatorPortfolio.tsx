/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import PacmanLoader from "react-spinners/PacmanLoader";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "material-react-toastify/dist/ReactToastify.css";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { useUserId } from "@/lib/hooks/useUserId";
import { createCreatorMultipart, checkUserPortfolio } from "@/api/creator";
import { useAuth } from "@/lib/context/auth-context";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getprofile } from "@/store/profile";
import { countryList } from "@/components/CountrySelect/countryList";

const DAY_OPTIONS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const CATEGORY_OPTIONS = [
  {
    value: "Fan meet",
    title: "Fan Meet & Greet",
    description: "In-person meet in a public place — 30 min max",
    icon: "🤝",
    iconBg: "rgba(108,99,255,.12)",
  },
  {
    value: "Fan date",
    title: "Fan Date",
    description: "An exclusive in-person date experience — public venues only",
    icon: "❤️",
    iconBg: "rgba(244,114,182,.1)",
  },
  {
    value: "Fan call",
    title: "Fan Call",
    description: "One-on-one video or voice call with your fan",
    icon: "📱",
    iconBg: "rgba(45,212,191,.1)",
  },
];

const MAX_PHOTOS = 9;

// ── AM / PM hour lists matching the HTML exactly ──────────────────────────
const AM_HOURS = [
  "12:00AM","1:00AM","2:00AM","3:00AM","4:00AM","5:00AM",
  "6:00AM","7:00AM","8:00AM","9:00AM","10:00AM","11:00AM",
];
const PM_HOURS = [
  "12:00PM","1:00PM","2:00PM","3:00PM","4:00PM","5:00PM",
  "6:00PM","7:00PM","8:00PM","9:00PM","10:00PM","11:00PM",
];

export default function CreateCreatorPortfolio() {
  const { session } = useAuth();
  const userid = session?._id ?? useUserId();
  const token = useAuthToken() || session?.token;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const profile = useSelector((state: RootState) => state.profile);
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const isCreatorVerified = useSelector((state: RootState) => state.profile.creator_verified);

  const [loading, setLoading] = useState(false);
  const [showFileSizeModal, setShowFileSizeModal] = useState(false);
  const [name, setname] = useState("");
  const [age, setage] = useState("18");
  const [location, setlocation] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [gender, setgender] = useState("");
  const [pm, setpm] = useState<"AM" | "PM">("PM");
  // ── CHANGED: default duration 30, step 5, min 5 ──
  const [duration, setduration] = useState("30");
  const [price, setprice] = useState("");
  const [priceValue, setPriceValue] = useState<number | null>(null);
  const [discription, setdiscription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("Fan meet");
  const [imglist, setimglist] = useState<string[]>([]);
  const [photolink, setphotolink] = useState<File[]>([]);
  // ── CHANGED: popover instead of modal ──
  const [showRatesPopover, setShowRatesPopover] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countryList.slice(0, 12);
    return countryList.filter((c) => c.toLowerCase().includes(query)).slice(0, 12);
  }, [countryQuery]);

  // ── CHANGED: step 5, min 5, max 30 ──
  const durationValue = Math.max(5, Math.min(30, Number(duration) || 30));

  const hourValues = pm === "AM" ? AM_HOURS : PM_HOURS;

  const displayedSlots = useMemo(() => {
    return Array.from({ length: MAX_PHOTOS }, (_, i) => imglist[i] || null);
  }, [imglist]);

  const rateSubtitle =
    hosttype === "Fan call"
      ? "Rate in GOLD per minute — e.g. 100 gold/min ≈ $4/min"
      : hosttype === "Fan date"
        ? "Suggested: 15,000 gold ≈ $600 per date"
        : "Suggested: 10,000 gold ≈ $400 per meet";

  const ratePriceLabel =
    hosttype === "Fan call"
      ? "Enter your call rate per minute"
      : hosttype === "Fan date"
        ? "Enter rate for the Date in GOLD"
        : "Enter rate for the Meet in GOLD";

  // ── Autofill full name from user profile ────────────────────────────────
  useEffect(() => {
    const currentUserId = reduxUserId || userid;
    if (currentUserId && (!profile.firstname || profile.status === "idle")) {
      let currentToken: string | undefined;
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          currentToken = data?.refreshtoken || data?.accesstoken;
        }
      } catch {}
      if (currentToken) dispatch(getprofile({ userid: currentUserId, token: currentToken }));
    }
    if (profile?.firstname && profile.userId === currentUserId) {
      const fullName = `${profile.firstname} ${profile.lastname || ""}`.trim();
      if (fullName && (!name || name.trim() === "")) setname(fullName);
    } else {
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.firstname && data?.userID === currentUserId) {
              const fullName = `${data.firstname} ${data.lastname || ""}`.trim();
              if (fullName && (!name || name.trim() === "")) setname(fullName);
            }
          }
        }
      } catch {}
    }
  }, [profile, reduxUserId, userid, dispatch, name]);

  // ── Check if user already has a portfolio ────────────────────────────────
  useEffect(() => {
    const checkExistingPortfolio = async () => {
      const currentUserId = reduxUserId || userid;
      if (!currentUserId || !token) return;
      try {
        const response = await checkUserPortfolio({ userid: currentUserId, token });
        if (response.ok && response.hasPortfolio) {
          toast.error("Portfolio already exists", { autoClose: false });
          setdisablebut(true);
        }
      } catch {}
    };
    checkExistingPortfolio();
  }, [reduxUserId, userid, token]);

  // ── CHANGED: step 5, min 5 ───────────────────────────────────────────────
  const updateDuration = (nextValue: number) => {
    const bounded = Math.max(5, Math.min(30, nextValue));
    setduration(String(bounded));
  };

  const updateHostType = (value: string) => sethosttype(value);

  const updatePriceValue = (rawValue: string) => {
    if (hosttype === "Fan call") {
      setprice(`${rawValue} GOLDper minute`);
    } else {
      setprice(`${rawValue} GOLD`);
    }
    const num = Number(rawValue || "");
    setPriceValue(Number.isFinite(num) && num > 0 ? num : null);
  };

  const checkuserInput = async () => {
    if (disablebut || loading) return;
    if (!name || name.trim() === "") return toast.error("Full name is required");
    if (!age) return toast.error("Age is required");
    if (!hosttype) return toast.error("Select host type");
    if (photolink.length <= 0) return toast.error("Please upload at least one image");
    if (!location) return toast.error("Location is required");
    if (!priceValue) return toast.error("Price is required");
    if (!discription) return toast.error("Write your description");
    if (!userid) return toast.error("Missing user, please login again");
    if (!token) return toast.error("Missing token");

    try {
      setdisablebut(true);
      setLoading(true);

      const hosttypeNormalized = hosttype.charAt(0).toUpperCase() + hosttype.slice(1).toLowerCase();

      const data = {
        userid,
        name: name.trim(),
        age: String(age),
        location: location.trim(),
        price: priceValue != null ? String(priceValue) : "",
        displayPrice: price,
        duration,
        description: discription.trim(),
        gender,
        timeava: selectedTimes,
        daysava: selectedDays,
        hosttype: hosttypeNormalized,
      };

      // ── CHANGED: capture response to get hostid for redirect ────────────
      const response = await createCreatorMultipart({ token, userid, data, photolink });
      const hostid = response?.hostid || response?.data?.hostid || response?._id || response?.id || response?.data?._id;

      toast.success("Portfolio created successfully", { autoClose: 3000 });
      router.push(`/creators/${hostid}`);

    // window.location.href = "/creators";

    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const serverMsg = data?.message || data?.msg || data?.error || err?.message;
      const detail = typeof data === "object" ? JSON.stringify(data).slice(0, 400) : String(data || "");
      const msg = serverMsg ? String(serverMsg) : "Failed to create portfolio";
      toast.error(`${status ? `[${status}]` : ""}${msg}${detail && serverMsg !== detail ? `\n${detail}` : ""}`, { autoClose: 6000 });
      setdisablebut(false);
      setLoading(false);
    }
  };

  const handleImageUpload = (files: FileList) => {
    const selected: File[] = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const oversizedFiles = selected.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) { setShowFileSizeModal(true); return; }
    const remaining = Math.max(0, MAX_PHOTOS - photolink.length);
    const slice = selected.slice(0, remaining);
    const previewUrls = slice.map((f) => URL.createObjectURL(f));
    setimglist((prev) => [...prev, ...previewUrls]);
    setphotolink((prev) => [...prev, ...slice]);
  };

  const removeImage = (index: number) => {
    setimglist((prev) => prev.filter((_, i) => i !== index));
    setphotolink((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isCreatorVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b14]">
        <p className="text-xl text-white">You are not verified yet</p>
      </div>
    );
  }

  // Duration progress bar fill %
  const durFillPct = ((durationValue - 5) / (30 - 5)) * 100;

  return (
    <div
      className="min-h-screen bg-[#080b14] text-slate-100"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onClick={() => setShowRatesPopover(false)}
    >
      <ToastContainer position="top-center" theme="dark" />

      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 px-5"
        style={{ background: "rgba(8,11,20,.97)", backdropFilter: "blur(20px)" }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          ← Back
        </button>
        <a href="#" className="flex items-center gap-2 no-underline">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] text-xs font-black text-white">
            M
          </div>
          <span className="text-[15px] font-bold text-white">mmeko</span>
        </a>
        <div style={{ width: 60 }} />
      </nav>

      <div className="mx-auto max-w-[520px] px-5 pb-20 pt-7">

        {/* ── PAGE HEADER ── */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/20 bg-[#6c63ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#a89cff]">
          ✦ Creator Portfolio
        </div>
        <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-white">
          Create Your Portfolio
        </h1>
        <p className="mb-8 text-[13px] leading-relaxed text-slate-400">
          Set up your creator profile so fans can discover and book a meet &amp; greet with you.
        </p>

        {/* ── PERSONAL INFO ── */}
        <SectionLabel>Personal Info</SectionLabel>

        <div className="mb-[18px]">
          <FieldLabel required>Full Name</FieldLabel>
          <input
            value={name}
            readOnly
            className="fi w-full rounded-[10px] border border-white/7 bg-[#111624] px-[14px] py-[13px] text-[13.5px] text-slate-200 outline-none opacity-80"
          />
        </div>

        <div className="mb-[18px] grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Age</FieldLabel>
            <select
              value={age}
              onChange={(e) => setage(e.currentTarget.value)}
              className="fi w-full appearance-none rounded-[10px] border border-white/7 bg-[#111624] px-[14px] py-[13px] text-[13.5px] text-slate-100 outline-none"
            >
              {Array.from({ length: 53 }, (_, i) => 18 + i).map((n) => (
                <option key={n} value={String(n)}>{n} years</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel required>Gender</FieldLabel>
            {/* ── CHANGED: "Couples" option added, order matches HTML ── */}
            <select
              value={gender}
              onChange={(e) => setgender(e.currentTarget.value)}
              className="fi w-full appearance-none rounded-[10px] border border-white/7 bg-[#111624] px-[14px] py-[13px] text-[13.5px] text-slate-100 outline-none"
            >
              <option value="">Select gender</option>
              <option value="Man">Man</option>
              <option value="Woman">Woman</option>
              <option value="Couples">Couples</option>
              <option value="Trans">Trans</option>
            </select>
          </div>
        </div>

        <div className="relative mb-[18px]">
          <FieldLabel required>Location</FieldLabel>
          <input
            value={countryQuery}
            onFocus={() => setShowCountryDropdown(true)}
            onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
            onChange={(e) => {
              setCountryQuery(e.currentTarget.value);
              setlocation(e.currentTarget.value.trim());
            }}
            placeholder="Search country..."
            className="w-full rounded-[10px] border border-white/7 bg-[#111624] px-[14px] py-[13px] text-[13.5px] text-slate-100 outline-none focus:border-[#6c63ff]/40"
          />
          {showCountryDropdown && filteredCountries.length > 0 && (
            <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111624] shadow-2xl">
              {filteredCountries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCountryQuery(country);
                    setlocation(country);
                    setShowCountryDropdown(false);
                  }}
                  className="block w-full border-b border-white/5 px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
                >
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* ── AVAILABLE DAYS ── */}
        <SectionLabel>Available Days</SectionLabel>
        <div className="mb-6 flex flex-wrap gap-[7px]">
          {DAY_OPTIONS.map((day) => {
            const sel = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() =>
                  setSelectedDays((prev) =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  )
                }
                style={{
                  width: 52, height: 48, borderRadius: 10,
                  fontSize: 10, fontWeight: 700, letterSpacing: ".03em",
                  border: sel ? "1px solid rgba(34,197,94,.25)" : "1px solid rgba(255,255,255,.07)",
                  background: sel ? "rgba(34,197,94,.08)" : "#111624",
                  color: sel ? "#22c55e" : "#475569",
                  cursor: "pointer", transition: "all .2s",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* ── AVAILABLE HOURS ── */}
        <SectionLabel>Available Hours</SectionLabel>
        <div className="mb-6 overflow-hidden rounded-xl border border-white/7 bg-[#111624]">
          {/* AM / PM tabs */}
          <div className="grid grid-cols-2 border-b border-white/7">
            {(["AM", "PM"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setpm(tab)}
                className="flex items-center justify-center gap-1.5 py-3 text-sm font-bold transition"
                style={{ background: pm === tab ? "rgba(108,99,255,.1)" : "transparent", color: pm === tab ? "#a89cff" : "#475569" }}
              >
                <span>{tab === "AM" ? "🌞" : "🌙"}</span>
                <span>{tab}</span>
              </button>
            ))}
          </div>
          {/* Hour chips */}
          <div className="grid grid-cols-3 gap-2 p-[14px]">
            {hourValues.map((h) => {
              const sel = selectedTimes.includes(h);
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() =>
                    setSelectedTimes((prev) =>
                      prev.includes(h) ? prev.filter((t) => t !== h) : [...prev, h]
                    )
                  }
                  style={{
                    padding: "9px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    textAlign: "center", cursor: "pointer", transition: "all .2s",
                    background: sel ? "rgba(108,99,255,.14)" : "#0e1220",
                    border: sel ? "1px solid rgba(108,99,255,.35)" : "1px solid rgba(255,255,255,.04)",
                    color: sel ? "#a89cff" : "#94a3b8",
                  }}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* ── CATEGORY ── */}
        <SectionLabel>Choose Category</SectionLabel>
        <div className="mb-6 flex flex-col gap-[10px]">
          {CATEGORY_OPTIONS.map((opt) => {
            const sel = hosttype === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateHostType(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, borderRadius: 12,
                  padding: "16px", textAlign: "left", cursor: "pointer", transition: "all .2s",
                  background: sel ? "rgba(108,99,255,.06)" : "#111624",
                  border: sel ? "1.5px solid rgba(108,99,255,.45)" : "1.5px solid rgba(255,255,255,.07)",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: opt.iconBg }}>
                  {opt.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 3 }}>{opt.title}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.4 }}>{opt.description}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, transition: "all .2s",
                  border: sel ? "2px solid #6c63ff" : "2px solid rgba(255,255,255,.15)",
                  background: sel ? "#6c63ff" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── YOUR RATE ── */}
        <SectionLabel>Your Rate</SectionLabel>
        <div className="relative mb-1.5">
          <FieldLabel required>{ratePriceLabel}</FieldLabel>
          <div className="flex items-start gap-[10px]">
            <div className="flex-1">
              <input
                className="w-full rounded-[10px] border border-white/7 bg-[#111624] px-[14px] py-[13px] text-[13.5px] text-slate-100 outline-none focus:border-[#6c63ff]/40"
                type="number"
                value={priceValue ?? ""}
                placeholder="e.g. 10000"
                min="0"
                onChange={(e) => updatePriceValue(e.currentTarget.value)}
              />
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">{rateSubtitle}</p>
            </div>

            {/* ── CHANGED: inline popover (not modal) ── */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowRatesPopover((v) => !v)}
                title="Suggested rates"
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(108,99,255,.12)", border: "1px solid rgba(108,99,255,.2)",
                  color: "#a89cff", fontSize: 15, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ?
              </button>

              {showRatesPopover && (
                <div
                  style={{
                    position: "absolute", right: 0, top: 44, zIndex: 50,
                    width: 260, background: "#141928",
                    border: "1px solid rgba(108,99,255,.25)", borderRadius: 14,
                    padding: 18, boxShadow: "0 20px 60px rgba(0,0,0,.6)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a89cff", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 14 }}>
                    Suggested Rates
                  </div>

                  {[
                    { icon: "📱", bg: "rgba(45,212,191,.1)", name: "Fan Call (online)", val: "100 gold / min", usd: "≈ $4 / min" },
                    { icon: "🤝", bg: "rgba(108,99,255,.12)", name: "Fan Meet (in person)", val: "10,000 gold", usd: "≈ $400" },
                    { icon: "❤️", bg: "rgba(244,114,182,.1)", name: "Fan Date (in person)", val: "15,000 gold", usd: "≈ $600" },
                  ].map((r) => (
                    <div key={r.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {r.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{r.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{r.val}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{r.usd}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* ── DURATION (hidden for Fan Call) ── */}
        {hosttype !== "Fan call" && (
          <section className="mb-8">
            <SectionLabel>Duration</SectionLabel>

            <p
  style={{
    fontSize: 12,
    color: "rgba(148,163,184,.85)",
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 1.4,
  }}
>
  For premium creators, fans can seamlessly continue their experience by sending another booking request at the end of each session if both parties wish to continue.
</p>

            {/* ── CHANGED: step 5, visual progress bar ── */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateDuration(durationValue - 5)}
                style={{
                  width: 38, height: 38, borderRadius: "50%", fontSize: 20, fontWeight: 700,
                  background: "#111624", border: "1px solid rgba(255,255,255,.07)",
                  color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", transition: "all .2s", lineHeight: 1,
                }}
              >
                −
              </button>
              <div
                style={{
                  flex: 1, background: "#111624", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 10, padding: 13, textAlign: "center",
                  fontSize: 16, fontWeight: 800, letterSpacing: "-.01em",
                }}
              >
                {durationValue} min
              </div>
              <button
                type="button"
                onClick={() => updateDuration(durationValue + 5)}
                style={{
                  width: 38, height: 38, borderRadius: "50%", fontSize: 20, fontWeight: 700,
                  background: "#111624", border: "1px solid rgba(255,255,255,.07)",
                  color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", transition: "all .2s", lineHeight: 1,
                }}
              >
                +
              </button>
            </div>

            {/* ── CHANGED: progress bar replaces range slider ── */}
            <div style={{ height: 4, background: "rgba(255,255,255,.04)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${durFillPct}%`, background: "linear-gradient(90deg,#6c63ff,#9b59f5)", borderRadius: 2, transition: "width .3s" }} />
            </div>
            <p className="mt-1.5 text-center text-[11px] text-slate-500">Maximum 30 minutes per session</p>
          </section>
        )}

        <Divider />

        {/* ── ABOUT ME ── */}
        <SectionLabel>About Me</SectionLabel>
        <div className="mb-8">
          <FieldLabel required>Tell fans about yourself</FieldLabel>
          <textarea
            value={discription}
            onChange={(e) => setdiscription(e.currentTarget.value)}
            rows={4}
            placeholder="e.g. Laid back and fun to be around. I love good conversations and genuine connections..."
            className="w-full resize-none rounded-[10px] border border-white/7 bg-[#111624] px-[14px] py-[13px] text-[13.5px] leading-relaxed text-slate-100 outline-none focus:border-[#6c63ff]/40"
          />
        </div>

        <Divider />

        {/* ── PORTFOLIO PHOTOS ── */}
        <SectionLabel>Portfolio Photos</SectionLabel>
        <div className="mb-3 grid grid-cols-3 gap-[10px]">
          {displayedSlots.map((slot, index) => {
            if (!slot) {
              return (
                <button
                  key={`empty-${index}`}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    aspectRatio: "1", borderRadius: 12, background: "#111624",
                    border: "1.5px dashed rgba(108,99,255,.25)",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 6, cursor: "pointer", transition: "all .2s",
                  }}
                >
                  <span style={{ fontSize: 24, opacity: .4 }}>📷</span>
                  <span style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>Add Photo</span>
                </button>
              );
            }
            return (
              <div
                key={`photo-${index}`}
                style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", position: "relative", border: "1.5px solid rgba(108,99,255,.3)", background: "#111624" }}
              >
                <Image width={300} height={300} alt={`uploaded-${index}`} src={slot} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    position: "absolute", top: 6, right: 6, width: 22, height: 22,
                    borderRadius: "50%", background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.15)",
                    color: "white", fontSize: 12, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", zIndex: 5,
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => { if (e.currentTarget.files?.length) handleImageUpload(e.currentTarget.files); }}
        />

        <p className="mb-8 text-[11.5px] leading-relaxed text-slate-500">
          Upload up to 9 photos. Choose clear, high-quality images that represent you well. Photos are reviewed before going live.
        </p>

        <Divider />

        {/* ── SUBMIT ── */}
        <button
          disabled={disablebut || loading}
          onClick={() => { if (!disablebut && !loading) checkuserInput(); }}
          style={{
            width: "100%", padding: 16, borderRadius: 14, marginBottom: 12,
            background: "linear-gradient(135deg,#6c63ff,#9b59f5)", border: "none",
            color: "white", fontSize: 15, fontWeight: 800, cursor: disablebut || loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 6px 28px rgba(108,99,255,.4)", transition: "all .25s",
            opacity: disablebut || loading ? .4 : 1,
          }}
        >
          {loading ? "Creating Portfolio..." : "Create Portfolio →"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: "100%", padding: 14, borderRadius: 12, background: "transparent",
            border: "1px solid rgba(255,255,255,.07)", color: "#94a3b8",
            fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .2s",
          }}
        >
          Cancel
        </button>

        <div className="mt-4 flex justify-between overflow-hidden">
          <PacmanLoader color="#9b59f5" loading={loading} size={12} />
          <PacmanLoader color="#9b59f5" loading={loading} size={12} />
          <PacmanLoader color="#9b59f5" loading={loading} size={12} />
        </div>
      </div>

      {/* ── FILE SIZE MODAL ── */}
      {showFileSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111624] p-5">
            <h3 className="mb-3 text-lg font-bold text-red-400">File Too Large</h3>
            <p className="mb-4 text-sm text-slate-200">Max size is 10 MB. Please trim or compress before uploading.</p>
            <button
              type="button"
              onClick={() => setShowFileSizeModal(false)}
              className="w-full rounded-xl bg-[#6c63ff] px-4 py-2.5 font-semibold text-white hover:bg-[#5d55ea]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small shared sub-components ──────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
      <span style={{ display: "block", width: 16, height: 2, background: "#6c63ff", borderRadius: 2 }} />
      {children}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-400">
      {children}{" "}
      {required && <span className="text-[11px] text-red-400">*</span>}
    </label>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: "28px 0" }} />;
}