"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import BottomNavBar from "@/components/bottom-navbar";
import ShouldRenderPopUp from "@/components/ShouldRenderPopUp";
import { NotificationPermissionModal } from "@/components/NotificationPermissionModal";
import { usePushNotificationContext } from "@/contexts/PushNotificationContext";
import GlobalNotificationFetcher from "@/components/GlobalNotificationFetcher";

interface ConditionalLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function ConditionalLayout({ children, isAuthenticated }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const { isSupported, permission, subscribe } = usePushNotificationContext();
  
  // Check if it's a QuickChat [userid] route
  const isQuickChatRoute = pathname.includes('/message/') && pathname.split('/').length > 2;
  
  // Check if it's an admin route
  const isAdminRoute = pathname.includes('/mmeko/');
  
  // Check if it's an auth route (login, register, etc.)
  const isAuthRoute = pathname.includes('/auth/');

  // Show notification permission modal for authenticated users who haven't granted permission
  useEffect(() => {
    if (isAuthenticated && isSupported && permission === 'default') {
      // Check if user has seen the notification modal before
      const hasSeenModal = localStorage.getItem('notification-modal-seen');
      if (!hasSeenModal) {
        setShowNotificationModal(true);
      }
    }
  }, [isAuthenticated, isSupported, permission]);

  const handleEnableNotifications = async () => {
    try {
      await subscribe();
      setShowNotificationModal(false);
      localStorage.setItem('notification-modal-seen', 'true');
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  const handleCloseModal = () => {
    setShowNotificationModal(false);
    localStorage.setItem('notification-modal-seen', 'true');
  };
  
  // If it's a QuickChat [userid] route, admin route, or auth route, render without main layout
  if (isQuickChatRoute || isAdminRoute || isAuthRoute) {
    return <div className="pb-0">{children}</div>;
  }
  
  // Otherwise, render with main layout
  return (
    <>
      {/* Global notification fetcher for authenticated users */}
      {isAuthenticated && <GlobalNotificationFetcher />}
      
      <main className="flex overflow-hidden h-screen relative">
        <Sidebar />
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="w-full flex flex-col overflow-hidden mt-12">
          <div className="flex-1 overflow-y-auto scrollbar pt-4 pb-20 grid grid-cols-[60fr_40fr] max-[1200px]:grid-cols-[75fr_25fr] max-[600px]:grid-cols-1 justify-between">
            <div className="w-full max-[1000px]:max-w-[90%]  max-[800px]:max-w-[100%] [&_svg]:!text-inherit [&_svg]:!fill-current [&_svg]:!stroke-current [&_svg]:!color-inherit">
              {children}
            </div>
            <div className="w-full h-full max-[1000px]:w-0"></div>
          </div>
          {isAuthenticated && <BottomNavBar />}
          {!isAuthenticated && <ShouldRenderPopUp />}
        </div>
      </main>
      
      {/* Notification Permission Modal */}
      {showNotificationModal && (
        <NotificationPermissionModal
          onClose={handleCloseModal}
          onEnable={handleEnableNotifications}
        />
      )}
    </>
  );
}
