"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import PostsCard from "@/components/home/post";
import AdminNotificationModal from "@/components/AdminNotificationModal";
import CreatorLandingContent from "@/components/landing/CreatorLandingContent";

const CREATOR_AVATAR_COUNT = 10;

export default function HomePage() {
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
  const [localUserid, setLocalUserid] = useState("");
  const [localToken, setLocalToken] = useState("");
  const [mounted, setMounted] = useState(false);
  const [prefetchedCreators, setPrefetchedCreators] = useState<
    { userId: string; username: string; photolink: string | null }[]
  >([]);

  const loggedInUserId = reduxUserId || localUserid;
  const token = reduxToken || localToken;
  const isAuthenticated = !!(loggedInUserId && token);

  // Sync auth from localStorage (same pattern as PostsCard) after mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        if (!reduxUserId && data?.userID) setLocalUserid(data.userID);
        if (!reduxToken && (data?.refreshtoken || data?.accesstoken)) {
          setLocalToken(data.refreshtoken || data.accesstoken);
        }
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, [reduxUserId, reduxToken]);

  // Prefetch top creators as soon as home page mounts so landing avatars load fast
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/proxy/top_creators");
        const data = await res.json();
        if (!cancelled && data?.ok && Array.isArray(data.creators)) {
          setPrefetchedCreators(
            data.creators.slice(0, CREATOR_AVATAR_COUNT).map(
              (c: { userId: string; username: string; photolink?: string | null }) => ({
                userId: c.userId,
                username: c.username || "",
                photolink: c.photolink ?? null,
              })
            )
          );
        }
      } catch {
        // ignore; LovedByCreators will fallback to its own fetch or placeholders
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Avoid hydration mismatch: show nothing or a neutral state until mounted
  if (!mounted) {
    return (
      <div className="w-full mx-auto space-y-5 px-2 md:mt-0 mt-8 min-h-[50vh]" />
    );
  }

  if (!isAuthenticated) {
  return (
    <div
      className="text-white min-h-screen"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 40,
        background: "#080b14",
        width: "100vw",
      }}
    >
      <CreatorLandingContent prefetchedCreators={prefetchedCreators} />
    </div>
  );
}

  return (
    <div className="w-full mx-auto space-y-5 px-2 md:mt-0 ">
      <AdminNotificationModal />
      <PostsCard />
    </div>
  );
}
