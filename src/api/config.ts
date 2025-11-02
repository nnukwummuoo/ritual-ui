//  NOWPayments API base URL
// export const NOWPAYMENTS_API_URL =
//   process.env.NODE_ENV === "development"
//     ? "/api/proxy/"
//     : "https://api-sandbox.nowpayments.io/v1";

// Backend API URL for your server
export const URL = (() => {
  if (typeof window === "undefined") {
    // Server-side rendering
    return process.env.NODE_ENV === "development"
      ? "http://localhost:3100"
      : process.env.NEXT_PUBLIC_BACKEND || "";
  }
  
  // Client-side - check environment
  if (process.env.NODE_ENV === "development") {
    // Development - use localhost
    return "http://localhost:3100";
  }
  
  // Production - use production backend
  return process.env.NEXT_PUBLIC_BACKEND || "";
})();