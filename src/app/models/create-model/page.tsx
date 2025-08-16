"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PacmanLoader from "react-spinners/PacmanLoader";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
// import {
//   createmodel,
//   changemodelstatus,
// } from "@/app/features/model/modelSlice";
import CountrySelect from "@/components/CountrySelect/CountrySelect";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/CreateModelview.css";
import person from "../../icons/person.svg";
import idcardicon from "../../icons/idcardIcon.svg";
import deleteIcon from "../../icons/deleteicon.svg";
// import "@/styles";

let times: any[] = [];
let hours: any[] = [];
let Interested: any[] = [];
let MIN = "";

export default function CreateModelview () {
  // const firstname = useSelector((state: any) => state.profile.firstname);
  // const lastname = useSelector((state: any) => state.profile.lastname);
  // const login = useSelector((state: any) => state.register.logedin);
  // const userid = useSelector((state : any) => state.register.userID);
  // const token = useSelector((state : any) => state.register.refreshtoken);
  // const modelpoststatus = useSelector((state : any) => state.model.modelpoststatus);
  // const message = useSelector((state : any) => state.model.message);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#d49115");

  const [name, setname] = useState(``);
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
  const [days, setdays] = useState("1hour");
  const [price, setprice] = useState("");
  const [discription, setdiscription] = useState("");
  const [disablebut, setdisablebut] = useState(false);
  const [hosttype, sethosttype] = useState("fan Meet");
  const [imglist, setimglist] = useState([]);
  const [photolink, setphotolink] = useState([]);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // useEffect(() => {
  //   if (modelpoststatus === "succeeded") {
  //     toast.success(`${message}`, { autoClose: 2000 });
  //     // dispatch(changemodelstatus("idle"));
  //     router.push("/model");
  //   }

  //   if (modelpoststatus === "failed") {
  //     setdisablebut(false);
  //     setLoading(false);
  //     toast.error(`${message}`, { autoClose: 5000 });
  //     // dispatch(changemodelstatus("idle"));
  //   }
  // }, [modelpoststatus]);

  useEffect(() => {
    // imglist.reverse();
  });

  // Function to validate step-specific requirements
  const validateStep = (stepNumber: any) => {
    switch (stepNumber) {
      case 1:
        if (!name || name.trim() === "") {
          toast.error("Full name is required");
          return false;
        }
        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        if (!nameRegex.test(name.trim())) {
          toast.error(
            "Full name must contain only letters and spaces, and be at least 2 characters long"
          );
          return false;
        }
        if (!age) {
          toast.error(`Age is required`);
          return false;
        }
        if (!location) {
          toast.error(`Location is required`);
          return false;
        }
        if (!height) {
          toast.error(`Height is required`);
          return false;
        }
        return true;

      case 2:
        if (!price) {
          toast.error(`Price is required`);
          return false;
        }
        if (!hosttype) {
          toast.error(`Select host type`);
          return false;
        }
        if (Interested.length <= 0) {
          toast.error(`Please select what you're interested in`);
          return false;
        }
        if (!discription) {
          toast.error(`Write your description`);
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const checkuserInput = () => {
    if (!name || name.trim() === "") {
      toast.error("Full name is required");
      return;
    }
    if (!age) {
      toast.error(`Age is required`);
      return;
    }
    if (!hosttype) {
      toast.error(`Select host type`);
      return;
    }
    if (photolink.length <= 0) {
      toast.error(`Please upload at least one image`);
      return;
    }
    if (!location) {
      toast.error(`Location is required`);
      return;
    }
    if (!price) {
      toast.error(`Price is required`);
      return;
    }
    if (!height) {
      toast.error(`Height is required`);
      return;
    }
    if (Interested.length <= 0) {
      toast.error(`Please select what you're interested in`);
      return;
    }
    if (!discription) {
      toast.error(`Write your description`);
      return;
    }

    // if (modelpoststatus !== "loading") {
    //   setdisablebut(true);
    //   setLoading(true);
      // dispatch(
      //   createmodel({
      //     name,
      //     age,
      //     location: location || "",
      //     price,
      //     duration: days,
      //     bodytype,
      //     smoke,
      //     drink,
      //     interestedin: Interested,
      //     height,
      //     weight,
      //     discription,
      //     gender,
      //     timeava: times,
      //     daysava: hours,
      //     photolink,
      //     userid,
      //     token,
      //     hosttype,
      //   })
      // );
    // }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const getLocation = (country: any) => {
    setlocation(`${country}`);
  };

  return (
    <>
      <div className="pt-16 md:pt-8">
        <ToastContainer position="top-center" theme="dark" />
        <p className="text-2xl font-semibold text-center text-slate-300 sm:w-1/2">
          Create New Model
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
              <label className="label">Full Name</label>
              <input
                type="text"
                className="bg-black name-label"
                placeholder="Enter your full name"
                value={name}
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

              <div className="mt-4">
                <select
                  name="days"
                  className="w-full p-3 mb-3 text-white bg-gray-800 focus:outline-none"
                  onChange={(e) => setdays(e.currentTarget.value)}
                >
                  <option value={`${duration}min`}>{duration} MIN</option>
                  <option value={`${duration}hour`}>{duration} HOUR</option>
                  <option value={`${duration}day`}>{duration} DAY</option>
                </select>
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
                  <option value={`Private show`}>Private show</option>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) {
                      setimglist((value) => [...value, URL.createObjectURL(e.target.files[0])]);
                      setphotolink((value) => [...value, e.target.files[0]]);
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4">
                {imglist.map((value, index) => (
                  <div key={index} className="relative group">
                    <Image
                      alt={`uploaded-${index}`}
                      src={value}
                      className="object-cover w-full border rounded-lg h-36 border-slate-600"
                    />
                    <button
                      onClick={() => {
                        setimglist((prev) =>
                          prev.filter((item) => item !== value)
                        );
                        setphotolink((prev) =>
                          prev.filter((item) => item !== value)
                        );
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
              <PacmanLoader
                color={color}
                loading={loading}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
                margin={"auto"}
              />
              <PacmanLoader
                color={color}
                loading={loading}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
                margin={"auto"}
              />
              <PacmanLoader
                color={color}
                loading={loading}
                size={15}
                aria-label="Loading Spinner"
                data-testid="loader"
                margin={"auto"}
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
          </div>
        </div>
      </div>
    </>
  );
};
