"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export function useUserId(): string | undefined {
  const reduxUserId = useSelector((s: RootState) => (s as any)?.register?.userID as string | undefined);
  const [localId, setLocalId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Only skip localStorage check if reduxUserId has a valid value
    if (reduxUserId && reduxUserId.trim().length > 0) return;
    try {
      const raw = localStorage.getItem("login");
      // eslint-disable-next-line no-console
      console.log("[useUserId] localStorage raw:", raw);
      if (raw) {
        const saved = JSON.parse(raw);
        // eslint-disable-next-line no-console
        console.log("[useUserId] localStorage parsed:", saved);
        if (saved?.userID) setLocalId(String(saved.userID));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useUserId] localStorage error:", e);
    }
  }, [reduxUserId]);

  // Debug log whenever the resolved userId changes
  useEffect(() => {
    const validReduxId = reduxUserId && reduxUserId.trim().length > 0 ? reduxUserId : undefined;
    const resolved = validReduxId ?? localId;
    // eslint-disable-next-line no-console
    console.log("[useUserId] resolved userId:", resolved, {
      reduxUserId,
      validReduxId,
      localId,
      hasLocalStorage: typeof window !== 'undefined' && !!localStorage.getItem("login")
    });
  }, [reduxUserId, localId]);

  const validReduxId = reduxUserId && reduxUserId.trim().length > 0 ? reduxUserId : undefined;
  return validReduxId ?? localId;
}

export function useUser(): any {
  const reduxUserId = useSelector((s: RootState) => (s as any)?.register?.userID as string | undefined);
  const [user, setUser] = useState({});

  useEffect(() => {
    // Only skip localStorage check if reduxUserId has a valid value
    if (reduxUserId && reduxUserId.trim().length > 0) return;
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const saved = JSON.parse(raw);
        setUser(saved);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useUserId] localStorage error:", e);
    }
  }, [reduxUserId]);

  return user as any;
}
