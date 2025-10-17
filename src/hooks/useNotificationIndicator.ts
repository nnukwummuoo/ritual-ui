import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useMemo } from 'react';

export const useNotificationIndicator = () => {
  const { notifications, notifications_stats } = useSelector(
    (state: RootState) => state.profile
  );

  const notificationData = useMemo(() => {
    console.log("[useNotificationIndicator] Notifications:", notifications?.length || 0, "Stats:", notifications_stats);
    
    if (!notifications || notifications.length === 0) {
      return {
        hasUnread: false,
        unreadCount: 0,
        totalCount: 0,
        isLoading: notifications_stats === 'loading',
        allUnreadCount: 0
      };
    }

    const unreadNotifications = notifications.filter(notification => !notification.seen);
    
    const result = {
      hasUnread: unreadNotifications.length > 0,
      unreadCount: unreadNotifications.length,
      totalCount: notifications.length,
      isLoading: notifications_stats === 'loading',
      allUnreadCount: unreadNotifications.length
    };
    
    console.log("[useNotificationIndicator] Result:", result);
    return result;
  }, [notifications, notifications_stats]);

  return notificationData;
};
