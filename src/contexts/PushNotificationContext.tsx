import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import pushNotificationService from '@/lib/pushNotifications';
import { serviceWorkerManager } from '@/utils/serviceWorkerManager';

interface PushNotificationContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showLocalNotification: (message: string, options?: {
    title?: string;
    icon?: string;
    url?: string;
    type?: 'message' | 'support' | 'activity' | 'admin';
  }) => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export const usePushNotificationContext = () => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotificationContext must be used within a PushNotificationProvider');
  }
  return context;
};

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
  
  // Fallback to localStorage if Redux state is empty (hydration issue)
  const [localUserid, setLocalUserid] = useState<string>('');
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState<boolean>(false);
  
  // Use Redux data if available, otherwise use localStorage
  const userid = reduxUserid || localUserid;
  const isLoggedIn = reduxIsLoggedIn || localIsLoggedIn;

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load userid from localStorage if not in Redux (hydration issue)
  useEffect(() => {
    if (!reduxUserid && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.userID) {
            setLocalUserid(data.userID);
            setLocalIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("[Context] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserid]);

  // Initialize push notifications
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First register the push service worker
        const pushSWRegistered = await serviceWorkerManager.registerPush();
        if (!pushSWRegistered) {
          setError('Failed to register push service worker');
          return;
        }

        // Check if push notifications are supported
        const supported = await pushNotificationService.initialize();
        setIsSupported(supported);

        if (supported) {
          // Check current permission
          const currentPermission = await pushNotificationService.requestPermission();
          setPermission(currentPermission);

          // If permission is granted, automatically subscribe
          if (currentPermission === 'granted') {
            const subscribed = await pushNotificationService.subscribe(userid);
            setIsSubscribed(subscribed);
          } else {
            // Check if already subscribed
            const subscribed = await pushNotificationService.isSubscribed();
            setIsSubscribed(subscribed);
          }
        }
      } catch (err) {
        console.error('Error initializing push notifications:', err);
        setError('Failed to initialize push notifications');
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize on client side to prevent hydration mismatch
    if (isClient && isLoggedIn && userid) {
      initializePushNotifications();
    }
  }, [isClient, isLoggedIn, userid]);

  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!userid) {
      setError('User ID not available');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.subscribe(userid);
      
      if (success) {
        setIsSubscribed(true);
        setPermission('granted');
        return true;
      } else {
        setError('Failed to subscribe to push notifications');
        return false;
      }
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError('Failed to subscribe to push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!userid) {
      setError('User ID not available');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.unsubscribe(userid);
      
      if (success) {
        setIsSubscribed(false);
        return true;
      } else {
        setError('Failed to unsubscribe from push notifications');
        return false;
      }
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe from push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Show local notification
  const showLocalNotification = async (
    message: string,
    options: {
      title?: string;
      icon?: string;
      url?: string;
      type?: 'message' | 'support' | 'activity' | 'admin';
    } = {}
  ): Promise<void> => {
    try {
      await pushNotificationService.showLocalNotification({
        message,
        title: options.title,
        icon: options.icon,
        url: options.url,
        type: options.type,
        userid: userid || undefined,
      });
    } catch (err) {
      console.error('Error showing local notification:', err);
    }
  };

  const value: PushNotificationContextType = {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};
