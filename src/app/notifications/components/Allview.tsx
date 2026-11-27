/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, markNotificationsSeen, getprofile } from "@/store/profile";
import { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import PacmanLoader from "react-spinners/RingLoader";
import { CheckCircle, XCircle, Clock, Star, Phone, Heart, Handshake, MessageCircle, ShoppingCart, Wallet, UserPlus, Eye, Bell, ArrowRight } from "lucide-react";
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

    const diffInMonths = Math.round(diffInDays / 30);
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
const { notifications, notifications_stats } = useSelector(
  (state: RootState) => state.profile
);
const myPortfolioId = useSelector((state: RootState) => (state.profile as any)?.creator_portfolio_id as string | undefined);
const reduxProfileUserId = useSelector((state: RootState) => state.profile.userId);
const reduxRegisterUserId = useSelector((state: RootState) => state.register.userID);
const [localUserId, setLocalUserId] = useState<string>('');

useEffect(() => {
  try {
    const raw = localStorage.getItem('login');
    if (raw) {
      const d = JSON.parse(raw);
      setLocalUserId(d.userID || d.userId || '');
    }
  } catch {}
}, []);

const userId = reduxProfileUserId || reduxRegisterUserId || localUserId;

  // Get notification indicator data
  const { hasUnread, unreadCount, totalCount } = useNotificationIndicator();

  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (userId && token) {
      dispatch(getNotifications({ userid: userId, token }));
      // Needed so an approved creator's "Create Portfolio" notification button
      // can correctly become "My Portfolio" if they already have one.
      dispatch(getprofile({ userid: userId, token }));
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
      <div className="w-full min-h-[50vh] flex flex-col justify-center items-center">
        <PacmanLoader color="#fff" loading={true} size={35} />
        <p className="text-slate-400 text-xs mt-3">please wait...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
          <Bell className="w-7 h-7 text-slate-500" />
        </div>
        <p className="text-white font-semibold">No notifications yet</p>
        <p className="text-slate-500 text-sm mt-1">
          Notifications about your account will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto pb-10 space-y-3">
      {/* Summary row */}
      <div className="flex items-center justify-between px-1 pb-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Recent</p>
        <div className="flex items-center gap-2">
          {hasUnread && (
            <span className="bg-rose-500/15 text-rose-300 border border-rose-500/25 text-[11px] px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
          <span className="text-slate-500 text-xs">{totalCount} total</span>
        </div>
      </div>

      {notifications.map((note: any) => {
        const message = note.message.toLowerCase();
        const isAdminNotification = !!note.adminNotification;

        // determine status from message
        let status: "approved" | "rejected" | "pending" = "pending";
        if (message.includes("approve")) status = "approved";
        else if (message.includes("reject")) status = "rejected";
        else if (message.includes("follow") || message.includes("unfollow") || message.includes("like") || message.includes("comment") || message.includes("message") || message.includes("request") || message.includes("request") || message.includes("missed") || message.includes("accept") || message.includes("decline") || message.includes("cancel") || message.includes("complete") || message.includes("rating") || message.includes("star") || message.includes("ppv")) {
          status = "approved"; // These are informational notifications, not pending actions
        }

        // Admin broadcasts already carry a real title from the dashboard —
        // use it directly instead of guessing one from the message text.
        let title = "MMEKO"; // Default fallback
        if (isAdminNotification) {
          title = note.title || "Admin Notification";
        } else if (note.title) {
          title = note.title; // e.g. "Booking marked as complete"
        } else if (message.includes("application")) {
          title = "Application Status";
        } else if (message.includes("follow")) {
          title = "Follow Notification";
        } else if (message.includes("unfollow")) {
          title = "Unfollow Notification";
        } else if (message.includes("like")) {
          title = "Like Notification";
        } else if (message.includes("comment")) {
  title = "Comment Notification";
} else if (message.includes("ritual")) {
  if (message.includes("liked") || message.includes("like")) {
    title = "Like Notification";
  } else if (message.includes("comment")) {
    title = "Comment Notification";
  }
} else if (message.includes("message")) {
          title = "Message Notification";
        }
        else if (message.includes("purchased")) {
          title = "Purchase Notification";
        }
        // } else if (message.includes("request") || message.includes("request")) {
        //   title = "Request Notification";
        // }
        else if (message.includes("missed") && message.includes("call")) {
          title = "Missed Fan Call";
        } else if (message.includes("fan meet")) {
          title = "Fan Meet Request";
        }
        else if (message.includes("fan date")) {
          title = "Fan Date Request";
        } else if (message.includes("fan call") || message.includes("Fan Call")) {
          title = "Fan Call Request";
        } else if (message.includes("views") && (message.includes("discover") || message.includes("visibility") || message.includes("momentum"))) {
          title = "Views Notification";
        } else if (message.includes("rating") || message.includes("star")) {
          title = "Rating Notification";
      } else if (message.includes("rating") || message.includes("withdrawal")) {
          title = "Withdrawal Notification";
        }

        // Buttons for this notification (same destinations as before)
        const actions: { label: string; href: string }[] = [];
        if (status === "rejected") {
          actions.push({ label: "Reapply Later", href: "/be-a-creator/apply" });
        }
        if (title === "Follow Notification" || title === "Unfollow Notification") {
          actions.push({ label: "View Following", href: "/following" });
        }
        if (
          [
            "Request Notification",
            "Fan Date Request",
            "Fan Meet Request",
            "Fan Call Request",
            "Missed Fan Call",
            "Activity Update",
            "Rating Notification",
            "Booking marked as complete",
            "Your meet has ended",
            "Your date has ended",
          ].includes(title)
        ) {
          actions.push({ label: "View Activity", href: "/notifications/activity" });
        }
        if (title === "Message Notification") {
          actions.push({ label: "View Messages", href: "/message" });
        }

        const actionClass =
          "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#161b2e] text-[13px] font-semibold text-slate-200 transition-colors [@media(hover:hover)]:hover:bg-[#1e2540] [@media(hover:hover)]:hover:border-white/20";

        return (
          <div
            key={note._id}
            className={`relative w-full rounded-2xl border p-4 text-white transition-colors hover:border-white/[0.18] ${
              !note.seen
                ? "border-[#6c63ff]/40 bg-gradient-to-br from-[#6c63ff]/[0.10] to-[#0d1220]"
                : "border-white/[0.07] bg-[#0d1220]"
            }`}
          >
            <div className="flex gap-3.5">
              <NotificationIcon title={title} status={status} isAdmin={isAdminNotification} />

              <div className="min-w-0 flex-1">
                {/* Title + time */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-[14.5px] font-semibold text-white leading-snug">{title}</h2>
                    {!note.seen && <span className="w-2 h-2 shrink-0 rounded-full bg-[#6c63ff] shadow-[0_0_8px_rgba(108,99,255,0.9)]" />}
                  </div>
                  <span className="shrink-0 mt-0.5 text-[11px] text-slate-500">
                    {formatRelativeTime(note.createdAt)}
                  </span>
                </div>

                {/* Message */}
                <p
                  className={`mt-1 text-[13.5px] leading-relaxed text-slate-400 whitespace-pre-line ${
                    note.hasLearnMore ? "line-clamp-3" : ""
                  }`}
                >
                  {note.message}
                </p>

                {/* Learn More — keeps long admin broadcasts from stretching the card */}
                {note.hasLearnMore && (
                  <div className="mt-3">
                    <Link href={`/learn-more/${note._id}`} className={actionClass}>
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* Application approved → portfolio */}
                {status === "approved" && title === "Application Status" && (
                  <div className="mt-3">
                    {!myPortfolioId && (
                      <p className="text-slate-500 text-xs mb-2">
                        Your creator profile isn&apos;t live to fans yet — set up your portfolio next to start accepting requests.
                      </p>
                    )}
                    <Link href={myPortfolioId ? `/creators/${myPortfolioId}` : "/creator/create"} className={actionClass}>
                      {myPortfolioId ? "My Portfolio" : "Create Portfolio"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* Other buttons */}
                {actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map((a) => (
                      <Link key={a.label} href={a.href} className={actionClass}>
                        {a.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function NotificationIcon({
  title,
  status,
  isAdmin,
}: {
  title: string;
  status: "approved" | "rejected" | "pending";
  isAdmin: boolean;
}) {
  const bubble = "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center";

  if (isAdmin) {
    return (
      <div className={`${bubble} bg-[#080b14] border border-white/10 overflow-hidden`}>
        <Image
          src="/icons/icon-192x192.png"
          alt="MMEKO"
          width={26}
          height={26}
          className="rounded-full object-cover"
        />
      </div>
    );
  }

  switch (title) {
    case "Rating Notification":
      return <div className={`${bubble} bg-yellow-500/10`}><Star className="text-yellow-400 w-5 h-5 fill-current" /></div>;
    case "Views Notification":
      return <div className={`${bubble} bg-indigo-500/10`}><Eye className="text-indigo-400 w-5 h-5" /></div>;
    case "Missed Fan Call":
      return <div className={`${bubble} bg-red-500/10`}><Phone className="text-red-400 w-5 h-5" /></div>;
    case "Fan Date Request":
      return <div className={`${bubble} bg-pink-500/10`}><Heart className="text-pink-400 w-5 h-5 fill-current" /></div>;
    case "Fan Meet Request":
      return <div className={`${bubble} bg-green-500/10`}><Handshake className="text-green-400 w-5 h-5" /></div>;
    case "Fan Call Request":
      return <div className={`${bubble} bg-blue-500/10`}><Phone className="text-blue-400 w-5 h-5" /></div>;
    case "Like Notification":
      return <div className={`${bubble} bg-red-500/10`}><Heart className="text-red-400 w-5 h-5 fill-current" /></div>;
    case "Message Notification":
      return <div className={`${bubble} bg-blue-500/10`}><MessageCircle className="text-blue-400 w-5 h-5" /></div>;
    case "Follow Notification":
    case "Unfollow Notification":
      return <div className={`${bubble} bg-blue-500/10`}><UserPlus className="text-blue-400 w-5 h-5" strokeWidth={2.25} /></div>;
    case "Purchase Notification":
      return <div className={`${bubble} bg-green-500/10`}><ShoppingCart className="text-green-400 w-5 h-5" /></div>;
    case "Withdrawal Notification":
      return <div className={`${bubble} bg-green-500/10`}><Wallet className="text-green-400 w-5 h-5" /></div>;
  }

  if (status === "approved") {
    return <div className={`${bubble} bg-green-500/10`}><CheckCircle className="text-green-400 w-5 h-5" /></div>;
  }
  if (status === "rejected") {
    return <div className={`${bubble} bg-red-500/10`}><XCircle className="text-red-400 w-5 h-5" /></div>;
  }
  return <div className={`${bubble} bg-yellow-500/10`}><Clock className="text-yellow-400 w-5 h-5" /></div>;
}