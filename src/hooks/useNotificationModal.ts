import { useState, useEffect } from 'react';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';

export const useNotificationModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading
  } = usePushNotificationContext();

  useEffect(() => {
    // Only show modal if:
    // 1. Push notifications are supported
    // 2. User is not already subscribed
    // 3. Permission is not denied
    // 4. We haven't shown the modal before in this session
    // 5. Not currently loading
    if (
      isSupported && 
      !isSubscribed && 
      permission !== 'denied' && 
      !hasShownModal && 
      !isLoading
    ) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setShowModal(true);
        setHasShownModal(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, permission, hasShownModal, isLoading]);

  const closeModal = () => {
    setShowModal(false);
  };

  const enableNotifications = () => {
    setShowModal(false);
    // The actual subscription will be handled by the modal component
  };

  return {
    showModal,
    closeModal,
    enableNotifications
  };
};
