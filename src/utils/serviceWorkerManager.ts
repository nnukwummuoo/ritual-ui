// Service Worker Manager - Handles unified PWA and Push Notification service worker
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  // Register unified service worker (handles both PWA caching and push notifications)
  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      // Unregister ALL old service workers to prevent conflicts
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${existingRegistrations.length} existing service worker(s)`);
      
      for (const reg of existingRegistrations) {
        const scriptURL = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || '';
        const fullURL = scriptURL || 'unknown';
        
        // Unregister if it's an old worker OR if it's not the unified sw.js
        if (fullURL.includes('sw-pwa.js') || fullURL.includes('sw-push.js') || (!fullURL.includes('sw.js') && fullURL !== 'unknown')) {
          console.log('Unregistering old service worker:', fullURL);
          try {
            await reg.unregister();
            console.log('Successfully unregistered:', fullURL);
          } catch (err) {
            console.warn('Error unregistering service worker:', fullURL, err);
          }
        }
      }

      // Small delay to ensure unregistration completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Register the unified service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Unified SW registered:', this.registration);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Double-check: unregister any old workers that might have been registered after
      const finalRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of finalRegistrations) {
        const scriptURL = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || '';
        if (scriptURL && (scriptURL.includes('sw-pwa.js') || scriptURL.includes('sw-push.js'))) {
          console.log('Found old worker after registration, unregistering:', scriptURL);
          await reg.unregister();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Unified SW registration failed:', error);
      return false;
    }
  }

  // Legacy method names for backward compatibility
  async registerPWA(): Promise<boolean> {
    return this.register();
  }

  async registerPush(): Promise<boolean> {
    return this.register();
  }

  // Register both (now just registers the unified worker)
  async registerAll(): Promise<{ pwa: boolean; push: boolean }> {
    const success = await this.register();
    return {
      pwa: success,
      push: success
    };
  }

  // Get registration (unified)
  getPWARegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  getPushRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Check if service worker is registered
  async checkStatus(): Promise<{
    pwa: boolean;
    push: boolean;
    pwaActive: boolean;
    pushActive: boolean;
  }> {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');

    return {
      pwa: !!reg,
      push: !!reg,
      pwaActive: !!reg?.active,
      pushActive: !!reg?.active
    };
  }

  // Unregister all service workers
  async unregisterAll(): Promise<void> {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    this.registration = null;
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
