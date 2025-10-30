"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAuthUser } from '@/store/registerSlice';
import type { AppDispatch } from '@/store/store';
import type { RootState } from '@/store/store';

const ReduxHydrator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxLoggedIn = useSelector((state: RootState) => state.register.logedin);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Only run hydration once and only if user is not already logged in
    if (typeof window !== "undefined" && !reduxLoggedIn && !hasHydrated) {
      try {
        const raw = localStorage.getItem("login");
        
        if (raw) {
          const data = JSON.parse(raw);
          
          // Check if we have valid login data
          if (data?.userID && (data?.refreshtoken || data?.accesstoken)) {
            dispatch(loginAuthUser({
              email: data.username || data.email || '', // Use username as email
              password: data.password || '',
              message: "restored_from_storage",
              refreshtoken: data.refreshtoken || '',
              accesstoken: data.accesstoken || '',
              userID: data.userID,
              creator_portfolio_id: data.creator_portfolio_id,
              creator_portfolio: data.creator_portfolio,
            }));
            
            setHasHydrated(true);
          } else {
            setHasHydrated(true);
          }
        } else {
          setHasHydrated(true);
        }
      } catch (error) {
        setHasHydrated(true);
      }
    } else if (reduxLoggedIn) {
      setHasHydrated(true);
    }
  }, [dispatch, reduxLoggedIn, hasHydrated]);

  return null; // This component doesn't render anything
};

export default ReduxHydrator;