"use client";
import React, { useState } from "react";
import "./Navs.css";
import { useRouter } from "next/navigation";
import MenuIconImg from "@/components/MenuIcon-img";
import { useMenuContext } from "@/lib/context/MenuContext";
import Profile from "@/components/Profile";
import { FaCoins, FaAngleRight, FaAngleDown } from "react-icons/fa";
import OpenMobileMenuBtn from "@/components/OpenMobileMenuBtn";
import handleLogout from "@/lib/service/logout";
import { useUserId } from "@/lib/hooks/useUserId";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getprofile } from "@/store/profile";

const Sidemenu = () => {
  // 🔒 CRITICAL: This component ALWAYS uses current user data
  // It is NEVER affected by viewing other users' profiles
  // The side menu should always show the current logged-in user's information
  
  const [minimize, setMinimize] = useState(false);
  const userId = useUserId();
  const router = useRouter();
  const { open, toggleMenu: handleMenubar } = useMenuContext();
  const dispatch = useDispatch<AppDispatch>();

  // ALWAYS use current user profile from Redux (NEVER viewing profile)
  // This ensures side menu is NEVER affected by viewing other users' profiles
  const profile = useSelector((state: RootState) => state.profile);
  
  // Get current user ID to ensure we're using the right profile
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  
  // Fallback to localStorage if Redux doesn't have the user ID
  const [currentUserId, setCurrentUserId] = React.useState(reduxUserId || '');
  
  // Get user ID from localStorage if Redux doesn't have it
  React.useEffect(() => {
    if (!reduxUserId && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.userID) {
            setCurrentUserId(data.userID);
       
          }
        }
      } catch (error) {
        console.error("Error getting userID from localStorage:", error);
      }
    } else if (reduxUserId) {
      setCurrentUserId(reduxUserId);
    }
  }, [reduxUserId]);
  
  // 🔒 CRITICAL: Ensure current user profile is always loaded
  // This prevents the side menu from showing "User" fallback
  // MUST be called before any early returns to maintain hook order
  React.useEffect(() => {
    if (currentUserId && (!profile.firstname || profile.status === "idle")) {
      
      // Get token from localStorage or Redux
      let token: string | undefined;
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          token = data?.refreshtoken || data?.accesstoken;
        }
      } catch (error) {
        console.error("Error getting token for side menu:", error);
      }
      
      if (token) {
        dispatch(getprofile({ userid: currentUserId, token }));
      }
    }
  }, [currentUserId, profile.firstname, profile.status, dispatch]);

  // Additional effect for Edge browser compatibility
  React.useEffect(() => {
    const isEdge = navigator.userAgent.includes('Edg');
    const isCurrentUserProfile = profile.userId === currentUserId || profile.userid === currentUserId;
    
    if (isEdge && currentUserId && (!profile.firstname || !isCurrentUserProfile)) {
    
      
      // Force reload profile for Edge browser
      let token: string | undefined;
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          token = data?.refreshtoken || data?.accesstoken;
        }
      } catch (error) {
        console.error("Error getting token for Edge fallback:", error);
      }
      
      if (token) {
        // Add a small delay for Edge browser
        setTimeout(() => {
          dispatch(getprofile({ userid: currentUserId, token }));
        }, 100);
      }
    }
  }, [currentUserId, profile.firstname, profile.userId, profile.userid, dispatch]);
  
  // ⛔ Don't render until current user profile exists and has actual data
  if (!profile || Object.keys(profile).length === 0 || !profile.firstname) {
    return null; // nothing until current user profile is ready with real data
  }

  // SAFETY: Always use current user data with fallbacks
  // These values are ALWAYS from the current logged-in user, never from viewing profiles
  // Only use profile data if it belongs to the current user
  const isCurrentUserProfile = profile.userId === currentUserId || profile.userid === currentUserId;
  

  // Enhanced fallback mechanism for cross-browser compatibility
  let firstname = "User";
  let gold_balance = 0;
  let admin = false;
  
  if (isCurrentUserProfile && profile?.firstname) {
    firstname = profile.firstname;
    gold_balance = profile.balance || 0;
    admin = profile.admin || false;
  } else {
    // Try to get data from localStorage as fallback for Edge browser issues
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.firstname && data?.userID === currentUserId) {
            firstname = data.firstname;
          } else {
            console.log("❌ [Sidemenu] localStorage fallback failed:", {
              hasFirstname: !!data?.firstname,
              userIDMatch: data?.userID === currentUserId,
              localStorageUserID: data?.userID,
              currentUserId,
              reduxUserId
            });
          }
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage in Sidemenu:", error);
    }
  }

  // Debug logging to track what's happening

   






//creator button dynmic condition


  // MODEL BUTTON LOGIC
 // MODEL BUTTON LOGIC
