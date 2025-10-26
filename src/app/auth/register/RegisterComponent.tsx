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
import { toast } from "material-react-toastify";
import { useDispatch } from "react-redux";
import { registernewUser } from "@/store/registerSlice";
import type { AppDispatch } from "@/store/store";
import axios from "axios";
import { URL as API_URL } from "@/api/config";
import { FaHome } from "react-icons/fa";

// Word list for generating a mnemonic phrase (unchanged)
const wordList = [
// Igbo
"chi","aku","obi","mma","nne","nna","nwa","elu","ala","uzo","ulo","anu","mmiri","oku","igwe","osisi","ite","ugwu","igweoma","ike","ife","eze","ada","uzochi","odogwu","obioma","nwanne","okwu","ego","uto","mmirioma","nkume","ugwuoma","onyema","olile","ndidi","obiomaeze","chukwu","onyinye","okwuoma","okike","uwa","nnamdi","oge","udo","ihe","isi","aka","ukwu","anya",

// Yoruba
"omo","iya","baba","orun","ile","omi","ina","igi","orunmila","orunko","ire","ayo","ife","oro","owon","ojo","orunke","agbara","ebi","ireti","ojooma","ore","ogo","ala","irele","awon","aseyori","agbara nla","otito","ire gbogbo",

// Hausa
"uba","uwa","yaro","yarinya","ruwa","wuta","sama","kasa","gida","hanya","zuciya","zuciyarmu","sarki","mace","namiji","gari","rana","dare","lafiya","arziki","karfi","hakuri","gaskiya","soyayya","bege","kyauta","aboki","farin ciki","duniya","lokaci",

// Ghana (Twi)
"agya","ena","abofra","nsuo","ogya","soro","asaase","ofie","kwan","akoma","ohene","obaa","barima","anadwo","owia","osrane","adesua","nkrabea","nkwagye","nokware","aseda","ahonya","anigye","animuonyam","asomdwoe","bere","wiase",

// Zulu
"Inhliziyo","Indlu","Amanzi","Inyama","Ekuseni","Usuku","Ubusuku","Ingane","Umgwaqo","Ikhanda","Umlenze","Isandla","Umlilo","Ukudla","Umngane","Isikhathi","Umhlaba","Indoda","Owesifazane","Imali","Incwadi","Inhlanzi","Ingubo","Amandla","Ithemba","Uthando","Injabulo","Ilanga","Izulu","Ukuphila",

// Swahili
"Moyo","Nyumba","Maji","Nyama","Asubuhi","Siku","Usiku","Mtoto","Barabara","Kichwa","Mguu","Mkono","Moto","Chakula","Rafiki","Wakati","Dunia","Mwanaume","Mwanamke","Pesa","Kitabu","Samaki","Nguo","Nguvu","Nuru","Upendo","Furaha","Jua","Mbingu","Maisha",

// Tagalog (Philippines)
"Araw","Buwan","Tubig","Apoy","Hangin","Lupa","Ulan","Gubat","Bundok","Ilog","Puso","Mabuhay","Kamay","Ulo","Katawan","Mata","Saya","Lungkot","Galit","Ginhawa","Umaga","Gabi","Oras","Lakad","Takbo","Bahay","Kaibigan","Salita","Buhay","Mundo"
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
    nickname: "",
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
    } else if (name === 'nickname') {
        // Enforce nickname format: starts with @, no special chars except _, lowercase
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

  const copyToClipboard = () => { navigator.clipboard.writeText(secretPhrase.join(" ")); setCopied(true); toast.success("Phrase copied!", { style: { backgroundColor: "#111" } }); setTimeout(() => setCopied(false), 2000); };

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
          .map((word) => `<div class="word">${word}</div>`)
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
        if (!formValues.nickname) { newErrors.nickname = "Username is required."; isValid = false; }
        else if (!/^@[a-z0-9_]{3,15}$/.test(formValues.nickname)) { newErrors.nickname = "Must be 3-15 characters (letters, numbers, or _)."; isValid = false; }
        else if (usernameStatus === "invalid") { newErrors.nickname = usernameError || "Please choose a different username."; isValid = false; }
        else if (usernameStatus === "" && formValues.nickname.length >= 3) { newErrors.nickname = "Please wait for username validation."; isValid = false; }
        else if (usernameStatus === "checking") { newErrors.nickname = "Checking username availability..."; isValid = false; }
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
    if (formValues.nickname && formValues.nickname.length >= 3) {
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

    const payload = { ...formValues, age: calculateAge(formValues.dob).toString(), country, secretPhrase };
    
    try {
      setLoading(true);
      const resultAction = await dispatch(registernewUser(payload));
      
      if (registernewUser.fulfilled.match(resultAction)) {
        // Create session for the newly registered user
        try {
          const sessionResult = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
            method: "POST",
            body: JSON.stringify({ 
              nickname: formValues.nickname, 
              password: formValues.password 
            }),
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("Session creation result:", await sessionResult.text());
        } catch (sessionError) {
          console.error("Session creation error:", sessionError);
        }
        
      toast.success("Registration successful! Redirecting...", { style: { backgroundColor: "#111" } });
      router.push("/");
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.message || "Registration failed.";
      toast.error(errorMessage === "Nickname already taken!" ? "Username exists." : errorMessage, { style: { backgroundColor: "#111" } });
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
    "Your Beauty. Your Time. Your Rules.",
    "No Stream. No Stress. Just Earnings.",
    "Create. Connect. Cash Out.",
    "Talk Less. Meet More."
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
          name: "nickname",
          label: "@User Name",
          input: (
            <div className="relative">
              <Input 
                id="nickname" 
                required={true} 
                type="text" 
                name="nickname" 
                placeholder="@username" 
                overide={false}
                classNames={`${usernameStatus === "valid" ? 'border border-green-500' : usernameStatus === "invalid" ? 'border border-red-500' : usernameStatus === "checking" ? 'border border-yellow-500' : ''}`}
                maxLength={16} 
                pattern="@[a-z0-9_]{3,15}" 
                title="Username: @ followed by 3-15 lowercase letters, numbers, or _" 
                value={formValues.nickname} 
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
          input: <Input id="confirmPassword" type="password" name="confirmPassword" placeholder=" " overide={true} classNames="" required={true} value={formValues.confirmPassword} onChange={handleInputChange}/>,
        },
      ]
    }
  ];

  return (
    <div className="body w-full h-auto overflow-scroll min-h-screen">
      {/* Home Icon */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          title="Go to Home"
        >
          <FaHome className="text-2xl" style={{color: '#bec8fa'}} />
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
             {inputs[0].step_1.map((v, i)=>(
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
             {inputs[0].step_2.map((v, i)=>(
              <div className="floating-label-group" key={i}>
                {v.input}
                {v.name !== "nickname" && <label htmlFor={v.name}>{v.label}</label>}
                <p className="error-text h-6">{errors[v.name] || ""}</p>
                {/* Username specific messages */}
                {v.name === "nickname" && (
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
             {inputs[0].step_3.map((v, i)=>(
              <div className="floating-label-group" key={i}>
                {v.input}
                <label htmlFor={v.name}>{v.label}</label>
                <p className="error-text h-6">{errors[v.name] || ""}</p>
              </div>
             ))}
              
              <Agree id="terms" toThe={<Link href="/auth/T_&_C" className='!text-blue-500'>the Terms & Conditions.</Link>} agree={agreedTerms} setAgree={()=> setAgreedTerms(prev=> !prev)} />
              < Agree id="privacy" toThe={<Link href={"/auth/privacy-policy"} className='!text-blue-500'>Privacy Policy</Link>} agree={agreedPrivacy} setAgree={()=> setAgreedPrivacy(prev=> !prev)} />
              
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
                {loading ? <p style={{color: "white"}} className="flex items-center justify-center gap-3 text-white"><BtnLoader /> Please wait...</p> : "Register" }
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

