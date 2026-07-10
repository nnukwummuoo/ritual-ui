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
import { Country, State } from "country-state-city";
import { formatTourDateRange } from "@/utils/tourFormat";

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
    description: "In-person meet",
    icon: "🤝",
    iconClass: "ci-meet",
  },
  {
    value: "Fan date",
    title: "Fan Date",
    description: "An exclusive in-person date experience",
    icon: "❤️",
    iconClass: "ci-date",
  },
  {
    value: "Fan call",
    title: "Fan Call",
    description: "One-on-one video or voice call with your fan",
    icon: "📱",
    iconClass: "ci-call",
  },
];

const MAX_PHOTOS = 9;

type Tour = { state: string; countryCode: string; startDate: string; endDate: string };

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

  // State/Province + Tours
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourCountryCode, setTourCountryCode] = useState("");
  const [tourStateQuery, setTourStateQuery] = useState("");
  const [showTourStateDropdown, setShowTourStateDropdown] = useState(false);
  const [tourSelectedState, setTourSelectedState] = useState("");
  const [tourStartDate, setTourStartDate] = useState("");
  const [tourEndDate, setTourEndDate] = useState("");
  const [showTourDates, setShowTourDates] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hosttypeInitialized = useRef(false);
  const token = useAuthToken();
  const imagesInitialized = useRef(false);
  const tourInitialized = useRef(false);

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countryList.slice(0, 12);
    return countryList
      .filter((country) => country.toLowerCase().includes(query))
      .slice(0, 12);
  }, [countryQuery]);

  const availableStates = useMemo(() => {
    if (!selectedCountryCode) return [];
    return State.getStatesOfCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  const filteredStates = useMemo(() => {
    const query = stateQuery.trim().toLowerCase();
    const list = availableStates.map((s) => s.name);
    if (!query) return list.slice(0, 12);
    return list.filter((s) => s.toLowerCase().includes(query)).slice(0, 12);
  }, [stateQuery, availableStates]);

  const tourAvailableStates = useMemo(() => {
    if (!tourCountryCode) return [];
    return State.getStatesOfCountry(tourCountryCode);
  }, [tourCountryCode]);

  const filteredTourStates = useMemo(() => {
    const query = tourStateQuery.trim().toLowerCase();
    const list = tourAvailableStates.map((s) => s.name);
    if (!query) return list.slice(0, 12);
    return list.filter((s) => s.toLowerCase().includes(query)).slice(0, 12);
  }, [tourStateQuery, tourAvailableStates]);

  const addTour = () => {
    if (!tourSelectedState || !tourCountryCode || !tourStartDate || !tourEndDate) {
      toast.error("Select a state and both dates to add a tour");
      return;
    }
    if (new Date(tourEndDate) < new Date(tourStartDate)) {
      toast.error("End date must be after start date");
      return;
    }
    setTours((prev) => [
      ...prev,
      { state: tourSelectedState, countryCode: tourCountryCode, startDate: tourStartDate, endDate: tourEndDate },
    ]);
    setTourSelectedState("");
    setTourStateQuery("");
    setTourCountryCode("");
    setTourStartDate("");
    setTourEndDate("");
    setShowTourDates(false);
  };

  const removeTour = (index: number) => {
    setTours((prev) => prev.filter((_, i) => i !== index));
  };

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
          currentToken = data?.accesstoken || data?.refreshtoken;
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

    if (!tourInitialized.current) {
      setSelectedState(creator.state || "");
      setStateQuery(creator.state || "");
      const matched = allCountries.find((c) => c.name === creator.location);
      setSelectedCountryCode(matched?.isoCode || "");
      setTours(Array.isArray(creator.tours) ? creator.tours : []);
      tourInitialized.current = true;
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
    allCountries,
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
    if (!age) return toast.error("Age Empty", { autoClose: 2000 });
    if (!hosttype) return toast.error("Select host type", { autoClose: 2000 });
    if (newImages.length === 0 && existingImages.length === 0) {
      return toast.error("Please upload at least one image", { autoClose: 2000 });
    }
    if (!location) return toast.error("Location Empty", { autoClose: 2000 });
    if (!price) return toast.error("Price Empty", { autoClose: 2000 });
    if (!description) return toast.error("Write your description", { autoClose: 2000 });

    if (!userid) return toast.error("Missing user, please login again");
    if (!token) return toast.error("Missing token");
    if (!creator_portfolio_id) return toast.error("Missing creator id");

    try {
      setdisablebut(true);
      setLoading(true);

      const preservedExistingImages = existingImages.filter(
        (img) => !imagesToDelete.includes(img),
      );

      const data = {
        userId: userid,
        creator_portfolio_id,
        name,
        age,
        location,
        state: selectedState,
        tours: JSON.stringify(tours),
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
      const selectedFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const oversizedFiles = selectedFiles.filter((f: any) => f.size > 10 * 1024 * 1024);
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
    const bucketIndex = urlParts.findIndex((part) => part === "gateway.storjshare.io") + 1;
    const bucket = urlParts[bucketIndex] || "creator";

    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"}/api/image/view?publicId=${key}&bucket=${bucket}`;
  };

  return (
    <div className="mcp-edit-portfolio">
      <ToastContainer position="top-center" theme="dark" />

      {/* NAV */}
      <nav className="nav">
        <button className="nav-back" type="button" onClick={() => router.back()}>← Back</button>
        <a href="#" className="nav-logo" onClick={(e) => e.preventDefault()}>
          <div className="nav-logo-icon">M</div>
          <span className="nav-logo-name">mmeko</span>
        </a>
        <div style={{ width: 60 }} />
      </nav>

      <div className="page">
        {/* HEADER */}
        <div className="page-tag">✦ Edit Portfolio</div>
        <div className="page-title">Edit Your Portfolio</div>
        <p className="page-sub">Set up your creator profile so fans can discover and book a meet &amp; greet with you.</p>

        {/* PERSONAL INFO */}
        <div className="sec-label">Personal Info</div>

        <div className="fg">
          <label className="fl">Full Name <span className="req">*</span></label>
          <input type="text" className="fi" value={name} readOnly />
        </div>

        <div className="frow">
          <div className="fg">
            <label className="fl">Age <span className="req">*</span></label>
            <select className="fi" value={age} onChange={(e) => setage(e.currentTarget.value)}>
              <option value="" disabled>Select age</option>
              {Array.from({ length: 53 }, (_, index) => 18 + index).map((num) => (
                <option key={num} value={num}>{num} years</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Gender <span className="req">*</span></label>
            <select className="fi" value={gender} onChange={(e) => setgender(e.currentTarget.value)}>
              <option value="" disabled>Select gender</option>
              <option value="Man">Man</option>
              <option value="Woman">Woman</option>
              <option value="Couple">Couples</option>
              <option value="Trans">Trans</option>
            </select>
          </div>
        </div>

        <div className="fg">
  <label className="fl">Location <span className="req">*</span></label>
  <div style={{ position: "relative" }}>
    <input
      type="text"
      className="fi"
      value={countryQuery}
      onFocus={() => setShowCountryDropdown(true)}
      onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
      onChange={(e) => {
        const value = e.currentTarget.value;
        setCountryQuery(value);
        setlocation(value.trim());
      }}
      placeholder="Search country..."
      autoComplete="off"
    />
    {showCountryDropdown && filteredCountries.length > 0 && (
      <div className="dropdown-panel">
        {filteredCountries.map((country) => (
          <button
            key={country}
            type="button"
            className="dropdown-item"
            onMouseDown={(e) => {
              e.preventDefault();
              setCountryQuery(country);
              setlocation(country);
              setShowCountryDropdown(false);
              const matched = allCountries.find((c) => c.name === country);
              setSelectedCountryCode(matched?.isoCode || "");
              setSelectedState("");
              setStateQuery("");
            }}
          >
            {country}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

       <div className="fg">
  <label className="fl">State / Province (optional)</label>
  <div style={{ position: "relative" }}>
    <input
      type="text"
      className="fi"
      value={stateQuery}
      disabled={!selectedCountryCode}
      onFocus={() => setShowStateDropdown(true)}
      onBlur={() => setTimeout(() => setShowStateDropdown(false), 150)}
      onChange={(e) => setStateQuery(e.currentTarget.value)}
      placeholder={selectedCountryCode ? "Search state/province..." : "Select a country first"}
    />
    {showStateDropdown && filteredStates.length > 0 && (
      <div className="dropdown-panel">
        {filteredStates.map((stateName) => (
          <button
            key={stateName}
            type="button"
            className="dropdown-item"
            onMouseDown={(e) => {
              e.preventDefault();
              setStateQuery(stateName);
              setSelectedState(stateName);
              setShowStateDropdown(false);
            }}
          >
            {stateName}
          </button>
        ))}
      </div>
    )}
  </div>
</div>
        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />

        {/* AVAILABLE DAYS */}
        <div className="sec-label">Available Days</div>
        <div className="days-wrap" style={{ marginBottom: 24 }}>
          {DAY_OPTIONS.map((day) => {
            const selected = hours.includes(day.value);
            return (
              <div
                key={day.value}
                className={`day-chip${selected ? " sel" : ""}`}
                onClick={() =>
                  setHours((prev: string[]) =>
                    prev.includes(day.value) ? prev.filter((v) => v !== day.value) : [...prev, day.value],
                  )
                }
              >
                {day.label}
              </div>
            );
          })}
        </div>

        {/* AVAILABLE HOURS */}
        <div className="sec-label">Available Hours</div>
        <div className="hours-section" style={{ marginBottom: 24 }}>
          <div className="hours-tabs">
            <button type="button" className={`h-tab${pm === "AM" ? " active" : ""}`} onClick={() => setpm("AM")}>🌞 AM</button>
            <button type="button" className={`h-tab${pm === "PM" ? " active" : ""}`} onClick={() => setpm("PM")}>🌙 PM</button>
          </div>
          <div className="hours-grid">
            {hourValues.map((value) => {
              const selected = times.includes(value);
              return (
                <div
                  key={value}
                  className={`h-chip${selected ? " sel" : ""}`}
                  onClick={() =>
                    setTimes((prev: string[]) =>
                      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
                    )
                  }
                >
                  {value.replace(/(AM|PM)$/, " $1")}
                </div>
              );
            })}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />

        {/* CATEGORY */}
        <div className="sec-label">Choose Category</div>
        <div className="cat-cards" style={{ marginBottom: 24 }}>
          {CATEGORY_OPTIONS.map((option) => {
            const selected = hosttype === option.value;
            return (
              <div
                key={option.value}
                className={`cat-card${selected ? " sel" : ""}`}
                onClick={() => sethosttype(option.value)}
              >
                <div className={`cat-icon ${option.iconClass}`}>{option.icon}</div>
                <div className="cat-info">
                  <div className="cat-name">{option.title}</div>
                  <div className="cat-desc">{option.description}</div>
                </div>
                <div className="cat-radio" />
              </div>
            );
          })}
        </div>

        {/* PRICE */}
        <div className="sec-label">Your Rate</div>
        <div className="fg price-wrap" style={{ marginBottom: 6 }}>
          <label className="fl">
            {hosttype === "Fan call" ? "Enter your call rate" : "Enter your rate"} <span className="req">*</span>
          </label>
          <div className="price-row">
            <div className="price-input-wrap">
              <input
                type="number"
                className="fi"
                value={price}
                placeholder="e.g. 10000"
                min={0}
                onChange={(e) => setprice(e.currentTarget.value)}
              />
              <div className="price-label-txt">{rateSubtitle}</div>
            </div>
            <button
              type="button"
              className="btn-hint"
              title="Suggested rates"
              onClick={(e) => {
                e.stopPropagation();
                setShowPriceGuide((v) => !v);
              }}
            >
              ?
            </button>
          </div>

          <div className={`rates-pop${showPriceGuide ? " open" : ""}`}>
            <div className="rates-pop-title">Suggested Rates</div>
            <div className="rate-item">
              <div className="rate-icon ri-call">📱</div>
              <div>
                <div className="rate-name">Fan Call (online)</div>
                <div className="rate-val">100 gold / min</div>
                <div className="rate-usd">≈ $4 / min</div>
              </div>
            </div>
            <div className="rate-item">
              <div className="rate-icon ri-meet">🤝</div>
              <div>
                <div className="rate-name">Fan Meet (in person)</div>
                <div className="rate-val">10,000 gold</div>
                <div className="rate-usd">≈ $400</div>
              </div>
            </div>
            <div className="rate-item">
              <div className="rate-icon ri-date">❤️</div>
              <div>
                <div className="rate-name">Fan Date (in person)</div>
                <div className="rate-val">15,000 gold</div>
                <div className="rate-usd">≈ $600</div>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />

        {/* DURATION */}
        {hosttype !== "Fan call" && (
          <>
            <div className="sec-label">Duration</div>
            <p style={{ fontSize: 12, color: "rgba(148,163,184,.85)", marginTop: 6, marginBottom: 4, lineHeight: 1.4 }}>
              <span style={{ color: "#6c63ff" }} className="font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                ✨ Premium Extension Available
              </span>
            </p>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm" style={{ marginTop: -4, marginBottom: 12 }}>
              Fans can seamlessly extend their experience by sending an additional structured booking request at the end of each session if both parties wish to continue.
            </p>

            <div className="fg" style={{ marginBottom: 24 }}>
              <div className="dur-wrap">
                <button type="button" className="dur-btn" onClick={() => updateDuration(durationValue - 1)}>−</button>
                <div className="dur-display">{durationValue} min</div>
                <button type="button" className="dur-btn" onClick={() => updateDuration(durationValue + 1)}>+</button>
              </div>
             
              <div className="dur-bar"><div className="dur-fill" style={{ width: `${(durationValue / 30) * 100}%` }} /></div>
              <div className="dur-note">Maximum 30 minutes per session</div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />
          </>
        )}

        {/* SCHEDULE TOUR */}
        <div className="sec-label">Schedule Tour (optional)</div>
        <div className="fg" style={{ marginBottom: 24 }}>
          {tours.map((tour, i) => (
            <div key={i} className="cat-card" style={{ marginBottom: 8, cursor: "default" }}>
              <div className="cat-info" style={{ flex: 1 }}>
                <div className="cat-name" style={{ fontSize: 13 }}>
                  {tour.state}, {tour.countryCode}. {formatTourDateRange(tour.startDate, tour.endDate)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTour(i)}
                style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>
          ))}

          <select
            className="fi"
            style={{ marginBottom: 8 }}
            value={tourCountryCode}
            onChange={(e) => {
              setTourCountryCode(e.target.value);
              setTourSelectedState("");
              setTourStateQuery("");
              setShowTourDates(false);
            }}
          >
            <option value="">Select country for tour</option>
            {allCountries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>

          {tourCountryCode && (
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input
                type="text"
                className="fi"
                value={tourStateQuery}
                onFocus={() => setShowTourStateDropdown(true)}
                onBlur={() => setTimeout(() => setShowTourStateDropdown(false), 150)}
                onChange={(e) => setTourStateQuery(e.currentTarget.value)}
                placeholder="Search state/province for tour..."
              />
              {showTourStateDropdown && filteredTourStates.length > 0 && (
                <div className="dropdown-panel">
                  {filteredTourStates.map((stateName) => (
                    <button
                      key={stateName}
                      type="button"
                      className="dropdown-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setTourStateQuery(stateName);
                        setTourSelectedState(stateName);
                        setShowTourStateDropdown(false);
                        setShowTourDates(true);
                      }}
                    >
                      {stateName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showTourDates && tourSelectedState && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <input type="date" className="fi" style={{ width: "auto" }} value={tourStartDate} onChange={(e) => setTourStartDate(e.target.value)} />
              <span style={{ color: "var(--text3)", fontSize: 12 }}>to</span>
              <input type="date" className="fi" style={{ width: "auto" }} value={tourEndDate} onChange={(e) => setTourEndDate(e.target.value)} />
              <button type="button" className="btn-hint" style={{ width: "auto", borderRadius: 10, padding: "0 16px", height: 44, fontSize: 13, fontWeight: 700 }} onClick={addTour}>
                Add Tour
              </button>
            </div>
          )}
        </div>

       <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />

        {/* ABOUT ME */}
        <div className="sec-label">About Me</div>
        <div className="fg" style={{ marginBottom: 0 }}>
          <label className="fl">Tell fans about yourself <span className="req">*</span></label>
          <textarea
            className="fi"
            rows={4}
            value={description}
            onChange={(e) => setdescription(e.currentTarget.value)}
            placeholder="e.g. Laid back and fun to be around. I love good conversations and genuine connections..."
          />
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />

        {/* PHOTOS */}
        <div className="sec-label">Portfolio Photos</div>
        <div className="photos-grid">
          {displayedSlots.map((slot, slotIndex) => {
            if (!slot) {
              return (
                <div key={`empty-${slotIndex}`} className="photo-slot" onClick={() => fileInputRef.current?.click()}>
                  <div className="ps-inner">
                    <div className="ps-icon">📷</div>
                    <div className="ps-label">Add Photo</div>
                  </div>
                </div>
              );
            }

            if (slot.kind === "existing") {
              return (
                <div key={slot.id} className="photo-slot filled">
                  <Image
                    width={300}
                    height={300}
                    alt={`existing-${slot.index}`}
                    src={resolveExistingImageSrc(slot.imageUrl)}
                    className="photo-thumb"
                    unoptimized
                  />
                  <div className="photo-remove" onClick={() => removeExistingImage(slot.index)}>✕</div>
                </div>
              );
            }

            return (
              <div key={slot.id} className="photo-slot filled">
                <Image
                  width={300}
                  height={300}
                  alt={`new-${slot.index}`}
                  src={URL.createObjectURL(slot.file)}
                  className="photo-thumb"
                />
                <div className="photo-remove" onClick={() => removeNewImage(slot.index)}>✕</div>
              </div>
            );
          })}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files?.[0]) handleImageUpload(e.target.files);
          }}
        />

        <div className="photos-note">
          Tap ✕ to remove an existing photo. Tap any empty slot to add a new one. Updated photos are reviewed before going live.
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0", height: 0, background: "none" }} />

        {/* PROCEED */}
        <button className="btn-proceed" disabled={disablebut} onClick={checkuserInput}>
          Save Changes →
        </button>
        <button type="button" className="btn-cancel" onClick={() => router.back()}>Cancel</button>

       <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", overflow: "hidden" }}>
  <PacmanLoader color="#9b59f5" loading={loading} size={12} />
  <PacmanLoader color="#9b59f5" loading={loading} size={12} />
  <PacmanLoader color="#9b59f5" loading={loading} size={12} />
</div>
      </div>

      {showFileSizeModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)", padding: "0 16px" }}>
          <div style={{ width: "100%", maxWidth: 420, borderRadius: 16, background: "var(--card)", padding: 20, border: "1px solid var(--border)" }}>
            <h3 style={{ marginBottom: 10, fontSize: 17, fontWeight: 800, color: "#f87171" }}>File Too Large</h3>
            <p style={{ marginBottom: 16, fontSize: 13.5, color: "var(--text)" }}>
              Max size is 10 MB. Please trim or compress before uploading.
            </p>
            <button
              type="button"
              onClick={() => setShowFileSizeModal(false)}
              style={{ width: "100%", borderRadius: 10, background: "var(--accent)", padding: "10px 16px", fontWeight: 700, color: "#fff", border: "none", cursor: "pointer" }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        *,*::before,*::after{box-sizing:border-box;}
        .mcp-edit-portfolio{
          --bg:#080b14;--bg2:#0b0f1c;--bg3:#0e1220;
          --card:#111624;--card2:#161b2e;
          --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.04);
          --accent:#6c63ff;--accent2:#9b59f5;
          --teal:#2dd4bf;--rose:#f472b6;
          --success:#22c55e;--gold:#f59e0b;
          --text:#f1f5f9;--text2:#94a3b8;--text3:#475569;
          background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;
        }
        .nav{position:sticky;top:0;z-index:200;background:rgba(8,11,20,.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 20px;height:56px;display:flex;align-items:center;justify-content:space-between;}
        .nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .nav-logo-icon{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#6c63ff,#9b59f5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;}
        .nav-logo-name{font-size:15px;font-weight:700;color:var(--text);}
        .nav-back{background:none;border:none;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:color .2s;}
        .nav-back:hover{color:var(--text);}
        .page{max-width:520px;margin:0 auto;padding:28px 20px 80px;}
        .page-tag{display:inline-flex;align-items:center;gap:7px;background:rgba(108,99,255,.1);border:1px solid rgba(108,99,255,.2);border-radius:100px;padding:5px 12px;margin-bottom:14px;font-size:11px;font-weight:700;color:#a89cff;letter-spacing:.06em;text-transform:uppercase;}
        .page-title{font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px;}
        .page-sub{font-size:13px;color:var(--text2);line-height:1.65;margin-bottom:32px;}
        .sec-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:12px;display:flex;align-items:center;gap:8px;}
        .sec-label::before{content:'';display:block;width:16px;height:2px;background:var(--accent);border-radius:2px;}
        .fg{display:flex;flex-direction:column;gap:7px;margin-bottom:18px;}
        .fg:last-child{margin-bottom:0;}
        .fl{font-size:12.5px;font-weight:600;color:var(--text2);display:flex;align-items:center;gap:6px;}
        .req{color:#ef4444;font-size:11px;}
        .fi{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:13px 14px;font-size:13.5px;color:var(--text);font-family:inherit;outline:none;transition:border-color .2s;width:100%;}
        .fi:focus{border-color:rgba(108,99,255,.4);}
        .fi::placeholder{color:var(--text3);}
        .fi:disabled{opacity:.4;}
        select.fi{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23475569' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;background-color:var(--card);}
        textarea.fi{resize:none;line-height:1.65;}
        .frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .divider{height:1px;background:var(--border);margin:28px 0;}
        .dropdown-panel{position:absolute;z-index:30;margin-top:8px;max-height:224px;width:100%;overflow-y:auto;border-radius:12px;border:1px solid var(--border);background:var(--card);box-shadow:0 20px 60px rgba(0,0,0,.6);}
        .dropdown-item{display:block;width:100%;border-bottom:1px solid var(--border2);padding:10px 16px;text-align:left;font-size:13px;color:var(--text2);background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;}
        .dropdown-item:hover{background:rgba(255,255,255,.05);}
        .days-wrap{display:flex;gap:7px;flex-wrap:wrap;}
        .day-chip{width:52px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;letter-spacing:.03em;background:var(--card);border:1px solid var(--border);color:var(--text3);cursor:pointer;transition:all .2s;user-select:none;}
        .day-chip:hover{border-color:rgba(108,99,255,.3);color:var(--text);}
        .day-chip.sel{background:rgba(34,197,94,.08);border-color:rgba(34,197,94,.25);color:var(--success);}
        .hours-section{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
        .hours-tabs{display:flex;border-bottom:1px solid var(--border);}
        .h-tab{flex:1;padding:12px;font-size:13px;font-weight:700;font-family:inherit;background:transparent;border:none;color:var(--text3);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
        .h-tab.active{background:rgba(108,99,255,.1);color:#a89cff;}
        .hours-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px;}
        .h-chip{padding:9px 8px;border-radius:8px;font-size:12px;font-weight:600;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);cursor:pointer;transition:all .2s;text-align:center;user-select:none;}
        .h-chip:hover{border-color:rgba(108,99,255,.3);color:#a89cff;}
        .h-chip.sel{background:rgba(108,99,255,.14);border-color:rgba(108,99,255,.35);color:#a89cff;}
        .cat-cards{display:flex;flex-direction:column;gap:10px;}
        .cat-card{display:flex;align-items:center;gap:14px;background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;transition:all .2s;user-select:none;}
        .cat-card:hover{border-color:rgba(108,99,255,.25);}
        .cat-card.sel{border-color:rgba(108,99,255,.45);background:rgba(108,99,255,.06);}
        .cat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .ci-meet{background:rgba(108,99,255,.12);}
        .ci-date{background:rgba(244,114,182,.1);}
        .ci-call{background:rgba(45,212,191,.1);}
        .cat-name{font-size:14px;font-weight:700;margin-bottom:3px;}
        .cat-desc{font-size:11.5px;color:var(--text2);line-height:1.4;}
        .cat-radio{margin-left:auto;width:20px;height:20px;border-radius:50%;border:2px solid var(--border);flex-shrink:0;transition:all .2s;display:flex;align-items:center;justify-content:center;}
        .cat-card.sel .cat-radio{border-color:var(--accent);background:var(--accent);}
        .cat-card.sel .cat-radio::after{content:'';width:8px;height:8px;border-radius:50%;background:white;}
        .price-wrap{position:relative;}
        .price-row{display:flex;align-items:flex-start;gap:10px;}
        .price-input-wrap{flex:1;}
        .price-label-txt{font-size:12px;color:var(--text3);margin-top:6px;line-height:1.5;}
        .btn-hint{width:36px;height:36px;border-radius:50%;background:rgba(108,99,255,.12);border:1px solid rgba(108,99,255,.2);color:#a89cff;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;margin-top:0;font-family:inherit;}
        .btn-hint:hover{background:rgba(108,99,255,.22);}
        .rates-pop{display:none;position:absolute;right:0;top:48px;z-index:50;width:260px;background:#141928;border:1px solid rgba(108,99,255,.25);border-radius:14px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.6);}
        .rates-pop.open{display:block;}
        .rates-pop-title{font-size:12px;font-weight:700;color:#a89cff;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px;}
        .rate-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;}
        .rate-item:last-child{margin-bottom:0;}
        .rate-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
        .ri-call{background:rgba(45,212,191,.1);}
        .ri-meet{background:rgba(108,99,255,.12);}
        .ri-date{background:rgba(244,114,182,.1);}
        .rate-name{font-size:12px;font-weight:700;margin-bottom:2px;}
        .rate-val{font-size:13px;font-weight:800;color:var(--gold);}
        .rate-usd{font-size:11px;color:var(--text3);margin-top:1px;}
        .dur-wrap{display:flex;align-items:center;gap:12px;}
        .dur-btn{width:38px;height:38px;border-radius:50%;background:var(--card);border:1px solid var(--border);color:var(--text2);font-size:20px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:inherit;line-height:1;}
        .dur-btn:hover{border-color:rgba(108,99,255,.35);color:#a89cff;background:rgba(108,99,255,.08);}
        .dur-display{flex:1;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:13px;text-align:center;font-size:16px;font-weight:800;letter-spacing:-.01em;}
        .dur-note{font-size:11px;color:var(--text3);text-align:center;margin-top:6px;}
        .dur-bar{height:4px;background:var(--border2);border-radius:2px;margin-top:10px;overflow:hidden;}
        .dur-fill{height:100%;background:linear-gradient(90deg,#6c63ff,#9b59f5);border-radius:2px;transition:width .3s;}
        .photos-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .photo-slot{aspect-ratio:1;border-radius:12px;background:var(--card);border:1.5px dashed rgba(108,99,255,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
        .photo-slot:hover{border-color:rgba(108,99,255,.5);background:rgba(108,99,255,.04);}
        .photo-slot.filled{border-style:solid;border-color:rgba(108,99,255,.3);}
        .ps-inner{display:flex;flex-direction:column;align-items:center;gap:6px;}
        .ps-icon{font-size:24px;opacity:.4;}
        .ps-label{font-size:10px;color:var(--text3);font-weight:600;}
        .photo-remove{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.15);color:white;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;}
        .photo-thumb{position:absolute;inset:0;object-fit:cover;width:100%;height:100%;}
        .photos-note{margin-top:10px;font-size:11.5px;color:var(--text3);line-height:1.55;}
        .btn-proceed{width:100%;padding:16px;border-radius:14px;background:linear-gradient(135deg,#6c63ff,#9b59f5);border:none;color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 28px rgba(108,99,255,.4);transition:all .25s;margin-bottom:12px;}
        .btn-proceed:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(108,99,255,.55);}
        .btn-proceed:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
        .btn-cancel{width:100%;padding:14px;border-radius:12px;background:transparent;border:1px solid var(--border);color:var(--text2);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;}
        .btn-cancel:hover{background:rgba(255,255,255,.04);color:var(--text);}
        @media(max-width:480px){.frow{grid-template-columns:1fr;}}
      `}</style>
    </div>
  );
}