// Temporary: use local backend for both development and production during testing
// Live URL was: "https://mmekoapi.onrender.com"
export const URL = process.env.NODE_ENV === 'development'
  ? "/api/proxy"
  : "https://mmekoapi.onrender.com"; // "https://mmekoapi.onrender.com"
  //http://localhost:3100