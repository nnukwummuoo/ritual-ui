"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

/**
 * Resolve an auth token similar to the Profile page logic.
 * Order: Redux (refreshtoken | accesstoken) -> window-injected -> localStorage('login').
 */
export function useAuthToken(): string | undefined {
  const reduxRefresh = useSelector((s: RootState) => (s as any)?.register?.refreshtoken as string | undefined);
  const reduxAccess = useSelector((s: RootState) => (s as any)?.register?.accesstoken as string | undefined);
  const [localToken, setLocalToken] = useState<string | undefined>(undefined);

  const reduxToken = reduxRefresh || reduxAccess;

  useEffect(() => {
    if (reduxToken && reduxToken.trim().length > 0) return;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem("login") : null;
      // eslint-disable-next-line no-console
      console.log("[useAuthToken] localStorage raw:", raw);
      if (raw) {
        const saved = JSON.parse(raw);
        const t = saved?.refreshtoken || saved?.accesstoken || saved?.token;
        if (t && String(t).trim().length > 0) setLocalToken(String(t));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useAuthToken] localStorage parse error:", e);
    }
  }, [reduxToken]);

  useEffect(() => {
    const resolved = (reduxToken && reduxToken.trim().length > 0) ? reduxToken : localToken;
    // eslint-disable-next-line no-console
    console.log("[useAuthToken] resolved token present:", Boolean(resolved), {
      hasRedux: Boolean(reduxToken),
      hasLocal: Boolean(localToken),
    });
  }, [reduxToken, localToken]);

  return (reduxToken && reduxToken.trim().length > 0) ? reduxToken : localToken;
}