"use client";
import { useAuth } from "@/lib/context/auth-context";
import Image from "next/image";
import React from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Logins from "./Login";
import { useRouter } from "next/navigation";
import anyaLogo from '@/icons/Anya.png';

export default function Navbar({isAuthenticated}:{isAuthenticated: boolean}) {
  const { isOpen, toggle } = useAuth();
  const router = useRouter()

  console.log(isOpen);
  
  
  return (
    <div className="z-[1000] w-full fixed top-0 left-0 top-bar-visibility">
    <div className="flex items-center text-orange-600 justify-between">
      <div className="absolute left-0 top-0 p-2 flex items-center justify-between w-full">
        <button onClick={toggle} className="navBtn">
          {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
        </button>
        <Image src={anyaLogo} alt="logo" className="logo" />
      <div className="size-6"></div>
      </div>
      {!isAuthenticated && <Logins />}
      {/* <div className="size-6"></div> *<Logins /> placeholder */}
    </div>
    </div>
  );
}
