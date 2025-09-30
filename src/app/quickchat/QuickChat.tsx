/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { QuickChatList } from "./_components/QuickChatList";

export const QuickChatView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [color] = useState<string>("#c2d0e1");
  const [userid, setUserid] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Get userid from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.userID) {
            setUserid(data.userID);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
          console.error("[QuickChat] Error retrieving user ID:", error);
      }
    }
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="w-full h-full mx-auto">
        {/* Header */}
        <div className=" border-b  p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-blue-700/50 rounded-full transition-colors"
              >
                <FaAngleLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">QuickChat</h1>
            </div>
            <button className="p-2 hover:bg-blue-700/50 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 ">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Search by name or message..."
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto h-full">
          <QuickChatList userid={userid} isLoggedIn={isLoggedIn} />
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-6 z-50">
          <button className="w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
