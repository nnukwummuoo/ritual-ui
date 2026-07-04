"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

/**
 * Resolve an auth token for Bearer-authenticated API calls.
 * Order: Redux accesstoken -> localStorage accesstoken -> refreshtoken as a last resort.
 * The backend's verifyJwt only validates against ACCESS_TOKEN_SECRET, so the
 * access token must always be preferred over the refresh token.
 */
export function useAuthToken(): string | undefined {
  const reduxAccess = useSelector((s: RootState) => (s as any)?.register?.accesstoken as string | undefined);
  const reduxRefresh = useSelector((s: RootState) => (s as any)?.register?.refreshtoken as string | undefined);
  const [localToken, setLocalToken] = useState<string | undefined>(undefined);

  const reduxToken = reduxAccess || reduxRefresh;

  useEffect(() => {
    if (reduxToken && reduxToken.trim().length > 0) return;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem("login") : null;
      if (raw) {
        const saved = JSON.parse(raw);
        const t = saved?.accesstoken || saved?.token || saved?.refreshtoken;
        if (t && String(t).trim().length > 0) setLocalToken(String(t));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useAuthToken] localStorage parse error:", e);
    }
  }, [reduxToken]);

  return (reduxToken && reduxToken.trim().length > 0) ? reduxToken : localToken;
}