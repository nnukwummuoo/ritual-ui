import { URL } from '@/api/config';
import { toast } from 'material-react-toastify';

export const checkUserBanStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${URL}/checkBanStatus`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 403) {
      const data = await response.json();
      console.log('🚫 User is banned:', data);
      
      // Show ban message
      toast.error(data.message || "Your account has been banned.", { 
        autoClose: false,
        position: "top-center"
      });
      
      // Clear all authentication data
      if (typeof window !== "undefined") {
        localStorage.removeItem("login");
        localStorage.removeItem("user");
        sessionStorage.clear();
        // Clear cookies manually
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Redirect to banned page
      window.location.href = '/banned';
      return true; // User is banned
    } else if (response.status === 401) {
      console.log('🔑 Token invalid or expired');
      
      // Clear authentication data
      if (typeof window !== "undefined") {
        localStorage.removeItem("login");
        localStorage.removeItem("user");
        sessionStorage.clear();
        // Clear cookies manually
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Redirect to login
      window.location.href = '/login?session=expired';
      return true; // Session expired
    }
    
    return false; // User is not banned
  } catch (error) {
    console.error('❌ Error checking ban status:', error);
    return false; // Continue on error
  }
};

// Hook for immediate ban check on user actions
export const useImmediateBanCheck = () => {
  return checkUserBanStatus;
};
