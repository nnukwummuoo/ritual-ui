"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import PacmanLoader from "react-spinners/RingLoader";
import { useRouter } from "next/navigation";

import profileIcon from "@/icons/icons8-profile_Icon.png";
import uploadIcon from "@/icons/uploadIcon.svg";

import {
  getEdit,
  comprofilechangeStatus,
  updateEdit,
} from "@/store/comprofile";
import { getallpost } from "@/store/post";


// ✅ Update RootState type according to your Redux store
import { RootState } from "@/store/store";
import { countryList } from "@/components/CountrySelect/countryList";
import HeaderBackNav from "@/navs/HeaderBackNav";
import { Gennavigation } from "@/components/navs/Gennav";

const EditProfile: React.FC = () => {
  const login = useSelector((state: RootState) => state.register.logedin);
  const userid = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);

  const data = useSelector((state: RootState) => state.comprofile.editData);
  const getedit_stats = useSelector(
    (state: RootState) => state.comprofile.getedit_stats
  );
  const getedit_message = useSelector(
    (state: RootState) => state.comprofile.getedit_message
  );
  const updateEdit_stats = useSelector(
    (state: RootState) => state.comprofile.updateEdit_stats
  );
  const updateEdit_message = useSelector(
    (state: RootState) => state.comprofile.updateEdit_message
  );

  const [loading, setLoading] = useState(true);
  const [color] = useState("#d49115");
  const [showEdit, setShowEdit] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const ref = useRef<HTMLInputElement | null>(null);

  const [firstnamepl, setFirstnamepl] = useState("first name");
  const [lastnamepl, setLastnamepl] = useState("last name");
  const [countrypl, setCountrypl] = useState("country");
  const [biopl, setBiopl] = useState("about me");

  const [profileimg, setProfileimg] = useState<string | any>(profileIcon);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [click, setclick] = useState(false);

  const [updatePhoto, setUpdatePhoto] = useState<File | undefined>();
  const [deletePhotolink, setDeletePhotolink] = useState<string | undefined>();
  const [deletePhotoID, setDeletePhotoID] = useState<string | undefined>();

  // ✅ Handle login check
  useEffect(() => {
    if (!login) {
      router.push("/");
    }

    if (login && getedit_stats !== "loading") {
      dispatch(
        getEdit({
          userid,
          token,
        }) as any
      );
    }
  }, [login]);

  useEffect(() => {
    if (getedit_stats === "succeeded") {
      dispatch(comprofilechangeStatus("idle") as any);
      setLoading(false);
      setShowEdit(true);

      if (data) {
        if (data.photolink) {
          setProfileimg(data.photolink);
          setDeletePhotolink(data.photolink);
          setDeletePhotoID(data.photoID);
        }
        if (data.firstname) setFirstnamepl(data.firstname);
        if (data.lastname) setLastnamepl(data.lastname);
        if (data.country) setCountrypl(data.country);
        if (data.bio) setBiopl(data.bio);
      }
    }

    if (getedit_stats === "failed") {
      dispatch(comprofilechangeStatus("idle") as any);
      console.log("edit message: " + getedit_message);
    }

    if (updateEdit_stats === "succeeded") {
      dispatch(comprofilechangeStatus("idle") as any);
      setLoading(false);

      setTimeout(() => {
        router.push("/");
        dispatch(getallpost({ userid }) as any);
      }, 1000);
    }

    if (updateEdit_stats === "failed") {
      dispatch(comprofilechangeStatus("idle") as any);
      setLoading(false);
      setShowEdit(true);
      console.log("update failed: " + updateEdit_message);
    }
  }, [getedit_stats, updateEdit_stats]);

  const updateButton = () => {
    if (updateEdit_stats !== "loading") {
      setLoading(true);
      setShowEdit(false);

      const changedProfileData = {
        userid,
        token,
        deletePhotolink,
        deletePhotoID,
        updatePhoto,
        firstname: firstname || firstnamepl,
        lastname: lastname || lastnamepl,
        country: country || countrypl,
        bio: bio || biopl,
      };

      console.log("Profile data being sent: ", changedProfileData);
      dispatch(updateEdit(changedProfileData) as any);
    }
  };

  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto md:mr-auto md:ml-0">
      <div className="chat_nav">
        <Gennavigation click={click} setclick={setclick}  />
      </div>
      <HeaderBackNav title=""  />

      <div className="md:w-3/5 md:mx-auto">
        <div className="w-full h-full flex flex-col items-center md:w-3/4 mt-4 sm:mt-16 md:mr-auto md:ml-0">
          <p className="text-slate-400 font-bold border border-b-2 border-t-0 border-r-0 border-l-0 border-slate-400">
            Edit your Profile Information
          </p>

          {loading && (
            <div className="flex flex-col items-center mt-16 w-full">
              <PacmanLoader
                color={color}
                loading={loading}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <p className="text-yellow-500 text-xs">wait please...</p>
            </div>
          )}

          {showEdit && (
            <div className="w-full">
              <div className="w-full flex flex-col items-center mt-4">
                {/* Profile Image */}
                <div className="relative">
                  <Image
                    alt="profileIcon"
                    src={profileimg}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-sm"
                    onError={() => setProfileimg(profileIcon)}
                  />
                </div>

                {/* Upload Button */}
                <button
                  className="mt-3 flex items-center gap-2 bg-gray-900 text-gray-100 hover:bg-gray-200 transition-colors px-3 py-1.5 text-sm rounded-md border border-gray-300 shadow-sm"
                  onClick={() => ref.current?.click()}
                >
                  <Image alt="uploadIcon" src={uploadIcon} width={16} height={16} />
                  <span>Upload</span>
                </button>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  ref={ref}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) {
                      setProfileimg(URL.createObjectURL(e.target.files[0]));
                      setUpdatePhoto(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Form */}
              <div className="w-full max-w-md mx-auto mt-6 p-4 bg-gray-900 rounded-xl shadow-md text-slate-700 font-semibold">
                {/* First Name */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">First Name</label>
                  <input
                    type="text"
                    className="rounded-lg bg-slate-200 text-slate-900 p-2 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    placeholder={firstnamepl}
                    value={firstname}
                    onChange={(e) => setFirstname(e.currentTarget.value)}
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">Last Name</label>
                  <input
                    type="text"
                    className="rounded-lg bg-slate-200 text-slate-900 p-2 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    placeholder={lastnamepl}
                    value={lastname}
                    onChange={(e) => setLastname(e.currentTarget.value)}
                  />
                </div>

                {/* Bio */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">Bio</label>
                  <textarea
                    className="rounded-lg bg-slate-200 text-slate-900 p-2 h-24 resize-none placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    placeholder={biopl}
                    value={bio}
                    onChange={(e) => setBio(e.currentTarget.value)}
                  ></textarea>
                </div>

                {/* Country Dropdown */}
                <div className="flex flex-col mb-6">
                  <label className="mb-1 text-sm text-slate-300">Country</label>
                  <select
                    className="rounded-lg bg-slate-200 text-slate-900 p-2 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    value={country || countrypl}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {countryList.map((countryName, index) => (
                      <option key={index} value={countryName}>
                        {countryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Button */}
                <button
                  className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium py-2 px-4 rounded-lg w-full text-center disabled:opacity-50"
                  onClick={updateButton}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
