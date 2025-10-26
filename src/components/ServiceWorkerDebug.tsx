'use client';

import { useEffect, useState } from 'react';
import { serviceWorkerManager } from '@/utils/serviceWorkerManager';

export default function ServiceWorkerDebug() {
  const [swStatus, setSwStatus] = useState<{
    pwa: boolean;
    push: boolean;
    pwaActive: boolean;
    pushActive: boolean;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await serviceWorkerManager.checkStatus();
      setSwStatus(status);
    };
    
    checkStatus();
    
    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600"
      >
        SW Debug
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
          <h3 className="font-bold text-sm mb-2">Service Worker Status</h3>
        <div className="text-xs space-y-1">
          <div>
            <strong>PWA SW:</strong> {swStatus?.pwa ? '✅' : '❌'} 
            {swStatus?.pwaActive && ' (Active)'}
          </div>
          <div>
            <strong>Push SW:</strong> {swStatus?.push ? '✅' : '❌'} 
            {swStatus?.pushActive && ' (Active)'}
          </div>
          <div className="pt-2 border-t space-y-1">
            <button
              onClick={() => serviceWorkerManager.registerAll()}
              className="text-blue-600 hover:underline text-xs block"
            >
              Register Both SWs
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline text-xs block"
            >
              Reload Page
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
