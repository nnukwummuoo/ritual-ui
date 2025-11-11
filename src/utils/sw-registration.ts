// Service Worker Registration Utility
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        console.log('SW registered: ', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
        
        // Handle errors
        registration.addEventListener('error', (event) => {
          console.error('SW registration failed: ', event);
        });
        
      } catch (error) {
        console.error('SW registration failed: ', error);
      }
    });
  }
}

// Check if service worker is supported and working
export function checkServiceWorkerSupport() {
  if (typeof window === 'undefined') return false;
  
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return false;
  }
  
  return true;
}

// Get service worker status
export async function getServiceWorkerStatus() {
  if (!checkServiceWorkerSupport()) {
    return { supported: false, registered: false, error: 'Not supported' };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      registered: !!registration,
      controller: !!navigator.serviceWorker.controller,
      registration
    };
  } catch (error) {
    return {
      supported: true,
      registered: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
