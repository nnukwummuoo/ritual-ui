import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useMemo } from 'react';

export const useActivityNotificationIndicator = () => {
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

    // Filter only activity-related notifications (request, request, fan meet related)
    const activityNotifications = notifications.filter(notification => {
      const message = notification.message.toLowerCase();
      return message.includes('request') || 
             message.includes('request') ||
             message.includes('fan meet') ||
             message.includes('accepted') ||
             message.includes('declined') ||
             message.includes('cancelled') ||
             message.includes('expired') ||
             message.includes('completed');
    });

    const unreadActivityNotifications = activityNotifications.filter(notification => !notification.seen);
    
    const result = {
      hasUnread: unreadActivityNotifications.length > 0,
      unreadCount: unreadActivityNotifications.length,
      totalCount: activityNotifications.length,
      isLoading: notifications_stats === 'loading'
    };
    
    return result;
  }, [notifications, notifications_stats]);

  return notificationData;
};
