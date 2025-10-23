//  NOWPayments API base URL
// export const NOWPAYMENTS_API_URL =
//   process.env.NODE_ENV === "development"
//     ? "/api/proxy/"
//     : "https://api-sandbox.nowpayments.io/v1";

// Backend API URL for your server
// Use proxy when accessed via network IP to route to localhost backend
export const URL = (() => {
  console.log("🔧 [API_CONFIG] Environment check:", {
    NODE_ENV: process.env.NODE_ENV,
    isServer: typeof window === "undefined",
    hostname: typeof window !== "undefined" ? window.location.hostname : "server-side"
  });
  
  if (typeof window === "undefined") {
    // Server-side rendering
    const serverUrl = process.env.NODE_ENV === "development"
      ? "http://localhost:3100"
      : "https://mmekoapi.onrender.com";
    console.log("🔧 [API_CONFIG] Server-side URL:", serverUrl);
    return serverUrl;
  }
  
  // Client-side - check if accessed via network IP
  if (window.location.hostname === '10.245.95.157') {
    // Network access - use proxy to route to localhost backend
    console.log("🔧 [API_CONFIG] Network access - using proxy");
    return "/api/proxy";
  }
  
  // Local access - force localhost for now
  console.log("🔧 [API_CONFIG] Forcing localhost:3100 for development");
  return "http://localhost:3100";
  
  // Commented out for debugging
  // if (process.env.NODE_ENV === "development") {
  //   console.log("🔧 [API_CONFIG] Development mode - using localhost:3100");
  //   return "http://localhost:3100";
  // }
  
  // // Production
  // console.log("🔧 [API_CONFIG] Production mode - using render.com");
  // return "https://mmekoapi.onrender.com";
})();