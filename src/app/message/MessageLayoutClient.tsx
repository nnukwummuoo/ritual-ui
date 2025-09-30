"use client";
import { useEffect } from "react";

export default function MessageLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add("message-route");
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("message-route");
    };
  }, []);

  return <>{children}</>;
}
