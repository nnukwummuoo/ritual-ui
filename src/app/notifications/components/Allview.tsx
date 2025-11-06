/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, markNotificationsSeen } from "@/store/profile";
import { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/RingLoader";
import { CheckCircle, XCircle, Clock, Star, Phone, Heart, Handshake, MessageCircle, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useNotificationIndicator } from "@/hooks/useNotificationIndicator";

// Utility function to format relative time (same as in post components)
const formatRelativeTime = (timestamp: string | number | Date): string => {
  try {
    const now = new Date();
    let time: Date;
    
    // Handle different timestamp formats
    if (typeof timestamp === 'number') {
      // If it's a number, check if it's in seconds or milliseconds
      time = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    } else if (typeof timestamp === 'string') {
      // Try to parse the string - first check if it's a numeric string
      if (/^\d+$/.test(timestamp)) {
        // It's a numeric string, treat it as a number
        const numTimestamp = parseInt(timestamp, 10);
        time = new Date(numTimestamp < 10000000000 ? numTimestamp * 1000 : numTimestamp);
      } else {
        // Try to parse as a regular date string
        time = new Date(timestamp);
      }
    } else {
      time = new Date(timestamp);
    }
    
    // Check if the date is valid
    if (isNaN(time.getTime())) {
      // Try alternative parsing methods for invalid timestamps
      if (typeof timestamp === 'string') {
        // Try parsing as ISO string or other formats
        const altTime = new Date(timestamp.replace(/[^\d]/g, ''));
        if (!isNaN(altTime.getTime())) {
          time = altTime;
        } else {
          return 'recently'; // Fallback for completely invalid timestamps
        }
      } else if (typeof timestamp === 'number') {
        // Try different number formats
        if (timestamp > 1000000000000) {
          // Already in milliseconds
          time = new Date(timestamp);
        } else if (timestamp > 1000000000) {
          // In seconds, convert to milliseconds
          time = new Date(timestamp * 1000);
        } else {
          return 'recently'; // Fallback for very small numbers
        }
      } else {
        return 'recently'; // Fallback for other types
      }
      
      // Final check after alternative parsing
      if (isNaN(time.getTime())) {
        return 'recently';
      }
    }
    
    // Check if the timestamp is in the future (more than 1 hour ahead)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    // If the timestamp is in the future, show a different message
    if (diffInSeconds < 0) {
      const futureDiff = Math.abs(diffInSeconds);
      if (futureDiff < 3600) { // Less than 1 hour in the future
        return 'in a moment';
      } else if (futureDiff < 86400) { // Less than 1 day in the future
        const hours = Math.floor(futureDiff / 3600);
        return `in ${hours}h`;
      } else if (futureDiff < 31536000) { // Less than 1 year in the future
        const days = Math.floor(futureDiff / 86400);
        return `in ${days}d`;
      } else {
        // If it's more than a year in the future, it's likely a data issue
        return 'recently';
      }
    }

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  } catch (error) {
    return 'recently'; // More user-friendly fallback
  }
};

export const Allview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = session?.token;
  
  // Get user ID from localStorage
  const [userID, setUserID] = useState<string>('');
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserID(parsedUser.userID || '');
    }
  }, []);

  const { notifications, notifications_stats } = useSelector(
    (state: RootState) => state.profile
  );
  const userId = useSelector((state: RootState) => state.profile.userId);
  
  // Get notification indicator data
  const { hasUnread, unreadCount, totalCount } = useNotificationIndicator();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && token) {
      dispatch(getNotifications({ userid: userId, token }));
    }
  }, [dispatch, userId, token]);

  // Mark notifications as seen when component mounts (user is viewing notifications)
  useEffect(() => {
    if (userId && token && notifications && notifications.length > 0) {
      const hasUnreadNotifications = notifications.some(notification => !notification.seen);
      if (hasUnreadNotifications) {
        dispatch(markNotificationsSeen({ userid: userId, token }));
      }
    }
  }, [dispatch, userId, token, notifications]);

  useEffect(() => {
    setLoading(notifications_stats === "loading");
  }, [notifications_stats]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <PacmanLoader color="#fff" loading={true} size={35} />
        <p className="text-slate-400 text-xs mt-2">please wait...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p className="text-slate-400 text-xs">
          Notifications about your account will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-4 space-y-4 min-h-screen">
      {/* Notification Header */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-[#0B0F1A]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {unreadCount} new
                </div>
              )}
              <span className="text-slate-400 text-sm">
                {totalCount} total
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {notifications.map((note: any) => {
        const message = note.message.toLowerCase();

        // determine status from message
        let status: "approved" | "rejected" | "pending" = "pending";
        if (message.includes("approve")) status = "approved";
        else if (message.includes("reject")) status = "rejected";
        else if (message.includes("follow") || message.includes("unfollow") || message.includes("like") || message.includes("comment") || message.includes("message") || message.includes("request") || message.includes("request") || message.includes("missed") || message.includes("accept") || message.includes("decline") || message.includes("cancel") || message.includes("complete") || message.includes("rating") || message.includes("star")) {
          status = "approved"; // These are informational notifications, not pending actions
        }

        // determine title based on notification type
        let title = "MMEKO"; // Default fallback
        if (message.includes("application")) {
          title = "Application Status";
        } else if (message.includes("follow")) {
          title = "Follow Notification";
        } else if (message.includes("unfollow")) {
          title = "Unfollow Notification";
        } else if (message.includes("like")) {
          title = "Like Notification";
        } else if (message.includes("comment")) {
          title = "Comment Notification";
        } else if (message.includes("message")) {
          title = "Message Notification";
        }
        // } else if (message.includes("request") || message.includes("request")) {
        //   title = "Request Notification";
        // }
         else if (message.includes("missed") && message.includes("call")) {
          title = "Missed Fan Call";
        } else if (message.includes("fan meet")) {
          title = "Fan Meet Request";
         }
        //  else if (message.includes("accept") || message.includes("decline") || message.includes("cancel") || message.includes("complete")) {
        //   title = "Activity Update";
        // }
        else if (message.includes("fan date")) {
          title = "Fan Date Request";
        }else if (message.includes("fan call") || message.includes("Fan Call")) {
          title = "Fan Call Request";
        } else if (message.includes("rating") || message.includes("star")) {
          title = "Rating Notification";
        }

        return (
          <div
            key={note._id}
            className={`relative bg-[#0B0F1A]/70 backdrop-blur-xl border shadow-lg 
                       rounded-2xl p-6 w-full max-w-md text-white transition hover:border-slate-700 ${
                         !note.seen 
                           ? 'border-blue-500 bg-blue-500/5' 
                           : 'border-slate-800'
                       }`}
          >
            {/* Unread indicator */}
            {!note.seen && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            <div className="flex flex-col items-start space-y-3">
              {/* Header + Icon */}
              <div className="flex items-center space-x-2">
                {title === "Admin Notification" && (
                  <div className="bg-purple-500/10 p-1 rounded-full">
                    <Shield className="text-purple-500 w-5 h-5" />
                  </div>
                )}
                {title === "Rating Notification" && (
                  <div className="bg-yellow-500/10 p-1 rounded-full">
                    <Star className="text-yellow-500 w-5 h-5 fill-current" />
                  </div>
                )}
                {title === "Missed Fan Call" && (
                  <div className="bg-red-500/10 p-1 rounded-full">
                    <Phone className="text-red-500 w-5 h-5" />
                  </div>
                )}
                {title === "Fan Date Request" && (
                  <div className="bg-pink-500/10 p-1 rounded-full">
                    <Heart className="text-pink-500 w-5 h-5 fill-current" />
                  </div>
                )}
                {title === "Fan Meet Request" && (
                  <div className="bg-green-500/10 p-1 rounded-full">
                    <Handshake className="text-green-500 w-5 h-5" />
                  </div>
                )}
                {title === "Fan Call Request" && (
                  <div className="bg-blue-500/10 p-1 rounded-full">
                    <Phone className="text-blue-500 w-5 h-5" />
                  </div>
                )}
                {title === "Like Notification" && (
                  <div className="bg-red-500/10 p-1 rounded-full">
                    <Heart className="text-red-500 w-5 h-5 fill-current" />
                  </div>
                )}
                {title === "Message Notification" && (
                  <div className="bg-blue-500/10 p-1 rounded-full">
                    <MessageCircle className="text-blue-500 w-5 h-5" />
                  </div>
                )}
                {(title === "Follow Notification" || title === "Unfollow Notification") && (
                  <div className="bg-blue-500/10 p-1 rounded-full">
                    <Image src="/icons/following.png" alt="Users" width={28} height={28} />
                  </div>
                )}
                {title !== "Admin Notification" && title !== "Rating Notification" && title !== "Missed Fan Call" && title !== "Fan Date Request" && title !== "Fan Meet Request" && title !== "Fan Call Request" && title !== "Like Notification" && title !== "Message Notification" && title !== "Follow Notification" && title !== "Unfollow Notification" && status === "approved" && (
                  <div className="bg-green-500/10 p-1 rounded-full">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  </div>
                )}
                {title !== "Admin Notification" && title !== "Rating Notification" && title !== "Missed Fan Call" && title !== "Fan Date Request" && title !== "Fan Meet Request" && title !== "Fan Call Request" && title !== "Like Notification" && title !== "Message Notification" && title !== "Follow Notification" && title !== "Unfollow Notification" && status === "rejected" && (
                  <div className="bg-red-500/10 p-1 rounded-full">
                    <XCircle className="text-red-500 w-5 h-5" />
                  </div>
                )}
                {title !== "Admin Notification" && title !== "Rating Notification" && title !== "Missed Fan Call" && title !== "Fan Date Request" && title !== "Fan Meet Request" && title !== "Fan Call Request" && title !== "Like Notification" && title !== "Message Notification" && title !== "Follow Notification" && title !== "Unfollow Notification" && status === "pending" && (
                  <div className="bg-yellow-500/10 p-1 rounded-full">
                    <Clock className="text-yellow-500 w-5 h-5" />
                  </div>
                )}

                <h2 className="text-base sm:text-lg font-semibold">
                  {title}
                </h2>
              </div>

              {/* Message */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {note.message}
              </p>

              {/* Buttons */}
              {status === "approved" && title === "Application Status" && (
                <div className="pt-2">
                  <Link href="/creator/create">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      Create Portfolio
                    </button>
                  </Link>
                </div>
              )}

              {status === "rejected" && (
                <div className="pt-2">
                  <Link href="/be-a-creator/"> 
                  <button
                    className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                              rounded-lg text-sm text-slate-200 transition">
                    Reapply Later
                  </button>
                  </Link>
                </div>
              )}

              {/* Follow/Unfollow notifications show appropriate buttons */}
              {(title === "Follow Notification" || title === "Unfollow Notification") && (
                <div className="pt-2">
                  <Link href="/following">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Following
                    </button>
                  </Link>
                </div>
              )}

              {/* request notifications show activity button */}
              {title === "Request Notification" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Fan Date Request notifications show activity button */}
              {title === "Fan Date Request" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Fan Meet Request notifications show activity button */}
              {title === "Fan Meet Request" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Fan Call Request notifications show activity button */}
              {title === "Fan Call Request" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Message notifications show messages button */}
              {title === "Message Notification" && (
                <div className="pt-2">
                  <Link href="/message">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Messages
                    </button>
                  </Link>
                </div>
              )}

              {/* Missed call notifications show activity button */}
              {title === "Missed Fan Call" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Activity update notifications show activity button */}
              {title === "Activity Update" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Rating notifications show activity button */}
              {title === "Rating Notification" && (
                <div className="pt-2">
                  <Link href="/notifications/activity">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Activity
                    </button>
                  </Link>
                </div>
              )}

              {/* Pending has no button */}
              <span className="absolute right-4 bottom-3 text-[10px] text-slate-500">
                {formatRelativeTime(note.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
