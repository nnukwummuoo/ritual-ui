"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { getmycreatorbyid } from "@/store/creatorSlice";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { useUserId } from "@/lib/hooks/useUserId";
import CreatorPortfolioView from "@/app/creators/_components/CreatorPortfolioView";
import LoaderVisual from "@/components/LoaderVisual";

export default function PortfolioByUsernamePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username?.split(",")[0] || "";
  const dispatch = useDispatch<AppDispatch>();
  const token = useAuthToken();
  const userid = useUserId();

  // Resolve username -> the creator's real database ID once.
  const resolvedId = useSelector((s: any) => s.creator?.creatorbyid?.hostid as string | undefined);
  const requested = useRef(false);

  useEffect(() => {
    if (!username || requested.current) return;
    requested.current = true;
    dispatch(getmycreatorbyid({ hostid: null, token: token || undefined, userid: userid || undefined, username }));
  }, [username, token, userid, dispatch]);

 if (!resolvedId) {
    return <LoaderVisual />;
  }

  return <CreatorPortfolioView creatorPortfolioId={resolvedId} />;
}