"use client";

import axios from "axios";
import { URL as API_BASE } from "./config";
import { store } from "@/store/store";
import { updateAccessToken } from "@/store/registerSlice";
import { handleInvalidToken } from "@/utils/handleInvalidToken"

const PROD_BASE = process.env.NEXT_PUBLIC_API || "";

(function setupAxiosFallback() {
  try {
    const g: any = typeof window !== "undefined" ? window : globalThis;
    if (g.__AXIOS_FALLBACK_INSTALLED__) return;

    axios.interceptors.response.use(
  (res) => {
    // Sliding-expiration: if the backend silently issued a fresh access token,
    // update every place the app reads it from — Redux state (used by a few
    // call sites) and localStorage's "login" object (used by most of the app).
    const newToken = res.headers?.["x-new-access-token"];
    if (newToken) {
      store.dispatch(updateAccessToken(newToken));

      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          data.accesstoken = newToken;
          localStorage.setItem("login", JSON.stringify(data));
        }
      } catch {
        // if localStorage is unavailable or corrupted, Redux update above still applies
      }
    }
    return res;
  },
      async (error) => {

         if (error?.response?.status === 403 && error?.response?.data?.code === "TOKEN_INVALID") {
          handleInvalidToken();
          return Promise.reject(error);
        }


        if (!error || !error.config) return Promise.reject(error);

        const cfg = error.config as any;
        if (cfg.__retriedWithProd) return Promise.reject(error);

        const noResponse = !error.response;
        const status = error.response?.status;

        const shouldFallback = noResponse || (status && [502, 503, 504].includes(status));
        if (!shouldFallback) return Promise.reject(error);

        let originalUrl: string = cfg.url || "";

        const isProdAlready = /^https?:\/\//i.test(API_BASE) && API_BASE.includes("mmekoapi.onrender.com");
        if (isProdAlready) return Promise.reject(error);

        const devBase = API_BASE;
        let retryUrl = originalUrl;

        if (typeof originalUrl === "string" && originalUrl.startsWith(devBase)) {
          retryUrl = originalUrl.replace(devBase, PROD_BASE);
        } else if (/^https?:\/\//i.test(originalUrl)) {
          try {
            const u = new URL(originalUrl);
            if (u.host.includes("localhost:3100") || u.host.includes("127.0.0.1:3100")) {
              u.protocol = "https:";
              u.host = new URL(PROD_BASE).host;
              retryUrl = u.toString();
            }
          } catch {}
        } else {
          if (originalUrl.startsWith("/")) retryUrl = PROD_BASE + originalUrl;
          else retryUrl = PROD_BASE + "/" + originalUrl;
        }

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