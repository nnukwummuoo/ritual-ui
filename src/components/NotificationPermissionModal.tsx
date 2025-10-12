"use client";

import React, { useState, useEffect } from 'react';
import { IoNotificationsOutline, IoClose } from 'react-icons/io5';

interface NotificationPermissionModalProps {
  onClose: () => void;
  onEnable: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ 
  onClose, 
  onEnable 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal after a short delay to let the page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <IoNotificationsOutline className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Enable Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Stay updated with instant notifications for:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">New messages from creators</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Support chat responses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Activity notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Fan meet requests</span>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            You can change this setting anytime in your profile settings.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={onEnable}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
