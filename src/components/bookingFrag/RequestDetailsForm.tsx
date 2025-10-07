"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "material-react-toastify";

interface RequestDetailsFormProps {
  onDone: (details: { date: string; time: string; venue: string }) => void;
  onCancel: () => void;
  creatorName: string;
  creatorType: string;
  price: number;
}

export const RequestDetailsForm: React.FC<RequestDetailsFormProps> = ({
  onDone,
  onCancel,
  creatorName,
  creatorType,
  price,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");

  const handleSubmit = async () => {
    if (!date || !time || !venue) {
      toast.error("Please fill in all fields", { autoClose: 2000 });
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Please select a future date", { autoClose: 2000 });
      return;
    }

    onDone({ date, time, venue });
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 12); // 12 months from now
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header with lion image */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src="/lion-badge.png"
              alt="Lion Badge"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Please Enter Request Details</h2>
          <p className="text-gray-300 text-sm">
            Request {creatorType} with {creatorName}
          </p>
          <p className="text-yellow-400 font-semibold mt-2">
            💰 {price} GOLD will be deducted from your balance
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* Date Field */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enter Date:</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={getMaxDate()}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none w-40"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                ▼
              </span>
            </div>
          </div>

          {/* Time Field */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Enter Time:</label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none w-40"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                ▼
              </span>
            </div>
          </div>

          {/* Venue Field */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Input Venue:</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Enter venue location"
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none w-40"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        {/* Request Fan Meet Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            🎯
          </span>
          Request Fan meet
        </button>
      </div>
    </div>
  );
};
