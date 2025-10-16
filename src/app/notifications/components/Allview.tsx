/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, markNotificationsSeen } from "@/store/profile";
import { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/RingLoader";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useNotificationIndicator } from "@/hooks/useNotificationIndicator";

export const Allview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = session?.token;

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
        else if (message.includes("follow") || message.includes("unfollow") || message.includes("like") || message.includes("comment") || message.includes("message") || message.includes("request") || message.includes("request") || message.includes("missed") || message.includes("accept") || message.includes("decline") || message.includes("cancel") || message.includes("complete")) {
          status = "approved"; // These are informational notifications, not pending actions
        }

        // determine title based on notification type
        let title = "Application Status";
        if (message.includes("follow")) {
          title = "Follow Notification";
        } else if (message.includes("unfollow")) {
          title = "Unfollow Notification";
        } else if (message.includes("like")) {
          title = "Like Notification";
        } else if (message.includes("comment")) {
          title = "Comment Notification";
        } else if (message.includes("message")) {
          title = "Message Notification";
        } else if (message.includes("request") || message.includes("request")) {
          title = "Request Notification";
        } else if (message.includes("missed") && message.includes("call")) {
          title = "Missed Fan Call";
        } else if (message.includes("fan meet") || message.includes("fan date")) {
          title = "Fan Meet Request";
        } else if (message.includes("accept") || message.includes("decline") || message.includes("cancel") || message.includes("complete")) {
          title = "Activity Update";
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
                {status === "approved" && (
                  <div className="bg-green-500/10 p-1.5 rounded-full">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  </div>
                )}
                {status === "rejected" && (
                  <div className="bg-red-500/10 p-1.5 rounded-full">
                    <XCircle className="text-red-500 w-5 h-5" />
                  </div>
                )}
                {status === "pending" && (
                  <div className="bg-yellow-500/10 p-1.5 rounded-full">
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
                      Creator Portfolio
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

              {/* Fan meet request notifications show activity button */}
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

              {/* Pending has no button */}
              <span className="absolute right-4 bottom-3 text-[10px] text-slate-500">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