const getCreatorButton2 = () => {
  if (profile.creatorID) {
    if (profile.exclusive_verify) {
      // ✅ User has a creator and is verified → go to creator profile page
      return (
        <MenuIconImg
          src="/icons/icons8-creator.png"
          name="My Portfolio"
          url={`/creators/${profile.creatorID}`} // dynamic profile page
        />
      );
    } else {
      // User has a creator but not verified → go to create creator page
      return (
        <MenuIconImg
          src="/icons/icons8-creator.png"
          name="My Portfolio"
          url="/creator/create"
        />
      );
    }
  } else {
    // User has no creator
    return (
      <MenuIconImg
        src={!profile.exclusive_verify ? "/icons/icons8-plus.png" : "/icons/icons8-creator.png"}
        name={profile.exclusive_verify ? "My Portfolio" : "Become a creator"}
        url={profile.exclusive_verify ? "/be-a-creator/apply" : "/be-a-creator"}
      />
    );
  }
};



//  url={`/creators/${profile?.creatorId||profile?.creatorID}`}

  // MODEL BUTTON LOGIC - ALWAYS uses current user's creator data
  // This ensures the creator button reflects the current user's creator status
  const getCreatorButton = () => {
    // 1️⃣ Current user already has a creator → go to their creator profile
    if (profile.creatorID) {
    return (
      <MenuIconImg
        src="/icons/icons8-creator.png"
        name="My Portfolio"
       url={`/creators/${profile.creatorID}`}
      // url="/creator/create"
      />
    );
  }

    // 2️⃣ Current user applied/verified but hasn't created a creator yet → go to create creator
    if (profile.exclusive_verify) {
    return (
      <MenuIconImg
        src="/icons/icons8-creator.png"
        name="Create Listing"
        url="/creator/create"
      />
    );
  }

    // 3️⃣ Default → current user hasn't applied yet → show Become a creator
    return (
    <MenuIconImg
      src="/icons/icons8-plus.png"
      name="Become a creator"
      url="/be-a-creator"
    />
  );
};



  return (
    <div className="fixed z-[110]">
      <div className="p-2">
        <nav
          onClick={handleMenubar}
          className={`${
            open ? "show" : "hide"
          } sm:block menu-width origin-top-right mr mt pt px-2 py-4 h-fit bg-gray-900 text-white fixed rounded-l-lg rounded-r-2xl z-[70]`}
        >
          <div className="absolute -top-3 right-0 w-fit cls-btn">
            <OpenMobileMenuBtn />
          </div>

          <div className="overflow-hidden">
            <div
              className={`${
                minimize ? "minimize" : "maximize"
              } mt-4 transition-all duration-500 flex flex-col items-start ml-1 mr-1 p-2 divider relative overflow-hidden`}
            >
              <button
                onClick={() => setMinimize(!minimize)}
                className="top-0 -right-1 text-gray-400 absolute p-2 text-lg"
              >
                <p className="absolute top-0 right-0 w-full h-full mini-btn"></p>
                {minimize ? <FaAngleRight /> : <FaAngleDown />}
              </button>

              <div className="flex justify-between w-full">
                <div className="flex text-xs text-blue-200 mb-3 w-full">
                  <Profile
                    src={(profile as any).photolink || "/icons/icons8-profile_user.png"}
                    name={firstname}
                    url={userId ? `/Profile/${userId}` : `/Profile`}
                    gold_balance={gold_balance}
                  />
                  {/* 🔒 SAFETY: This Profile component ALWAYS shows current user's data */}
                </div>
              </div>

              <div className="cstm-flex gap-4 items-start w-full mt-4">
                <button
                  className="flex gap-2 items-center justify-center font-bold text-sm w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg transition-transform duration-300 hover:scale-105 shadow-md"
                  onClick={() => router.push("/buy-gold")}
                >
                  <FaCoins /> <span>Get More Golds</span>
                </button>

                <button className="cstm-boder w-full rounded-lg py-3 text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent bg-inherit flex gap-2 items-center justify-center transition-transform duration-300 hover:scale-105">
                  <span>Upgrade Account</span>
                </button>
              </div>
            </div>

            {/* 🔒 ALL MENU ITEMS BELOW ALWAYS USE CURRENT USER DATA */}
            <div className="grid-sys text-xs text-blue-100 mt-4">
              <MenuIconImg
                src="/icons/icons8-customer.gif"
                name="Profile"
                url={userId ? `/Profile/${userId}` : `/Profile`}
              />

              {getCreatorButton()}

              <MenuIconImg
                src="/icons/icons8-users.png"
                name="Following"
                url="/following"
              />
              <MenuIconImg
                src="/icons/icons8-collection.png"
                name="Collections"
                url="/collections"
              />
              <MenuIconImg
                src="/icons/icons8-gold.png"
                name="Gold Stats"
                url="/goldstat/history"
              />
              <MenuIconImg
                src="/icons/icons8-receipts.gif"
                name="Transactions"
                url="/earning"
              />

              {admin && (
                <MenuIconImg
                  src="/icons/icons8-admin.png"
                  name="Admin"
                  url="/mmeko/admin"
                />
              )}

              <MenuIconImg
                src="/icons/icons8-gift.gif"
                name="Whats New"
                url="/change-log"
              />

              <div
                onClick={handleLogout}
                className="flex flex-col items-center group cursor-pointer"
              >
                <img
                  alt="Logout"
                  src="/icons/icons8-log-out.png"
                  className="object-cover w-7 h-7 bg-slate-900"
                />
                <p className="mt-1 text-center group-hover:text-gray-400">
                  Log Out
                </p>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidemenu;