'use client';

import { useEffect } from 'react';
import { serviceWorkerManager } from '@/utils/serviceWorkerManager';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    const initializeServiceWorkers = async () => {
      // Register unified service worker (includes both PWA caching and push notifications)
      // The unified worker handles both functionalities, so no conflicts
      // Register for everyone (both authenticated and unauthenticated users)
      console.log('Registering unified service worker (PWA + Push Notifications)');
      await serviceWorkerManager.register();
    };

    // Register in both development and production for PWA installability
    // This ensures the install prompt works for all users
    initializeServiceWorkers();
  }, []);

  return null; // This component doesn't render anything
}
