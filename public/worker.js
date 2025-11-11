// Unified Service Worker - Combines PWA caching and Push Notifications
// This file will be processed by next-pwa/Workbox during build

// IMPORTANT: Workbox scripts will be injected here by next-pwa during build
// The importScripts for workbox will be automatically added by next-pwa
// In development, you might see a placeholder, but in production build,
// next-pwa will replace this with the actual Workbox imports

// IMPORTANT: self.__WB_MANIFEST will be injected by next-pwa during build
// This reference must exist in the source file for next-pwa to find and replace it
const wbManifest = self.__WB_MANIFEST;

// --- PUSH NOTIFICATION LOGIC ---
const VAPID_PUBLIC_KEY = 'BFOop0dhgbA4z797vPVoKUvMf_aTocG5baoucv2r14ZOv2xXwIc3QYPWcRtxHUPBIm9wiHUjlLM30wTVVLi_GDk';

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push SW: Push event received', event);
  console.log('Push SW: Event data:', event.data ? event.data.text() : 'No data');
  
  let notificationData = {
    title: 'MmeKo',
    body: 'You have a new notification',
    icon: '/icons/m-logo.png',
    badge: '/icons/m-logo.png',
    tag: `mmeko-notification-${Date.now()}`, // Make each notification unique
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/m-logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/m-logo.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log('Push SW: Push data parsed', pushData);
      
      if (pushData.message) {
        notificationData.body = pushData.message;
      }
      
      if (pushData.icon) {
        notificationData.icon = pushData.icon;
      }
      
      if (pushData.title) {
        notificationData.title = pushData.title;
      }
      
      if (pushData.url) {
        notificationData.data.url = pushData.url;
      }
      
      if (pushData.userid) {
        notificationData.data.userid = pushData.userid;
      }
      
      // Set different tags for different notification types
      if (pushData.type === 'message') {
        notificationData.tag = `mmeko-message-${Date.now()}`;
        notificationData.data.url = '/message';
      } else if (pushData.type === 'support') {
        notificationData.tag = `mmeko-support-${Date.now()}`;
        notificationData.data.url = '/message/supportchat';
      } else if (pushData.type === 'activity') {
        notificationData.tag = `mmeko-activity-${Date.now()}`;
        notificationData.data.url = '/notifications';
      } else if (pushData.type === 'admin') {
        notificationData.tag = `mmeko-admin-${Date.now()}`;
        notificationData.data.url = '/mmeko/admin';
      } else {
        // For any other type or no type, ensure unique tag
        notificationData.tag = `mmeko-general-${Date.now()}`;
      }
      
    } catch (error) {
      console.error('Push SW: Error parsing push data', error);
      // Error parsing push data, using defaults
    }
  }

  // Chrome-specific notification handling
  const notificationOptions = {
    ...notificationData,
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    noscreen: false, // Ensure notification shows on screen
    sticky: true // Keep notification visible
  };
  
  // Chrome-specific notification handling
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  
  console.log('Push SW: Showing notification with tag:', notificationData.tag);
  
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationOptions
  ).then(() => {
    console.log('Push SW: Notification shown successfully with tag:', notificationData.tag);
    
    // Additional check to ensure notification is actually visible
    return self.registration.getNotifications().then(notifications => {
      
      if (notifications.length === 0 && isChrome) {
        console.log('Push SW: No notifications visible, trying Chrome-specific options');
        
        // Try Chrome-specific notification options
        const chromeOptions = {
          body: notificationData.body,
          icon: '/icons/m-logo.png',
          badge: '/icons/m-logo.png',
          tag: notificationData.tag,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200],
          timestamp: Date.now(),
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/icons/m-logo.png'
            },
            {
              action: 'close',
              title: 'Close',
              icon: '/icons/m-logo.png'
            }
          ]
        };
        
        return self.registration.showNotification(notificationData.title, chromeOptions);
      }
      
    });
  }).catch((error) => {
    console.error('Push SW: Error showing notification, trying minimal options', error);
    // Try again with minimal options if first attempt fails
    return self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: '/icons/m-logo.png',
      badge: '/icons/m-logo.png',
      tag: notificationData.tag,
      requireInteraction: true
    });   
  });

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Push SW: Notification clicked', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  let urlToOpen = notificationData.url || '/';
  
  // Handle different actions
  if (action === 'close') {
    return;
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Push SW: Background sync event', event.tag);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any pending notifications
      Promise.resolve()
    );
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push SW: Push subscription changed', event);
  
  event.waitUntil(
    // Re-subscribe to push notifications
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    }).then(function(subscription) {
      // Send new subscription to server
      return fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    })
  );
});

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Handle errors
self.addEventListener('error', function(event) {
  console.error('Push SW: Error', event);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('Push SW: Unhandled rejection', event);
});

