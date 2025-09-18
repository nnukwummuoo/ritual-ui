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
import { register } from "@/api/register";
import { useRouter } from "next/navigation";
import BtnLoader from "@/constants/BtnLoader";
import { toast } from "material-react-toastify";

// Word list for generating a mnemonic phrase
const wordList = [
  "apple", "banana", "orange", "grape", "kiwi", "melon", "peach", "plum", "mango",
  "lemon", "lime", "cherry", "berry", "papaya", "cloud", "forest", "river", "mountain",
  "ocean", "desert", "sun", "moon", "star", "sky", "galaxy", "comet", "planet",
  "earth", "mars", "jupiter", "saturn", "neptune", "uranus", "pluto", "rocket",
  "ship", "car", "bike", "train", "plane", "boat", "house", "tree", "flower",
  "grass", "leaf", "book", "pen", "pencil", "paper", "code", "music", "art",
  "game", "life", "love", "peace", "happy", "smile", "laugh", "friend", "family"
];

// Function to generate a 12-word secret phrase
const generateSecretPhrase = (): string[] => {
  const phrase = new Set<string>();
  while (phrase.size < 12) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    phrase.add(wordList[randomIndex]);
  }
  return Array.from(phrase);
};

// Function to calculate age from date of birth
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
    
    if (name === 'nickname') {
        // Ensure nickname starts with @ and enforce pattern
        let formattedValue = value;
        if (!formattedValue.startsWith('@')) {
            formattedValue = '@' + formattedValue.replace(/^@+/, '');
        }
        setFormValues(prev => ({ ...prev, [name]: formattedValue }));
    } else {
        setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };


  const getLocation = (country: string) => {
    setCountry(country);
  };

  // Generate or regenerate secret phrase
  const generateNewPhrase = () => {
    setSecretPhrase(generateSecretPhrase());
    setCopied(false);
    setSaved(false);
  };

  // Generate phrase on initial component mount
  useEffect(() => {
    generateNewPhrase();
  }, []);


  // Copy phrase to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretPhrase.join(" "));
    setCopied(true);
    toast.success("Phrase copied to clipboard!", { style: { backgroundColor: "#111" } });
    setTimeout(() => setCopied(false), 2000);
  };

  // Download phrase as text file
  const downloadPhrase = () => {
    const element = document.createElement("a");
    const file = new Blob([secretPhrase.join(" ")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "recovery-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Submit form
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agreedPrivacy || !agreedTerms) {
      toast.error("Agree to the Terms & Conditions / Privacy & Policy to proceed", { style: { backgroundColor: "#111" } });
      return;
    }
    
    if (!saved) {
      toast.error("Please confirm that you've saved your recovery phrase", { style: { backgroundColor: "#111" } });
      return;
    }

    if(formValues.password !== formValues.confirmPassword) {
        toast.error("Passwords do not match.", { style: { backgroundColor: "#111" } });
        return;
    }
    
    const age = calculateAge(formValues.dob);
    if (age < 18) {
        toast.error("You must be at least 18 years old to register.", { style: { backgroundColor: "#111" } });
        return;
    }

    const payload = {
        firstname: formValues.firstname,
        lastname: formValues.lastname,
        gender: formValues.gender,
        nickname: formValues.nickname,
        password: formValues.password,
        age: age.toString(),
        country: country,
        dob: formValues.dob,
        secretPhrase: secretPhrase,
    };
    
    try {
      setLoading(true);
      // Assuming the register service can handle a JSON object
      const result = await register(payload);
      console.log(result);
      toast.success("Registration successful! Redirecting...", { style: { backgroundColor: "#111" } });
      router.push("/");
    } catch (error) {
      console.log(error);
      const errorMessage = (error as any)?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage, { style: { backgroundColor: "#111" } });
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (step < 4) {
      setStep(step + 1);
    }
  }

  const inputs = [
    {
      step_1: [
        {
          label: "First Name",
          input: <Input 
            type="text" 
            name="firstname" 
            placeholder="" 
            overide={true} 
            classNames="" 
            maxLength={10}
            pattern="[a-zA-Z]{1,10}"
            title="First name must be letters only, max 10 characters"
            required={true}
            value={formValues.firstname}
            onChange={handleInputChange}
          />,
        },
        {
          label: "Last Name",
          input: <Input 
            type="text" 
            name="lastname" 
            placeholder="" 
            overide={true} 
            classNames="" 
            maxLength={10}
            pattern="[a-zA-Z]{1,10}"
            title="Last name must be letters only, max 10 characters"
            required={true}
            value={formValues.lastname}
            onChange={handleInputChange}
          />,
        },
        {
          label: "Date of birth",
          input: <Input required={true} type="date" name="dob" placeholder="" overide={true} classNames="" value={formValues.dob} onChange={handleInputChange} />,
        },
      ],
      step_2: [
        {
          label: "Gender",
          input: <select
            id="Gender" 
            name="gender"
            required={true}
            value={formValues.gender}
            onChange={handleInputChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
        },
        {
          label: "@User Name",
          input: <Input 
            required={true} 
            type="text" 
            name="nickname" 
            placeholder="@username" 
            overide={true} 
            classNames="" 
            maxLength={16}
            pattern="@[a-z0-9_.]{1,15}"
            title="Username must start with @, followed by lowercase letters, numbers, underscore, or period, max 15 characters"
            value={formValues.nickname}
            onChange={handleInputChange}
          />
        },
      ],
      step_3: [
        {
          label: "Password",
          input: <Input type="password" name="password" placeholder="" overide={true} classNames="" required={true} value={formValues.password} onChange={handleInputChange} />,
        },
        {
          label: "Confirm Password",
          input: <Input type="password" name="confirmPassword" placeholder="" overide={true} classNames="" required={true} value={formValues.confirmPassword} onChange={handleInputChange}/>,
        },
      ]
    }
  ]

  return (
    <div className="body w-full h-auto overflow-scroll min-h-screen">
      <div className="form-container-wrapper w-full mt-12 min-h-screen">
        <Image src={"/register.png"} alt="Register" width={500} height={300} className="min-h-full" />

        <form onSubmit={handleSubmit}>
          <h2 className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !bg-clip-text !text-transparent">Register</h2>
          <p>Create. Connect. Cash Out.</p>
          
          {/* Pagination Steps */}
          <div className="pagination">
            <DotSlideBtn setStep={setStep} step={step} slide={1} />
            <DotSlideBtn setStep={setStep} step={step} slide={2} />
            <DotSlideBtn setStep={setStep} step={step} slide={3} />
            <DotSlideBtn setStep={setStep} step={step} slide={4} />
          </div>

          <div className="form-input-wrapper">
            {/* Step 1 */}
            <Step step={step} slide={1}>
             {inputs[0].step_1.map((v, i)=>(
              <div className="floating-label-group" key={i}>
                {v.input}
                <label htmlFor={v.label}>{v.label}</label>
              </div>
             ))}
              <NextSlide setStep={setStep} />
            </Step>

            {/* Step 2 */}
            <Step step={step} slide={2}>
             {inputs[0].step_2.map((v, i)=>(
              <div className="floating-label-group" key={i}>
                {v.input}
                <label htmlFor={v.label}>{v.label}</label>
              </div>
             ))}
              <div className="floating-label-group">
                <CountrySelect onSelectCountry={getLocation} />
                <input type="hidden" name="country" value={country} />
              </div>
              <NextSlide setStep={setStep} />
            </Step>

            {/* Step 3 */}
            <Step step={step} slide={3}>
             {inputs[0].step_3.map((v, i)=>(
              <div className="floating-label-group" key={i}>
                {v.input}
                <label htmlFor={v.label}>{v.label}</label>
              </div>
             ))}
              <NextSlide setStep={setStep} onClick={handleClick} />
            </Step>

            {/* Step 4 - Secret Phrase */}
            <Step step={step} slide={4}>
              <div className="secret-phrase-container">
                <h3 className="text-center mb-4 !bg-gradient-to-r !from-blue-500 !to-purple-600 !bg-clip-text !text-transparent">
                  Save Your Recovery Phrase
                </h3>
                
                <div className="phrase-grid">
                  {secretPhrase.map((word, index) => (
                    <div className="phrase-item" key={index}>
                        <span className="phrase-number">{index + 1}</span>
                        <span className="phrase-word">{word}</span>
                    </div>
                  ))}
                </div>
                
                <div className="phrase-warning">
                  <p>
                    ⚠️ This phrase is the <strong>only way</strong> to recover your account. 
                    Keep it safe and <strong>never share</strong> it. We cannot recover your 
                    account if you lose this phrase.
                  </p>
                </div>
                
                <div className="phrase-actions">
                  <button 
                    type="button" 
                    onClick={generateNewPhrase}
                    className="phrase-btn secondary"
                  >
                    🔄 Generate
                  </button>
                  <button 
                    type="button" 
                    onClick={copyToClipboard}
                    className="phrase-btn secondary"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button 
                    type="button" 
                    onClick={downloadPhrase}
                    className="phrase-btn secondary"
                  >
                    📥 Download
                  </button>
                </div>
                
                <div className="saved-confirmation">
                  <label className="saved-checkbox">
                    <input 
                      type="checkbox" 
                      checked={saved} 
                      onChange={() => setSaved(!saved)} 
                    />
                    <span>I have saved my recovery phrase securely</span>
                  </label>
                </div>

                <Agree id="terms" toThe={<Link href="/T_&_C" className='!text-blue-500'>the Terms and Conditions.</Link>} agree={agreedTerms} setAgree={()=> setAgreedTerms(prev=> !prev)} />
                < Agree id="privacy" toThe={<Link href={"/privacy-policy"} className='!text-blue-500'>Privacy and Policy</Link>} agree={agreedPrivacy} setAgree={()=> setAgreedPrivacy(prev=> !prev)} />

                <button 
                  type="submit" 
                  className="btn flex items-center justify-center mx-auto !bg-gradient-to-r !from-blue-500 !to-purple-600"
                  disabled={loading || !saved || !agreedTerms || !agreedPrivacy}
                >
                  {loading ? <p style={{color: "white"}} className="flex items-center justify-center gap-3 text-white"><BtnLoader /> Please wait...</p> : "Register" }
                </button>
                
                <p className="mt-4 text-center">
                  I already have an account <Link href="/" className="!text-blue-500">Login</Link>
                </p>
              </div>
            </Step>
          </div>
        </form>
      </div>
    </div>
  );
};
