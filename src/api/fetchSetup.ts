"use client";

import { handleInvalidToken } from "@/utils/handleInvalidToken";

(function setupFetchTokenSync() {
  if (typeof window === "undefined") return;

  const g: any = window;
  if (g.__FETCH_TOKEN_SYNC_INSTALLED__) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const res = await originalFetch(...args);

    try {
      const newToken = res.headers.get("x-new-access-token");
      if (newToken) {
        const { store } = await import("@/store/store");
        const { updateAccessToken } = await import("@/store/registerSlice");
        store.dispatch(updateAccessToken(newToken));

        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          data.accesstoken = newToken;
          localStorage.setItem("login", JSON.stringify(data));
        }
      }

      if (res.status === 403) {
        const clone = res.clone();
        const data = await clone.json().catch(() => null);
        if (data?.code === "TOKEN_INVALID") {
          handleInvalidToken();
        }
      }
    } catch {
      // Don't let sync failures break the actual request/response
    }

    return res;
  };

  g.__FETCH_TOKEN_SYNC_INSTALLED__ = true;
})();