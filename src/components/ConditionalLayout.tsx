"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
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
  
  // Check if it's a QuickChat [userid] route
  const isQuickChatRoute = pathname.includes('/message/') && pathname.split('/').length > 2;
  
  // Check if it's the home route
  const isHomeRoute = pathname === '/';
  
  // If it's a QuickChat [userid] route, render without main layout
  if (isQuickChatRoute) {
    return <>{children}</>;
  }
  
  // Otherwise, render with main layout
  return (
    <main className="flex mb-16 overflow-hidden h-screen relative">
      <Sidebar />
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="w-full grid grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden mt-12">
        <div className="scrollbar overflow-y-auto w-full pt-4 grid grid-cols-[60fr_40fr] max-[1200px]:grid-cols-[75fr_25fr] max-[600px]:grid-cols-1 justify-between">
          <div className="w-full max-[1000px]:max-w-[90%]  max-[800px]:max-w-[100%]">
            {children}
          </div>
          {/* Show CreatorCards only on home route and make it same size as bottom navbar */}
          {isHomeRoute && (
            <div className="w-full  h-full max-[1000px]:w-0 mt-28 lg:block hidden">
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
