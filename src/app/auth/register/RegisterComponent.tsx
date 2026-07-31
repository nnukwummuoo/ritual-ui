"use client"
import React, { useState, useEffect } from "react";
import "./styles.css";
import Image from "next/image";
import Link from "next/link";
import CountrySelect from "@/components/CountrySelect/CountrySelect";
import NextSlide from "./_components/NextSlideBtn";
import Input from "@/components/Input";
import Step from "./_components/Step";
import DotSlideBtn from "./_components/DotSlideBtn";
import Agree from "./_components/AgreeBtn";
import { register } from "@/lib/service/register";
import { useRouter } from "next/navigation";
import BtnLoader from "@/constants/BtnLoader";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { registernewUser } from "@/store/registerSlice";
import type { AppDispatch } from "@/store/store";
import axios from "axios";
import { URL as API_URL } from "@/api/config";
import { FaHome } from "react-icons/fa";
import Cookies from "js-cookie";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";


// Word list for generating a mnemonic phrase (unchanged)
const wordList = [
  "apple","ball","cat","dog","egg","fish","goat","hat","ice","jam",
  "kite","lamp","moon","nest","orange","pen","queen","rain","sun","tree",
  "umbrella","van","water","xray","yarn","zebra","book","chair","desk","door",
  "floor","glass","house","key","leaf","milk","note","oven","plate","road",
  "shoe","table","unit","vase","wall","yard","zero","air","bag","car",
  "day","ear","fan","game","hand","iron","job","king","line","man",
  "net","oil","park","quiz","ring","salt","time","use","voice","wind",
  "year","zone","bread","cloud","dust","fire","gold","hill","ink","joy",
  "love","map","name","open","pool","rice","sand","town","user","view",
  "wood","young","baby","cold","dark","easy","fast","good","hard","idea",
  "kind","long","more","new","old","play","quick","red","small","tall",
  "up","very","white","yellow","blue","green","black","brown","silver","gray",
  "happy","sad","angry","calm","peace","hope","fear","dream","wish","smile",
  "laugh","cry","sing","dance","walk","run","jump","sit","stand","sleep",
  "wake","eat","drink","cook","read","write","draw","paint","build","fix",
  "open","close","start","stop","push","pull","carry","lift","drop","throw",
  "catch","hold","touch","feel","see","hear","smell","taste","think","know",
  "learn","teach","work","rest","play","study","drive","ride","fly","swim",
  "climb","fall","grow","cut","break","make","give","take","send","call",
  "ask","answer","tell","say","talk","listen","look","watch","show","find",
  "lose","win","begin","end","stay","go","come","leave","enter","exit",
  "rise","move","stand","sit","walk","run","jump","sleep","dream","light",
  "dark","hot","cold","wet","dry","soft","hard","high","low","big",
  "small","short","long","wide","narrow","deep","shallow","near","far","early",
  "late","young","old","new","used","clean","dirty","full","empty","strong",
  "weak","rich","poor","fast","slow","right","left","north","south","east",
  "west","morning","noon","night","day","week","month","year","time","life",
  "death","man","woman","boy","girl","child","friend","family","people","city",
  "town","village","country","world","earth","sky","sea","river","lake","mountain",
  "forest","field","garden","road","street","bridge","school","work","home","shop",
  "market","bank","office","room","bed","chair","table","door","window","wall",
  "floor","roof","light","fan","clock","phone","radio","tv","computer","music",
  "song","film","game","sport","ball","team","goal","win","lose","food",
  "drink","fruit","meat","rice","bread","milk","water","tea","coffee","sugar",
  "salt","spice","sweet","soup","cake","fish","egg","oil","butter","money",
  "coin","note","card","price","cost","buy","sell","pay","save","love",
  "hope","peace","joy","fear","dream","wish","smile","laugh","cry","clouds",
  "storm","rainbow","riverbank","shore","beach","desert","valley","cave","stone","rock",
  "metal","iron","steel","wood","paper","pen","pencil","brush","color","paint",
  "picture","photo","camera","screen","keyboard","mouse","button","switch","lamp","lightbulb",
  "engine","wheel","tire","car","bus","train","ship","boat","plane","rocket",
  "star","planet","space","galaxy","universe","atom","cell","blood","heart","brain",
  "body","arm","leg","hand","foot","eye","ear","nose","mouth","face",
  "hair","skin","bone","muscle","voice","sound","noise","music","song","melody",
  "rhythm","beat","dance","move","step","jump","run","walk","sit","stand",
  "rest","sleep","dream","wake","think","plan","goal","task","job","work",
  "play","fun","joy","laugh","smile","cry","tear","sad","angry","calm",
  "peace","hope","love","care","help","share","give","take","send","call",
  "text","chat","talk","listen","hear","see","look","watch","show","find",
  "lose","win","begin","end","start","stop","open","close","push","pull",
  "carry","lift","drop","throw","catch","hold","touch","feel","taste","smell",
  "hot","cold","warm","cool","wet","dry","soft","hard","light","dark",
  "big","small","short","long","wide","narrow","deep","shallow","high","low",
  "early","late","young","old","new","used","clean","dirty","full","empty",
  "strong","weak","rich","poor","fast","slow","right","left","north","south",
  "east","west","day","night","week","month","year","time","life","death"
];
// Function to generate a 12-word secret phrase (unchanged)
const generateSecretPhrase = (): string[] => {
  const phrase = new Set<string>();
  while (phrase.size < 12) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    phrase.add(wordList[randomIndex]);
  }
  return Array.from(phrase);
};

