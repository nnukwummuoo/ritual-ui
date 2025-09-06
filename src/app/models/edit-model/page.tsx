"use client";

import { useEffect, useRef, useState } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "material-react-toastify";
// import {
//   updatemodel,
//   changemodelstatus,
// } from "@/app/features/model/modelSlice";
import HeaderBackNav from "@/components/navs/HeaderBackNav";
import CountrySelect from "@/components/CountrySelect/CountrySelect";
// import { useAuth } from "@/app/hooks/useAuth";

// Move static files into /public/icons
import idcardicon from "/public/icons/idcardIcon.svg";
import deleteIcon from "/public/icons/deleteicon.svg";
import "@/styles/CreateModelview.css";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { editModelMultipart } from "@/api/model";
import { useUserId } from "@/lib/hooks/useUserId";


export default function Editmodel () {

  // const login = useSelector((state) => state.register.logedin);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const modelupdatestatus = useSelector(
  //   (state) => state.model.modelupdatestatus
  // );
  const userid = useUserId();
  const model = useSelector((state: any) => state.model.modelbyid);
  const modelID = (model && (model.hostid || model.id || model._id)) as string | undefined;
  // const message = useSelector((state) => state.model.message);
  const dispatch = useDispatch();
  const router = useRouter();
  // const user = useAuth();

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#d49115");
  const [name, setname] = useState("");
  const [age, setage] = useState( "");
  const [location, setlocation] = useState("");
  const [bodytype, setbodytype] = useState("");
  const [height, setheight] = useState("");
  const [weight, setweight] = useState("");
  const [gender, setgender] = useState("");
  const [smoke, setsmoke] = useState("");
  const [drink, setdrink] = useState("");
  const [pm, setpm] = useState("PM");
  const [duration, setduration] = useState("");
  const [days, setdays] = useState("");
  const [price, setprice] = useState("");
  const [description, setdescription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("Fan meet");
  const [photocount, setphotocount] = useState(0);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [newImages, setNewImages] = useState<any[]>([]);
  const [times, setTimes] = useState<string[]>(
   []
  );
  const [hours, setHours] = useState<string[]>(
    []
  );
  const [interested, setInterested] = useState<string[]>(
     []
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const token = useAuthToken();

  // Prefill fields from store model and guard when missing
  useEffect(() => {
    // If there is no model context, redirect back to models list
    if (!model || !modelID) {
      toast.info("Open a model page before editing", { autoClose: 2000 });
      router.push("/models");
      return;
    }

    // Prefill once when model is present
    setname(model.name || "");
    setage(model.age || "");
    setlocation(model.location || "");
    setbodytype(model.bodytype || "");
    setheight(model.height || "");
    setweight(model.weight || "");
    setgender(model.gender || "");
    setsmoke(model.smoke || "");
    setdrink(model.drink || "");
    setdescription(model.description || "");
    sethosttype(model.hosttype || hosttype);

    // price and duration normalization
    if (typeof model.price === "string") {
      setprice(model.price);
    }
    if (typeof model.duration === "string") {
      // Keep original duration text and also try to extract leading number for slider
      setdays(model.duration);
      const num = (model.duration.match(/\d+/)?.[0]) || "";
      if (num) setduration(num);
    }

    // Arrays: interestedin, timeava, daysava may be strings or arrays
    const toArray = (v: any): string[] => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string") {
        // split by comma or whitespace
        const parts = v.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
        return parts;
      }
      return [];
    };
    setInterested((prev) => (prev.length ? prev : toArray(model.interestedin)));
    setTimes((prev) => (prev.length ? prev : toArray(model.timeava)));
    setHours((prev) => (prev.length ? prev : toArray(model.daysava)));
  }, [model, modelID, router]);

  // useEffect(() => {
  //   if (!login) {
  //     router.push("/");
  //   }
  // }, [login, router]);

  // useEffect(() => {
  //   if (modelupdatestatus === "succeeded") {
  //     toast.success(`${message}`, { autoClose: 2000 });
  //     dispatch(changemodelstatus("idle"));
  //     router.push(`/modelbyid/${modelID}`);
  //   }
  //   if (modelupdatestatus === "failed") {
  //     setdisablebut(false);
  //     setLoading(false);
  //     toast.error(`${message}`, { autoClose: 5000 });
  //     dispatch(changemodelstatus("idle"));
  //   }
  // }, [modelupdatestatus, message, dispatch, router, modelID]);

  const checkuserInput = async () => {
    if (!age) return toast.error(`Age Empty`, { autoClose: 2000 });
    if (!hosttype) return toast.error(`Select host type`, { autoClose: 2000 });
    if (newImages.length === 0)
      return toast.error(`Please upload at least one image`, {
        autoClose: 2000,
      });
    if (!location) return toast.error(`Location Empty`, { autoClose: 2000 });
    if (!price) return toast.error(`Price Empty`, { autoClose: 2000 });
    if (!height) return toast.error(`Height Empty`, { autoClose: 2000 });
    if (!description)
      return toast.error(`Write your description`, { autoClose: 2000 });

    if (!userid) return toast.error("Missing user, please login again");
    if (!token) return toast.error("Missing token");
    if (!modelID) return toast.error("Missing model id");

    try {
      setdisablebut(true);
      setLoading(true);
      const data = {
        userid,
        modelid: modelID,
        name,
        age,
        location,
        price,
        duration: days,
        bodytype,
        smoke,
        drink,
        interestedin: interested.length > 0 ? interested : model?.interestedin || [],
        height,
        weight,
        description,
        gender,
        timeava: times.length > 0 ? times : model?.timeava || [],
        daysava: hours.length > 0 ? hours : model?.daysava || [],
        hosttype,
        hostid:userid
      };
      const doc1 = newImages[0];
      const doc2 = newImages[1];
      await editModelMultipart({ token, data,files:newImages.map(img=>img), doc1, doc2 });
      toast.success("Model updated successfully");
      router.push(`/models/${modelID}`);
    } catch (err:any) {
      console.error("Edit model failed", err);
      toast.error(typeof err === 'string' ? err : 'Failed to update model');
    } finally {
      setdisablebut(false);
      setLoading(false);
    }
  };

  const getLocation = (country : any) => {
    setlocation(`${country}`);
  };

  const removeNewImage = (index : any) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setphotocount((prev) => prev - 1);
  };

  const handleImageUpload = (files: any) => {
    if (files?.length) {
      setNewImages((prev : any) => [...prev, ...files]);
      setphotocount((prev) => prev + files?.lenght);
    }
  };
  
  return (
    <div className="">
      <div className="">
        <HeaderBackNav />
        <ToastContainer position="top-center" theme="dark" />
        <p className="text-2xl font-semibold text-center text-slate-300 sm:w-1/2">
          Edit model
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
              <TextInput
                label="Fullname"
                name="name"
                value={name}
                type={"text"}
                onChange={({target}:any)=>setname(target.value)}
              />
            </div>
            <div className="input-container">
              <label className="label">Location</label>
              <div className="bg-black">
                <CountrySelect onSelectCountry={getLocation} />
              </div>
            </div>
            <div className="input-container">
              <label className="label">Edit age</label>
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
                className="custom-select"
                value={bodytype}
                onChange={(e) => setbodytype(e.currentTarget.value)}
              >
                <option value="">Select</option>
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
                  Edit height? <span className="height-value">{height}</span>
                </label>
              </div>
              <select
                id="height-select"
                className="height-select"
                value={height}
                onChange={(e) => setheight(e.currentTarget.value)}
              >
                <option value="">Select</option>
                {Array.from({ length: 200 }, (_, i) => i + 57).map((value) => (
                  <option key={value} value={`${value} cm`}>
                    {value} cm
                  </option>
                ))}
              </select>
            </div>
            <div className="input-container">
              <div>
                <label className="height-label">Edit weight? {weight}</label>
              </div>
              <select
                className="height-select"
                value={weight}
                onChange={(e) => setweight(e.currentTarget.value)}
              >
                <option value="">Select</option>
                {Array.from({ length: 120 }, (_, i) => i + 40).map((value) => (
                  <option
                    key={value}
                    value={`${value} kg`}
                    className="w-full mt-1 mb-1 bg-gray-800 border text-slate-100 rounded-2xl"
                  >{`${value} kg`}</option>
                ))}
              </select>
            </div>
            <div className="input-container">
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Change Gender?
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={gender}
                  onChange={(e) => setgender(e.currentTarget.value)}
                >
                  <option value="">Select</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Trans">Trans</option>
                  <option value="Couple">Couple</option>
                </select>
              </div>
            </div>
            <div className="input-container">
              <label htmlFor="smoke" className="form-label">
                Do You Smoke?
              </label>
              <select
                id="smoke"
                name="smoke"
                className="form-select"
                onChange={(e) => setsmoke(e.currentTarget.value)}
                value={smoke}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="input-container">
              <label htmlFor="drink" className="form-label">
                Do you Drink?
              </label>
              <select
                id="drink"
                name="drink"
                className="form-select"
                onChange={(e) => setdrink(e.currentTarget.value)}
                value={drink}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </fieldset>
          <fieldset
            style={{ display: step === 2 ? "flex" : "none" }}
            className="bg-gray-900 form-container"
            disabled={disablebut}
          >
            <div className="input-container">
              <p className="text-slate-300">Available hours</p>
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
                        id="hourscheck"
                        type="checkbox"
                        value={value}
                        className="sr-only peer"
                        checked={times.includes(value)}
                        onChange={() =>
                          setTimes((prev) =>
                            prev.includes(value)
                              ? prev.filter((t) => t !== value)
                              : [...prev, value]
                          )
                        }
                      />
                      <div className="h-6 transition duration-300 bg-gray-300 rounded-full w-11 peer-focus:outline-none peer peer-checked:bg-orange-500"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-slate-800 rounded-full shadow-md transform peer-checked:translate-x-5 transition duration-300"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="input-container">
              <p className="font-semibold text-slate-300">Available DAYS</p>
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
                          checked={hours.includes(value)}
                          onChange={() =>
                            setHours((prev : any) =>
                              prev.includes(value)
                                ? prev.filter((h: any) => h !== value)
                                : [...prev, value]
                            )
                          }
                        />
                        <div className="h-6 transition duration-300 bg-gray-300 rounded-full w-11 peer-focus:outline-none peer peer-checked:bg-orange-500"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-slate-800 rounded-full shadow-md transform peer-checked:translate-x-5 transition duration-300"></div>
                      </label>
                    </div>
                  )
                )}
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
              <div className="mt-4">
                <select
                  name="days"
                  className="w-full p-3 mb-3 text-white bg-gray-800 focus:outline-none"
                  value={days}
                  onChange={(e) => setdays(e.currentTarget.value)}
                >
                  <option value="">Select</option>
                  <option value={`${duration}min`}>{duration}MIN</option>
                  <option value={`${duration}hour`}>{duration}HOUR</option>
                  <option value={`${duration}day`}>{duration}DAY</option>
                </select>
              </div>
            </div>
            <div className="input-container">
              <div className="flex-col">
                <label className="form-label">Choose Category</label>
                <select
                  name="hosttype"
                  className="height-select"
                  value={hosttype}
                  onChange={(e) => sethosttype(e.currentTarget.value)}
                >
                  <option value="">Select</option>
                  <option value="Fan meet">Fan meet</option>
                  <option value="Fan date">Fan date</option>
                  <option value="Private show">Private show</option>
                </select>
              </div>
              <label className="text-slate-300">
                Enter desired{" "}
                {hosttype === "Private show" ? "tip " : "transport fare "}amount{" "}
                {hosttype === "Private show" && "per minute"}
              </label>
              <input
                className="bg-black name-label"
                type="number"
                placeholder={price}
                onInput={(e) => setprice(e.currentTarget.value)}
              />
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
                      checked={interested.includes(value)}
                      onChange={() =>
                        setInterested((prev: any) =>
                          prev.includes(value)
                            ? prev.filter((i: any) => i !== value)
                            : [...prev, value]
                        )
                      }
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
                placeholder="Tell us about yourself..."
                value={description}
                onChange={(e) => setdescription(e.currentTarget.value)}
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
                Please Upload Your Photo
              </label>
              <p className="mt-1 text-sm text-center text-slate-400">
                {newImages.length} {newImages.length === 1 ? "Photo" : "Photos"}{" "}
                Selected
              </p>
              <div
                className="p-6 mt-4 text-center transition border-2 border-dashed cursor-pointer border-slate-500 hover:border-yellow-500 rounded-xl text-slate-400 hover:text-yellow-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-sm">
                  Click or drag file to this area to upload
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files);
                  }} multiple
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4">
                {newImages.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <Image
                      width={100}
                      height={100}
                      alt={`new-${index}`}
                      src={URL.createObjectURL(file)}
                      className="object-cover w-full border rounded-lg h-36 border-slate-600"
                    />
                    <button
                      onClick={() => removeNewImage(index)}
                      className="absolute p-1 text-xs text-white transition bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                      title="Remove"
                    >
                      ✕
                    </button>
                    <div className="absolute px-2 py-1 text-xs text-white bg-green-500 rounded bottom-2 left-2">
                      New
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <hr className="my-4 bg-slate-300" />
            <button
              className="block w-full h-10 font-semibold text-center text-white transition bg-yellow-600 btn rounded-2xl hover:bg-yellow-500"
              disabled={disablebut}
              onClick={checkuserInput}
            >
              Proceed
            </button>
            <div className="flex justify-between mt-3 overflow-hidden">
              <PacmanLoader color={color} loading={loading} size={15} />
              <PacmanLoader color={color} loading={loading} size={15} />
              <PacmanLoader color={color} loading={loading} size={15} />
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
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-white bg-gray-600 rounded"
                style={{ maxWidth: 300 }}
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 text-white bg-orange-500 rounded"
                style={{ maxWidth: 300 }}
              >
                Next
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TextInput = ({ label, name, value, onChange, type = "text" }: any): any => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium mb-2">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
      ></textarea>
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
          onChange={onChange}
          placeholder={"Enter Your "+label}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-slate-800 text-white"
      />
    )}
  </div>
);