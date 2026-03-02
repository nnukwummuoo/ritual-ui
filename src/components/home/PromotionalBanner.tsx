"use client";

import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaClock, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

const DISMISS_KEY = "promotionalBannerDismissed";

const PromotionalBanner: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
      setVisible(false);
    } catch {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="mx-auto max-w-[30rem] w-full">
      <div className="bg-gray-900 rounded-2xl shadow-lg p-8 mb-4 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          aria-label="Close banner"
        >
          <FaTimes size={20} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaShieldAlt className="text-orange-500" size={28} />
            <FaClock className="text-green-400" size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">
            Apply and be a Verified Creator within Hours
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Fast-track verification process with premium benefits.
          </p>
          <button
            onClick={() => router.push("/be-a-creator")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 shadow-md"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
