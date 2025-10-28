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
      router.replace(`/Profile/${userId}`);
      return;
    }

    // Otherwise, wait briefly to allow Redux/localStorage to resolve
    const t = setTimeout(() => {
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
