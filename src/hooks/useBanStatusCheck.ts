import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/registerSlice';
import { URL } from '@/api/config';
import { toast } from 'material-react-toastify';

export const useBanStatusCheck = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const loggedIn = useSelector((state: RootState) => state.register.logedin);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = async () => {
    if (!loggedIn) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    try {
      const response = await fetch(`${URL}/checkBanStatus`, {
        method: 'GET',
        credentials: 'include', // Include cookies
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
        
        // Dispatch logout action
        dispatch(logout());
        
        // Stop checking
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // Redirect to banned page
        router.push('/banned');
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
        
        // Dispatch logout action
        dispatch(logout());
        
        // Stop checking
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // Redirect to login
        router.push('/login?session=expired');
      }
    } catch (error) {
      console.error('❌ Error checking ban status:', error);
      // Continue silently, don't interrupt user experience for network errors
    }
  };

  useEffect(() => {
    if (loggedIn) {
      // Initial check
      checkStatus();
      // Set up interval for periodic checks
      checkIntervalRef.current = setInterval(checkStatus, 10000); // Check every 10 seconds
      
      // Check when user returns to tab/window
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkStatus();
        }
      };
      
      // Check when window gains focus
      const handleFocus = () => {
        checkStatus();
      };
      
      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [loggedIn, router, dispatch]);

  return null;
};
