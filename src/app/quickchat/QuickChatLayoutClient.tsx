"use client";
import { useEffect } from "react";

export default function QuickChatLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add("quickchat-route");
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("quickchat-route");
    };
  }, []);

  return <>{children}</>;
}
