// Temporary: use local backend for development via Next.js proxy
// Live URL: "https://mmekoapi.onrender.com"
export const URL = process.env.NODE_ENV === 'development'
  ? "/api/proxy"
  : "https://mmekoapi.onrender.com";

