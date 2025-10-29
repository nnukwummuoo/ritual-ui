"use client";
import { useAuth } from "@/lib/context/auth-context";
import Image from "next/image";
import React from "react";
import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import anyaLogo from '@/icons/icon-192.png';

export default function Navbar({isAuthenticated}:{isAuthenticated: boolean}) {
  const { isOpen, toggle } = useAuth();
  const router = useRouter()
  
  
  return (
    <>
      {/* Mobile/Tablet Navbar - Hidden on lg screens and up */}
      <div className="z-[100] w-full fixed top-0 left-0 top-bar-visibility bg-gray-900 h-12 border-b border-b-gray-500 lg:hidden">
        <div className="flex items-center text-orange-600 justify-between">
          <div className="absolute left-0 top-0 p-2 flex items-center justify-between w-full">
            <button onClick={toggle} className="navBtn">
              {/* {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />} */}
              <span className="bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-blue-500">
                {isOpen ? <FaTimes size={25} className="text-blue-500" /> : <FaBars size={25}  />}
              </span>
            </button>
            <Image src={anyaLogo} alt="logo" className="logo" />
          <div className="size-6"></div>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 absolute right-4 top-2.5 z-[1000] text-white hover:text-white active:text-white focus:outline-none rounded-full lg:hidden"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 20,
              }}
            >
              <FaSignInAlt size={18} className="text-gray-900" />
            </button>
          )}
          {/* <div className="size-6"></div> *<Logins /> placeholder */}
        </div>
      </div>

      {/* Desktop Login Button - Only shown on lg screens and up, only when not authenticated */}
      {!isAuthenticated && (
        <button
          onClick={() => router.push('/auth/login')}
          className="hidden lg:flex fixed top-2.5 right-4 z-[1000] bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:text-white active:text-white focus:outline-none rounded-full items-center"
          style={{
            padding: "6px 10px",
            borderRadius: 20,
          }}
        >
          <FaSignInAlt size={18} className="text-gray-900" />
        </button>
      )}
    </>
  );
}
