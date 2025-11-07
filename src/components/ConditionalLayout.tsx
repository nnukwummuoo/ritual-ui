"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import BottomNavBar from "@/components/bottom-navbar";
import ShouldRenderPopUp from "@/components/ShouldRenderPopUp";
import CreatorCards from "@/components/home/CreatorCards";

interface ConditionalLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function ConditionalLayout({ children, isAuthenticated }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if it's a QuickChat [userid] route
  const isQuickChatRoute = pathname.includes('/message/') && pathname.split('/').length > 2;
  
  // Check if it's an admin route
  const isAdminRoute = pathname.includes('/mmeko/admin');
  
  // Check if it's the home route
  const isHomeRoute = pathname === '/';
  
  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle scroll behavior
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      
      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setShowNavbar(false);
      }
      
      // Always show navbar at the top
      if (currentScrollY < 10) {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);
  
  // Apply transform to navbar's fixed div (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Use a small delay to ensure the navbar is rendered
    const timeoutId = setTimeout(() => {
      // Find the fixed navbar div (mobile/tablet navbar)
      const navbarElement = document.querySelector('.top-bar-visibility') as HTMLElement;
      if (navbarElement) {
        if (showNavbar) {
          navbarElement.style.transform = 'translateY(0)';
          navbarElement.style.transition = 'transform 300ms ease-in-out';
        } else {
          navbarElement.style.transform = 'translateY(-100%)';
          navbarElement.style.transition = 'transform 300ms ease-in-out';
        }
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [showNavbar]);
  
  // If it's a QuickChat [userid] route or admin route, render without main layout
  if (isQuickChatRoute || isAdminRoute) {
    return <>{children}</>;
  }
  
  // Otherwise, render with main layout
  return (
    <main className="flex mb-28 overflow-hidden h-screen relative">
      <Sidebar />
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className={`w-full grid grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden transition-all duration-300 ${mounted && !showNavbar ? 'mt-0' : 'mt-12'}`}>
        <div 
          ref={scrollContainerRef}
          className="scrollbar overflow-y-auto w-full pt-4 grid grid-cols-[60fr_40fr] max-[1200px]:grid-cols-[75fr_25fr] max-[600px]:grid-cols-1 justify-between"
        >
          <div className="w-full max-[1000px]:max-w-[90%]  max-[800px]:max-w-[100%]">
            {children}
          </div>
          {/* Show CreatorCards only on home route and make it same size as bottom navbar */}
          {isHomeRoute && (
            <div className="w-full  h-full max-[1000px]:w-0 mt-36 sticky lg:block hidden">
              <div className="sticky top-4 -mr-16">
                <div className="w-[25rem] mx-auto max-[600px]:w-[90%] rounded-2xl px-4 pt-4 pb-2 bg-gray-900">
                  <CreatorCards />
                </div>
              </div>
            </div>
          )}
        </div>
        {isAuthenticated && <BottomNavBar />}
        {!isAuthenticated && <ShouldRenderPopUp />}
      </div>
    </main>
  );
}
