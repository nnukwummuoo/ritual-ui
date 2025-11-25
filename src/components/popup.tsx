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
    // Original messages
    {
      icon: (
        <FaGlobeAfrica className="w-6 h-6 text-blue-500 hover:scale-110 transition-all duration-300 ease-in-out" />
      ),
      text: "Asian & African creators are joining fast",
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
    
    // CREATOR-FOCUSED POPUPS
    {
      icon: (
        <div className="w-6 h-6 text-yellow-400 hover:scale-110 transition-all duration-300 ease-in-out">❌</div>
      ),
      text: "No scams • Real Asians and African VIP creators ",
    },
    {
      icon: (
        <div className="w-6 h-6 text-blue-400 hover:scale-110 transition-all duration-300 ease-in-out">🤖</div>
      ),
      text: "No bots • Only authentic connections",
    },
    {
      icon: (
        <div className="w-6 h-6 text-red-400 hover:scale-110 transition-all duration-300 ease-in-out">🪪</div>
      ),
      text: "No fraud • Real creators, real conversations",
    },
    {
      icon: (
        <div className="w-6 h-6 text-orange-400 hover:scale-110 transition-all duration-300 ease-in-out">🦁</div>
      ),
      text: "Real creators don't chase • They attract",
    },
    {
      icon: (
        <div className="w-6 h-6 text-green-400 hover:scale-110 transition-all duration-300 ease-in-out">🛡️</div>
      ),
      text: "No cuts • No fees • Just real connections",
    },
    {
      icon: (
        <div className="w-6 h-6 text-purple-400 hover:scale-110 transition-all duration-300 ease-in-out">🆓</div>
      ),
      text: "No catch • Free chat, real creators",
    },
    {
      icon: (
        <div className="w-6 h-6 text-pink-400 hover:scale-110 transition-all duration-300 ease-in-out">🔒</div>
      ),
      text: "No fake profiles • Verified creators only",
    },
    {
      icon: (
        <div className="w-6 h-6 text-teal-400 hover:scale-110 transition-all duration-300 ease-in-out">🎭</div>
      ),
      text: "No tricks • Respect for fans and creators",
    },
    {
      icon: (
        <div className="w-6 h-6 text-indigo-400 hover:scale-110 transition-all duration-300 ease-in-out">🧾</div>
      ),
      text: "Transparent from start to finish. Always",
    },
    {
      icon: (
        <div className="w-6 h-6 text-rose-400 hover:scale-110 transition-all duration-300 ease-in-out">💬</div>
      ),
      text: "No walls • No pay to message",
    },
    
    // FAN-FOCUSED POPUPS
    {
      icon: (
        <div className="w-6 h-6 text-yellow-500 hover:scale-110 transition-all duration-300 ease-in-out">🥇</div>
      ),
      text: "Meet who you admire — for real, not fantasy",
    },
    {
      icon: (
        <div className="w-6 h-6 text-blue-500 hover:scale-110 transition-all duration-300 ease-in-out">💬</div>
      ),
      text: "One click, one connection, no fake promises",
    },
    {
      icon: (
        <div className="w-6 h-6 text-pink-500 hover:scale-110 transition-all duration-300 ease-in-out">🌸</div>
      ),
      text: "Respect first •  Connection next",
    },
    {
      icon: (
        <div className="w-6 h-6 text-green-500 hover:scale-110 transition-all duration-300 ease-in-out">⚡</div>
      ),
      text: "Safe, verified, and real — always",
    },
    {
      icon: (
        <div className="w-6 h-6 text-red-500 hover:scale-110 transition-all duration-300 ease-in-out">💬</div>
      ),
      text: "No payments • Free entry, creator dignity intact",
    },
    {
      icon: (
        <div className="w-6 h-6 text-teal-500 hover:scale-110 transition-all duration-300 ease-in-out">🦢</div>
      ),
      text: "No pressure, just genuine connection",
    },
    {
      icon: (
        <div className="w-6 h-6 text-orange-500 hover:scale-110 transition-all duration-300 ease-in-out">🛡️</div>
      ),
      text: "No spam • Safe space for creators and fans",
    },
    {
      icon: (
        <div className="w-6 h-6 text-indigo-500 hover:scale-110 transition-all duration-300 ease-in-out">🌿</div>
      ),
      text: "No pressure • Fans welcome, creators respected",
    },
    {
      icon: (
        <div className="w-6 h-6 text-amber-500 hover:scale-110 transition-all duration-300 ease-in-out">🏆</div>
      ),
      text: "Be more than a viewer — be a fan that matters",
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
