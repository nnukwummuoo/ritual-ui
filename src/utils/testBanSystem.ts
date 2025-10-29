// Test utility to verify ban system is working
import { URL } from '@/api/config';

export const testBanSystem = async () => {
  try {
    console.log('🧪 Testing ban system...');
    
    const response = await fetch(`${URL}/checkBanStatus`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Ban check response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.status === 403) {
      const data = await response.json();
      console.log('🚫 User is banned:', data);
      return { banned: true, data };
    } else if (response.status === 401) {
      console.log('🔑 User not authenticated');
      return { banned: false, authenticated: false };
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ User is not banned:', data);
      return { banned: false, authenticated: true, data };
    } else {
      console.log('❓ Unexpected response:', response.status);
      return { banned: false, error: 'Unexpected response' };
    }
  } catch (error) {
    console.error('❌ Error testing ban system:', error);
    return { banned: false, error: error.message };
  }
};

// Call this function from browser console to test
if (typeof window !== 'undefined') {
  (window as any).testBanSystem = testBanSystem;
}
