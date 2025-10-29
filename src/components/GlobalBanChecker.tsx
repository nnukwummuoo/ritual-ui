"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/registerSlice';
import { URL } from '@/api/config';
import { toast } from 'material-react-toastify';

const GlobalBanChecker: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxLoggedIn = useSelector((state: RootState) => state.register.logedin);
  
  // Fallback to localStorage if Redux state is empty (hydration issue)
  const [localLoggedIn, setLocalLoggedIn] = useState<boolean>(false);
  
  // Use Redux data if available, otherwise use localStorage
  const loggedIn = reduxLoggedIn || localLoggedIn;

  // Load login status from localStorage if not in Redux (hydration issue)
  useEffect(() => {
    if (!reduxLoggedIn && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.userID && (data?.refreshtoken || data?.accesstoken)) {
            setLocalLoggedIn(true);
          }
        }
      } catch (error) {
        // Error retrieving data from localStorage
      }
    }
  }, [reduxLoggedIn]);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    // Don't run ban checks if we're on login page
    if (typeof window !== "undefined" && window.location.pathname === '/auth/login') {
      return;
    }

    const checkBanStatus = async () => {
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
          
          // Only clear data and redirect if we're not already on the banned page
          if (window.location.pathname !== '/banned') {
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
              document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
            
            // Dispatch logout action
            dispatch(logout());
            
            // Redirect to banned page
            router.push('/banned');
          }
        } else if (response.status === 401) {
          
          // Check if we have localStorage data before clearing
          // If localStorage exists, it might be a cookie issue, not an auth issue
          if (typeof window !== "undefined") {
            const hasLocalStorageData = localStorage.getItem("login");
            
            if (hasLocalStorageData) {
              // Don't clear localStorage if we have valid data
              // The cookie might just not be set properly
              return;
            }
            
            // Only clear if we don't have localStorage data (truly not authenticated)
            localStorage.removeItem("login");
            localStorage.removeItem("user");
            sessionStorage.clear();
            // Clear cookies manually
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Dispatch logout action
            dispatch(logout());
            
            // Redirect to login
            router.push('/login?session=expired');
          }
        }
      } catch (error) {
        // Error checking ban status
      }
    };

    // Check immediately
    checkBanStatus();

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkBanStatus();
    }, 30000);

    // Check when tab becomes visible (only when user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkBanStatus();
      }
    };

    // Check when window gains focus
    const handleFocus = () => {
      checkBanStatus();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loggedIn, router, dispatch]);

  return null; // This component doesn't render anything
};

export default GlobalBanChecker;
