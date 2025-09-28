"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile } from "@/store/profile";
import type { AppDispatch, RootState } from "@/store/store";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AboutPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { status, firstname, lastname, nickname, State: location } = useSelector((s: RootState) => s.profile);
  const profile = useSelector((state: RootState) => state.comprofile.profile);
  const getprofilebyidstats = useSelector((state: RootState) => state.comprofile.getprofileidstatus);
  const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
  
  const viewingUserId = (params as { userid?: string })?.userid as string;
  const [about, setAbout] = useState("");
  
  // Use the same useMemo approach as ProfilePage
  const joined = React.useMemo(() => {
    if (!createdAt) return { month: "", year: "" };
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return { month: "", year: "" };
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return { month: months[d.getMonth()] ?? "", year: String(d.getFullYear()) };
  }, [createdAt]);

  useEffect(() => {
    const userid = (params as { userid?: string })?.userid as string | undefined;
    if (!userid) return;
    
    let token: string | undefined = undefined;
    if (!token) {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const saved = JSON.parse(raw);
          token = saved?.refreshtoken || saved?.accesstoken;
        }
      } catch {}
    }
    
    dispatch(getprofile({ userid, token: token || "" }));
  }, [params, dispatch]);

  useEffect(() => {
    if (getprofilebyidstats === "succeeded") {
      console.log("Profile data received:", profile);
      console.log("Profile keys:", Object.keys(profile));
      console.log("createdAt from Redux:", createdAt);
      console.log("joined result:", joined);
      
      setAbout(profile.aboutuser || "");
    }
  }, [getprofilebyidstats, profile.aboutuser, createdAt, joined]);

  const accountDetails = [
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      label: "Date joined",
      value: joined.month && joined.year ? `${joined.month}, ${joined.year}` : "Unknown"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      label: "Account based in",
      value: location || "Not specified"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0e0f2a] text-white">
      {/* Header */}
      <div className="sticky top-0 bg-[#0e0f2a] border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">About this account</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-4 py-6">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {(status === "loading" || status === "idle") && (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton width={120} height={120} circle />
                <Skeleton width={150} height={24} />
                <Skeleton width={100} height={16} />
              </div>
            </SkeletonTheme>
          )}
          
          {status === "succeeded" && (
            <>
              <div className="relative inline-block mb-4">
                <Image
                  src="/icons/profile.png"
                  alt="Profile picture"
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
                {/* Verification Badge */}
                {/* <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div> */}
              </div>
              {/* <h2 className="text-2xl font-bold mb-2">{firstname} {lastname}</h2> */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400">{nickname}</span>
                {/* <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div> */}
              </div>
            </>
          )}
        </div>

        {/* Information Text */}
        <div className="mb-8">
          <p className="text-gray-300 text-xs text-center  leading-relaxed">
            To help keep our community authentic, we&apos;re showing information about accounts on our platform. 
            <span className="text-blue-400 cursor-pointer hover:underline"> See why this information is important.</span>
          </p>
        </div>

        {/* Account Details */}
        <div className="space-y-4 mb-8">
          {accountDetails.map((detail, index) => (
            <div key={index} className="flex items-center gap-4 py-3">
              <div className="text-gray-400">
                {detail.icon}
              </div>
              <div className="flex justify-between w-full items-center">
                <p className="text-gray-300 font-bold text-sm">{detail.label}</p>
                <p className="text-white font-medium">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default AboutPage;
