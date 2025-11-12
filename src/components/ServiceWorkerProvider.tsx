'use client';

import { useEffect } from 'react';
import { serviceWorkerManager } from '@/utils/serviceWorkerManager';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    const initializeServiceWorkers = async () => {
      // Register unified service worker (includes both PWA caching and push notifications)
      // The unified worker handles both functionalities, so no conflicts
      console.log('Registering unified service worker (PWA + Push Notifications)');
      await serviceWorkerManager.register();
    };

    // Only register in production
    if (process.env.NODE_ENV === 'production') {
      initializeServiceWorkers();
    }
  }, []);

  return null; // This component doesn't render anything
}
