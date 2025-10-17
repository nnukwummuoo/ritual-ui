// Push Notification Service
import { URL as API_URL } from '@/api/config';

const VAPID_PUBLIC_KEY = 'BFOop0dhgbA4z797vPVoKUvMf_aTocG5baoucv2r14ZOv2xXwIc3QYPWcRtxHUPBIm9wiHUjlLM30wTVVLi_GDk';

export interface PushNotificationData {
  message: string;
  title?: string;
  icon?: string;
  url?: string;
  type?: 'message' | 'support' | 'activity' | 'admin';
  userid?: string;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        return false;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        return false;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Check if registration is valid
      if (!this.registration) {
        return false;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  // Subscribe to push notifications
  async subscribe(userid: string): Promise<boolean> {
    try {
      if (!this.registration) {
        console.error('Service Worker not registered');
        return false;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });


      // Send subscription to server
      const success = await this.sendSubscriptionToServer(userid, this.subscription);
      
      if (success) {
        return true;
      } else {
        console.error('Failed to send subscription to server');
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(userid: string): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
      }

      // Remove subscription from server
      await this.removeSubscriptionFromServer(userid);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(userid: string, subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/subpushid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userid,
          subinfo: subscription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return true;
      } else {
        console.error('Failed to send subscription to server:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      return false;
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(userid: string): Promise<void> {
    try {
      await fetch(`${API_URL}/subpushid`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userid,
        }),
      });
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Show local notification (for testing)
  async showLocalNotification(data: PushNotificationData): Promise<void> {
    try {
      if (!this.registration) {
        console.error('Service Worker not registered');
        return;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      await this.registration.showNotification(data.title || 'MmeKo', {
        body: data.message,
        icon: data.icon || '/bell.jpg',
        badge: '/bell.jpg',
        tag: `mmeko-${data.type || 'notification'}`,
        requireInteraction: true,
        data: {
          url: data.url || '/',
          userid: data.userid,
          type: data.type,
        },
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get current subscription
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Get registration
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
