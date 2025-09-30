"use client"
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import TextInput from "../../../components/textinput";
import FileInput from "../../../components/fileUpload";
// import CheckboxWithLabel from "../../components/input/checkbox";
import PacmanLoader from "react-spinners/ClockLoader";
import Checklist from "../../../components/checklist";
import Ruleslist from "../../../components/ruleslist";
// import { useSelector, useDispatch } from "react-redux";
// import { changecreatorstatus, post_exclusive_ids, post_exclusive_docs } from "../../app/features/creator/creatorSlice";
// import { useNavigate } from "react-router-dom";
import '@/styles/VerificationForm.css';
import {formVerificationConstants} from "@/constants/formVerificationConstants";

import HeaderBackNav from "@/navs/HeaderBackNav";
import { useRouter } from "next/navigation";


export default function VerifiedUserForm(){
  const userid = "random-user-id"; //useSelector((state) => state.register.userID);
  const token = "random-token"; //useSelector((state) => state.register.refreshtoken);
  // const exclusive_holdphoto = useSelector((state) => state.creator.exclusive_holdphoto);
  // const exclusive_idphoto = useSelector((state) => state.creator.exclusive_idphoto);
  // const exclusive_ids_stats = useSelector((state) => state.creator.exclusive_ids_stats);
  // const exclusive_docs_stats = useSelector((state) => state.creator.exclusive_docs_stats);
  // const dispatch = useDispatch()
  const router = useRouter()
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#d49115");
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  

  const [documentType, setDocumentType] = useState("");
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
    idPhoto: "",
    holdingIdPhoto: "",
    acceptTerms: false,
    userid,
    documentType:"",
    idexpire:"",
    token
  });

  // useEffect(()=>{
  //    if(!userid){
  //     window.location.href = "/";
  //    }
  // },[])

  // useEffect(()=>{
  //   if(exclusive_ids_stats === "succeeded"){
  //     dispatch(changecreatorstatus("idle"))
  //     // formData.holdingIdPhoto = exclusive_holdphoto
  //     // formData.idPhoto = exclusive_idphoto
  //     // formData.holdingIdPhotofile = ""
  //     // formData.idPhotofile = ""

  //     if(exclusive_docs_stats !== "loading"){
  //       dispatch(post_exclusive_docs(formData))
  //     }

  //     // post details to server
  //   }

  //   if(exclusive_ids_stats === "failed"){
  //     dispatch(changecreatorstatus("idle"))
  //     setLoading(false)
  //   }

  //   if(exclusive_docs_stats === "succeeded"){
  //     console.log("exclusive success")
  //     dispatch(changecreatorstatus("idle"))
  //     router("/notifications");
  //     setLoading(false)

  //   }

  //   if(exclusive_docs_stats === "failed"){
  //     dispatch(changecreatorstatus("idle"))
  //     setLoading(false)

  //   }

  // },[exclusive_ids_stats, exclusive_docs_stats])

  // const handleChange = (e) => {
  //   const { name, value, type, checked, files } = e.target;
  //   if (type === "checkbox") {
  //     setFormData((prev) => ({ ...prev, [name]: checked }));
  //   } else if (type === "file") {
  //     console.log(`${name} is loaded`, files)
  //     setFormData((prev) => ({ ...prev, [name]: files[0] }));
  //   } else {
  //     setFormData((prev) => ({ ...prev, [name]: value }));
  //   }
  // };

  // const handleDocumentTypeChange = (e) => {
  //   //router("/notification");

  //   setDocumentType(e.currentTarget.value);
  //   formData.documentType = e.currentTarget.value
  //   console.log("doc type "+formData.documentType)
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("formData", formData)

  //   if(exclusive_ids_stats !== "loading"){
  //     setLoading(true)
  //     console.log("formData.holdingIdPhotofile: ", formData.holdingIdPhotofile, "idPhotofile:formData.idPhotofile: ", "idPhotofile: ", formData.idPhotofile)
  //     dispatch(post_exclusive_ids({holdingIdPhotofile:formData.holdingIdPhotofile, idPhotofile:formData.idPhotofile}))

  //   }

  // };

  return (
    <div className=" text-white">

      <HeaderBackNav title="Verification"/>
       <div className='w-full md:w-5/4 flex flex-col mb-12 '>
      <div className="p-4 " style={{ maxWidth: "700px", }}>
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
              // margin={"auto"}
            />

            <p className="jost text-yellow-500 font-bold

            ">submitting...</p>
          </div>
        )}

        <fieldset disabled={loading}>

        <form className="max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-md p-6">
        {step === 1 && (
          <div className="verify step1 mb-6">
            {/* Personal Information Step */}
            <h4 className="font-bold text-md mb-4 text-center">Personal Information</h4>
                <div className="input-container">
                    <TextInput
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      // onChange={handleChange}

                    />
                    <TextInput
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      // onChange={handleChange}

                    />

                  </div>
                  <div className="input-container">
                    <TextInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      // onChange={handleChange}
                    />
                    <TextInput
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      // onChange={handleChange}
                    />

                  </div>
                  <div className="input-container">
                  <TextInput
                    label="Country"
                    name="country"
                    value={formData.country}
                    // onChange={handleChange}
                  />
                  <TextInput
                    label="City"
                    name="city"
                    value={formData.city}
                    // onChange={handleChange}
                  />

                  </div>
              
              
              
                <TextInput
                  label="Residential Address"
                  name="address"
                  type="textarea"
                  value={formData.address}
                  // onChange={handleChange}
                 
                />
          </div>
        )}

        {step === 2 && (
          <div className="verify step2 mb-6">
            {/* Document Upload Step */}
            <Ruleslist />
          </div>
        )}

        {step === 3 && (
          <div className="verify step3 mb-6">
            {/* Rules Step */}
           
            <h4 className="font-bold text-md my-4">Document Upload</h4>
          
                  <img
                    src={"/icons/verificationImage2.jpeg"}
                    alt="Verification Example"
                    className="w-full mb-4 h-80"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
               <div className="mb-4">
  <label
    htmlFor="documentType"
    className="block text-sm font-medium mb-2"
  >
    Document Type:
  </label>
  <select
    id="documentType"
    name="documentType"
    value={documentType}
    // onChange={handleDocumentTypeChange}
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
                    // onChange={handleChange}
                  />
                  <FileInput
                    label="Photo of You Holding ID with Handwritten Note"
                    name="holdingIdPhotofile"
                    icon={<FaPlus />}
                    // onChange={handleChange}
                  />

                  <div className="input-container">
                    <TextInput
                      label="ID Expirational Date"
                      name="idexpire"
                      type="date"
                      value={formData.idexpire}
                      // onChange={handleChange}
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
};