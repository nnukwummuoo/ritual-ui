"use client";
import { FaSignInAlt } from "react-icons/fa";
// import Popup from ;
import { Loginview } from "./Loginview";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/context/auth-context";
// import { status } from "@/constants/status";

const Popup = dynamic(()=> import("reactjs-popup"), {ssr: false,})

export default function Logins() {
  const {status} = useAuth()
  
  return (
    <div className="">
      <Popup
        open={!["idle","resolved"].includes(status)}
        modal
        nested
        trigger={
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-600 absolute right-4 top-2.5 z-[1000] text-white hover:text-white active:text-white focus:outline-none rounded-full"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 20,
            }}
          >
            <FaSignInAlt size={18} className="text-gray-900" />
          </button>
        }
      >
        <div className=" w-2/3">
          <Loginview />
        </div>
      </Popup>
    </div>
  );
}
