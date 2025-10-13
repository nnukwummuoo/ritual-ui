import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useMemo } from 'react';

export const useNotificationIndicator = () => {
  const { notifications, notifications_stats } = useSelector(
    (state: RootState) => state.profile
  );

  const notificationData = useMemo(() => {
    if (!notifications || notifications.length === 0) {
      return {
        hasUnread: false,
        unreadCount: 0,
        totalCount: 0,
        isLoading: notifications_stats === 'loading'
      };
    }

    const unreadNotifications = notifications.filter(notification => !notification.seen);
    
    return {
      hasUnread: unreadNotifications.length > 0,
      unreadCount: unreadNotifications.length,
      totalCount: notifications.length,
      isLoading: notifications_stats === 'loading'
    };
  }, [notifications, notifications_stats]);

  return notificationData;
};
