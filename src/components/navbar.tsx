"use client";
import { useAuth } from "@/lib/context/auth-context";
import Image from "next/image";
import React from "react";
import { FaTimes, FaSignInAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import anyaLogo from '@/icons/icon-192.png';

export default function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { isOpen, toggle } = useAuth();
  const router = useRouter();

  return (
    <>
      {/* Mobile/Tablet Navbar */}
      <div
        className="z-[100] w-full fixed top-0 left-0 h-12 lg:hidden"
        style={{ backgroundColor: "#080b14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between h-full px-3">

          {/* Left — hamburger or spacer */}
          {isAuthenticated ? (
            <button onClick={toggle} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5">
              {isOpen
                ? <FaTimes size={20} style={{ color: "#6c63ff" }} />
                : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )
              }
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* Center — logo */}
          <Image
            src={anyaLogo}
            onClick={() => router.push("/")}
            alt="logo"
            className="logo cursor-pointer"
            width={32}
            height={32}
          />

          {/* Right — search icon (authenticated) or sign in */}
          {isAuthenticated ? (
            <button
              onClick={() => router.push("/discover")}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#6c63ff" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="flex items-center text-white rounded-full text-xs font-semibold"
              style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", padding: "6px 10px", boxShadow: "0 4px 14px rgba(108,99,255,.35)" }}
            >
              <FaSignInAlt size={16} />
            </button>
          )}

        </div>
      </div>

      {/* Desktop Login Button — unauthenticated only */}
      {!isAuthenticated && (
        <button
          onClick={() => router.push("/auth/login")}
          className="hidden lg:flex fixed top-2.5 right-4 z-[1000] items-center text-white rounded-full"
          style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", padding: "6px 10px", boxShadow: "0 4px 14px rgba(108,99,255,.35)" }}
        >
          <FaSignInAlt size={18} />
        </button>
      )}
    </>
  );
}