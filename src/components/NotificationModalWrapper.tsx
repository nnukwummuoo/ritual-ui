'use client';

import { NotificationPermissionModal } from './NotificationPermissionModal';
import { useNotificationModal } from '@/hooks/useNotificationModal';

export const NotificationModalWrapper = () => {
  const { showModal, closeModal, enableNotifications } = useNotificationModal();

  if (!showModal) return null;

  return (
    <NotificationPermissionModal 
      onClose={closeModal}
      onEnable={enableNotifications}
    />
  );
};
