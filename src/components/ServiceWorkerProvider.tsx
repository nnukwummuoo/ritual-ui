'use client';

import { useEffect } from 'react';
import { serviceWorkerManager } from '@/utils/serviceWorkerManager';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    const initializeServiceWorkers = async () => {
      // Register PWA service worker (for caching, offline support)
      await serviceWorkerManager.registerPWA();
      
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
