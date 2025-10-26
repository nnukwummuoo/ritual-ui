'use client';

import { useState } from 'react';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';
import { Bell, BellOff, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

export default function PushNotificationTest() {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification
  } = usePushNotificationContext();

  const [testMessage, setTestMessage] = useState('Test notification message');
  const [testTitle, setTestTitle] = useState('Test Title');

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      alert('Successfully subscribed to push notifications!');
    } else {
      alert('Failed to subscribe to push notifications. Check console for errors.');
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      alert('Successfully unsubscribed from push notifications!');
    } else {
      alert('Failed to unsubscribe from push notifications. Check console for errors.');
    }
  };

  const handleTestLocal = async () => {
    await showLocalNotification(testMessage, {
      title: testTitle,
      icon: '/icons/m-logo.png',
      type: 'message'
    });
  };

  const handleTestPush = async () => {
    try {
      const response = await fetch('/api/push/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: 'test-user', // You might want to get this from context
          message: testMessage,
          title: testTitle,
          type: 'test'
        })
      });

      if (response.ok) {
        alert('Test push notification sent!');
      } else {
        alert('Failed to send test push notification.');
      }
    } catch (error) {
      console.error('Error sending test push:', error);
      alert('Error sending test push notification. Check console for details.');
    }
  };

  const handleTestActivity = async () => {
    try {
      const response = await fetch('/api/push/send-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: 'test-user',
          message: 'You have new activity!'
        })
      });

      if (response.ok) {
        alert('Activity notification sent!');
      } else {
        alert('Failed to send activity notification.');
      }
    } catch (error) {
      console.error('Error sending activity notification:', error);
      alert('Error sending activity notification. Check console for details.');
    }
  };

  const handleTestMessage = async () => {
    try {
      const response = await fetch('/api/push/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: 'test-user',
          message: 'You have a new message!',
          senderName: 'Test User'
        })
      });

      if (response.ok) {
        alert('Message notification sent!');
      } else {
        alert('Failed to send message notification.');
      }
    } catch (error) {
      console.error('Error sending message notification:', error);
      alert('Error sending message notification. Check console for details.');
    }
  };

  const handleTestSupport = async () => {
    try {
      const response = await fetch('/api/push/send-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: 'test-user',
          message: 'Support team has responded!'
        })
      });

      if (response.ok) {
        alert('Support notification sent!');
      } else {
        alert('Failed to send support notification.');
      }
    } catch (error) {
      console.error('Error sending support notification:', error);
      alert('Error sending support notification. Check console for details.');
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Push notifications not supported</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Your browser doesn't support push notifications or you're not on HTTPS.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Push Notification Test
      </h3>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Permission:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            permission === 'granted' ? 'bg-green-100 text-green-800' :
            permission === 'denied' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {permission}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Subscribed:</span>
          {isSubscribed ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Test Inputs */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Title
          </label>
          <input
            type="text"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter test title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Message
          </label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter test message"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bell className="w-4 h-4" />
            {isLoading ? 'Subscribing...' : 'Subscribe to Push Notifications'}
          </button>
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BellOff className="w-4 h-4" />
            {isLoading ? 'Unsubscribing...' : 'Unsubscribe from Push Notifications'}
          </button>
        )}

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTestLocal}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <TestTube className="w-4 h-4" />
              Test Local
            </button>
            
            <button
              onClick={handleTestPush}
              disabled={isLoading || !isSubscribed}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <TestTube className="w-4 h-4" />
              Test Push
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={handleTestActivity}
              disabled={isLoading || !isSubscribed}
              className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Activity
            </button>
            
            <button
              onClick={handleTestMessage}
              disabled={isLoading || !isSubscribed}
              className="flex items-center justify-center gap-1 px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Message
            </button>
            
            <button
              onClick={handleTestSupport}
              disabled={isLoading || !isSubscribed}
              className="flex items-center justify-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Support
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
          Debug Information
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
          <div>Supported: {isSupported ? 'Yes' : 'No'}</div>
          <div>Permission: {permission}</div>
          <div>Subscribed: {isSubscribed ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
        </div>
      </details>
    </div>
  );
}