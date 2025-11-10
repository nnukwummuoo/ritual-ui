"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import BottomNavBar from "@/components/bottom-navbar";
import ShouldRenderPopUp from "@/components/ShouldRenderPopUp";
import CreatorCards from "@/components/home/CreatorCards";
import { FaSignInAlt } from "react-icons/fa";

interface ConditionalLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function ConditionalLayout({ children, isAuthenticated }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Optimized scroll handler with throttling for smooth performance
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = scrollContainer.scrollTop;
          const reachedBottom =
            scrollContainer.scrollTop + scrollContainer.clientHeight >=
            scrollContainer.scrollHeight - 8;
          
          // Only handle on mobile screens
          if (window.innerWidth >= 768) {
            setShowNavbar(true);
            ticking = false;
            return;
          }
          
          // Show navbar when scrolling up, hide when scrolling down
          if (currentScrollY < lastScrollY && !reachedBottom) {
            // Scrolling up
            setShowNavbar(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down and past 100px
            setShowNavbar(false);
          } else if (reachedBottom) {
            // Keep navbar hidden when the user is pushing against the bottom
            setShowNavbar(false);
          }
          
          // Always show navbar at the top
          if (currentScrollY < 10) {
            setShowNavbar(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);
  
  // Apply transform to navbar's fixed div (client-side only) - only for mobile/tablet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we're on md or larger screen - if so, don't apply transform
    if (window.innerWidth >= 768) {
      // Ensure navbar is visible on md+ screens
      const navbarElement = document.querySelector('.top-bar-visibility') as HTMLElement;
      if (navbarElement) {
        navbarElement.classList.remove('navbar-hidden');
        navbarElement.classList.add('navbar-visible');
      }
      return;
    }
    
    const navbarElement = document.querySelector('.top-bar-visibility') as HTMLElement;
    if (navbarElement) {
      if (showNavbar) {
        navbarElement.classList.remove('navbar-hidden');
        navbarElement.classList.add('navbar-visible');
      } else {
        navbarElement.classList.remove('navbar-visible');
        navbarElement.classList.add('navbar-hidden');
      }
    }
  }, [showNavbar]);
  
  // If it's a QuickChat [userid] route or admin route, render without main layout
  if (isQuickChatRoute || isAdminRoute) {
    return <>{children}</>;
  }
  
  // Otherwise, render with main layout
  return (
    <main className="flex overflow-hidden h-screen relative">
      {/* Sidebar Container - Hidden on mobile, visible on sm and up */}
      <div className="hidden sm:block md:p-4 h-full overflow-hidden flex items-center sm:w-1/4 flex-shrink-0">
        <div className="h-full w-full">
          <Sidebar />
        </div>
      </div>
      
      {/* Mobile Sidebar - Only visible on mobile, positioned fixed */}
      <div className="sm:hidden">
        <Sidebar />
      </div>
     
      {/* Navbar - Hidden on md devices and up */}
      <div className="md:hidden">
        <Navbar isAuthenticated={isAuthenticated} />
      </div>
      
      {/* Login Button - Only shown on md devices and up, when not authenticated */}
      {!isAuthenticated && (
        <button
          onClick={() => router.push('/auth/login')}
          className="hidden md:flex fixed top-4 right-4 z-[1000] bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:text-white active:text-white focus:outline-none rounded-full items-center"
          style={{
            padding: "8px 12px",
            borderRadius: 20,
          }}
        >
          <FaSignInAlt size={18} className="text-gray-900" />
        </button>
      )}
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 min-w-0 min-h-0 ${mounted && !showNavbar ? 'mt-0' : 'md:mt-0 mt-12'}`}>
        <div 
          ref={scrollContainerRef}
          className="flex-1 scrollbar overflow-y-auto overflow-x-hidden w-full pt-4 min-w-0"
          style={{ minHeight: 0 }}
        >
          <div className="grid grid-cols-[60fr_40fr] max-[1200px]:grid-cols-[75fr_25fr] max-[600px]:grid-cols-1 gap-4 min-h-0">
            <div className="w-full max-w-full min-w-0 overflow-x-hidden">
              {children}
            </div>
            {/* Show CreatorCards only on home route and make it same size as bottom navbar */}
            {isHomeRoute && (
              <div className="w-full h-full max-[1000px]:w-0 lg:block hidden">
                <div className="sticky top-28 self-start -mr-16">
                  <div className="w-[25rem] mx-auto max-[600px]:w-[90%] rounded-2xl px-4 pt-4 pb-2 bg-gray-900">
                    <CreatorCards />
                  </div>
                </div>
              </div>
            )}
          </div>
          {isAuthenticated && <div className="h-24 md:h-0"></div>}
        </div>
        {isAuthenticated && <BottomNavBar />}
        {!isAuthenticated && <ShouldRenderPopUp />}
      </div>
    </main>
  );
}
