"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications } from "@/store/profile";
import type { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";

export default function GlobalNotificationFetcher() {
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = session?.token;
  const userId = useSelector((state: RootState) => state.profile.userId);
  const notifications_stats = useSelector((state: RootState) => state.profile.notifications_stats);

  // Fetch notifications when component mounts and user is authenticated
  useEffect(() => {
    if (userId && token && notifications_stats === "idle") {
      console.log("[GlobalNotificationFetcher] Fetching notifications for user:", userId);
      dispatch(getNotifications({ userid: userId, token }));
    }
  }, [userId, token, notifications_stats, dispatch]);

  // Also fetch notifications when userid changes (e.g., after login)
  useEffect(() => {
    if (userId && token) {
      console.log("[GlobalNotificationFetcher] User changed, fetching notifications for user:", userId);
      dispatch(getNotifications({ userid: userId, token }));
    }
  }, [userId, token, dispatch]);

  // This component doesn't render anything, it just fetches data
  return null;
}
