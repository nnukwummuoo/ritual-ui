"use client";

import axios from "axios";
import { URL as API_BASE } from "./config";

// Fallback production base (same as used elsewhere)
const PROD_BASE = "https://mmekoapi.onrender.com";

// Ensure interceptor is only registered once per window
(function setupAxiosFallback() {
  try {
    const g: any = typeof window !== "undefined" ? window : globalThis;
    if (g.__AXIOS_FALLBACK_INSTALLED__) return;

    axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        // Only handle axios-like errors
        if (!error || !error.config) return Promise.reject(error);

        const cfg = error.config as any;
        // Avoid infinite retry loop
        if (cfg.__retriedWithProd) return Promise.reject(error);

        const noResponse = !error.response; // network issues, ECONNREFUSED, CORS, offline
        const status = error.response?.status;

        // Only trigger fallback for network errors or transient server errors
        const shouldFallback = noResponse || (status && [502, 503, 504].includes(status));
        if (!shouldFallback) return Promise.reject(error);

        // Build retry URL replacing API_BASE with PROD_BASE when API_BASE is not absolute
        let originalUrl: string = cfg.url || "";

        // If url is relative or starts with the dev base, try to swap to PROD
        // API_BASE in dev is "/api/proxy"; in prod it's already the prod host
        const isProdAlready = /^https?:\/\//i.test(API_BASE) && API_BASE.includes("mmekoapi.onrender.com");
        if (isProdAlready) return Promise.reject(error);

        const devBase = API_BASE; // e.g. "/api/proxy"
        let retryUrl = originalUrl;

        // If originalUrl is relative and starts with devBase, replace prefix with PROD_BASE
        if (typeof originalUrl === "string" && originalUrl.startsWith(devBase)) {
          retryUrl = originalUrl.replace(devBase, PROD_BASE);
        } else if (/^https?:\/\//i.test(originalUrl)) {
          // If absolute URL but points to localhost:3100, swap host
          try {
            const u = new URL(originalUrl);
            if (u.host.includes("localhost:3100") || u.host.includes("127.0.0.1:3100")) {
              u.protocol = "https:";
              u.host = new URL(PROD_BASE).host;
              retryUrl = u.toString();
            }
          } catch {}
        } else {
          // If completely relative (like "/getprofile"), prepend PROD_BASE
          if (originalUrl.startsWith("/")) retryUrl = PROD_BASE + originalUrl;
          else retryUrl = PROD_BASE + "/" + originalUrl;
        }

        // Mark config to prevent loops and retry once
        const retryCfg = {
          ...cfg,
          url: retryUrl,
          __retriedWithProd: true,
        };

        try {
          return await axios.request(retryCfg);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    );

    g.__AXIOS_FALLBACK_INSTALLED__ = true;
  } catch {
    // swallow setup errors
  }
})();
