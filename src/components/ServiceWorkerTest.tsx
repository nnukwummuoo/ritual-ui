import React, { useState, useEffect } from 'react';

const ServiceWorkerTest: React.FC = () => {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [swError, setSwError] = useState<string>('');

  useEffect(() => {
    const testServiceWorker = async () => {
      try {
        setSwStatus('Testing service worker registration...');
        
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          setSwStatus('❌ Service Worker not supported');
          return;
        }

        // Try to register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        setSwStatus('✅ Service Worker registered successfully');
        console.log('Service Worker registration:', registration);

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        setSwStatus('✅ Service Worker is ready');

        // Check if service worker is active
        if (registration.active) {
          setSwStatus('✅ Service Worker is active and running');
        } else {
          setSwStatus('⚠️ Service Worker registered but not active yet');
        }

      } catch (error: any) {
        setSwStatus('❌ Service Worker registration failed');
        setSwError(error.message);
        console.error('Service Worker error:', error);
      }
    };

    testServiceWorker();
  }, []);

  const testFetch = async () => {
    try {
      const response = await fetch('/sw.js');
      if (response.ok) {
        setSwStatus('✅ Service Worker file is accessible');
      } else {
        setSwStatus(`❌ Service Worker file not accessible: ${response.status}`);
      }
    } catch (error: any) {
      setSwStatus(`❌ Error fetching service worker: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">Service Worker Test</h3>
      
      <div className="mb-4">
        <p className="text-sm">Status: {swStatus}</p>
        {swError && (
          <p className="text-sm text-red-400 mt-2">Error: {swError}</p>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={testFetch}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          Test Service Worker File Access
        </button>
        
        <div className="text-xs text-gray-300">
          <p>Current URL: {window.location.href}</p>
          <p>Protocol: {window.location.protocol}</p>
          <p>Is Secure Context: {window.isSecureContext ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerTest;
