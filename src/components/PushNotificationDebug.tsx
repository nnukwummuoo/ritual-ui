import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationDebug: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification,
  } = usePushNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkSupport = () => {
      const info = {
        isSecureContext: window.isSecureContext,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasPushManager: 'PushManager' in window,
        hasNotification: 'Notification' in window,
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
      };
      setDebugInfo(info);
    };

    checkSupport();
  }, []);

  const handleTestLocalNotification = async () => {
    await showLocalNotification('Test notification from debug component', {
      title: 'Debug Test',
      type: 'activity'
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white max-w-2xl mx-auto">
      <h3 className="text-lg font-bold mb-4">Push Notification Debug Info</h3>
      
      {/* Support Status */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Support Status:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className={`p-2 rounded ${isSupported ? 'bg-green-600' : 'bg-red-600'}`}>
            Overall Support: {isSupported ? '✅ Supported' : '❌ Not Supported'}
          </div>
          <div className={`p-2 rounded ${isSubscribed ? 'bg-green-600' : 'bg-gray-600'}`}>
            Subscribed: {isSubscribed ? '✅ Yes' : '❌ No'}
          </div>
          <div className={`p-2 rounded ${
            permission === 'granted' ? 'bg-green-600' : 
            permission === 'denied' ? 'bg-red-600' : 'bg-yellow-600'
          }`}>
            Permission: {permission}
          </div>
          <div className={`p-2 rounded ${isLoading ? 'bg-yellow-600' : 'bg-gray-600'}`}>
            Loading: {isLoading ? '⏳ Yes' : '✅ No'}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-600 rounded">
          <h4 className="font-semibold">Error:</h4>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Browser Support Details */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Browser Support Details:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className={`p-2 rounded ${debugInfo.isSecureContext ? 'bg-green-600' : 'bg-red-600'}`}>
            Secure Context: {debugInfo.isSecureContext ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${debugInfo.hasServiceWorker ? 'bg-green-600' : 'bg-red-600'}`}>
            Service Worker: {debugInfo.hasServiceWorker ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${debugInfo.hasPushManager ? 'bg-green-600' : 'bg-red-600'}`}>
            Push Manager: {debugInfo.hasPushManager ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${debugInfo.hasNotification ? 'bg-green-600' : 'bg-red-600'}`}>
            Notifications: {debugInfo.hasNotification ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Environment Info:</h4>
        <div className="text-sm space-y-1">
          <div>Protocol: {debugInfo.protocol}</div>
          <div>Hostname: {debugInfo.hostname}</div>
          <div>Port: {debugInfo.port || 'default'}</div>
          <div>User Agent: {debugInfo.userAgent?.substring(0, 50)}...</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={subscribe}
          disabled={isLoading || !isSupported || isSubscribed}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
        >
          Subscribe
        </button>
        <button
          onClick={unsubscribe}
          disabled={isLoading || !isSupported || !isSubscribed}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
        >
          Unsubscribe
        </button>
        <button
          onClick={handleTestLocalNotification}
          disabled={!isSupported}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
        >
          Test Local Notification
        </button>
      </div>

      {/* Troubleshooting Tips */}
      {!isSupported && (
        <div className="mt-4 p-3 bg-yellow-600 rounded">
          <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm space-y-1">
            <li>• Make sure you're using HTTPS or localhost</li>
            <li>• Use a modern browser (Chrome, Firefox, Safari, Edge)</li>
            <li>• Check if notifications are blocked in browser settings</li>
            <li>• Try refreshing the page</li>
            <li>• Check browser console for detailed error messages</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PushNotificationDebug;
