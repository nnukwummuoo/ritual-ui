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
        <FaGlobeAfrica className="w-6 h-6 text-blue-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Asian & African creators are joining fast",
    },
    {
      icon: (
        <FaHandshake className="w-6 h-6 text-green-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Meet fans, get paid without showing skin",
    },
    {
      icon: (
        <FaDollarSign className="w-6 h-6 text-yellow-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Start earning from day 1 — no approval delays",
    },
    {
      icon: (
        <FaBan className="w-6 h-6 text-red-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "No subscriptions. No nudity required",
    },
    {
      icon: (
        <FaClock className="w-6 h-6 text-purple-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Set your own schedule — full control",
    },
    {
      icon: (
        <FaPhone className="w-6 h-6 text-teal-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Get paid for every Fan Call — no livestream pressure",
    },
    {
      icon: (
        <FaMapMarkerAlt className="w-6 h-6 text-pink-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Fan Meet —  instant reward (fans cover transport)",
    },
    {
      icon: (
        <FaHeart className="w-6 h-6 text-rose-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Fan Date — Your time, your rules — fans cover all costs",
    },
    {
      icon: (
        <FaGift className="w-6 h-6 text-orange-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Keep 100% of your earnings forever",
    },
  ];


  useEffect(() => {
    let showTimer: any, hideTimer: any, nextMessageTimer: any;

    if (isVisible && !animatingOut) {
      // Show for 4 seconds, then start animating out
      showTimer = setTimeout(() => {
        setAnimatingOut(true);
      }, 4000);
    }

    return () => {
      clearTimeout(showTimer);
    };
  }, [isVisible, animatingOut, currentMessageIndex]);

  useEffect(() => {
    let hideTimer: any, nextMessageTimer: any;

    if (animatingOut) {
      // Animate out for 300ms, then hide and prepare next message
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setAnimatingOut(false);
        setCurrentMessageIndex(
          (prevIndex) => (prevIndex + 1) % messages.length
        );
        // Shorter delay before showing next message
        nextMessageTimer = setTimeout(() => {
          setIsVisible(true);
        }, 200);
      }, 300);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextMessageTimer);
    };
  }, [animatingOut, messages.length, currentMessageIndex]);

  // Fallback: If popup should be visible but isn't, show it after a delay
  useEffect(() => {
    if (!isVisible && !animatingOut && currentMessageIndex > 0) {
      const fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isVisible, animatingOut, currentMessageIndex]);

  if (!isVisible) return null;

  const { icon, text } = messages[currentMessageIndex];

  return (
    <div className="fixed bottom-2 max-[600px]:bottom-4 left-0 right-0 z-40 flex justify-center px-4 sm:bottom-24">
      <div
        className={`bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md w-full border border-gray-700
          transform transition-all duration-300 ease-in-out ${
            animatingOut ? "translate-y-4 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"
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
