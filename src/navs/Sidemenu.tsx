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
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const Sidemenu = () => {
  const [minimize, setMinimize] = useState(false);
  const userId = useUserId();
  const router = useRouter();
  const { open, toggleMenu: handleMenubar } = useMenuContext();

  // profile directly from Redux
  const profile = useSelector((state: RootState) => state.profile);

  // ⛔ Don't render until profile exists
  if (!profile || Object.keys(profile).length === 0) {
    return null; // nothing until profile is ready
  }

 // Default fallback
const firstname = profile?.firstname || "User";
const gold_balance = profile?.balance || 0;
  const admin = true;
   






//model button dynmic condition


  // MODEL BUTTON LOGIC
 // MODEL BUTTON LOGIC
const getModelButton2 = () => {
  if (profile.modelId || profile.modelID) {
    if (profile.exclusive_verify) {
      // ✅ User has a model and is verified → go to model profile page
      return (
        <MenuIconImg
          src="/icons/icons8-model.png"
          name="Model Portfolio"
          url={`/models/${profile.modelId || profile.modelID}`} // dynamic profile page
        />
      );
    } else {
      // User has a model but not verified → go to create model page
      return (
        <MenuIconImg
          src="/icons/icons8-model.png"
          name="Model Portfolio"
          url="/model/create"
        />
      );
    }
  } else {
    // User has no model
    return (
      <MenuIconImg
        src={!profile.exclusive_verify ? "/icons/icons8-plus.png" : "/icons/icons8-model.png"}
        name={profile.exclusive_verify ? "Model Portfolio" : "Model Application"}
        url={profile.exclusive_verify ? "/be-a-model/apply" : "/be-a-model"}
      />
    );
  }
};



//  url={`/models/${profile?.modelId||profile?.modelID}`}

  // MODEL BUTTON LOGIC
 // MODEL BUTTON LOGIC
const getModelButton = () => {
  // 1️⃣ User already has a model → go to their model profile
  if (profile.modelID || profile.modelId) {
    return (
      <MenuIconImg
        src="/icons/icons8-model.png"
        name="Model Portfolio"
       url={`/models/${profile.modelID || profile.modelId}`}
      // url="/model/create"
      />
    );
  }

  // 2️⃣ User applied/verified but hasn't created a model yet → go to create model
  if (profile.exclusive_verify) {
    return (
      <MenuIconImg
        src="/icons/icons8-model.png"
        name="Create Model"
        url="/model/create"
      />
    );
  }

  // 3️⃣ Default → user hasn't applied yet → show Model Application
  return (
    <MenuIconImg
      src="/icons/icons8-plus.png"
      name="Model Application"
      url="/be-a-model"
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
                    src="/icons/icons8-profile_user.png"
                    name={firstname}
                    url={userId ? `/Profile/${userId}` : `/Profile`}
                    gold_balance={gold_balance}
                  />
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

            <div className="grid-sys text-xs text-blue-100 mt-4">
              <MenuIconImg
                src="/icons/icons8-customer.gif"
                name="Profile"
                url={userId ? `/Profile/${userId}` : `/Profile`}
              />

              {getModelButton()}

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