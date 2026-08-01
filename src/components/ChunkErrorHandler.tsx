"use client";
import { useEffect } from "react";

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message =
        "message" in event ? event.message : (event as PromiseRejectionEvent).reason?.message;

      if (
        message &&
        (message.includes("ChunkLoadError") ||
          message.includes("Loading chunk") ||
          message.includes("Failed to fetch dynamically imported module"))
      ) {
        const hasReloaded = sessionStorage.getItem("chunk-reload");
        if (!hasReloaded) {
          sessionStorage.setItem("chunk-reload", "1");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError as EventListener);
    window.addEventListener("unhandledrejection", handleChunkError as EventListener);

    return () => {
      window.removeEventListener("error", handleChunkError as EventListener);
      window.removeEventListener("unhandledrejection", handleChunkError as EventListener);
    };
  }, []);

  return null;
}