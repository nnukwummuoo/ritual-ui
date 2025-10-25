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
          <div className="w-full h-full max-[1000px]:w-0 mt-28 lg:block hidden">
            <div className="sticky top-4">
              <CreatorCards />
            </div>
          </div>
        </div>
        {isAuthenticated && <BottomNavBar />}
        {!isAuthenticated && <ShouldRenderPopUp />}
      </div>
    </main>
  );
}
