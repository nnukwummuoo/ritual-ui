/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useRef, useEffect } from "react";
import "./Navs.css";
import { useRouter } from "next/navigation";
import MenuIconImg from "@/components/MenuIcon-img";
import { useMenuContext } from "@/lib/context/MenuContext";
import Profile from "@/components/Profile";
import { FaCoins, FaAngleRight, FaAngleDown } from "react-icons/fa";
import handleLogout from "@/lib/service/logout";
import { useUserId } from "@/lib/hooks/useUserId";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getprofile } from "@/store/profile";
import { checkVipStatus } from "@/store/vip";

const Sidemenu = () => {
  const [minimize, setMinimize] = useState(false);
  const userId = useUserId();
  const router = useRouter();
  const { open, toggleMenu: handleMenubar } = useMenuContext();
  const dispatch = useDispatch<AppDispatch>();
  const menuRef = useRef<HTMLDivElement>(null);

  const profile = useSelector((state: RootState) => state.profile);
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const [currentUserId, setCurrentUserId] = React.useState(reduxUserId || "");
  const vipStatus = useSelector((state: RootState) => state.vip.vipStatus);
  const isVip = vipStatus?.isVip || false;
  const vipEndDate = vipStatus?.vipEndDate;

  React.useEffect(() => {
    if (!reduxUserId && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.userID) setCurrentUserId(data.userID);
        }
      } catch (error) {
        console.error("Error getting userID from localStorage:", error);
      }
    } else if (reduxUserId) {
      setCurrentUserId(reduxUserId);
    }
  }, [reduxUserId]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleMenubar();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleMenubar]);

  React.useEffect(() => {
    if (currentUserId && (!profile.firstname || profile.status === "idle")) {
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
        dispatch(checkVipStatus(currentUserId));
      }
    }
  }, [currentUserId, profile.firstname, profile.status, dispatch]);

  React.useEffect(() => {
    const isEdge = navigator.userAgent.includes("Edg");
    const isCurrentUserProfile = profile.userId === currentUserId;
    if (isEdge && currentUserId && (!profile.firstname || !isCurrentUserProfile)) {
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
        setTimeout(() => {
          dispatch(getprofile({ userid: currentUserId, token }));
        }, 100);
      }
    }
  }, [currentUserId, profile.firstname, profile.userId, dispatch]);

  if (!profile || Object.keys(profile).length === 0 || !profile.firstname) {
    return null;
  }

  const isCurrentUserProfile = profile.userId === currentUserId;

  let firstname = "User";
  let lastname = "";
  let gold_balance = 0;
  let pending_balance = 0;
  let admin = false;
  let verified = false;

  if (isCurrentUserProfile && profile?.firstname) {
    firstname = profile.firstname;
    lastname = profile.lastname || "";
    gold_balance = Number(profile.balance) || 0;
    pending_balance = Number(profile.pending) || 0;
    admin = profile.admin || false;
    verified = profile.creator_verified || false;
  } else {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.firstname && data?.userID === currentUserId) {
            firstname = data.firstname;
            lastname = data.lastname || "";
          }
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage in Sidemenu:", error);
    }
  }

  const getCreatorButton = () => {
    if (profile.creator_portfolio_id) {
      return (
        <MenuIconImg
          src="/icons/icons8-creator.png"
          name="My Portfolio"
          url={`/creators/${profile.creator_portfolio_id}`}
        />
      );
    }
    if (profile.creator_verified) {
      return (
        <MenuIconImg
          src="/icons/icons8-plus.png"
          name="Create Portfolio"
          url="/creator/create"
        />
      );
    }
    return (
      <MenuIconImg
        src="/icons/icons-become-a-creator.png"
        name="Become a creator"
        url="/be-a-creator"
      />
    );
  };

  return (
    <div className="fixed z-[110]">
      <div className="p-2">
        {/* ✅ Backdrop — closes menu when clicking outside on all screen sizes */}
        {open && (
          <div
            className="fixed inset-0 bg-black/40 z-[90]"
            style={{ backdropFilter: "blur(2px)" }}
            onClick={handleMenubar}
          />
        )}

        <nav
          ref={menuRef}
          // ✅ No onClick here — was closing menu on any click inside
          className={`${
            open ? "show" : "hide"
          } menu-width origin-top-right mr mt pt px-2 py-4 h-fit bg-[#080b14] text-white fixed rounded-l-lg rounded-r-2xl z-[100]`}
        >
          {/* ✅ Close button — visible on ALL screen sizes */}
          <div className="absolute top-3 right-3 z-[110]">
            <button
              onClick={handleMenubar}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
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
                    src={profile.photolink || ""}
                    name={`${firstname} ${lastname}`.trim()}
                    firstname={firstname}
                    lastname={lastname}
                    url={
                      userId || profile?.username
                        ? `/${profile?.username || userId}`
                        : `/`
                    }
                    gold_balance={gold_balance}
                    {...(pending_balance > 0 && { pending_balance })}
                    isVip={isVip || false}
                    vipEndDate={vipEndDate}
                    onClick={() => handleMenubar()}
                    verified={verified}
                  />
                </div>
              </div>

              <div className="cstm-flex gap-4 items-start w-full mt-4">
                <button
                  className="flex gap-2 items-center text-black justify-center font-bold text-sm w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg transition-transform duration-300 hover:scale-105 shadow-md"
                  onClick={() => { router.push("/buy-gold"); handleMenubar(); }}
                >
                  <FaCoins /> <span>Get More Golds</span>
                </button>

                <button
                  className="cstm-boder w-full rounded-lg py-3 text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent bg-inherit flex gap-2 items-center justify-center transition-transform duration-300 hover:scale-105"
                  onClick={() => { router.push("/vip"); handleMenubar(); }}
                >
                  <span>Upgrade Account</span>
                </button>
              </div>
            </div>

            <div className="grid-sys text-xs text-blue-100 mt-4">
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
                name="My Earnings"
                url="/goldstat/history"
              />

              {admin && (
                <MenuIconImg
                  src="/icons/icons8-admin.png"
                  name="Admin"
                  url="/mmeko/admin"
                />
              )}

              <MenuIconImg
                src="/icons/icons8-gift.png"
                name="What's New"
                url="/change-log"
              />

              <div
                onClick={async () => {
                  try {
                    localStorage.clear();
                    await handleLogout();
                  } catch (error) {
                    console.error(error);
                  } finally {
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }
                }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <img
                  alt="Logout"
                  src="/icons/icons8-log-out.png"
                  className="object-cover w-12 h-12"
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