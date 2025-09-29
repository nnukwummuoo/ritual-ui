"use client";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import TextInput from "../../../components/textinput";
import FileInput from "../../../components/fileUpload";
import PacmanLoader from "react-spinners/ClockLoader";
import Checklist from "../../../components/checklist";
import Ruleslist from "../../../components/ruleslist";
import { useSelector, useDispatch } from "react-redux";
import { post_exclusive_docs } from "@/store/modelSlice";
import '@/styles/VerificationForm.css';
import { formVerificationConstants } from "@/constants/formVerificationConstants";
import HeaderBackNav from "@/navs/HeaderBackNav";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/store/store";
import { toast, ToastContainer } from "material-react-toastify";

export default function VerifiedUserForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.profile.userId); // Fetch userId from Redux
  const token = useSelector((state: RootState) => state.register. accesstoken); // Fetch token
  const [loading, setLoading] = useState(false);
  const [color] = useState("#d49115");
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const [formData, setFormData] = useState<formVerificationConstants>({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    country: "",
    city: "",
    address: "",
    idPhotofile: null,
    holdingIdPhotofile: null,
    //acceptTerms: false,
    userid: userId || "",
    documentType: "",
    idexpire: "",
  });

  useEffect(() => {
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      router.push("/");
    }
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      console.log(`${name} is loaded`, files);
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData", formData);

    // if (!formData.acceptTerms) {
    //   toast.error("Please accept the terms and conditions.");
    //   return;
    // }

    if (!formData.idPhotofile || !formData.holdingIdPhotofile) {
      toast.error("Please upload both ID photo and holding ID photo.");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dob || 
        !formData.country || !formData.city || !formData.address || !formData.documentType || !formData.idexpire) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(post_exclusive_docs({
        ...formData,
        token: accesstoken,
        idPhotofile: formData.idPhotofile,
        holdingIdPhotofile: formData.holdingIdPhotofile,
      })).unwrap();
      toast.success("Application submitted successfully!");
      router.push("/notifications");
    } catch (error: any) {
      toast.error(error || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <ToastContainer position="top-center" theme="dark" />
      <HeaderBackNav title="Verification" />
      <div className="w-full md:w-5/4 flex flex-col mb-12">
        <div className="p-4" style={{ maxWidth: "700px" }}>
          <h1 className="text-2xl font-semibold text-center mb-4">
            Verified User Application
          </h1>
          <p className="text-slate-400 mb-6">
            Please provide us with information for verification. Once verified,
            you'll be able to start a creator account.
          </p>
          {loading && (
            <div className="flex flex-col items-center mt-16 w-full z-10 relative top-3/4">
              <PacmanLoader
                color={color}
                loading={loading}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <p className="jost text-yellow-500 font-bold">submitting...</p>
            </div>
          )}

          <fieldset disabled={loading}>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-md p-6">
              {step === 1 && (
                <div className="verify step1 mb-6">
                  <h4 className="font-bold text-md mb-4 text-center">Personal Information</h4>
                  <div className="input-container">
                    <TextInput
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <TextInput
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-container">
                    <TextInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <TextInput
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-container">
                    <TextInput
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                    <TextInput
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
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
                  <Ruleslist />
                </div>
              )}

              {step === 3 && (
                <div className="verify step3 mb-6">
                  <h4 className="font-bold text-md my-4">Document Upload</h4>
                  <img
                    src="/icons/verificationImage2.jpeg"
                    alt="Verification Example"
                    className="w-full mb-4 h-80"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div className="mb-4">
                    <label htmlFor="documentType" className="block text-sm font-medium mb-2">
                      Document Type:
                    </label>
                    <select
                      id="documentType"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none bg-black text-white"
                    >
                      <option className="bg-black text-white" value="">Select Document Type</option>
                      <option className="bg-black text-white" value="passport">Passport</option>
                      <option className="bg-black text-white" value="driversLicense">Driver's License</option>
                    </select>
                  </div>
                  <FileInput
                    label="Photo of ID"
                    name="idPhotofile"
                    icon={<FaPlus />}
                    onChange={handleChange}
                  />
                  <FileInput
                    label="Photo of You Holding ID with Handwritten Note"
                    name="holdingIdPhotofile"
                    icon={<FaPlus />}
                    onChange={handleChange}
                  />
                  <div className="input-container">
                    <TextInput
                      label="ID Expiration Date"
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
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition duration-300"
                  >
                    Next
                  </button>
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