"use client"; // Needed if using client-side hooks like useState, useSelector

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation"; // Next.js equivalent of useNavigate

// import { Logins } from "../auth/Logins";
import { Profilenav } from "../navs/Profilenav";
// import { Sidemenu } from "./Sidemenu";
import { CreatorSideMenu } from "./CreatorSideMenu";

import "@/styles/Navs.css";
import "@/styles/Gennav.css";
import Logins from "../Login";

// Define types for props
interface GennavigationProps {
  // isOpen: boolean;
  // creatorMenu: boolean;
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
  // creatorMenu,
  // handleGenderSearchQuery,
  // stoptop,
  click,
  setclick,
}) => {
  const login = useSelector((state: RootState) => state.register.logedin);
  const [open, setOpen] = useState(false);
  const [creatorToggle, setCreatorToggle] = useState(false);

  const router = useRouter();

  const handleMenubar = () => setOpen(!open);
  const handleCreatorToggle = () => setCreatorToggle(!creatorToggle);

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
              creatorMenu={creatorMenu}
              handleCreatorToggle={handleCreatorToggle}
            />
          )}
          {login && <Sidemenu open={open} handleMenubar={handleMenubar} />} */}
        </div>
      </div>
    </div>
  );
};