// Function to calculate age from date of birth (unchanged)
const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const Register = () => {
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [country, setCountry] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [secretPhrase, setSecretPhrase] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const deviceId = useDeviceFingerprint();

  // State for form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // State to track if current step is valid
  const [isStepValid, setIsStepValid] = useState<boolean>(false);
  // State to track which steps are accessible (user must complete previous steps)
  const [accessibleSteps, setAccessibleSteps] = useState<number[]>([1]);

  // Username validation
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(""); // "valid", "invalid", "checking", ""

  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    dob: "",
    gender: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear the error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'firstname' || name === 'lastname') {
      // Prevent special characters in name fields
      const sanitizedValue = value.replace(/[^a-zA-Z]/g, '');
      setFormValues(prev => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === 'username') {
      // Enforce username format: starts with @, no special chars except _, lowercase
      let formattedValue = value;
      if (!formattedValue.startsWith('@')) {
        formattedValue = '@' + formattedValue;
      }
      const usernamePart = formattedValue.substring(1).toLowerCase().replace(/[^a-z0-9_]/g, '');
      formattedValue = '@' + usernamePart;

      if (formattedValue.length > 16) { // @ + 15 characters
        formattedValue = formattedValue.substring(0, 16);
      }

      setFormValues(prev => ({ ...prev, [name]: formattedValue }));

      // Reset username validation status when user starts typing
      setUsernameStatus("");
      setUsernameValid(false);
      setUsernameError("");

      // Check uniqueness after a short delay
      const cleanUsername = formattedValue.substring(1); // Remove @ prefix
      if (cleanUsername.length >= 3) {
        setTimeout(() => {
          checkUsernameUniqueness(cleanUsername);
        }, 500);
      }
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const getLocation = (country: string) => {
    setCountry(country);
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: '' }));
    }
  };

  const generateNewPhrase = () => { setSecretPhrase(generateSecretPhrase()); setCopied(false); setSaved(false); };
  useEffect(() => { generateNewPhrase(); }, []);

  // Function to check username uniqueness
  const checkUsernameUniqueness = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("");
      setUsernameValid(false);
      setUsernameStatus("");
      return false;
    }

    // Validate username format: 3-15 characters, only letters, numbers, and underscores
    const usernameRegex = /^[a-z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-15 characters, lowercase letters, numbers, and underscores only");
      setUsernameValid(false);
      setUsernameStatus("invalid");
      return false;
    }

    setIsCheckingUsername(true);
    setUsernameError("");
    setUsernameStatus("checking");
    setUsernameValid(false);

    try {
      const response = await axios.post(`${API_URL}/checkusername`, {
        username: `@${username}`, // Add @ prefix for database check
        currentUserId: null // No current user during registration
      });

      if (response.data.available) {
        setUsernameError("");
        setUsernameValid(true);
        setUsernameStatus("valid");
        return true;
      } else {
        setUsernameError("Username is already taken");
        setUsernameValid(false);
        setUsernameStatus("invalid");
        return false;
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameError("Error checking username availability");
      setUsernameValid(false);
      setUsernameStatus("invalid");
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Validate step whenever formValues, country, step, or username status changes
  useEffect(() => {
    setIsStepValid(validateStep(step));
  }, [formValues, country, step, usernameStatus]);

  const copyToClipboard = () => {
  const numbered = secretPhrase.map((word, index) => `${index + 1}. ${word}`).join("\n");
  navigator.clipboard.writeText(numbered);
  setCopied(true);
  toast.success("Phrase copied!", { style: { backgroundColor: "#111" } });
  setTimeout(() => setCopied(false), 2000);
};

  const downloadPhrase = () => {
    const htmlContent = `
    <html>
      <head>
        <title>Recovery Phrase</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            color: #111;
            text-align: center;
            margin-top: 100px;
          }
          .word {
            display: inline-block;
            margin: 8px 12px;
            padding: 10px 15px;
            border: 2px solid #333;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        ${secretPhrase
        .map((word, index) => `<div class="word">${index + 1}. ${word}</div>`)
        .join("")}
      </body>
    </html>
  `;
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "recovery-phrase.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Validation logic for each step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formValues.firstname) { newErrors.firstname = "First name is required."; isValid = false; }
      else if (!/^[a-zA-Z]{1,9}$/.test(formValues.firstname)) { newErrors.firstname = "First name must be 1-9 letters."; isValid = false; }

      if (!formValues.lastname) { newErrors.lastname = "Last name is required."; isValid = false; }
      else if (!/^[a-zA-Z]{1,9}$/.test(formValues.lastname)) { newErrors.lastname = "Last name must be 1-9 letters."; isValid = false; }

      if (!formValues.dob) { newErrors.dob = "Date of birth is required."; isValid = false; }
      else if (calculateAge(formValues.dob) < 18) { newErrors.dob = "You must be at least 18 years old."; isValid = false; }
    }

    if (currentStep === 2) {
      if (!formValues.gender) { newErrors.gender = "Please select your gender."; isValid = false; }
      if (!country) { newErrors.country = "Please select your country."; isValid = false; }
      if (!formValues.username) { newErrors.username = "Username is required."; isValid = false; }
      else if (!/^@[a-z0-9_]{3,15}$/.test(formValues.username)) { newErrors.username = "Must be 3-15 characters (letters, numbers, or _)."; isValid = false; }
      else if (usernameStatus === "invalid") { newErrors.username = usernameError || "Please choose a different username."; isValid = false; }
      else if (usernameStatus === "" && formValues.username.length >= 3) { newErrors.username = "Please wait for username validation."; isValid = false; }
      else if (usernameStatus === "checking") { newErrors.username = "Checking username availability..."; isValid = false; }
    }

    if (currentStep === 3) {
      if (!formValues.password) { newErrors.password = "Password is required."; isValid = false; }
      if (!formValues.confirmPassword) { newErrors.confirmPassword = "Please confirm your password."; isValid = false; }
      else if (formValues.password !== formValues.confirmPassword) { newErrors.confirmPassword = "Passwords do not match."; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agreedPrivacy || !agreedTerms) {
      toast.error("Agree to the Terms & Conditions / Privacy & Policy.", { style: { backgroundColor: "#111" } });
      return;
    }
    if (!saved) {
      toast.error("Please confirm you've saved your recovery phrase.", { style: { backgroundColor: "#111" } });
      return;
    }
    if (formValues.password !== formValues.confirmPassword) {
      toast.error("Passwords do not match.", { style: { backgroundColor: "#111" } });
      return;
    }
    if (calculateAge(formValues.dob) < 18) {
      toast.error("You must be at least 18 years old.", { style: { backgroundColor: "#111" } });
      return;
    }

    // Check username validation
    if (formValues.username && formValues.username.length >= 3) {
      if (usernameStatus === "invalid") {
        toast.error("Please choose a different username.", { style: { backgroundColor: "#111" } });
        return;
      }
      if (usernameStatus === "checking") {
        toast.error("Please wait for username validation to complete.", { style: { backgroundColor: "#111" } });
        return;
      }
      if (usernameStatus === "" || !usernameValid) {
        toast.error("Please wait for username validation to complete.", { style: { backgroundColor: "#111" } });
        return;
      }
    }

    // 🎁 Get referral code from cookie
    const REFERRAL_COOKIE_KEY = 'referral_code';
    const referralCode = Cookies.get(REFERRAL_COOKIE_KEY) || null;

    if (!deviceId) {
      toast.error("System check failed. Please refresh and try again.", { style: { backgroundColor: "#111" } });
      return;
    }

    const payload = {
      ...formValues,
      age: calculateAge(formValues.dob).toString(),
      country,
      secretPhrase,
      referralCode, // Include referral code in payload
      deviceId, // Include device fingerprint
    };

    try {
      setLoading(true);
      const resultAction = await dispatch(registernewUser(payload));

      if (registernewUser.fulfilled.match(resultAction)) {
        // Registration successful - redirect to login page
        // User must log in manually after registration

        // 🎁 Clear the referral cookie after successful registration
        if (referralCode) {
          Cookies.remove(REFERRAL_COOKIE_KEY);
          console.log('✅ Referral code cleared after successful registration');
        }

        toast.success("Registration successful! Please log in to continue.", { style: { backgroundColor: "#111", zIndex: 9999 } });
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.message || "Registration failed.";
      toast.error(errorMessage === "Username already taken!" ? "Username exists." : errorMessage, { style: { backgroundColor: "#111", zIndex: 9999 } });
    } finally {
      setLoading(false);
    }
  }

  // Handle click for the "Next" button
  function handleNextClick() {
    if (validateStep(step) && step < 4) {
      const nextStep = step + 1;
      setStep(nextStep);
      // Add the next step to accessible steps
      if (!accessibleSteps.includes(nextStep)) {
        setAccessibleSteps(prev => [...prev, nextStep]);
      }
    }
  }

  // Step descriptions mapping
  const stepDescriptions = [
    "Meet Your Fans • Keep 100% • Stay Safe ",
    "Meet Your Fans • Keep 100% • Stay Safe ",
    "Meet Your Fans • Keep 100% • Stay Safe ",
    "Meet Your Fans • Keep 100% • Stay Safe "
  ];

  const inputs = [
    {
      step_1: [
        {
          name: "firstname",
          label: "First Name",
          input: <Input id="firstname" type="text" name="firstname" placeholder=" " overide={true} classNames="" maxLength={9} pattern="[a-zA-Z]{1,9}" title="First name must be 1-9 letters only." required={true} value={formValues.firstname} onChange={handleInputChange} />,
        },
        {
          name: "lastname",
          label: "Last Name",
          input: <Input id="lastname" type="text" name="lastname" placeholder=" " overide={true} classNames="" maxLength={9} pattern="[a-zA-Z]{1,9}" title="Last name must be 1-9 letters only." required={true} value={formValues.lastname} onChange={handleInputChange} />,
        },
        {
          name: "dob",
          label: "Date of birth",
          input: <Input id="dob" required={true} type="date" name="dob" placeholder=" " overide={true} classNames="" value={formValues.dob} onChange={handleInputChange} />,
        },
      ],
      step_2: [
        {
          name: "gender",
          label: "Gender",
          input: (
            <select
              id="gender"
              name="gender"
              required={true}
              value={formValues.gender}
              onChange={handleInputChange}
              style={{ color: formValues.gender ? 'inherit' : 'transparent' }}
            >
              <option value="" disabled>Select Gender</option>
              <option value="male" style={{ color: 'initial' }}>Male</option>
              <option value="female" style={{ color: 'initial' }}>Female</option>
            </select>
          )
        },
        {
          name: "username",
          label: "@User Name",
          input: (
            <div className="relative">
              <Input
                id="username"
                required={true}
                type="text"
                name="username"
                placeholder="@username"
                overide={false}
                classNames={`${usernameStatus === "valid" ? 'border border-green-500' : usernameStatus === "invalid" ? 'border border-red-500' : usernameStatus === "checking" ? 'border border-yellow-500' : ''}`}
                maxLength={16}
                pattern="@[a-z0-9_]{3,15}"
                title="Username: @ followed by 3-15 lowercase letters, numbers, or _"
                value={formValues.username}
                onChange={handleInputChange}
              />
              {/* Status indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingUsername && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                )}
                {usernameStatus === "valid" && !isCheckingUsername && (
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {usernameStatus === "invalid" && !isCheckingUsername && (
                  <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          )
        },
      ],
      step_3: [
        {
          name: "password",
          label: "Password",
          input: <Input id="password" type="password" name="password" placeholder=" " overide={true} classNames="" required={true} value={formValues.password} onChange={handleInputChange} />,
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          input: <Input id="confirmPassword" type="password" name="confirmPassword" placeholder=" " overide={true} classNames="" required={true} value={formValues.confirmPassword} onChange={handleInputChange} />,
        },
      ]
    }
  ];

  // Scroll to top whenever step changes - scroll the parent scrollable container
  useEffect(() => {
    const scrollToTop = () => {
      // Find the scrollable parent container (from ConditionalLayout with overflow-y-auto)
      let scrollableContainer: HTMLElement | null = null;

      // Try to find the container by class name (scrollbar overflow-y-auto)
      scrollableContainer = document.querySelector('.scrollbar.overflow-y-auto') as HTMLElement;

      // Fallback: find parent element with overflow-y-auto
      if (!scrollableContainer && containerRef.current) {
        let parent = containerRef.current.parentElement;
        while (parent) {
          const styles = window.getComputedStyle(parent);
          if (styles.overflowY === 'auto' || styles.overflowY === 'scroll') {
            scrollableContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }

      // If we found the scrollable container, scroll it to top
      if (scrollableContainer) {
        scrollableContainer.scrollTop = 0;
      } else {
        // Fallback to window scroll if container not found
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Scroll immediately
    scrollToTop();

    // Also scroll after DOM update to ensure it works
    requestAnimationFrame(() => {
      scrollToTop();
      // One more time after a tiny delay to catch any layout changes
      setTimeout(scrollToTop, 10);
    });
  }, [step]);

  return (
    <div ref={containerRef} className="body w-full h-auto overflow-scroll min-h-screen">
      {/* Home Icon */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          title="Go to Home"
        >
          <FaHome className="text-2xl" style={{ color: '#bec8fa' }} />
        </button>
      </div>

      <div className="form-container-wrapper w-full mt-12 min-h-screen">
        <Image src={"/register.png"} alt="Register" width={500} height={300} className="min-h-full" />

        <form onSubmit={handleSubmit} noValidate>
          <h2 className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !bg-clip-text !text-transparent">Register</h2>
          <p>{stepDescriptions[step - 1]}</p>

          <div className="pagination">
            <DotSlideBtn setStep={setStep} step={step} slide={1} disabled={!accessibleSteps.includes(1)} />
            <DotSlideBtn setStep={setStep} step={step} slide={2} disabled={!accessibleSteps.includes(2)} />
            <DotSlideBtn setStep={setStep} step={step} slide={3} disabled={!accessibleSteps.includes(3)} />
            <DotSlideBtn setStep={setStep} step={step} slide={4} disabled={!accessibleSteps.includes(4)} />
          </div>

          <div className="form-input-wrapper">
            {/* Step 1 */}
            <Step step={step} slide={1}>
              {inputs[0].step_1.map((v, i) => (
                <div className="floating-label-group" key={i}>
                  {v.input}
                  <label htmlFor={v.name}>{v.label}</label>
                  <p className="error-text h-6">{errors[v.name] || ""}</p>
                </div>
              ))}
              <NextSlide onClick={handleNextClick} setStep={setStep} disabled={!isStepValid} />
            </Step>

            {/* Step 2 */}
            <Step step={step} slide={2}>
              {inputs[0].step_2.map((v, i) => (
                <div className="floating-label-group" key={i}>
                  {v.input}
                  {v.name !== "username" && <label htmlFor={v.name}>{v.label}</label>}
                  <p className="error-text h-6">{errors[v.name] || ""}</p>
                  {/* Username specific messages */}
                  {v.name === "username" && (
                    <>
                      {usernameStatus === "valid" && (
                        <div className="text-xs text-green-400 mt-1">
                          ✓ Username is available
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        • Must be between 3-15 characters • Only letters, numbers, and underscores • Must be unique
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="floating-label-group">
                <CountrySelect onSelectCountry={getLocation} />
                <input type="hidden" name="country" value={country} />
                <p className="error-text h-6">{errors.country || ""}</p>
              </div>
              <NextSlide onClick={handleNextClick} setStep={setStep} disabled={!isStepValid} />
            </Step>

            {/* Step 3 */}
            <Step step={step} slide={3}>
              {inputs[0].step_3.map((v, i) => (
                <div className="floating-label-group" key={i}>
                  {v.input}
                  <label htmlFor={v.name}>{v.label}</label>
                  <p className="error-text h-6">{errors[v.name] || ""}</p>
                </div>
              ))}

              <Agree id="terms" toThe={<Link href="/auth/T_&_C" className='!text-blue-500'>the Terms & Conditions.</Link>} agree={agreedTerms} setAgree={() => setAgreedTerms(prev => !prev)} />
              < Agree id="privacy" toThe={<Link href={"/auth/privacy-policy"} className='!text-blue-500'>Privacy Policy</Link>} agree={agreedPrivacy} setAgree={() => setAgreedPrivacy(prev => !prev)} />

              <NextSlide onClick={handleNextClick} setStep={setStep} disabled={!isStepValid} />
            </Step>

            {/* Step 4 - Secret Phrase */}
            <Step step={step} slide={4}>
              <div className="secret-phrase-container max-h-[60vh] overflow-y-auto">
                <h3 className="text-center mb-4 !bg-gradient-to-r !from-blue-500 !to-purple-600 !bg-clip-text !text-transparent">Save Your Recovery Phrase</h3>

                <div className="phrase-grid">
                  {secretPhrase.map((word, index) => (
                    <div className="phrase-item" key={index}>
                      <span className="phrase-word">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="phrase-warning">
                  <p>
                    <span style={{ color: '#ff4d4d', fontSize: '16px' }}>⚠️ IMPORTANT</span><br />
                    <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Save Your Recovery Phrase</span><br />
                    <span style={{ color: '#ffffff' }}>
                      This phrase is the only way to recover your account. If you lose it, we cannot help you.
                    </span><br />
                    <span style={{ color: '#ffffff' }}>→ Keep it safe.</span><br />
                    <span style={{ color: '#ffffff' }}>× Never share it with anyone.</span>
                  </p>
                </div>

                <div className="phrase-actions">
                  <button type="button" onClick={generateNewPhrase} className="phrase-btn secondary">🔄 Generate</button>
                  <button type="button" onClick={copyToClipboard} className="phrase-btn secondary">{copied ? "✓ Copied!" : "📋 Copy"}</button>
                  <button type="button" onClick={downloadPhrase} className="phrase-btn secondary">📥 Download</button>
                </div>

                <div className="saved-confirmation">
                  <label className="saved-checkbox">
                    <input type="checkbox" checked={saved} onChange={() => setSaved(!saved)} />
                    <span>I have saved my recovery phrase securely</span>
                  </label>
                </div>

                <button type="submit" className="btn flex items-center justify-center mx-auto !bg-gradient-to-r !from-blue-500 !to-purple-600" disabled={loading || !saved || !agreedTerms || !agreedPrivacy}>
                  {loading ? <p style={{ color: "white" }} className="flex items-center justify-center gap-3 text-white"><BtnLoader /> Please wait...</p> : "Register"}
                </button>
              </div>
            </Step>
          </div>

          {/* Login link is now outside the steps, visible on all of them */}
          <p className="mt-4 text-center">
            I already have an account <Link href="/auth/login" className="!text-blue-500">Login</Link>
          </p>

        </form>
      </div>
    </div>
  );
};

