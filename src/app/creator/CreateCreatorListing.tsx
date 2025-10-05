"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PacmanLoader from "react-spinners/PacmanLoader";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "material-react-toastify";
import CountrySelect from "@/components/CountrySelect/CountrySelect";
import "material-react-toastify/dist/ReactToastify.css";
import "@/styles/CreateCreatorListing.css";
import person from "../../icons/person.svg";
import idcardicon from "../../icons/idcardIcon.svg";
import deleteIcon from "../../icons/deleteicon.svg";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { useUserId } from "@/lib/hooks/useUserId";
import { createCreatorMultipart } from "@/api/creator";
import { useAuth } from "@/lib/context/auth-context";

// Appwrite imports
import { Client, Storage } from "appwrite";

let times: any[] = [];
let hours: any[] = [];
let Interested: any[] = [];
let MIN = "";

// 🔥 Convert remote Appwrite URL → File object
async function urlToFile(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

// Simple client-side image compression via canvas
async function compressImage(file: File, opts?: { maxWidth?: number; maxHeight?: number; quality?: number }): Promise<File> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = opts || {};
  const img = document.createElement("img");
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve as any;
      img.onerror = reject as any;
      img.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    let { width, height } = img;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch (_) {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function () {
  const { session } = useAuth();
  const userid = session?._id ?? useUserId();
  const token = useAuthToken() || session?.token;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#d49115");
  const [name, setname] = useState("");
  const [age, setage] = useState("18");
  const [location, setlocation] = useState("");
  const [bodytype, setbodytype] = useState("Slim");
  const [height, setheight] = useState("");
  const [weight, setweight] = useState("");
  const [gender, setgender] = useState("Man");
  const [smoke, setsmoke] = useState("Yes");
  const [drink, setdrink] = useState("Yes");
  const [pm, setpm] = useState("PM");
  const [duration, setduration] = useState("1");
  //const [days, setdays] = useState("1hour");
  const [price, setprice] = useState("");
  const [priceValue, setPriceValue] = useState<number | null>(null);
  const [discription, setdiscription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("Fan meet");
  const [imglist, setimglist] = useState<string[]>([]);
 const [photolink, setphotolink] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // 🔥 Autofill full name when session changes
// 🔥 Autofill the name from session
useEffect(() => {
  console.log("🔍 Session object:", session);       // 👈 log the whole session
  console.log("📛 Current name state:", name);     // 👈 log current state
  console.log("➡️ session.fullName:", session?.fullName); // 👈 log just the fullname

  if (session?.fullName && (!name || name.trim() === "")) {
    console.log("✅ Setting name to:", session.fullName);
    setname(session.fullName);
  }
}, [session, name]);

// Initialize Appwrite client & storage
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(client);

// Upload a file to Appwrite and return its public URL
const uploadToAppwrite = async (file: File): Promise<string> => {
  try {
    const uniqueId = `${Date.now()}_${file.name}`;
    const res = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      uniqueId,
      file
    );

    // Construct public URL (works for public buckets)
    const publicUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${res.bucketId}/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    return publicUrl;
  } catch (err) {
    console.error("Appwrite upload failed:", err);
    throw err;
  }
};







// -----------------------------
// checkuserInput
// -----------------------------
const checkuserInput = async () => {
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
    setdisablebut(true);
    setLoading(true);

    const hosttypeNormalized = hosttype.charAt(0).toUpperCase() + hosttype.slice(1).toLowerCase();

    // Make sure photolink is always string array
    const photolinksForBackend: string[] = await Promise.all(
      photolink.map(async (urlOrFile, i) => {
        if (typeof urlOrFile === "string" && urlOrFile.startsWith("http")) return urlOrFile;
        const url = await uploadToAppwrite(urlOrFile as unknown as File);
        console.log(`[checkuserInput] Uploaded photolink[${i}] →`, url);
        return url;
      })
    );

    setphotolink(photolinksForBackend);

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
      photolink: photolinksForBackend, // ✅ string array
    };

    console.log("[checkuserInput] Sending payload to backend:", { token, userid, data });

    await createCreatorMultipart({
      token,
      userid, // ✅ keep exactly like this
      data,
      photolink: photolinksForBackend,
    });

    toast.success("Listing created successfully", { autoClose: 3000 });
    router.push("/creators");
  } catch (err: any) {
    console.error("Failed to create listing", err?.response || err);
    const status = err?.response?.status;
    const data = err?.response?.data;
    const serverMsg = data?.message || data?.msg || data?.error || err?.message;
    const detail = typeof data === "object" ? JSON.stringify(data).slice(0, 400) : String(data || "");
    const msg = serverMsg ? String(serverMsg) : "Failed to create listing";
    toast.error(`${status ? `[${status}]` : ""}${msg}${detail && serverMsg !== detail ? `\n${detail}` : ""}`, { autoClose: 6000 });
  } finally {
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
    readOnly   // ✅ makes the field locked
    onChange={(e) => setname(e.target.value)}
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
                onChange={(e) => setbodytype(e.currentTarget.value)}
              >
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
                onChange={(e) => setheight(e.currentTarget.value)}
              >
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
                onChange={(e) => {
                  setweight(e.currentTarget.value);
                }}
              >
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
                  onChange={(e) => setgender(e.currentTarget.value)}
                >
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
                  onChange={(e) => setsmoke(e.currentTarget.value)}
                >
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
                  onChange={(e) => setdrink(e.currentTarget.value)}
                >
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
              <div className="flex-col">
                <label className="form-label">Choose Category</label>
                <select
                  name="hosttype"
                  className="height-select"
                  onChange={(e) => {
                    sethosttype(e.currentTarget.value);
                    if (e.currentTarget.value === "Private show") {
                      MIN = "per minute";
                    } else {
                      MIN = "";
                    }
                  }}
                >
                  <option value={`Fan meet`}>Fan meet</option>
                  <option value={`Fan date`}>Fan date</option>
                  <option value={`Private show`}>Fan call</option>
                </select>
              </div>

              <label className="text-slate-300">
                Enter desired{" "}
                {hosttype === "Private show" ? "tip " : "transport fare "}
                amount {`${MIN} ${hosttype == "Private show" && "per minute"}`}
              </label>
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
              <label className="mb-2 font-medium text-slate-300">
                Interested In
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {["MEN", "WOMEN", "COUPLE", "TRANS"].map((value) => (
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
                    if (selected.some((f) => f.size > 2 * 1024 * 1024)) {
                      toast.info("Compressing large images for faster upload...");
                    }
                    const compressed: File[] = [];
                    for (const f of selected) {
                      const cf = f.size > 2 * 1024 * 1024 ? await compressImage(f) : f;
                      compressed.push(cf);
                      if (cf.size > 2 * 1024 * 1024) {
                        toast.warn(`${f.name} is still large after compression (~${(cf.size/1024/1024).toFixed(1)}MB)`);
                      }
                    }
                    setimglist((prev) => [
                      ...prev,
                      ...compressed.map((f) => URL.createObjectURL(f)),
                    ]);
                    setphotolink((prev) => [...prev, ...compressed]);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4">
                {imglist.map((value: string, index: number) => (
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
                  </div>
                ))}
              </div>
            </div>

            <hr className="mb-3 bg-slate-300"></hr>

            <button
              className="block w-full text-center truncate btn rounded-2xl"
              disabled={disablebut}
              onClick={() => {
                checkuserInput();
              }}
            >
              Procced
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
    </>
  );
};
