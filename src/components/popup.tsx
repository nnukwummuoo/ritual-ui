"use client";
import { useState, useEffect } from "react";
import {
  FaGlobeAfrica,
  FaHandshake,
  FaDollarSign,
  FaBan,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
  FaGift,
} from "react-icons/fa";

export function PopUp() {
  const [isVisible, setIsVisible] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = [
    {
      icon: (
        <FaGlobeAfrica className="w-6 h-6 text-blue-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Asian & African creators are joining fast",
    },
    {
      icon: (
        <FaHandshake className="w-6 h-6 text-green-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Meet fans, get paid without showing skin",
    },
    {
      icon: (
        <FaDollarSign className="w-6 h-6 text-yellow-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Start earning from day 1 — no approval delays",
    },
    {
      icon: (
        <FaBan className="w-6 h-6 text-red-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "No subscriptions. No nudity required",
    },
    {
      icon: (
        <FaClock className="w-6 h-6 text-purple-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Set your own schedule — full control",
    },
    {
      icon: (
        <FaPhone className="w-6 h-6 text-teal-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Get paid for every Fan Call — no livestream pressure",
    },
    {
      icon: (
        <FaMapMarkerAlt className="w-6 h-6 text-pink-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Fan Meet —  instant reward (fans cover transport)",
    },
    {
      icon: (
        <FaHeart className="w-6 h-6 text-rose-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Fan Date — Your time, your rules — fans cover all costs",
    },
    {
      icon: (
        <FaGift className="w-6 h-6 text-orange-500 hover:scale-110 transition-transform icon-glow" />
      ),
      text: "Keep 100% of your earnings forever",
    },
  ];

  useEffect(() => {
    let showTimer: any, hideTimer: any;

    if (isVisible && !animatingOut) {
      // Show for 5 seconds, then start animating out
      showTimer = setTimeout(() => {
        setAnimatingOut(true);
      }, 5000);
    } else if (animatingOut) {
      // Animate out for 500ms, then hide and prepare next message
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setAnimatingOut(false);
        setCurrentMessageIndex(
          (prevIndex) => (prevIndex + 1) % messages.length
        );
        setTimeout(() => setIsVisible(true), 500);
      }, 500);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible, animatingOut]);

  if (!isVisible) return null;

  const { icon, text } = messages[currentMessageIndex];

  return (
    <div className="fixed bottom-6 max-[600px]:bottom-28 left-0 right-0 z-40 flex justify-center px-4 sm:bottom-24">
      <div
        className={`bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md w-full border border-gray-700
          transform transition-all duration-500 ${
            animatingOut ? "animate-slide-down" : "animate-slide-up"
          }`}
      >
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-4">
            {icon}
            <p className="text-sm sm:text-base">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
