"use client"
import { toast } from "material-react-toastify";
import React, { useState } from "react";
import {createAModel} from "@/store/modelSlice"
import { useUserId } from "@/lib/hooks/useUserId";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import {useRouter } from "next/navigation"

// A simple SVG for the plus icon
const PlusIcon = (): any => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

// A simple replacement for TextInput
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
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
      />
    )}
  </div>
);

// A simple replacement for FileInput with feedback
const FileInput = ({ label, name, onChange, icon, fileName }: any): any => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="flex items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-md cursor-pointer text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
    >
      <input id={name} name={name} type="file" onChange={onChange} className="hidden" />
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-2">{icon}</div>
        <span className="text-sm font-medium">
          {fileName || label}
        </span>
      </div>
    </label>
  </div>
);

// A simple replacement for Checklist
const Checklist = (): any => (
  <div className="bg-gray-800 p-4 rounded-md">
    <h5 className="font-bold text-md mb-2">Checklist</h5>
    <ul className="text-sm space-y-2">
      <li className="flex items-center">
        <span className="mr-2 text-green-500">✓</span>
        <span>ID is clearly visible.</span>
      </li>
      <li className="flex items-center">
        <span className="mr-2 text-green-500">✓</span>
        <span>Handwritten note is legible.</span>
      </li>
      <li className="flex items-center">
        <span className="mr-2 text-green-500">✓</span>
        <span>Information on ID matches personal details.</span>
      </li>
    </ul>
  </div>
);

// A simple replacement for Ruleslist
const Ruleslist = (): any => (
  <div className="bg-gray-800 p-4 rounded-md">
    <h4 className="font-bold text-md mb-4 text-center">Creator Account Rules</h4>
    <ul className="list-disc list-inside space-y-2 text-sm">
      <li>All information must be accurate and truthful.</li>
      <li>You must be at least 18 years old to apply.</li>
      <li>Your content must comply with our community guidelines.</li>
      <li>Do not share explicit or illegal content.</li>
      <li>Respect the privacy of others.</li>
    </ul>
  </div>
);

// A simple replacement for HeaderBackNav
const HeaderBackNav = ({ title }: any): any => (
  <header className="py-4 px-6 mb-6 flex items-center justify-between">
    <button className="text-white text-xl">←</button>
    <h2 className="text-xl font-bold">{title}</h2>
    <div></div>
  </header>
);

