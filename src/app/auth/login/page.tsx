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
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden" style={{ backgroundColor: '#080b14' }}>
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#6c63ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#9b59f5]/15 blur-3xl" />

      <div className="w-full max-w-md h-full flex flex-col justify-center relative">
        <Loginview />
      </div>
    </div>
  );
}