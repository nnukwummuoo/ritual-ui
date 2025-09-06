"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { verifymodel, rejectmodel } from "@/store/modelSlice";
import { MdOutlineClose } from "react-icons/md";
import proimage1 from "../../../icons/icons8-profile_Icon.png";
import PacmanLoader from "react-spinners/ClockLoader";
import Image, { StaticImageData } from "next/image";

// Helper to get src string from string | StaticImageData
function getImageSrc(image: string | StaticImageData): string {
  return typeof image === "string" ? image : image.src;
}

// Props type (adjust as needed)
interface HostProps {
  prob: {
    userid: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    dob: string;
    city: string;
    country: string;
    address?: string;
    documentType?: string;
    holdingIdPhoto?: string;
    idPhoto?: string;
    id?: string;
    image?: string;
  };
}

const Hostlist: React.FC<HostProps> = ({ prob }) => {
  const {
    userid,
    firstname,
    lastname,
    username,
    email,
    dob,
    city,
    country,
    address,
    holdingIdPhoto,
    idPhoto,
    image,
    id
  } = prob;

  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageType, setImageType] = useState("");
  const [imageSrc, setImageSrc] = useState<string>(getImageSrc(proimage1));
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.register.refreshtoken);

  // Normalize images to string src
  const userImage = getImageSrc(image || proimage1);
  const holdingImage = getImageSrc(holdingIdPhoto || proimage1);
  const idImage = getImageSrc(idPhoto || proimage1);

  const verify = async () => {
    try {
      setDisableButton(true);
      setLoading(true);
      await dispatch(verifymodel({ token, userid,id })).unwrap();
    } catch (e) {
      // noop; errors can be surfaced via global toasts if present
    } finally {
      setLoading(false);
      setDisableButton(false);
    }
  };

  const reject = async () => {
    try {
      setDisableButton(true);
      setLoading(true);
      await dispatch(rejectmodel({ token, userid })).unwrap();
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
      setDisableButton(false);
    }
  };

  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  const openImageViewer = (type: string, src: string) => {
    setImageType(type);
    setImageSrc(src);
    setShowImage(true);
  };

  const closeImageViewer = () => {
    setShowImage(false);
  };

  return (
    <>
      <div className="jost bg-[#161515] py-3 px-2 mb-2 relative">
        {loading && (
          <div className="flex flex-col items-center mt-16 w-full z-10 relative top-3/4">
            <PacmanLoader
              color="#d49115"
              loading={loading}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="jost text-yellow-500 font-bold">submitting...</p>
          </div>
        )}

        <div className="text-stone-200 flex gap-4 rounded-md">
          <div
            className="w-[60px] h-[60px] rounded-full overflow-hidden cursor-pointer"
            // onClick={() => navigate(`/profile/${userid}`)} // TODO: add navigation if needed
          >
            <Image
              src={userImage}
              alt="user"
              className="w-full h-full rounded-full object-cover"
              width={60}
              height={60}
            />
          </div>

          <div className="w-[100%]">
            <div>
              <h2 className="text-[1.3em] font-bold">
                {firstname} {lastname}
              </h2>
              <h2 className="text-[1.1em]">{username}</h2>
            </div>

            <div className="flex justify-between mt-3 w-[100%]">
              <button
                className="bg-blue-800 py-2 w-[48%] rounded-[3px]"
                onClick={verify}
                disabled={disableButton}
              >
                Accept
              </button>
              <button
                className="bg-slate-800 py-2 w-[48%] rounded-[3px]"
                onClick={reject}
                disabled={disableButton}
              >
                Decline
              </button>
            </div>

            <div>
              <button
                className="bg-[black] py-2 w-full rounded-[3px] text-white mt-3"
                onClick={toggleDetails}
              >
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`bg-dark mt-3 text-slate-100 text-[1.14em] ${
            !showDetails ? "hidden" : ""
          }`}
        >
          <ul>
            <li>First Name: {firstname}</li>
            <li>Last Name: {lastname}</li>
            <li>Country: {country}</li>
            <li>City: {city}</li>
            <li>Email: {email}</li>
            <li>Date Of Birth: {dob}</li>
            <li>Resident Address: {address}</li>
          </ul>

          <div className="flex w-full justify-between mt-5">
            <button
              className="bg-amber-500 py-2 w-[48%] rounded-[3px]"
              onClick={() => openImageViewer("photo", holdingImage)}
            >
              View photo
            </button>
            <button
              className="bg-gray-500 py-2 w-[48%] rounded-[3px]"
              onClick={() => openImageViewer("id", idImage)}
            >
              View ID
            </button>
          </div>
        </div>

        {/* Image Viewer Modal */}
        <div
          className={`w-[90%] h-screen bg-slate-50 absolute top-0 left-1/2 transform -translate-x-1/2 ${
            showImage ? "" : "hidden"
          }`}
        >
          <div className="w-full relative h-12 mt-2">
            <MdOutlineClose
              className="absolute right-[2%] text-5xl text-black font-bold cursor-pointer"
              onClick={closeImageViewer}
            />
          </div>

          <p className="font-bold text-center text-xl">
            {imageType === "photo"
              ? "Applicant Verification Selfie"
              : "Applicant ID Card"}
          </p>

          <div className="m-[2%]">
            <Image
              src={imageSrc}
              alt={imageType}
              className="w-full h-full object-contain"
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hostlist;
