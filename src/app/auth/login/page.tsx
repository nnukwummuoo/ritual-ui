"use client";
import { Loginview } from "@/components/Loginview";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden" style={{backgroundColor: '#0c0f27'}}>
      <div className="w-full max-w-md h-full flex flex-col justify-center">
        <Loginview />
      </div>
    </div>
  );
}