console.log('Unified Service Worker: Loaded with PWA and Push Notification support');

// --- END PUSH NOTIFICATION LOGIC ---

// --- WORKBOX PRECACHE ---
// Workbox will inject its precache manifest here during build
// The manifest will be injected as self.__WB_MANIFEST
// IMPORTANT: self.__WB_MANIFEST must be referenced directly for next-pwa to inject it

// Register runtime caching routes when Workbox is available
if (typeof workbox !== 'undefined' && workbox.routing && workbox.strategies && workbox.precaching) {
  // Precache all assets from the manifest
  // wbManifest contains self.__WB_MANIFEST which was replaced by next-pwa during build
  workbox.precaching.precacheAndRoute(wbManifest);
  
  // Clean up outdated caches
  workbox.precaching.cleanupOutdatedCaches();
  
  // Claim clients immediately
  workbox.core.clientsClaim();
  
  // Skip waiting
  self.skipWaiting();

  // --- RUNTIME CACHING STRATEGIES ---
  const { registerRoute } = workbox.routing;
  const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  const { RangeRequestsPlugin } = workbox.rangeRequests;

  // Google Fonts - CacheFirst
  registerRoute(
    /^https:\/\/fonts\.googleapis\.com\/.*/i,
    new CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        })
      ]
    })
  );

  // Google Fonts Static - CacheFirst
  registerRoute(
    /^https:\/\/fonts\.gstatic\.com\/.*/i,
    new CacheFirst({
      cacheName: 'google-fonts-static',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        })
      ]
    })
  );

  // Static Font Assets - StaleWhileRevalidate
  registerRoute(
    /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    new StaleWhileRevalidate({
      cacheName: 'static-font-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        })
      ]
    })
  );

  // Static Image Assets - StaleWhileRevalidate
  registerRoute(
    /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    new StaleWhileRevalidate({
      cacheName: 'static-image-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // Next.js Image Optimization - StaleWhileRevalidate
  registerRoute(
    /\/_next\/image\?url=.+$/i,
    new StaleWhileRevalidate({
      cacheName: 'next-image',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // Audio Assets - CacheFirst with RangeRequests
  registerRoute(
    /\.(?:mp3|wav|ogg)$/i,
    new CacheFirst({
      cacheName: 'static-audio-assets',
      plugins: [
        new RangeRequestsPlugin(),
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // Video Assets - CacheFirst with RangeRequests
  registerRoute(
    /\.(?:mp4)$/i,
    new CacheFirst({
      cacheName: 'static-video-assets',
      plugins: [
        new RangeRequestsPlugin(),
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // JavaScript Assets - StaleWhileRevalidate
  registerRoute(
    /\.(?:js)$/i,
    new StaleWhileRevalidate({
      cacheName: 'static-js-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // CSS Assets - StaleWhileRevalidate
  registerRoute(
    /\.(?:css|less)$/i,
    new StaleWhileRevalidate({
      cacheName: 'static-style-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  // API Cache - NetworkFirst with timeout
  registerRoute(
    /^https:\/\/mmekoapi\.onrender\.com\/.*/i,
    new NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 10,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        })
      ]
    })
  );

  console.log('Runtime caching strategies registered');
} else {
  console.warn('Workbox not available, runtime caching not registered');
}

