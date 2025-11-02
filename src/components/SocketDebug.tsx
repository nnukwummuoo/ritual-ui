"use client";

import { useState, useEffect } from 'react';
import { getSocket, resetSocket, reconnectSocket } from '@/lib/socket';
import { testSocketConnection } from '@/lib/socket-test';

export const SocketDebug = () => {
  const [socketStatus, setSocketStatus] = useState<string>('Unknown');
  const [socketId, setSocketId] = useState<string>('');
  const [transport, setTransport] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      setIsConnected(socket.connected);
      setSocketId(socket.id || '');
      setTransport(socket.io.engine.transport.name);
      setSocketStatus(socket.connected ? 'Connected' : 'Disconnected');

      const handleConnect = () => {
        setIsConnected(true);
        setSocketId(socket.id || '');
        setTransport(socket.io.engine.transport.name);
        setSocketStatus('Connected');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setSocketId('');
        setSocketStatus('Disconnected');
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, []);

  const runConnectionTest = async () => {
    const results = [];
    
    // Test local server
    const localResult = await testSocketConnection('http://localhost:3100');
    results.push({ url: 'http://localhost:3100', connected: localResult });
    
    // Test production server
    const prodUrl = process.env.NEXT_PUBLIC_BACKEND || "";
    if (prodUrl) {
      const prodResult = await testSocketConnection(prodUrl);
      results.push({ url: prodUrl, connected: prodResult });
    }
    
    setTestResults(results);
  };

  const handleReconnect = () => {
    resetSocket();
    reconnectSocket();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">🔌 Socket.IO Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> 
          <span className={`ml-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {socketStatus}
          </span>
        </div>
        
        {socketId && (
          <div>
            <strong>Socket ID:</strong> 
            <span className="ml-2 text-gray-300">{socketId}</span>
          </div>
        )}
        
        {transport && (
          <div>
            <strong>Transport:</strong> 
            <span className="ml-2 text-gray-300">{transport}</span>
          </div>
        )}
        
        <div>
          <strong>Environment:</strong> 
          <span className="ml-2 text-gray-300">{process.env.NODE_ENV}</span>
        </div>
        
        <div>
          <strong>Hostname:</strong> 
          <span className="ml-2 text-gray-300">{typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={runConnectionTest}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
        >
          Test Connections
        </button>
        
        <button
          onClick={handleReconnect}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
        >
          Reconnect
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <h4 className="font-bold text-xs mb-2">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className="text-xs">
              <span className={result.connected ? 'text-green-400' : 'text-red-400'}>
                {result.connected ? '✅' : '❌'}
              </span>
              <span className="ml-2 text-gray-300">{result.url}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
