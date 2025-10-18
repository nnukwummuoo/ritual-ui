/* eslint-disable @typescript-eslint/no-unused-vars */
// Service Worker for Push Notifications
const CACHE_NAME = 'mmeko-push-v4';
const VAPID_PUBLIC_KEY = 'BFOop0dhgbA4z797vPVoKUvMf_aTocG5baoucv2r14ZOv2xXwIc3QYPWcRtxHUPBIm9wiHUjlLM30wTVVLi_GDk';


// Install event
self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
  // Clear old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Message event (for handling skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  
  let notificationData = {
    title: 'MmeKo',
    body: 'You have a new notification',
    icon: '/icons/m-logo.png',
    badge: '/icons/m-logo.png',
    tag: 'mmeko-notification',
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
      
      if (pushData.message) {
        notificationData.body = pushData.message;
      }
      
      // FORCE DEFAULT ICONS - Ignore backend icon and always use defaults
      // notificationData.icon = pushData.icon; // Commented out to force default
      
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
      }
      
    } catch (error) {
      // Error parsing push data, using defaults
    }
  }

  
  // Chrome-specific notification handling
  const notificationOptions = {
    ...notificationData,
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    renotify: true, // Force notification even with same tag
    noscreen: false, // Ensure notification shows on screen
    sticky: true // Keep notification visible
  };
  
  
  // Chrome-specific notification handling
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationOptions
  ).then(() => {
    
    // Additional check to ensure notification is actually visible
    return self.registration.getNotifications().then(notifications => {
      
      if (notifications.length === 0 && isChrome) {
        
        // Try Chrome-specific notification options
        const chromeOptions = {
          body: notificationData.body,
          icon: notificationData.icon,
          badge: notificationData.badge,
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
    // Try again with minimal options if first attempt fails
    return self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      tag: notificationData.tag,
      requireInteraction: true
    });   
  });

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  
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
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any pending notifications
      Promise.resolve()
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
