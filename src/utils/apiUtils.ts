/**
 * API utility functions for handling authentication and requests
 */

import { URL } from "@/api/config";

/**
 * Get authentication token from Redux state or localStorage
 * @param state - Redux state
 * @returns Token string or empty string
 */
export function getAuthToken(state: any): string {
  // Try Redux state first
  const reduxToken = state?.register?.refreshtoken || state?.register?.accesstoken;
  if (reduxToken) {
    return reduxToken;
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const loginData = localStorage.getItem('login');
      if (loginData) {
        const parsedData = JSON.parse(loginData);
        return parsedData.refreshtoken || parsedData.accesstoken || '';
      }
    } catch (error) {
      console.error('Error parsing login data:', error);
    }
  }
  
  return '';
}

/**
 * Create authenticated request data with token
 * @param data - Original request data
 * @param state - Redux state
 * @returns Request data with token
 */
export function createAuthenticatedRequest(data: any, state: any): any {
  const token = getAuthToken(state);
  return {
    ...data,
    token: token || ""
  };
}

/**
 * Handle API errors consistently
 * @param error - Error object
 * @param defaultMessage - Default error message
 * @returns Error message string
 */
export function handleApiError(error: any, defaultMessage: string = "An error occurred"): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
}

/**
 * Check if error is authentication related
 * @param error - Error object
 * @returns True if authentication error
 */
export function isAuthError(error: any): boolean {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Get API URL with proper environment handling
 * @param endpoint - API endpoint
 * @returns Full API URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Use environment-specific URL
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3100/${cleanEndpoint}`;
  }
  
  return `${URL}/${cleanEndpoint}`;
}
