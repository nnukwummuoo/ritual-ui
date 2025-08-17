"use client"
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/hooks/useUserId";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const userId = useUserId();

  useEffect(() => {
    // If we already have a userId, go immediately
    if (userId && userId.length > 0) {
      // eslint-disable-next-line no-console
      console.log("[/Profile redirect] userId found, redirecting to:", `/Profile/${userId}`);
      router.replace(`/Profile/${userId}`);
      return;
    }

    // Otherwise, wait briefly to allow Redux/localStorage to resolve
    const t = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log("[/Profile redirect] no userId after delay, redirecting to /login");
      router.replace("/login");
    }, 1200);

    return () => clearTimeout(t);
  }, [userId, router]);

  return (
    <div className="flex items-center justify-center w-full h-dvh text-slate-300">
      Redirecting to your profile...
    </div>
  );
}
