"use client"
import React, { useState, useEffect } from "react";
import "@/styles/Navs.css";
import "@/styles/Gennav.css";
import { Loginview } from "@/components/Loginview";
// import { CreatorSideMenu } from "./CreatorSideMenu";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { Logins } from "../auth/Logins";
// import { Profilenav } from "../navs/Profilenav";
// import { Sidemenu } from "./Sidemenu";

let data = {};

// export const Gennavigation = ({ click, setclick }: { click: boolean, setclick: (click: boolean)=> void }) => {
export const Gennavigation = ({ click }: { click: boolean}) => {
  const [open, setOpen] = useState(false);
  const login = false
  // const [creatorToggle, setCreatorToggle] = useState(false);
  // const login = useSelector((state) => state.register.logedin);
  // const handleMenubar = () => setOpen(!open);
  // const handleCreatorToggle = () => setCreatorToggle(!creatorToggle);

  useEffect(() => {
    if (click) {
      setOpen(false);
      // setclick(false);
    }
  });
  return (
    <div className="header-main-container">
      <div className="header-container">
        <div></div>

        <div className="flex flex-nowrap flex-shrink-0 flex-row genav ">
          {!login && <Loginview />}
          {/*{login && (
            <Profilenav
              handleMenubar={handleMenubar}
              isOpen={isOpen}
              creatorMenu={creatorMenu}
              handleCreatorToggle={handleCreatorToggle}
            />
          )}
          {login && <Sidemenu open={open} handleMenubar={handleMenubar} />}*/}
        </div>
      </div>
    </div>
  );
};
