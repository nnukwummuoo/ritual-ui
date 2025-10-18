"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getprofile } from "@/store/profile";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const Cancel: React.FC = () => {
  const userId =  useSelector((state: RootState) => state.profile.userId);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-gray-700 mb-6">
          Your payment was cancelled. No changes have been made to your gold balance.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/buy-gold")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Buy Gold
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cancel;