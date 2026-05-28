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

const DAY_OPTIONS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];

const CATEGORY_OPTIONS = [
  {
    value: "Fan meet",
    title: "Fan Meet & Greet",
    description: "In-person meet in a public place - 30 min max",
    icon: "🤝",
    iconBg: "bg-[#6c63ff]/15",
  },
  {
    value: "Fan date",
    title: "Fan Date",
    description: "An exclusive in-person date experience - public venues only",
    icon: "❤️",
    iconBg: "bg-[#f472b6]/15",
  },
  {
    value: "Fan call",
    title: "Fan Call",
    description: "One-on-one video or voice call with your fan",
    icon: "📱",
    iconBg: "bg-[#2dd4bf]/15",
  },
];

const MAX_PHOTOS = 9;

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
  const [pm, setpm] = useState("PM");
  const [duration, setduration] = useState("1");
  const [price, setprice] = useState("");
  const [priceValue, setPriceValue] = useState<number | null>(null);
  const [discription, setdiscription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("Fan meet");
  const [imglist, setimglist] = useState<string[]>([]);
  const [photolink, setphotolink] = useState<File[]>([]);
  const [showPriceGuide, setShowPriceGuide] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countryList.slice(0, 12);
    return countryList.filter((country) => country.toLowerCase().includes(query)).slice(0, 12);
  }, [countryQuery]);

  const durationValue = Math.max(1, Math.min(30, Number(duration) || 1));

  const hourValues = useMemo(() => {
    const values: string[] = [`12:00${pm}`];
    for (let i = 1; i <= 11; i += 1) values.push(`${i}:00${pm}`);
    return values;
  }, [pm]);

  const displayedSlots = useMemo(() => {
    const count = MAX_PHOTOS;
    return Array.from({ length: count }, (_, index) => imglist[index] || null);
  }, [imglist]);

  const rateSubtitle =
    hosttype === "Fan call"
      ? "Rate in GOLD per minute - e.g. 100 gold/min"
      : hosttype === "Fan date"
        ? "Suggested: 15,000 gold per date"
        : "Suggested: 10,000 gold per meet";

  // Autofill full name from user profile
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
      } catch (error) {
        console.error("Error getting token for profile:", error);
      }

      if (currentToken) {
        dispatch(getprofile({ userid: currentUserId, token: currentToken }));
      }
    }

    if (profile?.firstname && profile.userId === currentUserId) {
      const fullName = `${profile.firstname} ${profile.lastname || ""}`.trim();
      if (fullName && (!name || name.trim() === "")) {
        setname(fullName);
      }
    } else {
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            if (data?.firstname && data?.userID === currentUserId) {
              const fullName = `${data.firstname} ${data.lastname || ""}`.trim();
              if (fullName && (!name || name.trim() === "")) {
                setname(fullName);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage for name:", error);
      }
    }
  }, [profile, reduxUserId, userid, dispatch, name]);

  // Check if user already has a portfolio
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
      } catch (error) {
        console.error("Error checking portfolio:", error);
      }
    };

    checkExistingPortfolio();
  }, [reduxUserId, userid, token]);

  const updateDuration = (nextValue: number) => {
    const bounded = Math.max(1, Math.min(30, nextValue));
    setduration(String(bounded));
  };

  const updateHostType = (value: string) => {
    sethosttype(value);
  };

  const updatePriceValue = (rawValue: string) => {
    const minSuffix = hosttype === "Fan call" ? "per minute" : "";
    if (minSuffix) {
      setprice(`${rawValue} GOLD${minSuffix}`);
    } else {
      setprice(`${rawValue} GOLD`);
    }

    const num = Number(rawValue || "");
    setPriceValue(Number.isFinite(num) && num > 0 ? num : null);
  };

  // checkuserInput (logic retained)
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

      await createCreatorMultipart({
        token,
        userid,
        data,
        photolink,
      });

      toast.success("Portfolio created successfully", { autoClose: 3000 });
      window.location.href = "/creator/hostid,userid?new=1";
    } catch (err: any) {
      console.error("Failed to create portfolio", err?.response || err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      const serverMsg = data?.message || data?.msg || data?.error || err?.message;
      const detail = typeof data === "object" ? JSON.stringify(data).slice(0, 400) : String(data || "");
      const msg = serverMsg ? String(serverMsg) : "Failed to create portfolio";
      toast.error(`${status ? `[${status}]` : ""}${msg}${detail && serverMsg !== detail ? `\n${detail}` : ""}`, {
        autoClose: 6000,
      });
      setdisablebut(false);
      setLoading(false);
    }
  };

  const handleImageUpload = (files: FileList) => {
    const selected: File[] = Array.from(files).filter((f) => f.type.startsWith("image/"));

    const oversizedFiles = selected.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setShowFileSizeModal(true);
      return;
    }

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

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ToastContainer position="top-center" theme="dark" />

      <div role="navigation" className="sticky top-0 z-40 h-14 border-b border-white/10 bg-[#080b14]/95 px-4">
        <div className="mx-auto flex h-full w-full max-w-[520px] items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 whitespace-nowrap text-sm text-slate-300 transition hover:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] text-xs font-bold text-white">
              M
            </div>
            <span className="text-lg font-bold text-white">mmeko</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[520px] px-4 pb-16 pt-7">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/25 bg-[#6c63ff]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a89cff]">
          Creator Portfolio
        </div>

        <h1 className="mb-2 text-4xl font-extrabold tracking-[-0.02em] text-white sm:text-lg">Create Your Portfolio</h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          Set up your creator profile so fans can discover and book a meet and greet with you.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Personal Info
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                value={name}
                readOnly
                className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-200 outline-none opacity-80"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Age <span className="text-red-400">*</span>
                </label>
                <select
                  value={age}
                  onChange={(e) => setage(e.currentTarget.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  {Array.from({ length: 53 }, (_, idx) => 18 + idx).map((num) => (
                    <option key={num} value={String(num)}>
                      {num} years
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setgender(e.currentTarget.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Trans">Trans</option>
                  <option value="Couple">Couple</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                value={countryQuery}
                onFocus={() => setShowCountryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setCountryQuery(value);
                  setlocation(value.trim());
                }}
                placeholder="Search country..."
                className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
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
          </div>
        </section>

        <div className="mb-8 h-px bg-white/10" />

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Available Days
          </h2>
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map((day) => {
              const selected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setSelectedDays((prev) =>
                      prev.includes(day)
                        ? prev.filter((value) => value !== day)
                        : [...prev, day],
                    )
                  }
                  className={`flex h-12 w-14 items-center justify-center rounded-xl border text-[11px] font-bold transition ${
                    selected
                      ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#6ee7b7]"
                      : "border-white/10 bg-[#111624] text-slate-500 hover:border-[#6c63ff]/40 hover:text-slate-200"
                  }`}
                >
                  {day === "THUR" ? "THU" : day}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Available Hours
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111624]">
            <div className="grid grid-cols-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setpm("AM")}
                className={`flex items-center justify-center gap-2 py-3 text-sm font-bold transition ${
                  pm === "AM" ? "bg-[#6c63ff]/15 text-[#a89cff]" : "text-slate-500"
                }`}
              >
                <span aria-hidden>🌞</span>
                <span>AM</span>
              </button>
              <button
                type="button"
                onClick={() => setpm("PM")}
                className={`flex items-center justify-center gap-2 py-3 text-sm font-bold transition ${
                  pm === "PM" ? "bg-[#6c63ff]/15 text-[#a89cff]" : "text-slate-500"
                }`}
              >
                <span aria-hidden>🌙</span>
                <span>PM</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
              {hourValues.map((value) => {
                const selected = selectedTimes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setSelectedTimes((prev) =>
                        prev.includes(value)
                          ? prev.filter((hourValue) => hourValue !== value)
                          : [...prev, value],
                      )
                    }
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition ${
                      selected
                        ? "border-[#6c63ff]/45 bg-[#6c63ff]/20 text-[#b8adff]"
                        : "border-white/5 bg-[#0f1527] text-slate-400 hover:border-[#6c63ff]/35 hover:text-slate-200"
                    }`}
                  >
                    {value.replace(/(AM|PM)$/, " $1")}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mb-8 h-px bg-white/10" />

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Choose Category
          </h2>

          <div className="mb-6 space-y-3">
            {CATEGORY_OPTIONS.map((option) => {
              const selected = hosttype === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateHostType(option.value)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-[#6c63ff]/50 bg-[#6c63ff]/10"
                      : "border-white/10 bg-[#111624] hover:border-[#6c63ff]/25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${option.iconBg}`}>
                      <span aria-hidden>{option.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white">{option.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{option.description}</p>
                    </div>
                    <span
                      className={`h-5 w-5 rounded-full border-2 ${
                        selected ? "border-[#6c63ff] bg-[#6c63ff]" : "border-white/15"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Your Rate
          </h2>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              {hosttype === "Fan call" ? "Enter your call rate" : "Enter your rate"}{" "}
              <span className="text-red-400">*</span>
            </label>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
                  type="number"
                  value={priceValue ?? ""}
                  placeholder="e.g. 10000"
                  onChange={(e) => updatePriceValue(e.currentTarget.value)}
                />
                <p className="mt-2 text-xs text-slate-500">{rateSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceGuide(true)}
                className="h-10 w-10 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/15 font-bold text-[#a89cff]"
                title="View Suggested Rates"
              >
                ?
              </button>
            </div>
          </div>
        </section>

        <div className="mb-8 h-px bg-white/10" />
       {hosttype !== "Fan call" && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Duration
          </h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateDuration(durationValue - 1)}
              className="h-10 w-10 rounded-full border border-white/10 bg-[#111624] text-xl text-slate-300 hover:border-[#6c63ff]/35"
            >
              -
            </button>
            <div className="flex-1 rounded-xl border border-white/10 bg-[#111624] py-3 text-center text-2xl font-extrabold">
              {durationValue} min
            </div>
            <button
              type="button"
              onClick={() => updateDuration(durationValue + 1)}
              className="h-10 w-10 rounded-full border border-white/10 bg-[#111624] text-xl text-slate-300 hover:border-[#6c63ff]/35"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={durationValue}
            onChange={(e) => updateDuration(Number(e.currentTarget.value))}
            className="mt-4 w-full accent-[#7f6bff]"
          />
          <p className="mt-2 text-center text-xs text-slate-500">Maximum 30 minutes per session</p>
        </section>
       )}
        <div className="mb-8 h-px bg-white/10" />

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            About Me
          </h2>

          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Tell fans about yourself <span className="text-red-400">*</span>
          </label>
          <textarea
            value={discription}
            onChange={(e) => setdiscription(e.currentTarget.value)}
            rows={5}
            placeholder="e.g. Laid back and fun to be around. I love good conversations and genuine connections..."
            className="w-full resize-none rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
          />
        </section>

        <div className="mb-8 h-px bg-white/10" />

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Portfolio Photos
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {displayedSlots.map((slot, index) => {
              if (!slot) {
                return (
                  <button
                    key={`empty-${index}`}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[#6c63ff]/25 bg-[#111624] transition hover:border-[#6c63ff]/50 hover:bg-[#6c63ff]/[0.04]"
                  >
                    <span aria-hidden className="text-2xl opacity-40 text-slate-400">
                      📷
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Add Photo
                    </span>
                  </button>
                );
              }

              return (
                <div
                  key={`photo-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-[#6c63ff]/30 bg-[#111624]"
                >
                  <Image width={300} height={300} alt={`uploaded-${index}`} src={slot} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 h-6 w-6 rounded-full bg-black/70 text-xs text-white"
                    title="Remove"
                  >
                    x
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
            onChange={(e) => {
              if (e.currentTarget.files?.length) {
                handleImageUpload(e.currentTarget.files);
              }
            }}
          />

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Upload up to 9 photos. Choose clear, high-quality images that represent you well. Photos are
            reviewed before going live.
          </p>
        </section>

        <div className="mb-8 h-px bg-white/10" />

        <button
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] px-4 py-4 text-lg font-extrabold text-white shadow-[0_10px_36px_rgba(108,99,255,0.4)] disabled:opacity-50"
          disabled={disablebut || loading}
          onClick={() => {
            if (!disablebut && !loading) checkuserInput();
          }}
        >
          {loading ? "Creating Portfolio..." : "Create Portfolio ->"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-base font-semibold text-slate-300 hover:bg-white/5"
        >
          Cancel
        </button>

        <div className="mt-4 flex justify-between overflow-hidden">
          <PacmanLoader color="#9b59f5" loading={loading} size={12} />
          <PacmanLoader color="#9b59f5" loading={loading} size={12} />
          <PacmanLoader color="#9b59f5" loading={loading} size={12} />
        </div>
      </div>

      {showPriceGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#6c63ff]/35 bg-[#141928] p-5">
            <button
              type="button"
              onClick={() => setShowPriceGuide(false)}
              className="absolute right-4 top-3 text-xl text-slate-400 hover:text-white"
            >
              x
            </button>

            <h3 className="mb-4 text-lg font-bold text-white">Suggested Rates</h3>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#111624] p-3">
                <p className="text-sm font-semibold text-white">Fan call (online)</p>
                <p className="text-base font-bold text-amber-400">100 gold / min</p>
              </div>
              <div className="rounded-xl bg-[#111624] p-3">
                <p className="text-sm font-semibold text-white">Fan Meet (in person)</p>
                <p className="text-base font-bold text-amber-400">10,000 gold</p>
              </div>
              <div className="rounded-xl bg-[#111624] p-3">
                <p className="text-sm font-semibold text-white">Fan Date (in person)</p>
                <p className="text-base font-bold text-amber-400">15,000 gold</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPriceGuide(false)}
              className="mt-5 w-full rounded-xl bg-[#6c63ff] px-4 py-2.5 font-semibold text-white hover:bg-[#5d55ea]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showFileSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111624] p-5">
            <h3 className="mb-3 text-lg font-bold text-red-400">File Too Large</h3>
            <p className="mb-4 text-sm text-slate-200">
              Max size is 5 MB. Please trim or compress before uploading.
            </p>
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