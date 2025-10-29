// Test utility to verify login and ban system
import { URL } from '@/api/config';

export const testLoginSystem = async () => {
  try {
    console.log('🧪 Testing login system...');
    
    // Test 1: Check localStorage data
    const raw = localStorage.getItem("login");
    if (raw) {
      const data = JSON.parse(raw);
      console.log('📊 [Test] localStorage data:', data);
      console.log('📊 [Test] Has userID:', !!data?.userID);
      console.log('📊 [Test] Has tokens:', !!(data?.refreshtoken || data?.accesstoken));
    } else {
      console.log('❌ [Test] No localStorage data found');
    }
    
    // Test 2: Check ban status
    const response = await fetch(`${URL}/checkBanStatus`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 [Test] Ban check response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.status === 403) {
      const data = await response.json();
      console.log('🚫 [Test] User is banned:', data);
      return { banned: true, data };
    } else if (response.status === 401) {
      console.log('🔑 [Test] User not authenticated');
      return { banned: false, authenticated: false };
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ [Test] User is not banned:', data);
      return { banned: false, authenticated: true, data };
    } else {
      console.log('❓ [Test] Unexpected response:', response.status);
      return { banned: false, error: 'Unexpected response' };
    }
  } catch (error) {
    console.error('❌ [Test] Error testing login system:', error);
    return { banned: false, error: error.message };
  }
};

// Call this function from browser console to test
if (typeof window !== 'undefined') {
  (window as any).testLoginSystem = testLoginSystem;
}