export default function VerifiedUserForm(): any {
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const nextStep = (): any => setStep((prev: any) => Math.min(prev + 1, 4));
  const prevStep = (): any => setStep((prev: any) => Math.max(prev - 1, 1));
  const userid = useUserId();
  const token = useAuthToken();
  const router =useRouter()

  const data: any = {
    userid,
    token: token,
    name: "",
    age: "",
    location: "",
    price: "",
    duration: "",
    bodytype: "",
    smoke: "",
    drink: "",
    interestedin: "",
    height: "",
    weight: "",
    description: "",
    gender: "",
    timeava: "",
    daysava: "",
    hosttype: "",
  };

  const [documentType, setDocumentType] = useState<string>("");
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    country: "",
    city: "",
    address: "",
    idPhotofile: null,
    holdingIdPhotofile: null,
    idPhoto: "",
    holdingIdPhoto: "",
    acceptTerms: false,
    documentType: "",
    idexpire: "",
    ...data,
  });

  const handleChange = (e: any): any => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      console.log(`${name} is loaded`, files);
      setFormData((prev: any) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentTypeChange = (e: any): any => {
    setDocumentType(e.value);
    setFormData((prev: any) => ({...prev, documentType: e.value}));
    console.log("doc type " + formData.documentType);
  };

  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    const tst=toast.loading("Creating your model");
    try{
      const res = await createAModel({...formData,userid,token})
      router.push("/")
      toast.success("Your model has been submitted")
    }catch(err:any){
      console.error(err)
      toast.error(err?.response?.data?.message||err?.message||"Something went wrong")
    } finally {
      toast.dismiss(tst)
    }
  };

  return (
    <div className=" text-white">
      <HeaderBackNav title="Verification" />
      <div className="w-full md:w-5/4 flex flex-col mb-12 ">
        <div className="p-4" style={{ maxWidth: "700px" }}>
          <h1 className="text-2xl font-semibold text-center mb-4">
            Verified User Application
          </h1>
          <p className="text-slate-400 mb-6">
            Please provide us with information for verification. Once verified, you'll be able to start a creator account.
          </p>
          {loading && (
            <div className="flex flex-col items-center mt-16 w-full z-10 relative top-3/4">
              <div className="text-yellow-500 animate-spin">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.686 4.686a6 6 0 108.628 8.628L4.686 4.686z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="jost text-yellow-500 font-bold">submitting...</p>
            </div>
          )}

          <fieldset disabled={loading}>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-md p-6">
              {step === 1 && (
                <div className="verify step1 mb-6">
                  <h4 className="font-bold text-md mb-4 text-center">Personal Information</h4>
                  <div className="input-container flex flex-wrap -mx-2">
                    <div className="w-1/2 px-2">
                      <TextInput
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="w-1/2 px-2">
                      <TextInput
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="input-container flex flex-wrap -mx-2">
                    <div className="w-1/2 px-2">
                      <TextInput
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="w-1/2 px-2">
                      <TextInput
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="input-container flex flex-wrap -mx-2">
                    <div className="w-1/2 px-2">
                      <TextInput
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="w-1/2 px-2">
                      <TextInput
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <TextInput
                    label="Residential Address"
                    name="address"
                    type="textarea"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="verify step2 mb-6">
                  <h4 className="font-bold text-md mb-4 text-center">Extra Information</h4>
                  <TextInput label="Display Name" name="name" value={formData.name} onChange={handleChange} />
                  <TextInput label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                  <TextInput label="Location" name="location" value={formData.location} onChange={handleChange} />
                  <TextInput label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
                  <TextInput label="Duration" name="duration" value={formData.duration} onChange={handleChange} />
                  <TextInput label="Body Type" name="bodytype" value={formData.bodytype} onChange={handleChange} />
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Do you smoke?</label>
                    <select
                      name="smoke"
                      value={formData.smoke}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Do you drink?</label>
                    <select
                      name="drink"
                      value={formData.drink}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Interested In</label>
                    <select
                      name="interestedin"
                      value={formData.interestedin}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
                    >
                      <option value="">Select</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                  <div className="input-container flex flex-wrap -mx-2">
                    <div className="w-1/2 px-2">
                      <TextInput label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
                    </div>
                    <div className="w-1/2 px-2">
                      <TextInput label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
                    </div>
                  </div>
                  <TextInput label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} />
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <TextInput label="Available Times" name="timeava" value={formData.timeava} onChange={handleChange} />
                  <TextInput label="Available Days" name="daysava" value={formData.daysava} onChange={handleChange} />
                  <TextInput label="Host Type" name="hosttype" value={formData.hosttype} onChange={handleChange} />
                </div>
              )}

              {step === 3 && (
                <div className="verify step3 mb-6">
                  <Ruleslist />
                </div>
              )}

              {step === 4 && (
                <div className="verify step4 mb-6">
                  <h4 className="font-bold text-md my-4">Document Upload</h4>
                  <img
                    src="https://placehold.co/600x400/0f172a/fafafa?text=Verification+Example"
                    alt="Verification Example"
                    className="w-full mb-4 h-80 rounded-md"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="mb-4">
                    <label htmlFor="documentType" className="block text-sm font-medium mb-2">
                      Document Type:
                    </label>
                    <select
                      id="documentType"
                      name="documentType"
                      value={documentType}
                      onChange={handleDocumentTypeChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
                    >
                      <option className="bg-black text-white" value="">Select Document Type</option>
                      <option className="bg-black text-white" value="passport">Passport</option>
                      <option className="bg-black text-white" value="driversLicense">Driver's License</option>
                    </select>
                  </div>

                  <FileInput label="Photo of ID" name="idPhotofile" icon={<PlusIcon />} onChange={handleChange} fileName={formData.idPhotofile?.name} />
                  <FileInput
                    label="Photo of You Holding ID with Handwritten Note"
                    name="holdingIdPhotofile"
                    icon={<PlusIcon />}
                    onChange={handleChange}
                    fileName={formData.holdingIdPhotofile?.name}
                  />

                  <div className="input-container">
                    <TextInput
                      label="ID Expirational Date"
                      name="idexpire"
                      type="date"
                      value={formData.idexpire}
                      onChange={handleChange}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <Checklist />
                </div>
              )}

              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-[#1a1e3f] text-white px-5 py-2 rounded-lg border border-transparent hover:border-orange-500 hover:text-orange-400 transition duration-300"
                  >
                    Previous
                  </button>
                )}

                {step < 4 ? (
                  <div
                    onClick={nextStep}
                    className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition duration-300"
                  >
                    Next
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition duration-300"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </form>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
