/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import TextInput from "../../../components/textinput";
import FileInput from "../../../components/fileUpload";
import PacmanLoader from "react-spinners/ClockLoader";
import Checklist from "../../../components/checklist";
import Ruleslist from "../../../components/ruleslist";
import { useSelector, useDispatch } from "react-redux";
import { post_exclusive_docs } from "@/store/creatorSlice";
import '@/styles/VerificationForm.css';
import { formVerificationConstants } from "@/constants/formVerificationConstants";
import HeaderBackNav from "@/navs/HeaderBackNav";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/store/store";
import { toast, ToastContainer } from "material-react-toastify";
import { checkApplicationStatus } from "@/store/profile";
import { useAuth } from "@/lib/context/auth-context";
import { useAuthToken } from "@/lib/hooks/useAuthToken";

export default function VerifiedUserForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.profile.userId);
  const { session } = useAuth();
  const token = useAuthToken() || session?.token;
  const [loading, setLoading] = useState(false);
  const [color] = useState("#d49115");
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<"pending" | "rejected" | "none">("none");
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    userid: userId || "",
    documentType: "",
    idexpire: "",
  });

  useEffect(() => {
    if (!userId || !token) {
      toast.error("User ID or token not found. Please log in again.");
      router.push("/");
      return;
    }

    dispatch(checkApplicationStatus({ userid: userId, token }))
      .unwrap()
      .then((result) => {
        setApplicationStatus(result.status);
        if (result.status === "pending") setShowSuccessModal(true);
      })
      .catch((error) => {
        toast.error(error.message || "Failed to check application status");
        setApplicationStatus("none");
      });
  }, [userId, token, dispatch, router]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) {
      return;
    }

    if (!(formData.idPhotofile instanceof File) || !(formData.holdingIdPhotofile instanceof File)) {
      toast.error("Please upload both ID photo and holding ID photo.");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dob || 
        !formData.country || !formData.city || !formData.address || !formData.documentType || !formData.idexpire) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const today = new Date();
    const dobDate = new Date(formData.dob);
    const idexpireDate = new Date(formData.idexpire);

    if (isNaN(dobDate.getTime()) || isNaN(idexpireDate.getTime())) {
      toast.error("Invalid date format.");
      return;
    }
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (dobDate > minAgeDate) {
      toast.error("You must be at least 18 years old");
      return;
    }
    if (idexpireDate < today) {
      toast.error("ID expiration date must be in the future");
      return;
    }

    setLoading(true);
    try {
      await dispatch(post_exclusive_docs({
        ...formData,
        idPhotofile: formData.idPhotofile,
        holdingIdPhotofile: formData.holdingIdPhotofile,
      })).unwrap();
      toast.success("Application submitted successfully!");
      setApplicationStatus("pending");
      setShowSuccessModal(true);
    } catch (error: any) {
      toast.error(error || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  if (applicationStatus === "pending") {
    return (
      <div className="text-white flex items-center justify-center min-h-screen bg-gray-900">
        <ToastContainer position="top-center" theme="dark" />
        <div className="bg-gray-900 rounded-xl shadow-md p-6 text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">⏳</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Application Status</h2>
          <p className="text-slate-400 mb-4">
              Your application has been submitted and is now pending review. You&apos;ll hear from us within a few hours.
          </p>
          <button
            onClick={handleModalClose}
            className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (applicationStatus === "rejected" || applicationStatus === "none") {
    return (
      <div ref={containerRef} className="text-white">
        <ToastContainer position="top-center" theme="dark" />
        <HeaderBackNav title="Verification" />
        <div className="w-full md:w-5/4 flex flex-col mb-12">
          <div className="p-4" style={{ maxWidth: "700px" }}>
            <h1 className="text-2xl font-semibold text-center mb-4">
              Verified User Application
            </h1>
            <p className="text-slate-400 mb-6">
              Please provide us with information for verification. Once verified,
              you&apos;ll be able to start a creator account.
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
                      <option className="bg-black text-white" value="nationalId">ID Card</option>
                      <option className="bg-black text-white" value="driversLicense">Driver&apos;s License</option>
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
                      disabled={loading}
                      className="ml-auto bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <PacmanLoader
                          color="#ffffff"
                          loading={true}
                          size={12}
                          aria-label="Loading Spinner"
                          data-testid="button-loader"
                        />
                      )}
                      {loading ? "Submitting Application..." : "Submit Application"}
                    </button>
                  )}
                </div>
              </form>
            </fieldset>

            {showSuccessModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-xl shadow-md p-6 text-center max-w-sm">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Application Successful</h2>
                  <p className="text-slate-400 mb-4">Your application has been submitted and is now in review. You will hear from us within a few hours.</p>
                  <button
                    onClick={handleModalClose}
                    className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null; // Fallback in case of unexpected status
}