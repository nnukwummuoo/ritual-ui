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
    const h = () => setScrolled(window.scrollY > 40 || (document.documentElement.scrollTop > 40));
    window.addEventListener("scroll", h, { passive: true });
    document.addEventListener("scroll", h, { passive: true });
    return () => {
      window.removeEventListener("scroll", h);
      document.removeEventListener("scroll", h);
    };
  }, [isAuthenticated]);

  // ── UNAUTHENTICATED — full landing nav ──────────────────────────────────────
  // if (!isAuthenticated) {
  //   return (
  //     <>
  //       {/* Mobile top bar */}
  //       <div
  //         className="z-[100] w-full fixed top-0 left-0 h-12 lg:hidden"
  //         style={{ backgroundColor: "#080b14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
  //       >
  //         <div className="flex items-center justify-between h-full px-3">
  //           <div className="w-8" />
  //           <Image src={anyaLogo} onClick={() => router.push("/")} alt="logo" className="logo cursor-pointer" width={32} height={32} />
  //           <button
  //             onClick={() => router.push("/auth/login")}
  //             className="flex items-center text-white rounded-full text-xs font-semibold"
  //             style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", padding: "6px 10px", boxShadow: "0 4px 14px rgba(108,99,255,.35)" }}
  //           >
  //             <FaSignInAlt size={16} />
  //           </button>
  //         </div>
  //       </div>

  //       {/* Desktop landing nav */}
  //       <nav
  //         className={`hidden lg:flex fixed top-0 left-0 right-0 z-[100] items-center justify-between px-10 h-16 transition-all duration-300 ${scrolled ? "backdrop-blur-xl border-b border-white/[0.07]" : "border-b border-transparent"}`}
  //         style={{ backgroundColor: scrolled ? "rgba(8,11,20,0.95)" : "transparent" }}
  //       >
  //         <Link href="/" className="flex items-center gap-2.5 no-underline">
  //           <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-white font-extrabold text-sm" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)" }}>M</div>
  //           <span className="text-white font-bold text-[17px] tracking-tight">mmeko</span>
  //         </Link>
  //         <div className="flex items-center gap-1">
  //           {["Offerings", "How It Works", "Payments", "Safety", "FAQ"].map((l, i) => (
  //             <Link key={l} href={`#${["offerings","how","payments","safety","faq"][i]}`} className="text-[#94a3b8] hover:text-white text-[13.5px] font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all no-underline">{l}</Link>
  //           ))}
  //         </div>
  //         <div className="flex items-center gap-2">
  //           <div className="w-px h-5 bg-white/[0.07] mx-1" />
  //           <Link href="/auth/login" className="text-[#94a3b8] border border-white/[0.07] hover:text-white hover:bg-white/5 text-[13.5px] font-semibold px-4 py-2 rounded-lg transition-all no-underline">Sign In</Link>
  //           <Link href="/auth/register" className="text-white text-[13.5px] font-semibold px-4 py-2 rounded-lg transition-all no-underline" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", boxShadow: "0 0 0 1px rgba(108,99,255,.3),0 4px 16px rgba(108,99,255,.25)" }}>Apply Now →</Link>
  //         </div>
  //       </nav>
  //     </>
  //   );
  // }

  // ── AUTHENTICATED — standard app navbar ─────────────────────────────────────
  return (
    <>
      <div
        className="z-[100] w-full fixed top-0 left-0 h-12 lg:hidden"
        style={{ backgroundColor: "#080b14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between h-full px-3">
          <button onClick={toggle} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5">
            {isOpen
              ? <FaTimes size={20} style={{ color: "#6c63ff" }} />
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"/></svg>
            }
          </button>
          <Image src={anyaLogo} onClick={() => router.push("/")} alt="logo" className="logo cursor-pointer" width={32} height={32} />
          <button onClick={() => router.push("/discover")} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#6c63ff" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}