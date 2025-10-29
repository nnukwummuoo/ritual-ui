import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface UseScrollToTopOptions {
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
   * Custom scroll position (x, y coordinates)
   * @default { x: 0, y: 0 }
   */
  scrollPosition?: { x: number; y: number };
}

export const useScrollToTop = (options: UseScrollToTopOptions = {}) => {
  const {
    smooth = true,
    delay = 0,
    preserveScrollRoutes = [],
    scrollOnSearchChange = false,
    scrollPosition = { x: 0, y: 0 }
  } = options;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scrollToPosition = () => {
    window.scrollTo({
      top: scrollPosition.y,
      left: scrollPosition.x,
      behavior: smooth ? "smooth" : "instant"
    });
  };

  const executeScroll = () => {
    // Check if current route should preserve scroll position
    const shouldPreserveScroll = preserveScrollRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (shouldPreserveScroll) {
      return;
    }

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToPosition, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToPosition();
    }
  };

  // Handle pathname changes
  useEffect(() => {
    executeScroll();
  }, [pathname]);

  // Handle search params change if enabled
  useEffect(() => {
    if (!scrollOnSearchChange) return;
    executeScroll();
  }, [searchParams]);

  // Return manual scroll function for programmatic use
  return {
    scrollToTop: scrollToPosition,
    scrollToPosition: (x: number, y: number) => {
      window.scrollTo({
        top: y,
        left: x,
        behavior: smooth ? "smooth" : "instant"
      });
    }
  };
};
