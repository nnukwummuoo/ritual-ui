"use client"
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/hooks/useUserId";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const userId = useUserId();
  const username = useSelector((state: RootState) => state.profile?.username);

  useEffect(() => {
    if (userId && userId.length > 0) {
      router.replace(username ? `/${username}` : `/${userId}`);
      return;
    }

    const t = setTimeout(() => {
      router.replace("/auth/login");
    }, 1200);

    return () => clearTimeout(t);
  }, [userId, username, router]);

  return (
    <div className="flex items-center justify-center w-full h-dvh text-slate-300">
      Redirecting to your profile...
    </div>
  );
}
