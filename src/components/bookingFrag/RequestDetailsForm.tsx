"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "material-react-toastify";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time || !venue) {
      toast.error("Please fill in all fields", { autoClose: 2000 });
      return;
    }

    // Validate date is within allowed range (today to 13 days from now)
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 13);
    
    if (selectedDate < today) {
      toast.error("Please select today or a future date", { autoClose: 2000 });
      return;
    }
    
    if (selectedDate > maxDate) {
      toast.error("Please select a date within the next 13 days", { autoClose: 2000 });
      return;
    }

    onDone({ date, time, venue });
  };


  // Calendar helper functions
  const getAvailableDates = () => {
    const today = new Date();
    const startDate = new Date(today); // Allow today
    const endDate = new Date();
    endDate.setDate(today.getDate() + 13); // 13 days from today
    
    return { startDate, endDate };
  };

  const isDateAvailable = (date: Date) => {
    const { startDate, endDate } = getAvailableDates();
    return date >= startDate && date <= endDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };


  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (isDateAvailable(selectedDate)) {
      setDate(formatDateForInput(selectedDate));
      setShowCalendar(false); // Close calendar after selection
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isAvailable = isDateAvailable(currentDate);
      const isSelected = currentDate.toISOString().split('T')[0] === date;
      const isTodayDate = isToday(currentDate);
      
      days.push(
        <button
          key={i}
          onClick={() => handleDateSelect(currentDate)}
          disabled={!isAvailable}
          className={`
            w-8 h-8 text-xs rounded-full transition-all duration-200 flex items-center justify-center
            ${!isCurrentMonth ? 'text-gray-500' : ''}
            ${isTodayDate ? 'bg-blue-500 text-white font-bold hover:bg-blue-600 cursor-pointer' : ''}
            ${isAvailable && !isTodayDate ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' : ''}
            ${!isAvailable && isCurrentMonth && !isTodayDate ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}
            ${isSelected ? 'ring-2 ring-yellow-400' : ''}
          `}
        >
          {currentDate.getDate()}
        </button>
      );
    }
    
    return days;
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
           {/* Date Selection Field */}
           <div className="space-y-2">
             <label className="text-white font-medium">Select Date:</label>
             <button
               onClick={() => setShowCalendar(true)}
               className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none text-left flex items-center justify-between hover:bg-gray-600 transition-colors"
             >
               <span>
                 {date ? new Date(date).toLocaleDateString('en-US', { 
                   weekday: 'long', 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 }) : 'Click to select date'}
               </span>
               <span className="text-gray-400">📅</span>
             </button>
             <p className="text-xs text-gray-400 text-right">
               Available: Today + 13 days
             </p>
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

        {/* Request Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            {creatorType === "Fan call" || creatorType === "Fan Call" ? "📞" : 
             creatorType === "Fan date" || creatorType === "Fan Date" ? "💕" : 
             "🎯"}
          </span>
          Request {creatorType}
         </button>
       </div>

       {/* Calendar Modal */}
       {showCalendar && (
         <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-75">
           <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
             {/* Calendar Header */}
             <div className="flex items-center justify-between mb-4">
               <button
                 onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                 className="text-white hover:text-yellow-400 transition-colors"
               >
                 <IoChevronBack className="w-6 h-6" />
               </button>
               <h3 className="text-white font-semibold text-lg">
                 {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </h3>
               <button
                 onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                 className="text-white hover:text-yellow-400 transition-colors"
               >
                 <IoChevronForward className="w-6 h-6" />
               </button>
             </div>
             
             {/* Calendar Grid */}
             <div className="grid grid-cols-7 gap-1 mb-3">
               {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                 <div key={day} className="text-center text-xs text-gray-400 font-medium py-2">
                   {day}
                 </div>
               ))}
             </div>
             
             <div className="grid grid-cols-7 gap-1 mb-4">
               {renderCalendar()}
             </div>
             
             {/* Legend */}
             <div className="flex flex-wrap gap-4 text-xs mb-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                 <span className="text-gray-300">Today</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 <span className="text-gray-300">Available</span>
               </div>
             </div>
             
             {/* Close Button */}
             <button
               onClick={() => setShowCalendar(false)}
               className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
             >
               Close
             </button>
           </div>
         </div>
       )}
     </div>
   );
 };
