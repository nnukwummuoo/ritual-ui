//  NOWPayments API base URL
// export const NOWPAYMENTS_API_URL =
//   process.env.NODE_ENV === "development"
//     ? "/api/proxy/"
//     : "https://api-sandbox.nowpayments.io/v1";

// Backend API URL for your server
// Use proxy when accessed via network IP to route to localhost backend
export const URL = (() => {
  if (typeof window === "undefined") {
    // Server-side rendering
    return process.env.NODE_ENV === "development"
      ? "http://localhost:3100"
      : "https://mmekoapi.onrender.com";
  }
  
  // Client-side - check if accessed via network IP
  if (window.location.hostname === '10.245.95.157') {
    // Network access - use proxy to route to localhost backend
    return "/api/proxy";
  }
  
  // Local access
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3100";
  }
  
  // Production
  return "https://mmekoapi.onrender.com";
})();