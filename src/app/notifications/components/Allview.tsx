/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications } from "@/store/profile";
import { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/RingLoader";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export const Allview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = session?.token;

  const { notifications, notifications_stats } = useSelector(
    (state: RootState) => state.profile
  );
  const userId = useSelector((state: RootState) => state.profile.userId);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && token) {
      dispatch(getNotifications({ userid: userId, token }));
    }
  }, [dispatch, userId, token]);

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
      {notifications.map((note: any) => {
        const message = note.message.toLowerCase();

        // determine status from message
        let status: "approved" | "rejected" | "pending" = "pending";
        if (message.includes("approve")) status = "approved";
        else if (message.includes("reject")) status = "rejected";
        else if (message.includes("follow") || message.includes("unfollow") || message.includes("like") || message.includes("comment") || message.includes("message") || message.includes("booking") || message.includes("request")) {
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
        } else if (message.includes("booking") || message.includes("request")) {
          title = "Booking Notification";
        }

        return (
          <div
            key={note._id}
            className="relative bg-[#0B0F1A]/70 backdrop-blur-xl border border-slate-800 shadow-lg 
                       rounded-2xl p-6 w-full max-w-md text-white transition hover:border-slate-700"
          >
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
                  <button
                    className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                              rounded-lg text-sm text-slate-200 transition">
                    Reapply Later
                  </button>
                </div>
              )}

              {/* Follow/Unfollow notifications show appropriate buttons */}
              {(title === "Follow Notification" || title === "Unfollow Notification") && (
                <div className="pt-2">
                  <Link href="/creators">
                    <button
                      className="px-4 py-2 border border-slate-700 hover:border-slate-500 
                                rounded-lg text-sm text-slate-200 transition">
                      View Creators
                    </button>
                  </Link>
                </div>
              )}

              {/* Booking notifications show activity button */}
              {title === "Booking Notification" && (
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
