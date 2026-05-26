"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { URL as API_URL } from "@/api/config";

export default function CreatorRedirect() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) return;

    const cleanSlug = slug.replace(/^@/, "");

    const tryRedirect = async () => {
      try {
        // Use the same endpoint the creators page already uses
        const res = await fetch(`${API_URL}/getcreatorbyusername`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanSlug }),
        });

        if (!res.ok) return; // not a creator, profile page renders normally

        const data = await res.json();
        const hostid = data?.hostid || data?._id || data?.data?.hostid || data?.creator?.hostid;

        if (hostid) {
          router.replace(`/creators/${hostid}`);
        }
      } catch {}
    };

    tryRedirect();
  }, [params?.slug]);

  return null;
}