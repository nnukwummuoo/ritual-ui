"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface ScrollToTopEnhancedProps {
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
}

const ScrollToTopEnhanced = ({ 
  smooth = true, 
  delay = 0,
  preserveScrollRoutes = [],
  scrollOnSearchChange = false
}: ScrollToTopEnhancedProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if current route should preserve scroll position
    const shouldPreserveScroll = preserveScrollRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (shouldPreserveScroll) {
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? "smooth" : "instant"
      });
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [pathname, smooth, delay, preserveScrollRoutes]);

  // Handle search params change if enabled
  useEffect(() => {
    if (!scrollOnSearchChange) return;

    const shouldPreserveScroll = preserveScrollRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (shouldPreserveScroll) {
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? "smooth" : "instant"
      });
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [searchParams, smooth, delay, preserveScrollRoutes, pathname]);

  return null;
};

export default ScrollToTopEnhanced;
