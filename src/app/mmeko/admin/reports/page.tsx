import React from "react";
import { FaHourglassHalf } from "react-icons/fa";

const Reports = () => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <FaHourglassHalf size={60} className="text-orange-600 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold">Coming Soon</h1>
        <p className="text-gray-400">We're working hard to bring this page to life. Stay tuned</p>
      </div>
    </div>
  );
};

export default Reports;
