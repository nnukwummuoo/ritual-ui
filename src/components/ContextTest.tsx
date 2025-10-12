import React from 'react';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';

const ContextTest: React.FC = () => {
  const context = usePushNotificationContext();
  
  return (
    <div className="p-4 bg-gray-700 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">Context Test</h3>
      <div className="space-y-2 text-sm">
        <div>isSupported: {context.isSupported ? '✅' : '❌'}</div>
        <div>isSubscribed: {context.isSubscribed ? '✅' : '❌'}</div>
        <div>permission: {context.permission}</div>
        <div>isLoading: {context.isLoading ? '⏳' : '✅'}</div>
        <div>error: {context.error || 'None'}</div>
      </div>
    </div>
  );
};

export default ContextTest;
