"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface ScrollToTopAdvancedProps {
  smooth?: boolean;
  delay?: number;
  preserveScrollRoutes?: string[];
  scrollOnSearchChange?: boolean;
  debug?: boolean;
}

const SCROLL_KEY_PREFIX = "mmeko_scrollpos:";
const NAV_IDX_KEY = "__mmekoNavIdx";

const ScrollToTopAdvanced = ({
  smooth = true,
  delay = 0,
  preserveScrollRoutes = [],
  scrollOnSearchChange = false,
  debug = false,
}: ScrollToTopAdvancedProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathnameRef = useRef<string>("");
  const scrollYRef = useRef(0);
  const navIdxRef = useRef(0);
  const isPopRef = useRef(false);
  const popDirectionRef = useRef<"back" | "forward" | null>(null);

  const log = (_message: string, ..._args: any[]) => {
    if (debug) console.log(_message, ..._args);
  };

  // Stamp an incrementing index onto history.state so we can tell back from forward.
  useEffect(() => {
    const existing = (window.history.state as any)?.[NAV_IDX_KEY];
    if (typeof existing === "number") {
      navIdxRef.current = existing;
    } else {
      navIdxRef.current = 0;
      try {
        window.history.replaceState(
          { ...(window.history.state || {}), [NAV_IDX_KEY]: 0 },
          "",
          window.location.href
        );
      } catch {}
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const newIdx = (e.state as any)?.[NAV_IDX_KEY];
      if (typeof newIdx === "number") {
        popDirectionRef.current = newIdx < navIdxRef.current ? "back" : "forward";
        navIdxRef.current = newIdx;
      } else {
        popDirectionRef.current = "back";
      }
      isPopRef.current = true;
      log("Popstate detected, direction:", popDirectionRef.current);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const prevPath = lastPathnameRef.current;

    if (prevPath && prevPath !== pathname) {
      try {
        sessionStorage.setItem(SCROLL_KEY_PREFIX + prevPath, String(scrollYRef.current));
      } catch {}
    }

    if (prevPath === pathname) return;
    lastPathnameRef.current = pathname;

    const wasPop = isPopRef.current;
    const direction = popDirectionRef.current;
    isPopRef.current = false;
    popDirectionRef.current = null;

    if (!wasPop) {
      navIdxRef.current += 1;
      try {
        window.history.replaceState(
          { ...(window.history.state || {}), [NAV_IDX_KEY]: navIdxRef.current },
          "",
          window.location.href
        );
      } catch {}
    }

    const shouldPreserveScroll = preserveScrollRoutes.some((route) => pathname.startsWith(route));
    if (shouldPreserveScroll) {
      log(`Skipping scroll handling for preserved route: ${pathname}`);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const performScroll = () => {
      if (wasPop && direction === "back") {
        let saved: string | null = null;
        try {
          saved = sessionStorage.getItem(SCROLL_KEY_PREFIX + pathname);
        } catch {}
        if (saved !== null) {
          log(`Restoring scroll position for ${pathname}:`, saved);
          window.scrollTo({ top: parseInt(saved, 10), left: 0, behavior: "instant" as ScrollBehavior });
          return;
        }
      }
      log(`Scrolling to top for ${pathname}`);
      window.scrollTo({ top: 0, left: 0, behavior: smooth ? "smooth" : "instant" });
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(performScroll, delay);
    } else {
      performScroll();
    }
  }, [pathname]);

  useEffect(() => {
    if (!scrollOnSearchChange) return;
    window.scrollTo({ top: 0, left: 0, behavior: smooth ? "smooth" : "instant" });
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null;
};

export default ScrollToTopAdvanced;