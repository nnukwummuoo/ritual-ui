/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { editCreatorMultipart } from "@/api/creator";
import { useUserId } from "@/lib/hooks/useUserId";
import { getprofile } from "@/store/profile";
import { countryList } from "@/components/CountrySelect/countryList";

const DAY_OPTIONS = [
  { value: "MON", label: "MON" },
  { value: "TUE", label: "TUE" },
  { value: "WED", label: "WED" },
  { value: "THUR", label: "THU" },
  { value: "FRI", label: "FRI" },
  { value: "SAT", label: "SAT" },
  { value: "SUN", label: "SUN" },
];

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

export default function Editcreator() {
  const userid = useUserId();
  const creator = useSelector((state: any) => state.creator.creatorbyid);
  const creator_portfolio_id = (creator &&
    (creator.hostid || creator.id || creator._id)) as string | undefined;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const profile = useSelector((state: any) => state.profile);
  const reduxUserId = useSelector((state: any) => state.register.userID);

  const [loading, setLoading] = useState(false);
  const [showFileSizeModal, setShowFileSizeModal] = useState(false);
  const [name, setname] = useState("");
  const [age, setage] = useState("");
  const [location, setlocation] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [gender, setgender] = useState("");
  const [pm, setpm] = useState("PM");
  const [duration, setduration] = useState("");
  const [days, setdays] = useState("");
  const [price, setprice] = useState("");
  const [description, setdescription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("Fan meet");
  const [showPriceGuide, setShowPriceGuide] = useState(false);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [hours, setHours] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hosttypeInitialized = useRef(false);
  const token = useAuthToken();
  const imagesInitialized = useRef(false); 

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countryList.slice(0, 12);
    return countryList
      .filter((country) => country.toLowerCase().includes(query))
      .slice(0, 12);
  }, [countryQuery]);

  const durationValue = Math.max(1, Math.min(30, Number(duration) || 1));

  const hourValues = useMemo(() => {
    const values: string[] = [`12:00${pm}`];
    for (let i = 1; i <= 11; i += 1) {
      values.push(`${i}:00${pm}`);
    }
    return values;
  }, [pm]);

  const displayedSlots = useMemo(() => {
    const existingSlots = existingImages.map((imageUrl, index) => ({
      id: `existing-${index}`,
      kind: "existing" as const,
      index,
      imageUrl,
    }));

    const newSlots = newImages.map((file, index) => ({
      id: `new-${index}`,
      kind: "new" as const,
      index,
      file,
    }));

    const combinedSlots = [...existingSlots, ...newSlots].slice(0, MAX_PHOTOS);
    return Array.from({ length: MAX_PHOTOS }, (_, index) => combinedSlots[index] || null);
  }, [existingImages, newImages]);

  const rateSubtitle =
    hosttype === "Fan call"
      ? "Rate in GOLD per minute - e.g. 100 gold/min"
      : hosttype === "Fan date"
        ? "Suggested: 15,000 gold per date"
        : "Suggested: 10,000 gold per meet";

  // Prefill fields from store creator and guard when missing
  useEffect(() => {
    if (!creator || !creator_portfolio_id) {
      toast.info("Open a creator page before editing", { autoClose: 2000 });
      router.push("/creators");
      return;
    }

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

    setname(creator.name || "");
    setage(creator.age || "");
    setlocation(creator.location || "");
    setCountryQuery(creator.location || "");
    setgender(creator.gender || "");
    setdescription(creator.description || "");

    if (creator.hosttype && !hosttypeInitialized.current) {
      sethosttype(creator.hosttype);
      hosttypeInitialized.current = true;
    }

    if (typeof creator.price === "string") {
      setprice(creator.price);
    }

    if (typeof creator.duration === "string") {
      setdays(creator.duration);
      const num = creator.duration.match(/\d+/)?.[0] || "";
      if (num) setduration(num);
    }

    const toArray = (v: any): string[] => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string") {
        return v
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    if (creator.timeava && !times.length) {
      setTimes(toArray(creator.timeava));
    }
    if (creator.daysava && !hours.length) {
      setHours(toArray(creator.daysava));
    }

   if (creator.photolink && !imagesInitialized.current) {
  const existingImgArray =
    typeof creator.photolink === "string"
      ? creator.photolink.split(",").filter((url: string) => url.trim())
      : Array.isArray(creator.photolink)
        ? creator.photolink.filter((url: string) => url.trim())
        : [];
  setExistingImages(existingImgArray);
  imagesInitialized.current = true;
}
  }, [
    creator,
    creator_portfolio_id,
    router,
    dispatch,
    hosttype,
    profile.firstname,
    profile.status,
    reduxUserId,
    userid,
  ]);

  // Autofill full name from user profile
  useEffect(() => {
    const currentUserId = reduxUserId || userid;

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
              const fullName =
                `${data.firstname} ${data.lastname || ""}`.trim();
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
  }, [profile, reduxUserId, userid, name]);

  const updateDuration = (nextValue: number) => {
    const bounded = Math.max(1, Math.min(30, nextValue));
    setduration(String(bounded));
    setdays(`${bounded}min`);
  };

  const checkuserInput = async () => {
    console.log("[EditCreatorPortfolio] Starting validation");
    console.log("[EditCreatorPortfolio] Current state:", {
      age,
      hosttype,
      newImagesCount: newImages.length,
      existingImagesCount: existingImages.length,
      totalImages: newImages.length + existingImages.length,
      location,
      price,
      description,
      userid,
      token: token ? "present" : "missing",
      creator_portfolio_id,
    });

    if (!age) return toast.error("Age Empty", { autoClose: 2000 });
    if (!hosttype) return toast.error("Select host type", { autoClose: 2000 });
    if (newImages.length === 0 && existingImages.length === 0) {
      return toast.error("Please upload at least one image", {
        autoClose: 2000,
      });
    }
    if (!location) return toast.error("Location Empty", { autoClose: 2000 });
    if (!price) return toast.error("Price Empty", { autoClose: 2000 });
    if (!description)
      return toast.error("Write your description", { autoClose: 2000 });

    if (!userid) return toast.error("Missing user, please login again");
    if (!token) return toast.error("Missing token");
    if (!creator_portfolio_id) return toast.error("Missing creator id");

    try {
      setdisablebut(true);
      setLoading(true);

      const preservedExistingImages = existingImages.filter(
        (img) => !imagesToDelete.includes(img),
      );

      console.log("[EditCreatorPortfolio] Image analysis:", {
        newImagesCount: newImages.length,
        existingImagesCount: existingImages.length,
        imagesToDeleteCount: imagesToDelete.length,
        preservedExistingImagesCount: preservedExistingImages.length,
        totalImagesAfterEdit: newImages.length + preservedExistingImages.length,
      });

      const data = {
        userId: userid,
        creator_portfolio_id,
        name,
        age,
        location,
        price,
        duration: days || `${durationValue}min`,
        description,
        gender,
        timeava: times.length > 0 ? times : creator?.timeava || [],
        daysava: hours.length > 0 ? hours : creator?.daysava || [],
        hosttype,
        hostid: userid,
        existingImages: preservedExistingImages,
        imagesToDelete,
      };

      const filesToUpload = newImages.length > 0 ? newImages : [];

      await editCreatorMultipart({
        token,
        data,
        files: filesToUpload,
      });

      toast.success("Portfolio updated successfully");
      window.location.href = `/creators/${creator_portfolio_id}`;
    } catch (err: any) {
      console.error("Failed to update portfolio", err);
      toast.error(typeof err === "string" ? err : "Failed to update portfolio");
    } finally {
      setdisablebut(false);
      setLoading(false);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageToDelete = existingImages[index];

    setImagesToDelete((prev) => [...prev, imageToDelete]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (files: FileList) => {
    if (files?.length) {
      const selectedFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      const oversizedFiles = selectedFiles.filter(
        (f: any) => f.size > 10 * 1024 * 1024,
      );
      if (oversizedFiles.length > 0) {
        setShowFileSizeModal(true);
        return;
      }

      const availableSlots = MAX_PHOTOS - (existingImages.length + newImages.length);
      if (availableSlots <= 0) {
        toast.info(`Maximum of ${MAX_PHOTOS} photos reached`);
        return;
      }

      const filesToAdd = selectedFiles.slice(0, availableSlots);
      if (filesToAdd.length < selectedFiles.length) {
        toast.info(`Only ${MAX_PHOTOS} photos are allowed`);
      }

      setNewImages((prev: any) => [...prev, ...filesToAdd]);
    }
  };

  const resolveExistingImageSrc = (imageUrl: string) => {
    const isStorj = imageUrl.startsWith("https://gateway.storjshare.io/");
    if (!isStorj) return imageUrl;

    const key = imageUrl.split("/").pop();
    const urlParts = imageUrl.split("/");
    const bucketIndex =
      urlParts.findIndex((part) => part === "gateway.storjshare.io") + 1;
    const bucket = urlParts[bucketIndex] || "creator";

    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"}/api/image/view?publicId=${key}&bucket=${bucket}`;
  };

  return (
    <div
      className="min-h-screen bg-[#080b14] text-slate-100"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <ToastContainer position="top-center" theme="dark" />

      <div className="sticky top-0 z-40 h-14 border-b border-white/10 bg-[#080b14]/95 px-4">
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

      <div className="max-w-[520px] mx-auto px-4 pb-16 pt-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/25 bg-[#6c63ff]/10 px-3 py-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a89cff]">
          Edit Portfolio
        </div>

        <h1 className="text-xl lg:text-2xl leading-tight font-extrabold tracking-[-0.02em] text-white mb-2">
          Edit Your Portfolio
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Set up your creator profile so fans can discover and book a meet and
          greet with you.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Personal Info
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                value={name}
                onChange={(e) => setname(e.currentTarget.value)}
                readOnly
                className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-200 outline-none opacity-80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Age <span className="text-red-400">*</span>
                </label>
                <select
                  value={age}
                  onChange={(e) => setage(e.currentTarget.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">Select age</option>
                  {Array.from({ length: 53 }, (_, index) => 18 + index).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num} years
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  name="gender"
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
                onBlur={() =>
                  setTimeout(() => setShowCountryDropdown(false), 150)
                }
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

        <div className="h-px bg-white/10 mb-8" />

        <section className="mb-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Available Days
          </h2>

          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map((day) => {
              const selected = hours.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() =>
                    setHours((prev: string[]) =>
                      prev.includes(day.value)
                        ? prev.filter((value) => value !== day.value)
                        : [...prev, day.value],
                    )
                  }
                  className={`h-12 w-14 rounded-xl border text-[11px] font-bold transition ${
                    selected
                      ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#6ee7b7]"
                      : "border-white/10 bg-[#111624] text-slate-500 hover:border-[#6c63ff]/40 hover:text-slate-200"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Available Hours
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111624]">
            <div className="grid grid-cols-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setpm("AM")}
                className={`py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
                  pm === "AM"
                    ? "bg-[#6c63ff]/15 text-[#a89cff]"
                    : "text-slate-500"
                }`}
              >
                <span aria-hidden>🌞</span>
                <span>AM</span>
              </button>
              <button
                type="button"
                onClick={() => setpm("PM")}
                className={`py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
                  pm === "PM"
                    ? "bg-[#6c63ff]/15 text-[#a89cff]"
                    : "text-slate-500"
                }`}
              >
                <span aria-hidden>🌙</span>
                <span>PM</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 p-3">
              {hourValues.map((value) => {
                const selected = times.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setTimes((prev: string[]) =>
                        prev.includes(value)
                          ? prev.filter((hourValue) => hourValue !== value)
                          : [...prev, value],
                      )
                    }
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
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

        <div className="h-px bg-white/10 mb-8" />

        <section className="mb-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Choose Category
          </h2>

          <div className="space-y-3 mb-6">
            {CATEGORY_OPTIONS.map((option) => {
              const selected = hosttype === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => sethosttype(option.value)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-[#6c63ff]/50 bg-[#6c63ff]/10"
                      : "border-white/10 bg-[#111624] hover:border-[#6c63ff]/25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${option.iconBg}`}
                    >
                      <span aria-hidden>{option.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white">
                        {option.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    <span
                      className={`h-5 w-5 rounded-full border-2 ${
                        selected
                          ? "border-[#6c63ff] bg-[#6c63ff]"
                          : "border-white/15"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Your Rate
          </h2>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              {hosttype === "Fan call"
                ? "Enter your call rate"
                : "Enter your rate"}{" "}
              <span className="text-red-400">*</span>
            </label>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none"
                  type="number"
                  value={price}
                  placeholder="e.g. 10000"
                  onChange={(e) => setprice(e.currentTarget.value)}
                />
                <p className="mt-2 text-xs text-slate-500">{rateSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceGuide(true)}
                className="h-10 w-10 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/15 text-[#a89cff] font-bold"
                title="View Suggested Rates"
              >
                ?
              </button>
            </div>
          </div>
        </section>

        <div className="h-px bg-white/10 mb-8" />
       {/* only show if hosttype is not fancall */}
        {hosttype !== "Fan call" && (
          <section className="mb-8">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
              <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
              Duration
            </h2>

   <>
  <p
    style={{
      fontSize: 12,
      color: "rgba(148,163,184,.85)",
      marginTop: 6,
      marginBottom: 12,
      lineHeight: 1.4,
    }}
  >
    <span
      style={{ color: "#6c63ff" }}
      className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1"
    >
      ✨ Premium Extension Available
    </span>
  </p>
  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
    Fans can seamlessly extend their experience by sending an additional structured booking request at the end of each session if both parties wish to continue.
  </p>
</>

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
            <p className="mt-2 text-center text-xs text-slate-500">
              Maximum 30 minutes per session
            </p>
          </section>
        )}

        <div className="h-px bg-white/10 mb-8" />

        <section className="mb-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            About Me
          </h2>

          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Tell fans about yourself <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setdescription(e.currentTarget.value)}
            rows={5}
            placeholder="e.g. Laid back and fun to be around. I love good conversations and genuine connections..."
            className="w-full rounded-xl border border-white/10 bg-[#111624] px-4 py-3 text-sm text-slate-100 outline-none resize-none"
          />
        </section>

        <div className="h-px bg-white/10 mb-8" />

        <section className="mb-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 flex items-center gap-2">
            <span className="block h-[2px] w-4 rounded bg-[#6c63ff]" />
            Portfolio Photos
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {displayedSlots.map((slot, slotIndex) => {
              if (!slot) {
                return (
                  <button
                    key={`empty-${slotIndex}`}
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

              if (slot.kind === "existing") {
                return (
                  <div
                    key={slot.id}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-[#6c63ff]/30 bg-[#111624]"
                  >
                    <Image
                      width={300}
                      height={300}
                      alt={`existing-${slot.index}`}
                      src={resolveExistingImageSrc(slot.imageUrl)}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(slot.index)}
                      className="absolute right-2 top-2 h-6 w-6 rounded-full bg-black/70 text-xs text-white"
                      title="Remove"
                    >
                      x
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={slot.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-[#6c63ff]/30 bg-[#111624]"
                >
                  <Image
                    width={300}
                    height={300}
                    alt={`new-${slot.index}`}
                    src={URL.createObjectURL(slot.file)}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(slot.index)}
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
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files);
            }}
            multiple
          />

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Tap x to remove an existing photo. Tap any empty slot to add a new
            one. Updated photos are reviewed before going live.
          </p>
        </section>

        <div className="h-px bg-white/10 mb-8" />

        <button
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] px-4 py-4 text-lg font-extrabold text-white shadow-[0_10px_36px_rgba(108,99,255,0.4)] disabled:opacity-50"
          disabled={disablebut}
          onClick={checkuserInput}
        >
          Save Changes -&gt;
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

            <h3 className="mb-4 text-lg font-bold text-white">
              Suggested Rates
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#111624] p-3">
                <p className="text-sm font-semibold text-white">
                  Fan call (online)
                </p>
                <p className="text-base font-bold text-amber-400">
                  100 gold / min
                </p>
              </div>
              <div className="rounded-xl bg-[#111624] p-3">
                <p className="text-sm font-semibold text-white">
                  Fan Meet (in person)
                </p>
                <p className="text-base font-bold text-amber-400">
                  10,000 gold
                </p>
              </div>
              <div className="rounded-xl bg-[#111624] p-3">
                <p className="text-sm font-semibold text-white">
                  Fan Date (in person)
                </p>
                <p className="text-base font-bold text-amber-400">
                  15,000 gold
                </p>
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
            <h3 className="mb-3 text-lg font-bold text-red-400">
              File Too Large
            </h3>
            <p className="mb-4 text-sm text-slate-200">
              Max size is 10 MB. Please trim or compress before uploading.
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
