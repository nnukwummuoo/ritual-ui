"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface ScrollToTopAdvancedProps {
  /**
   * Whether to use smooth scrolling animation
   * @default true
   */
  smooth?: boolean;
  
  /**
   * Delay before scrolling (useful for page transitions)
   * @default 0
   */
  delay?: number;
  
  /**
   * Routes that should NOT trigger scroll to top
   * Useful for preserving scroll position in certain cases
   */
  preserveScrollRoutes?: string[];
  
  /**
   * Whether to scroll to top on search params change
   * @default false
   */
  scrollOnSearchChange?: boolean;
  
  /**
   * Whether to scroll to top when navigating back/forward
   * @default true
   */
  scrollOnPopState?: boolean;
  
  /**
   * Custom scroll position (x, y coordinates)
   * @default { x: 0, y: 0 }
   */
  scrollPosition?: { x: number; y: number };
  
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
}

const ScrollToTopAdvanced = ({ 
  smooth = true, 
  delay = 0,
  preserveScrollRoutes = [],
  scrollOnSearchChange = false,
  scrollOnPopState = true,
  scrollPosition = { x: 0, y: 0 },
  debug = false
}: ScrollToTopAdvancedProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathnameRef = useRef<string>("");

  const log = (_message: string, ..._args: any[]) => {
    // Logging disabled - remove if not needed
  };

  const scrollToPosition = () => {
    log("Scrolling to position:", scrollPosition);
    window.scrollTo({
      top: scrollPosition.y,
      left: scrollPosition.x,
      behavior: smooth ? "smooth" : "instant"
    });
  };

  const executeScroll = (reason: string) => {
    // Check if current route should preserve scroll position
    const shouldPreserveScroll = preserveScrollRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (shouldPreserveScroll) {
      log(`Skipping scroll for preserved route: ${pathname}`);
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const performScroll = () => {
      log(`Executing scroll due to: ${reason}`);
      scrollToPosition();
    };

    if (delay > 0) {
      log(`Delaying scroll by ${delay}ms`);
      timeoutRef.current = setTimeout(performScroll, delay);
    } else {
      performScroll();
    }
  };

  // Handle pathname changes
  useEffect(() => {
    // Only scroll if pathname actually changed
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      executeScroll("pathname change");
    }
  }, [pathname]);

  // Handle search params change if enabled
  useEffect(() => {
    if (!scrollOnSearchChange) return;
    executeScroll("search params change");
  }, [searchParams]);

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!scrollOnPopState) return;

    const handlePopState = () => {
      log("Popstate event detected");
      executeScroll("popstate");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [scrollOnPopState]);

  // Cleanup timeout on unmount
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
