"use client";
import { useAuth } from "@/lib/context/auth-context";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaTimes, FaSignInAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import anyaLogo from '@/icons/icon-192.png';

export default function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { isOpen, toggle } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;
    const h = () => setScrolled(window.scrollY > 40 || document.documentElement.scrollTop > 40);
    window.addEventListener("scroll", h, { passive: true });
    document.addEventListener("scroll", h, { passive: true });
    return () => {
      window.removeEventListener("scroll", h);
      document.removeEventListener("scroll", h);
    };
  }, [isAuthenticated]);

  // ── UNAUTHENTICATED — hide navbar entirely on mobile (landing page handles its own top bar)
  if (!isAuthenticated) {
    return null;
  }

  // ── AUTHENTICATED — standard app navbar
  return (
    <>
      <div
        className="z-[100] w-full fixed top-0 left-0 h-12 lg:hidden"
        style={{ backgroundColor: "#080b14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between h-full px-3">
          <button onClick={toggle} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5">
            {isOpen
              ? <FaTimes size={20} style={{ color: "#64748b" }} />
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>
            }
          </button>
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "linear-gradient(135deg,#6c63ff,#9b59f5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0,
          }}>M</div>
        </div>          
        <button onClick={() => router.push("/discover")} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="2"/>
<path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}