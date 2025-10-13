import React, { useState } from 'react';
import pushNotificationService from '@/lib/pushNotifications';

const PushNotificationTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Not tested yet');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      console.log('🧪 [Test] Starting push notification test...');
      
      // Test 1: Check browser support
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      const isSecure = window.isSecureContext;
      
      console.log('🧪 [Test] Browser support:', {
        hasServiceWorker,
        hasPushManager,
        hasNotification,
        isSecure
      });
      
      if (!hasServiceWorker || !hasPushManager || !hasNotification || !isSecure) {
        setTestResult('❌ Browser not supported');
        return;
      }
      
      // Test 2: Initialize service
      console.log('🧪 [Test] Initializing push notification service...');
      const initialized = await pushNotificationService.initialize();
      console.log('🧪 [Test] Initialization result:', initialized);
      
      if (!initialized) {
        setTestResult('❌ Service initialization failed');
        return;
      }
      
      // Test 3: Request permission
      console.log('🧪 [Test] Requesting permission...');
      const permission = await pushNotificationService.requestPermission();
      console.log('🧪 [Test] Permission result:', permission);
      
      if (permission !== 'granted') {
        setTestResult(`❌ Permission denied: ${permission}`);
        return;
      }
      
      // Test 4: Check subscription
      console.log('🧪 [Test] Checking subscription...');
      const isSubscribed = await pushNotificationService.isSubscribed();
      console.log('🧪 [Test] Subscription status:', isSubscribed);
      
      setTestResult(`✅ All tests passed! Subscribed: ${isSubscribed}`);
      
    } catch (error: any) {
      console.error('🧪 [Test] Error:', error);
      setTestResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalNotification = async () => {
    try {
      await pushNotificationService.showLocalNotification({
        message: 'Test notification from manual test',
        title: 'Manual Test',
        type: 'activity'
      });
      setTestResult('✅ Local notification sent');
    } catch (error: any) {
      setTestResult(`❌ Local notification failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">Manual Push Notification Test</h3>
      
      <div className="mb-4">
        <p className="text-sm">Result: {testResult}</p>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
        >
          {isLoading ? 'Testing...' : 'Run Full Test'}
        </button>
        
        <button
          onClick={testLocalNotification}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
        >
          Test Local Notification
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-300">
        <p>This test bypasses the user login requirement and tests push notifications directly.</p>
      </div>
    </div>
  );
};

export default PushNotificationTest;
