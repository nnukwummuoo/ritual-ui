"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/context/auth-context";
import MobileSidebar from "./mobile-sidebar";
import dynamic from "next/dynamic";

const SideBar = () => {
  const router = useRouter();
  const { isOpen, toggle } = useAuth();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isMobile = dynamic(() => import("@/hooks/useIsMobile").then((mod) => mod.useIsMobile), {
    ssr: false,
    loading: () => <div>Loading...</div>,
  });

  const handleNav = (path: string) => {
    router.push(path);
    toggle();
  };

  useEffect(() => {
    if (!isMobile) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  return <MobileSidebar />;
};

export default SideBar;
