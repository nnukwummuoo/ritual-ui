"use client";

import { store } from "@/store/store";
import { updateAccessToken } from "@/store/registerSlice";

// Globally patches window.fetch so any raw fetch() call to the backend
// (not just axios calls) picks up a sliding-refresh access token the
// same way the axios interceptor does. This covers every current and
// future fetch() call site in the app without needing to touch each one.
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
        store.dispatch(updateAccessToken(newToken));

        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          data.accesstoken = newToken;
          localStorage.setItem("login", JSON.stringify(data));
        }
      }
    } catch {
      // Don't let sync failures break the actual request/response
    }

    return res;
  };

  g.__FETCH_TOKEN_SYNC_INSTALLED__ = true;
})();