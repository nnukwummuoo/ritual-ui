"use client";

import React, { useState, useEffect } from 'react';
import { IoNotificationsOutline, IoClose } from 'react-icons/io5';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';

interface NotificationPermissionModalProps {
  onClose: () => void;
  onEnable?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ 
  onClose, 
  onEnable 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    showLocalNotification
  } = usePushNotificationContext();

  useEffect(() => {
    // Only show modal if notifications are supported and user hasn't subscribed yet
    if (isSupported && !isSubscribed && permission !== 'denied') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Subscribe to push notifications
      const success = await subscribe();
      
      if (success) {
        // Show a test notification to confirm it's working
        await showLocalNotification('Welcome to Mmeko! You\'ll now receive notifications for messages, activities, and more.', {
          title: 'Notifications Enabled! 🎉',
          type: 'activity'
        });
        
        // Call the optional onEnable callback
        if (onEnable) {
          onEnable();
        }
        
        // Close the modal
        onClose();
      } else {
        setError('Failed to enable notifications. Please try again.');
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError('An error occurred while enabling notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

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
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            disabled={isLoading}
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
              <span className="text-gray-300">New messages from creators/fans</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Chat Support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Activity notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Fan requests</span>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            You can change this setting anytime in your profile settings.
          </p>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Maybe Later
          </button>
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enabling...
              </>
            ) : (
              'Enable Notifications'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
