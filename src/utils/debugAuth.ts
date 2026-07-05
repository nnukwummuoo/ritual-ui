/**
 * Debug authentication utilities
 */

export function debugAuth() {
  if (typeof window === 'undefined') return;
  
  try {
    const loginData = localStorage.getItem('login');
    console.log('🔍 [Debug Auth] Raw login data:', loginData);
    
    if (loginData) {
      const parsed = JSON.parse(loginData);
      console.log('🔍 [Debug Auth] Parsed login data:', parsed);
      console.log('🔍 [Debug Auth] Access token:', parsed.accesstoken);
      console.log('🔍 [Debug Auth] Refresh token:', parsed.refreshtoken);
      console.log('🔍 [Debug Auth] User ID:', parsed.userID || parsed.userid || parsed.id);
    }
  } catch (error) {
    console.error('❌ [Debug Auth] Error parsing login data:', error);
  }
}

export function getValidToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const loginData = localStorage.getItem('login');
    if (!loginData) return null;
    
    const parsed = JSON.parse(loginData);
    const token = parsed.accesstoken || parsed.refreshtoken;
    
    if (!token) return null;
    
    // Basic JWT validation (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ [Debug Auth] Invalid JWT format:', token);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('❌ [Debug Auth] Error getting token:', error);
    return null;
  }
}
