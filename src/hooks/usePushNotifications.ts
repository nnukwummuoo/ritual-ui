import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import pushNotificationService from '@/lib/pushNotifications';

export interface UsePushNotificationsReturn {
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

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userid = useSelector((state: RootState) => state.register.userID);
  const isLoggedIn = useSelector((state: RootState) => state.register.logedin);

  // Initialize push notifications
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if push notifications are supported
        const supported = await pushNotificationService.initialize();
        setIsSupported(supported);

        if (supported) {
          // Check current permission
          const currentPermission = await pushNotificationService.requestPermission();
          setPermission(currentPermission);

          // Check if already subscribed
          const subscribed = await pushNotificationService.isSubscribed();
          setIsSubscribed(subscribed);
        }
      } catch (err) {
        console.error('Error initializing push notifications:', err);
        setError('Failed to initialize push notifications');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && userid) {
      initializePushNotifications();
    }
  }, [isLoggedIn, userid]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
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
  }, [userid]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
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
  }, [userid]);

  // Show local notification
  const showLocalNotification = useCallback(async (
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
  }, [userid]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification,
  };
};
