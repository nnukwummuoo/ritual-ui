"use client"; // Needed if using client-side hooks like useState, useSelector

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation"; // Next.js equivalent of useNavigate

// import { Logins } from "../auth/Logins";
import { Profilenav } from "../navs/Profilenav";
// import { Sidemenu } from "./Sidemenu";
import { ModelSideMenu } from "./ModelSideMenu";

import "@/styles/Navs.css";
import "@/styles/Gennav.css";
import Logins from "../Login";

// Define types for props
interface GennavigationProps {
  // isOpen: boolean;
  // modelMenu: boolean;
  // handleGenderSearchQuery?: (query: string) => void;
  // stoptop?: boolean;
  click: boolean;
  setclick: (value: boolean) => void;
}

// Define type for Redux state (simplified, adjust to your full store shape)
interface RootState {
  register: {
    logedin: boolean;
  };
}

export const Gennavigation: React.FC<GennavigationProps> = ({
  // isOpen,
  // modelMenu,
  // handleGenderSearchQuery,
  // stoptop,
  click,
  setclick,
}) => {
  const login = useSelector((state: RootState) => state.register.logedin);
  const [open, setOpen] = useState(false);
  const [modelToggle, setModelToggle] = useState(false);

  const router = useRouter();

  const handleMenubar = () => setOpen(!open);
  const handleModelToggle = () => setModelToggle(!modelToggle);

  useEffect(() => {
    if (click) {
      setOpen(false);
      setclick(false);
    }
  }, [click, setclick]);

  return (
    <div className="header-main-container">
      <div className="header-container">
        <div></div>

        <div className="flex flex-nowrap flex-shrink-0 flex-row genav">
          {!login && <Logins />}
          {/* Uncomment when ready */}
          {/* {login && (
            <Profilenav
              handleMenubar={handleMenubar}
              isOpen={isOpen}
              modelMenu={modelMenu}
              handleModelToggle={handleModelToggle}
            />
          )}
          {login && <Sidemenu open={open} handleMenubar={handleMenubar} />} */}
        </div>
      </div>
    </div>
  );
};
