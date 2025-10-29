"use client";

import ScrollToTopAdvanced from "./ScrollToTopAdvanced";

/**
 * Example usage of ScrollToTopAdvanced component
 * This shows how to configure the scroll behavior for different scenarios
 */
const ScrollToTopExample = () => {
  return (
    <ScrollToTopAdvanced
      // Basic configuration
      smooth={true}
      delay={100} // Small delay for page transitions
      
      // Preserve scroll position for specific routes
      preserveScrollRoutes={[
        "/message", // Don't scroll to top when navigating within messages
        "/settings", // Don't scroll to top when navigating within settings
        "/profile"   // Don't scroll to top when navigating within profile
      ]}
      
      // Enable scroll on search params change (useful for filters)
      scrollOnSearchChange={true}
      
      // Enable scroll on browser back/forward
      scrollOnPopState={true}
      
      // Custom scroll position (default is top-left)
      scrollPosition={{ x: 0, y: 0 }}
      
      // Enable debug logging in development
      debug={process.env.NODE_ENV === "development"}
    />
  );
};

export default ScrollToTopExample;
