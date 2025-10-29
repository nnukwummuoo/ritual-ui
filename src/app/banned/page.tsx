"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/registerSlice";
import { ToastContainer } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";

export default function BannedPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear any stored authentication data
    if (typeof window !== "undefined") {
      localStorage.removeItem("login");
      localStorage.removeItem("user");
      sessionStorage.clear();
    }
    
    // Dispatch logout action to clear Redux state
    dispatch(logout());
  }, [dispatch]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <>
      <ToastContainer 
        position="top-center" 
        theme="dark" 
        style={{ zIndex: 999999 }}
        toastClassName="!z-[999999]"
        bodyClassName="!z-[999999]"
      />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {/* Ban Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" 
              />
            </svg>
          </div>
        </div>

        {/* Ban Message */}
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Account Banned
        </h1>
        
        <p className="text-gray-300 text-lg mb-6">
          This account has been banned for violating our rules
        </p>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">
            <strong>Notice:</strong> Your account has been permanently suspended due to violations of our Terms of Service. 
            This action was taken to maintain a safe and respectful environment for all users.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Return to Homepage
          </button>
          
          <p className="text-gray-400 text-sm">
            If you believe this is an error, please contact our support team.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-500 text-xs">
            © 2024 MMEKO. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </>
  );
}