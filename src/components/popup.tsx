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
   
    // CREATOR-FOCUSED POPUPS
    {
      icon: (
        <div className="w-6 h-6 text-yellow-400 hover:scale-110 transition-all duration-300 ease-in-out">🤝</div>
      ),
      text: "Meet Your Fans. Keep 100%. Stay Safe",
    },
    {
      icon: (
        <div className="w-6 h-6 text-blue-400 hover:scale-110 transition-all duration-300 ease-in-out">💫</div>
      ),
      text: "No cuts • No fees • Just pure connection",
    },
    {
      icon: (
        <div className="w-6 h-6 text-red-400 hover:scale-110 transition-all duration-300 ease-in-out">✅</div>
      ),
      text: "Verified creators only • Public meet‑ups only",
    },
    {
      icon: (
        <div className="w-6 h-6 text-orange-400 hover:scale-110 transition-all duration-300 ease-in-out">🎤</div>
      ),
      text: "Host Fan Meets, Fan Dates, Fan Calls and Exclusive Contents — all on your terms",
    },
    {
      icon: (
        <div className="w-6 h-6 text-green-400 hover:scale-110 transition-all duration-300 ease-in-out">🚕</div>
      ),
      text: "Fans cover transport fare upfront. Creators set their own transport fare price",
    },
    {
      icon: (
        <div className="w-6 h-6 text-purple-400 hover:scale-110 transition-all duration-300 ease-in-out">⏱️</div>
      ),
      text: "30‑minute cap • Public space only • You stay in control",
    },
    {
      icon: (
        <div className="w-6 h-6 text-pink-400 hover:scale-110 transition-all duration-300 ease-in-out">🌍</div>
      ),
      text: "Be part of the first platform making real fan meet‑ups safe, fair, and global",
    },
  ];


  useEffect(() => {
    let showTimer: any;

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
        // Move to next message (cycles infinitely)
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
  }, [animatingOut, messages.length]);

  // Fallback: Ensure popup continues cycling infinitely
  useEffect(() => {
    if (!isVisible && !animatingOut) {
      const fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isVisible, animatingOut]);

  // Additional safety: Force restart if somehow stuck
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!isVisible && !animatingOut) {
        console.log('🔄 Popup safety restart triggered');
        setIsVisible(true);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearTimeout(safetyTimer);
  }, [isVisible, animatingOut]);

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
