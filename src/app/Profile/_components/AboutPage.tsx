"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile } from "@/store/profile";
import { getViewingProfile, clearViewingProfile } from "@/store/viewingProfile";
import type { AppDispatch, RootState } from "@/store/store";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getImageSource } from "@/lib/imageUtils";
import { toast } from "material-react-toastify";

const AboutPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get viewingUserId from params first
  const viewingUserId = (params as { userid?: string })?.userid as string;
  
  // Get current user profile data
  const currentUserProfile = useSelector((s: RootState) => s.profile);
  
  // Get viewing profile data
  const viewingProfile = useSelector((s: RootState) => s.viewingProfile);
  
  // Determine which profile data to use
  const isViewingOwnProfile = viewingUserId === currentUserProfile.userId;
  const profileData = isViewingOwnProfile ? currentUserProfile : viewingProfile;
  
  const { status, firstname, lastname, username, country: location } = profileData;
  const profile = useSelector((state: RootState) => state.comprofile.profile);
  
  // Try to get createdAt from multiple sources
  const createdAt = profileData?.createdAt || profile?.createdAt || (profileData as any)?.created_at || (profile as any)?.created_at;
  const [copied, setCopied] = useState(false);
  
  // Generate profile URL
  const profileUrl = React.useMemo(() => {
    if (!viewingUserId) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/Profile/${viewingUserId}`;
    }
    return "";
  }, [viewingUserId]);
  
  // Copy profile link to clipboard
  const handleCopyProfileLink = async () => {
    if (!profileUrl) return;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        toast.success("Profile link copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Profile link copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy profile link:", error);
      toast.error("Failed to copy profile link");
    }
  };
  
  
  // Use the same useMemo approach as ProfilePage
  const joined = React.useMemo(() => {
    if (!createdAt) {
      return { month: "", year: "" };
    }
    
    const d = new Date(createdAt);
    
    if (isNaN(d.getTime())) {
      return { month: "", year: "" };
    }
    
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
    
    // Clear viewing profile first
    dispatch(clearViewingProfile());
    
    // If viewing own profile, use current user profile, otherwise fetch viewing profile
    if (userid === currentUserProfile.userId) {
      if (currentUserProfile.status === "idle") {
        dispatch(getprofile({ userid, token: token || "" }));
      }
    } else {
      dispatch(getViewingProfile({ userid, token: token || "" }));
    }
  }, [params, dispatch, currentUserProfile.userId, currentUserProfile.status]);


  type AccountDetail = {
    icon: React.ReactNode;
    label: string;
    value: string;
    isLink?: boolean;
  };

  const accountDetails: AccountDetail[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      label: "Date joined",
      value: (() => {
        // Try the calculated joined date first
        if (joined.month && joined.year) {
          return `${joined.month}, ${joined.year}`;
        }
        
        // Try profileData joined fields
        if ((profileData as any)?.joined_month && (profileData as any)?.joined_year) {
          return `${(profileData as any).joined_month}, ${(profileData as any).joined_year}`;
        }
        
        // Try profile joined fields
        if ((profile as any)?.joined_month && (profile as any)?.joined_year) {
          return `${(profile as any).joined_month}, ${(profile as any).joined_year}`;
        }
        
        // Fallback to raw createdAt if available
        if (createdAt) {
          const d = new Date(createdAt);
          if (!isNaN(d.getTime())) {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            return `${month}, ${year}`;
          }
        }
        
        return "Unknown";
      })()
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      label: "Account based in",
      value: location || "Not specified"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: "Profile link",
      value: profileUrl,
      isLink: true
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
                {(() => {
                  const profileImage = profileData?.photolink || "";
                  const userName = `${firstname || ""} ${lastname || ""}`.trim();
                  const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                  
                  if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                    const imageSource = getImageSource(profileImage, 'profile');
                    return (
                      <div className="w-[120px] h-[120px] rounded-full overflow-hidden flex items-center justify-center bg-gray-800">
                        <Image
                          src={imageSource.src}
                          alt="Profile picture"
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <div className="w-[120px] h-[120px] rounded-full bg-gray-600 flex items-center justify-center text-white text-4xl font-bold">
                      {initials}
                    </div>
                  );
                })()}
                {/* Verification Badge */}
                {/* <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div> */}
              </div>
              {/* <h2 className="text-2xl font-bold mb-2">{firstname} {lastname}</h2> */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400">{username}</span>
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
                {detail.isLink ? (
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-xs truncate max-w-[200px]" title={detail.value}>
                      {detail.value}
                    </p>
                    <button
                      onClick={handleCopyProfileLink}
                      className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
                      title="Copy profile link"
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-white font-medium">{detail.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default AboutPage;
