// Service Worker Manager - Handles both PWA and Push Notification service workers
export class ServiceWorkerManager {
  private pwaRegistration: ServiceWorkerRegistration | null = null;
  private pushRegistration: ServiceWorkerRegistration | null = null;

  // Register PWA service worker (handles caching, offline, etc.)
  async registerPWA(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      this.pwaRegistration = await navigator.serviceWorker.register('/sw-pwa.js', {
        scope: '/'
      });
      
      console.log('PWA SW registered:', this.pwaRegistration);
      return true;
    } catch (error) {
      console.error('PWA SW registration failed:', error);
      return false;
    }
  }

  // Register Push Notification service worker
  async registerPush(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      // First, unregister any existing service workers to prevent conflicts
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of existingRegistrations) {
        if (registration.scope === window.location.origin + '/' && 
            registration.active?.scriptURL?.includes('sw-pwa.js')) {
          console.log('Unregistering PWA service worker to prevent conflict');
          await registration.unregister();
        }
      }

      // Register the push service worker
      this.pushRegistration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/'
      });
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      return true;
    } catch (error) {
      console.error('Push SW registration failed:', error);
      return false;
    }
  }

  // Register both service workers
  async registerAll(): Promise<{ pwa: boolean; push: boolean }> {
    const [pwaSuccess, pushSuccess] = await Promise.all([
      this.registerPWA(),
      this.registerPush()
    ]);

    return {
      pwa: pwaSuccess,
      push: pushSuccess
    };
  }

  // Get PWA registration
  getPWARegistration(): ServiceWorkerRegistration | null {
    return this.pwaRegistration;
  }

  // Get Push registration
  getPushRegistration(): ServiceWorkerRegistration | null {
    return this.pushRegistration;
  }

  // Check if both service workers are registered
  async checkStatus(): Promise<{
    pwa: boolean;
    push: boolean;
    pwaActive: boolean;
    pushActive: boolean;
  }> {
    const pwaReg = await navigator.serviceWorker.getRegistration('/sw-pwa.js');
    const pushReg = await navigator.serviceWorker.getRegistration('/sw-push.js');

    return {
      pwa: !!pwaReg,
      push: !!pushReg,
      pwaActive: !!pwaReg?.active,
      pushActive: !!pushReg?.active
    };
  }

  // Unregister all service workers
  async unregisterAll(): Promise<void> {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    this.pwaRegistration = null;
    this.pushRegistration = null;
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
