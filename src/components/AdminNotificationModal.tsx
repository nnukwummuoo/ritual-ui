"use client";

import React, { useState, useEffect } from 'react';
import { URL } from '@/api/config';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';

interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  hasLearnMore: boolean;
  learnMoreUrl?: string;
  createdAt: string;
  targetGender: string;
}

const AdminNotificationModal: React.FC = () => {
  const [notification, setNotification] = useState<AdminNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const userGender = useSelector((s: RootState) => s.profile.gender);
  const isCreator = useSelector((s: RootState) => s.profile.creator_verified);
  const router = useRouter();

  useEffect(() => {
    // Only run once to prevent re-initialization
    if (hasInitialized) {
      return;
    }

    const fetchAdminNotification = async () => {
      // Fallback to localStorage if Redux state is not yet hydrated
      let effectiveUserId = userid;
      let effectiveToken = token;
      if ((!effectiveUserId || !effectiveToken) && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const saved = JSON.parse(raw);
            effectiveUserId = effectiveUserId || saved.userID;
            effectiveToken = effectiveToken || saved.refreshtoken || saved.accesstoken;
          }
        } catch (error) {
          // Silent fail for localStorage read
        }
      }

      if (!effectiveUserId || !effectiveToken) {
        setHasInitialized(true);
        return;
      }
      
      try {
        setLoading(true);
        
        const response = await fetch(`${URL}/getAdminNotification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify({ userid: effectiveUserId })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.notification) {
            setNotification(data.notification);
            
            // Check if this notification was already dismissed
            const dismissedId = localStorage.getItem('dismissedAdminNotification');
            
            if (dismissedId === data.notification._id) {
              setIsDismissed(true);
            } else {
              setIsOpen(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admin notification:', error);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    fetchAdminNotification();
  }, [userid, token, userGender, isCreator, hasInitialized]);

  const checkNotificationTarget = (notification: AdminNotification): boolean => {
    switch (notification.targetGender) {
      case 'all':
        return true;
      case 'creators':
        return isCreator;
      case 'male':
        return userGender?.toLowerCase() === 'male';
      case 'female':
        return userGender?.toLowerCase() === 'female';
      default:
        return true;
    }
  };

  const handleDismiss = () => {
    if (notification) {
      localStorage.setItem('dismissedAdminNotification', notification._id);
      setIsDismissed(true);
      setIsOpen(false);
    }
  };

  const handleLearnMore = () => {
    if (notification) {
      // Navigate to the learn more page
      router.push(`/learn-more/${notification._id}`);
      setIsOpen(false);
    }
  };


  if (loading) {
    return null; // Don't show loading state
  }

  if (!notification) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          aria-label="Dismiss notification"
        >
          ×
        </button>
        
        <div className="pr-8">
          <h3 className="text-xl font-bold text-blue-500 mb-4">{notification.title}</h3>
          <p className="text-white text-sm mb-6 leading-relaxed">{notification.message}</p>
          
          <div className="flex gap-3">
            {notification.hasLearnMore && (
              <button
                onClick={handleLearnMore}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Learn More
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationModal;
