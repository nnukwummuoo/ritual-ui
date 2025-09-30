"use client";

import React from "react";
import "../navs/Navs.css";
import { FaTimes } from "react-icons/fa";

// Define prop types
interface ProfilenavProps {
  isOpen: boolean;
  handleMenubar: () => void;
  creatorMenu: boolean;
  handleCreatorToggle: () => void;
}

export const Profilenav: React.FC<ProfilenavProps> = ({
  isOpen,
  handleMenubar,
  creatorMenu,
  handleCreatorToggle,
}) => {
  return (
    <header
      className="w-7 h-7 flex flex-row md:hidden"
      style={{
        position: "fixed",
        top: "5px",
        right: "10px",
        zIndex: 2000,
      }}
    >
      {!creatorMenu ? (
        <FaTimes size={24} color="#fff" onClick={handleMenubar} />
      ) : (
        <FaTimes size={24} color="#fff" onClick={handleCreatorToggle} />
      )}

      {/* 
      If needed later, you can re-enable this:
      <div className="flex md:hidden">
        <img alt="menuicon" src={person} />
      </div> 
      */}
    </header>
  );
};
