// NOWPayments API base URL
export const NOWPAYMENTS_API_URL = process.env.NODE_ENV === "development"
  ? "/api/proxy/"
  : "https://api-sandbox.nowpayments.io/v1";

// Backend API URL for your server
export const URL = process.env.NODE_ENV === "development"
  ? "/api/proxy"
  : "https://mmekoapi.onrender.com";