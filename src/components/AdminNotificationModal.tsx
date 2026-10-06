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
  const token = useSelector((s: RootState) => s.register.accesstoken);
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
            effectiveToken = effectiveToken || saved.accesstoken || saved.refreshtoken;
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
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center
                  bg-black/70 backdrop-blur-md
                  transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleDismiss}
    >
      <div
        className={`relative w-full sm:max-w-md bg-[#0d1220] border border-white/10
                    rounded-t-[28px] sm:rounded-2xl
                    shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.6)] sm:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.75)]
                    overflow-hidden transform transition-all duration-300 ease-out
                    ${visible
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#a89cff] via-[#c9bfff] to-[#a89cff]" />

        {/* Ambient brand glow */}
        <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#a89cff]/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#6c5ce7]/5 blur-[90px]" />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-5 right-4 sm:top-4 w-8 h-8 rounded-full flex items-center justify-center
                     text-slate-400 hover:text-white hover:bg-white/5 transition-colors z-10"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative px-6 sm:px-7 pt-5 sm:pt-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:pb-6">
          {/* Icon + badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative w-11 h-11 shrink-0">
              {/* Pulsing ring behind the icon */}
              <span className="absolute inset-0 rounded-xl bg-[#a89cff]/20 animate-ping [animation-duration:2.5s]" />
              <div className="relative w-11 h-11 rounded-xl bg-[#a89cff]/10 border border-[#a89cff]/20 flex items-center justify-center">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="MMEKO"
                  width={24}
                  height={24}
                  className="rounded-md object-cover"
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold
                             uppercase tracking-wider text-[#a89cff] bg-[#a89cff]/10 border border-[#a89cff]/20">
              <Megaphone className="w-3 h-3" />
              Announcement
            </span>
          </div>

          <h3 className="text-white text-xl sm:text-xl font-bold leading-snug mb-2 pr-6">
            {notification.title}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-7 line-clamp-4">
            {notification.message}
          </p>

          <div className="flex gap-3">
            {notification.hasLearnMore && (
              <button
                onClick={handleLearnMore}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl
                           text-sm font-semibold text-[#080b14] bg-[#a89cff] hover:bg-[#9384ff]
                           active:scale-[0.98] transition-all"
              >
                Learn More
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleDismiss}
              className={`${notification.hasLearnMore ? '' : 'flex-1'} inline-flex items-center justify-center
                         px-4 py-3 sm:py-2.5 rounded-xl text-sm font-medium text-slate-300
                         border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all`}
            >
              {notification.hasLearnMore ? 'Dismiss' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationModal;
