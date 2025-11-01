/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PacmanLoader from "react-spinners/PacmanLoader";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "material-react-toastify";
import CountrySelect from "@/components/CountrySelect/CountrySelect";
import "material-react-toastify/dist/ReactToastify.css";
import "@/styles/CreateCreatorPortfolio.css";
import person from "../../icons/person.svg";
import idcardicon from "../../icons/idcardIcon.svg";
import deleteIcon from "../../icons/deleteicon.svg";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { useUserId } from "@/lib/hooks/useUserId";
import { createCreatorMultipart } from "@/api/creator";
import { useAuth } from "@/lib/context/auth-context";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getprofile } from "@/store/profile";

// Storj imports (via backend API)
import { uploadToStorj } from "@/lib/storj";

let times: any[] = [];
let hours: any[] = [];
let Interested: any[] = [];
let MIN = "";

// 🔥 Convert remote URL → File object
async function urlToFile(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}


export default function CreateCreatorPortfolio() {
  const { session } = useAuth();
  const userid = session?._id ?? useUserId();
  const token = useAuthToken() || session?.token;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get profile data from Redux (like side menu)

  const profile = useSelector((state: RootState) => state.profile);
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const isCreatorVerified = useSelector((state: RootState) => state.profile.creator_verified);

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#d49115");
  const [showFileSizeModal, setShowFileSizeModal] = useState(false);
  const [name, setname] = useState("");
  const [age, setage] = useState("18");
  const [location, setlocation] = useState("");
  const [bodytype, setbodytype] = useState("");
  const [height, setheight] = useState("");
  const [weight, setweight] = useState("");
  const [gender, setgender] = useState("");
  const [smoke, setsmoke] = useState("");
  const [drink, setdrink] = useState("");
  const [pm, setpm] = useState("PM");
  const [duration, setduration] = useState("1");
  //const [days, setdays] = useState("1hour");
  const [price, setprice] = useState("");
  const [priceValue, setPriceValue] = useState<number | null>(null);
  const [discription, setdiscription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("Fan meet");
  const [imglist, setimglist] = useState<string[]>([]);
  const [photolink, setphotolink] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [showPriceGuide, setShowPriceGuide] = useState(false);

  // 🔥 Autofill full name from user profile (like side menu)
  useEffect(() => {
    const currentUserId = reduxUserId || userid;
    
    // Load profile if not loaded
    if (currentUserId && (!profile.firstname || profile.status === "idle")) {
      let token: string | undefined;
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          token = data?.refreshtoken || data?.accesstoken;
        }
      } catch (error) {
        console.error("Error getting token for profile:", error);
      }
      
      if (token) {
        dispatch(getprofile({ userid: currentUserId, token }));
      }
    }

    // Set name from profile data (like side menu)
    if (profile?.firstname && profile.userId === currentUserId) {
      const fullName = `${profile.firstname} ${profile.lastname || ""}`.trim();
      if (fullName && (!name || name.trim() === "")) {
        setname(fullName);
      }
    } else {
      // Fallback to localStorage (like side menu)
      try {
        if (typeof window !== 'undefined') {
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

// Initialize Storj upload function
// Upload a file to Storj via backend API and return its public URL
const uploadToStorjBackend = async (file: File): Promise<string> => {
  try {
    console.log("🔍 [Storj] Uploading file:", { name: file.name, size: file.size, type: file.type });
    
    const publicUrl = await uploadToStorj(file, 'creator');
    console.log("✅ [Storj] Upload successful:", publicUrl);
    
    return publicUrl;
    
  } catch (err: any) {
    console.error("❌ [Storj] Upload failed:", err);
    throw new Error(`Upload failed: ${err.message || 'Unknown error'}`);
  }
};







// -----------------------------
// checkuserInput
// -----------------------------
const checkuserInput = async () => {
  // Prevent multiple submissions
  if (disablebut || loading) {
    return;
  }

  if (!name || name.trim() === "") return toast.error("Full name is required");
  if (!age) return toast.error("Age is required");
  if (!hosttype) return toast.error("Select host type");
  if (photolink.length <= 0) return toast.error("Please upload at least one image");
  if (!location) return toast.error("Location is required");
  if (!priceValue) return toast.error("Price is required");
  if (!height) return toast.error("Height is required");
  if (Interested.length <= 0) return toast.error("Please select what you're interested in");
  if (!discription) return toast.error("Write your description");
  if (!userid) return toast.error("Missing user, please login again");
  if (!token) return toast.error("Missing token");

  try {
    // Set loading states immediately to prevent duplicate submissions
    setdisablebut(true);
    setLoading(true);

    const hosttypeNormalized = hosttype.charAt(0).toUpperCase() + hosttype.slice(1).toLowerCase();

    // Don't upload files in frontend - let backend handle all uploads
    // Just use the file objects directly
    setphotolink(photolink);

    const data = {
      userid, // ✅ leave as is, do not rename
      name: name.trim(),
      age: String(age),
      location: location.trim(),
      price: priceValue != null ? String(priceValue) : "",
      displayPrice: price,
      duration,
      bodytype,
      smoke,
      drink,
      interestedin: Interested.map((v) => String(v).toLowerCase()),
      height,
      weight,
      description: discription.trim(),
      gender,
      timeava: times,
      daysava: hours,
      hosttype: hosttypeNormalized,
      // photolink will be sent as files separately
    };

    await createCreatorMultipart({
      token,
      userid, // ✅ keep exactly like this
      data,
      photolink: photolink, // Pass file objects directly
    });

    // Success: Keep button disabled and show success message
    toast.success("Portfolio created successfully", { autoClose: 3000 });
    // Navigate away - don't reset states since we're leaving the page
    router.push("/creators");
  } catch (err: any) {
    console.error("Failed to create portfolio", err?.response || err);
    const status = err?.response?.status;
    const data = err?.response?.data;
    const serverMsg = data?.message || data?.msg || data?.error || err?.message;
    const detail = typeof data === "object" ? JSON.stringify(data).slice(0, 400) : String(data || "");
    const msg = serverMsg ? String(serverMsg) : "Failed to create portfolio";
    toast.error(`${status ? `[${status}]` : ""}${msg}${detail && serverMsg !== detail ? `\n${detail}` : ""}`, { autoClose: 6000 });
    // Only reset states on error so user can retry
    setdisablebut(false);
    setLoading(false);
  }
};







  const handleNextStep = () => {
    const skipValidation = process.env.NEXT_PUBLIC_SKIP_CREATE_MODEL_VALIDATION === "true";
    if (skipValidation || validateStep(step)) setStep(step + 1);
  };
  const handlePreviousStep = () => setStep(step - 1);
  const handleSkipStep = () => setStep(step + 1);
  const getLocation = (country: any) => setlocation(`${country}`);

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        if (!name || name.trim() === "") { toast.error("Full name is required"); return false; }
        if (!/^[a-zA-Z\s]{2,}$/.test(name.trim())) {
          toast.error("Full name must contain only letters and spaces, and be at least 2 characters long"); return false;
        }
        if (!age) { toast.error("Age is required"); return false; }
        if (!location) { toast.error("Location is required"); return false; }
        if (!height) { toast.error("Height is required"); return false; }
        return true;
      case 2:
        if (!priceValue) { toast.error("Price is required"); return false; }
        if (!hosttype) { toast.error("Select host type"); return false; }
        if (Interested.length <= 0) { toast.error("Please select what you're interested in"); return false; }
        if (!discription) { toast.error("Write your description"); return false; }
        return true;
      default: return true;
    }
  };


if (!isCreatorVerified) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <p className="text-xl text-white">You are not verified yet</p>
    </div>
  );
}


  return (
    <>
      <div className="pt-16 md:pt-8">
        <ToastContainer position="top-center" theme="dark" />
        <p className="text-2xl font-semibold text-center text-slate-300 sm:w-1/2">
          Create Portfolio 
        </p>
        <div className="form-container">
          <div className="w-full h-2 mb-6 bg-gray-700 rounded">
            <div
              className="h-2 bg-orange-500 rounded"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>

          <fieldset
            style={{ display: step === 1 ? "flex" : "none" }}
            className="bg-gray-900 form-container"
            disabled={disablebut}
          >
            <div className="input-container">
              <label htmlFor="fullname" className="block text-gray-300 mb-2">
    Full Name
  </label>
  <input
    id="fullname"
    type="text"
    className="bg-black name-label"
    placeholder="Enter your full name"
    value={name}
    readOnly
    style={{ cursor: 'not-allowed', opacity: 0.7 }}
  />
            </div>

            <div className="input-container">
              <label className="label">Location</label>
              <div className="bg-gray-800 height-select">
                <CountrySelect onSelectCountry={getLocation} />
              </div>
            </div>

            <div className="input-container">
              <label className="label">Select age</label>
              <div className="bg-black slider-group">
                <label className="age-display">{age} years</label>
                <input
                  type="range"
                  min="18"
                  max="70"
                  className="slider"
                  value={age}
                  onChange={(e) => setage(e.currentTarget.value)}
                />
              </div>
            </div>

            <div className="input-container">
              <label htmlFor="bodytype" className="select-label">
                Select body type:
              </label>
              <select
                name="bodytype"
                className="height-select"
                value={bodytype}
                onChange={(e) => setbodytype(e.currentTarget.value)}
              >
                <option value="">Select body type</option>
                <option value="Slim">Slim</option>
                <option value="Curvy">Curvy</option>
                <option value="Chubby">Chubby</option>
                <option value="Normal">Normal</option>
                <option value="Muscular">Muscular</option>
                <option value="Althetic">Althetic</option>
                <option value="Skinny">Skinny</option>
              </select>
            </div>

            <div className="input-container">
              <div>
                <label htmlFor="height-select" className="height-label">
                  What is your height?{" "}
                  <span className="height-value">{height}</span>
                </label>
              </div>
              <select
                id="height-select"
                className="height-select"
                value={height}
                onChange={(e) => setheight(e.currentTarget.value)}
              >
                <option value="">Select height</option>
                {Array.from({ length: 200 }, (_, i) => i + 57).map((value) => (
                  <option key={value} value={`${value} cm`}>
                    {value} cm
                  </option>
                ))}
              </select>
            </div>

            <div className="input-container">
              <div>
                <label className="height-label">
                  What is your weight? {weight}
                </label>
              </div>
              <select
                className="height-select"
                value={weight}
                onChange={(e) => {
                  setweight(e.currentTarget.value);
                }}
              >
                <option value="">Select weight</option>
                {Array.from({ length: 120 }, (_, i) => i + 40).map((value, i) => {
                  return (
                    <option
                      key={value}
                      value={`${value} kg`}
                      className="w-full mt-1 mb-1 bg-gray-800 border text-slate-100 rounded-2xl"
                    >{`${value} kg`}</option>
                  );
                })}
              </select>
            </div>

            <div className="input-container">
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  What is your Gender?{" "}
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={gender}
                  onChange={(e) => setgender(e.currentTarget.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Trans">Trans</option>
                  <option value="Couple">Couple</option>
                </select>
              </div>

              <div className="input-container">
                <label htmlFor="smoke" className="form-label">
                  Do You Smoke?{" "}
                </label>
                <select
                  id="smoke"
                  name="smoke"
                  className="form-select"
                  value={smoke}
                  onChange={(e) => setsmoke(e.currentTarget.value)}
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="input-container">
                <label htmlFor="drink" className="form-label">
                  Do you Drink ?
                </label>
                <select
                  id="drink"
                  name="drink"
                  className="form-select"
                  value={drink}
                  onChange={(e) => setdrink(e.currentTarget.value)}
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset
            style={{ display: step === 2 ? "flex" : "none" }}
            className="bg-gray-900 form-container"
            disabled={disablebut}
          >
            <div className="input-container">
              <p className="text-slate-300">Available hours (Optional)</p>
              <p className="mb-4 text-sm text-slate-400">
                You can skip this and set your availability later
              </p>

              <div className="flex-col"></div>
              <div className="ampm-toggle">
                <button
                  className={`toggle-btn ${pm === "AM" ? "active" : ""}`}
                  onClick={() => setpm("AM")}
                >
                  🌞 AM
                </button>
                <button
                  className={`toggle-btn ${pm === "PM" ? "active" : ""}`}
                  onClick={() => setpm("PM")}
                >
                  🌙 PM
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[
                  `1:00${pm}`,
                  `2:00${pm}`,
                  `3:00${pm}`,
                  `4:00${pm}`,
                  `5:00${pm}`,
                  `6:00${pm}`,
                  `7:00${pm}`,
                  `8:00${pm}`,
                  `9:00${pm}`,
                  `10:00${pm}`,
                  `11:00${pm}`,
                  `12:00${pm}`,
                ].map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 rounded-md shadow-sm bg-slate-800"
                  >
                    <label className="text-sm text-slate-600">{value}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={value}
                        className="sr-only peer"
                        onChange={(e) => {
                          const input = e.currentTarget.value;
                          const check = times.findIndex((v) => v === input);
                          if (check !== -1) {
                            times.splice(check, 1);
                          } else {
                            times.push(input);
                          }
                          console.log(times);
                        }}
                      />
                      <div className="h-6 transition duration-300 bg-gray-300 rounded-full w-11 peer-focus:outline-none peer peer-checked:bg-orange-500"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-slate-800 rounded-full shadow-md transform peer-checked:translate-x-5 transition duration-300"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="input-container">
              <p className="font-semibold text-slate-300">
                Available DAYS (Optional)
              </p>
              <p className="mb-4 text-sm text-slate-400">
                You can skip this and set your availability later
              </p>

              <div className="flex-col">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"].map(
                    (value, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 rounded-md shadow-sm bg-slate-800"
                      >
                        <label className="text-slate-400">{value}</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value={value}
                            className="sr-only peer"
                            onClick={(e) => {
                              let input = e.currentTarget.value;
                              let check = hours.findIndex((v) => v === input);
                              if (check !== -1) {
                                hours.splice(check, 1);
                              } else {
                                hours.push(input);
                              }
                            }}
                          />
                          <div className="h-6 transition duration-300 bg-gray-300 rounded-full w-11 peer-focus:outline-none peer peer-checked:bg-orange-500"></div>
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-slate-800 rounded-full shadow-md transform peer-checked:translate-x-5 transition duration-300"></div>
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="input-container">
              <div className="flex-col">
                <label className="form-label">Choose Category</label>
                <select
                  name="hosttype"
                  className="height-select"
                  value={hosttype}
                  onChange={(e) => {
                    sethosttype(e.currentTarget.value);
                    if (e.currentTarget.value === "Fan call") {
                      MIN = "per minute";
                    } else {
                      MIN = "";
                    }
                  }}
                >
                  <option value="">Select category</option>
                  <option value={`Fan meet`}>Fan meet</option>
                  <option value={`Fan date`}>Fan date</option>
                  <option value={`Fan call`}>Fan call</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-300">
                  {hosttype === "Fan call" 
                    ? "Set how much fans pay per minute for your Fan call"
                    : "Enter transport fare fans will pay you"
                  }
                </label>
                <button
                  type="button"
                  onClick={() => setShowPriceGuide(true)}
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-700 transition-colors"
                  title="View recommended prices"
                >
                  ?
                </button>
              </div>
              <input
                className="bg-black name-label"
                type="number"
                placeholder="Enter in gold"
                onInput={(e) => {
                  if (MIN) {
                    setprice(e.currentTarget.value + " GOLD" + `${MIN}`);
                  } else {
                    setprice(e.currentTarget.value + " GOLD");
                  }
                  const v = Number((e.currentTarget.value || "").toString());
                  setPriceValue(Number.isFinite(v) && v > 0 ? v : null);
                }}
              ></input>
            </div>

            <div className="input-container">
              <label className="font-semibold text-slate-300">Duration</label>
              <div className="ml-4 text-lg font-medium text-slate-300">
                {duration} min
              </div>
              <div className="flex items-center justify-between mt-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  className="slider"
                  value={duration}
                  onChange={(e) => setduration(e.currentTarget.value)}
                />
              </div>
            </div>

            <div className="input-container">
              <label className="mb-2 font-medium text-slate-300">
                Interested In
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {["Men", "Women", "Couples", "Trans"].map((value) => (
                  <label
                    key={value}
                    className="flex items-center px-3 py-2 space-x-2 text-white transition rounded-lg cursor-pointer bg-slate-700 hover:bg-slate-600"
                  >
                    <input
                      type="checkbox"
                      value={value}
                      className="accent-orange-500"
                      onClick={(e) => {
                        const input = e.currentTarget.value;
                        const check = Interested.findIndex((v) => v === input);
                        if (check !== -1) {
                          Interested.splice(check, 1);
                        } else {
                          Interested.push(input);
                        }
                      }}
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="input-container">
              <label className="mb-2 font-medium text-slate-300">
                About Me
              </label>
              <textarea
                className="h-32 p-4 text-white transition resize-none bg-slate-800 placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us something about yourself..."
                onInput={(e) => {
                  setdiscription(e.currentTarget.value);
                }}
              ></textarea>
            </div>
          </fieldset>

          <fieldset
            style={{ display: step === 3 ? "flex" : "none" }}
            className="bg-gray-900 form-container"
            disabled={disablebut}
          >
            <div className="w-full p-4 shadow-md bg-slate-800 rounded-2xl">
              <label className="block text-lg font-semibold text-center text-slate-300">
                Please Upload Your Photo *
              </label>
              <p className="mt-1 text-sm text-center text-slate-400">
                {imglist.length} {imglist.length === 1 ? "Photo" : "Photos"}{" "}
                Selected
              </p>
              <p className="mt-1 text-xs text-center text-red-400">
                * At least one photo is required to complete your profile
              </p>

              <div
                className="p-6 mt-4 text-center transition border-2 border-dashed cursor-pointer border-slate-500 hover:border-orange-500 rounded-xl text-slate-400 hover:text-orange-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-sm">
                  Click or drag file to this area to upload
                </p>
                {/* <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) {
                      setimglist((value) => [...value, URL.createObjectURL(e.target.files![0])]);
                      setphotolink((value) => [...value, e.target.files![0]]);
                    }
                  }}
                /> */}
                <input
                  type="file"
                  id="photo-upload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.currentTarget.files;
                    if (!files || files.length === 0) return;
                    
                    const selected: File[] = Array.from(files).filter((f) => f.type.startsWith("image/"));
                    
                    // Check for files larger than 5MB
                    const oversizedFiles = selected.filter(f => f.size > 5 * 1024 * 1024);
                    if (oversizedFiles.length > 0) {
                      setShowFileSizeModal(true);
                      return;
                    }
                    
                    // Create preview URLs for immediate display
                    const previewUrls = selected.map((f) => URL.createObjectURL(f));
                    setimglist((prev) => [...prev, ...previewUrls]);
                    setphotolink((prev) => [...prev, ...selected]);
                    
                    // Don't upload to Storj here - let backend handle all uploads
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4">
                {imglist.map((value: string, index: number) => {
                  return (
                    <div key={index} className="relative group">
                      <Image
                        alt={`uploaded-${index}`}
                        src={value}
                        width={300}
                        height={144}
                        className="object-cover w-full border rounded-lg h-36 border-slate-600"
                      />
                      <button
                        onClick={() => {
                          setimglist((prev) => prev.filter((_, i) => i !== index));
                          setphotolink((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute p-1 text-xs text-white transition bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                        title="Remove"
                      >
                        ✕
                      </button>
                      <div className="absolute px-2 py-1 text-xs text-white bg-blue-500 rounded bottom-2 left-2">
                        Preview
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="mb-3 bg-slate-300"></hr>

            <button
              className="block w-full h-10 font-semibold text-center text-white transition bg-yellow-600 btn rounded-2xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={disablebut || loading}
              onClick={() => {
                if (!disablebut && !loading) {
                  checkuserInput();
                }
              }}
            >
              {loading && (
                <PacmanLoader
                  color="#ffffff"
                  loading={true}
                  size={10}
                  aria-label="Loading Spinner"
                  data-testid="button-loader"
                />
              )}
              {loading ? "Creating Portfolio..." : "Procced"}
            </button>

            <div className="flex justify-between mt-3 overflow-hidden">
              {photolink.length === 0 && (
                <span className="text-xs text-yellow-400">
                  Tip: add at least one image to improve visibility.
                </span>
              )}
              <PacmanLoader
                color={color}
                loading={loading}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <PacmanLoader
                color={color}
                loading={loading}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <PacmanLoader
                color={color}
                loading={loading}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          </fieldset>

          <div
            className="flex w-full mt-6"
            style={{
              gap: "30px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {step > 1 && (
              <button
                onClick={handlePreviousStep}
                className="px-4 py-2 text-white bg-gray-600 rounded"
                style={{ maxWidth: 300 }}
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={handleNextStep}
                className="px-4 py-2 text-white bg-orange-500 rounded"
                style={{ maxWidth: 300 }}
              >
                Next
              </button>
            ) : (
              <></>
            )}
            {step < totalSteps && (
              <button
                onClick={handleSkipStep}
                className="px-4 py-2 text-white bg-gray-500 rounded"
                style={{ maxWidth: 300 }}
                title="Skip validation and go to next step"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Price Guide Modal */}
      {showPriceGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-4 relative">
            <button
              onClick={() => setShowPriceGuide(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Recommended Prices</h3>
            
            <div className="space-y-4">
              {/* Fan call */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    📱
                  </div>
                  <h4 className="text-white font-semibold">Fan call (online)</h4>
                </div>
                <p className="text-yellow-400 font-bold text-lg">10 - 120 gold / min</p>
                <p className="text-gray-300 text-sm">(≈ $0.40 - $0.80 / min)</p>
              </div>

              {/* Fan Meet */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    🤝
                  </div>
                  <h4 className="text-white font-semibold">Fan Meet (in person)</h4>
                </div>
                <p className="text-yellow-400 font-bold text-lg">750 - 1,250 gold</p>
                <p className="text-gray-300 text-sm">(≈ $30 - $50)</p>
              </div>

              {/* Fan Date */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    ❤️
                  </div>
                  <h4 className="text-white font-semibold">Fan Date (in person)</h4>
                </div>
                <p className="text-yellow-400 font-bold text-lg">1,250 - 2,500 gold</p>
                <p className="text-gray-300 text-sm">(≈ $50 - $100)</p>
              </div>
            </div>

            <button
              onClick={() => setShowPriceGuide(false)}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* File Size Modal */}
      {showFileSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-4 relative">
            <div className="bg-red-600 text-white font-bold text-lg px-4 py-3 rounded-t-lg -m-6 mb-4">
              File Too Large
            </div>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-white text-center">
                Max size is 5 MB. Please trim or compress before uploading.
              </p>
            </div>
            <button
              onClick={() => setShowFileSizeModal(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};
