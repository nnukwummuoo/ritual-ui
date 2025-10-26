// Service Worker for Push Notifications Only
const CACHE_NAME = 'mmeko-push-v4';
const VAPID_PUBLIC_KEY = 'BFOop0dhgbA4z797vPVoKUvMf_aTocG5baoucv2r14ZOv2xXwIc3QYPWcRtxHUPBIm9wiHUjlLM30wTVVLi_GDk';

// Install event
self.addEventListener('install', (event) => {
  console.log('Push SW: Install event');
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
  console.log('Push SW: Activate event');
  event.waitUntil(self.clients.claim());
});

// Message event (for handling skip waiting)
self.addEventListener('message', (event) => {
  console.log('Push SW: Message event', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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
      applicationServerKey: self.applicationServerKey
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

// Handle errors
self.addEventListener('error', function(event) {
  console.error('Push SW: Error', event);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('Push SW: Unhandled rejection', event);
});

console.log('Push SW: Service worker loaded for push notifications');
