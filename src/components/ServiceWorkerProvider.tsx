'use client';

import { useEffect } from 'react';
import { serviceWorkerManager } from '@/utils/serviceWorkerManager';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    const initializeServiceWorkers = async () => {
      // Only register PWA service worker if push notifications are not supported
      // This prevents conflicts between the two service workers
      if (!('PushManager' in window) || !('Notification' in window)) {
        console.log('Push notifications not supported, registering PWA service worker');
        await serviceWorkerManager.registerPWA();
      } else {
        console.log('Push notifications supported, PWA service worker will be skipped');
      }
      
      // Push notification service worker will be registered by PushNotificationProvider
      // when user is logged in and permissions are granted
    };

    // Only register in production
    if (process.env.NODE_ENV === 'production') {
      initializeServiceWorkers();
    }
  }, []);

  return null; // This component doesn't render anything
}
