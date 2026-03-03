"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { FaTimes } from "react-icons/fa";

const DISMISS_KEY = "safetyRulesBannerDismissed";

const SafetyRulesBanner: React.FC = () => {
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
      {/* Heading */}
      <h3 className="text-white text-lg font-bold mb-3 px-3">
        Safety Rules (Important)
      </h3>

      {/* Banner Card */}
      <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-blue-300 rounded-lg p-6 shadow-lg relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
          aria-label="Close safety rules banner"
        >
          <FaTimes size={20} />
        </button>
        <div className="space-y-4 text-white">
          {/* Main Rule */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle size={24} fill="#22c55e" className="text-white" />
            </div>
            <p className="text-lg font-semibold leading-tight">
              All Fan Meets and Fan Dates are limited to 30 minutes and must happen in public places.
            </p>
          </div>

          {/* Additional Info */}
          <p className="text-sm leading-relaxed pl-9">
            Fans cover transport fare upfront and creators may include any reasonable expenses in their transport fare price.
          </p>

          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle size={24} fill="#22c55e" className="text-white" />
            </div>
            <p className="text-lg font-semibold leading-tight">
              No scams. We handle everything with structure and transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyRulesBanner;
