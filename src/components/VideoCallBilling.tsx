/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

interface VideoCallBillingProps {
  callId?: string;
  callerId?: string;
  currentUserId: string;
  isCreator: boolean;
  userBalance: number; // Fan's gold balance
  creatorEarnings: number; // Creator's earnings
  callRate: number; // Gold per minute rate
  isConnected: boolean;
  onInsufficientFunds: () => void; // Callback when fan runs out of money
}

export default function VideoCallBilling({
  callId,
  callerId,
  currentUserId,
  isCreator,
  userBalance,
  creatorEarnings,
  callRate,
  isConnected,
  onInsufficientFunds
}: VideoCallBillingProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(userBalance);
  const [currentEarnings, setCurrentEarnings] = useState(creatorEarnings);
  const [lastBilledMinute, setLastBilledMinute] = useState(0);
  
  const callStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const billingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socket = getSocket();

  // Format duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call timer
  const startCallTimer = useCallback(() => {
    if (durationIntervalRef.current) return;
    console.log('⏱️ [Billing] Starting call timer');
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);
  }, []);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    console.log('⏱️ [Billing] Stopping call timer');
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setCallDuration(0);
  }, []);

  // Start billing system
  const startBilling = useCallback(() => {
    console.log('💰 [Billing] Starting billing system');
    setLastBilledMinute(0);
    
    const interval = setInterval(() => {
      const currentMinute = Math.floor(callDuration / 60);
      
      if (currentMinute > lastBilledMinute) {
        console.log(`💰 [Billing] Billing for minute ${currentMinute}`);
        
        // Check if fan has enough balance
        if (!isCreator && currentBalance < callRate) {
          console.log('💰 [Billing] Insufficient funds - ending call');
          onInsufficientFunds();
          return;
        }
        
        // Deduct from fan's balance and add to creator's earnings
        if (!isCreator) {
          setCurrentBalance(prev => {
            const newBalance = prev - callRate;
            console.log(`💰 [Billing] Fan balance: ${prev} -> ${newBalance}`);
            return newBalance;
          });
        }
        
        if (isCreator) {
          setCurrentEarnings(prev => {
            const newEarnings = prev + callRate;
            console.log(`💰 [Billing] Creator earnings: ${prev} -> ${newEarnings}`);
            return newEarnings;
          });
        }
        
        setLastBilledMinute(currentMinute);
        
        // Emit billing event to backend
        if (socket && callId && callerId) {
          socket.emit('video_call_billing', {
            callId: callId,
            callerId: callerId,
            currentUserId,
            amount: callRate,
            minute: currentMinute
          });
        }
      }
    }, 1000); // Check every second
    
    setBillingInterval(interval);
  }, [callDuration, lastBilledMinute, currentBalance, callRate, isCreator, socket, callId, callerId, currentUserId, onInsufficientFunds]);

  // Stop billing system
  const stopBilling = useCallback(() => {
    console.log('💰 [Billing] Stopping billing system');
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
  }, []);

  // Handle balance updates from backend
  const handleBalanceUpdate = useCallback((data: any) => {
    console.log('💰 [Billing] Balance update received:', data);
    if (data.type === 'deduct') {
      setCurrentBalance(parseFloat(data.balance || '0'));
    } else if (data.type === 'earn') {
      setCurrentEarnings(data.earnings);
    }
  }, []);

  // Handle insufficient funds from backend
  const handleInsufficientFunds = useCallback((data: any) => {
    console.log('💰 [Billing] Insufficient funds:', data);
    onInsufficientFunds();
  }, [onInsufficientFunds]);

  // Start timer and billing when connected
  useEffect(() => {
    if (isConnected) {
      startCallTimer();
      startBilling();
    } else {
      stopCallTimer();
      stopBilling();
    }
  }, [isConnected, startCallTimer, startBilling, stopCallTimer, stopBilling]);

  // Socket event listeners for balance updates
  useEffect(() => {
    if (!socket) return;

    socket.on('balance_updated', handleBalanceUpdate);
    socket.on('insufficient_funds', handleInsufficientFunds);

    return () => {
      socket.off('balance_updated', handleBalanceUpdate);
      socket.off('insufficient_funds', handleInsufficientFunds);
    };
  }, [socket, handleBalanceUpdate, handleInsufficientFunds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
      stopBilling();
    };
  }, [stopCallTimer, stopBilling]);

  if (!isConnected) return null;

  return (
    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-4">
        {/* Call Timer */}
        <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
        
        {/* Fan Balance Display */}
        {!isCreator && (
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-sm">💰</span>
            <span className="font-semibold">{currentBalance}</span>
            <span className="text-xs">Gold</span>
          </div>
        )}
        
        {/* Creator Earnings Display */}
        {isCreator && (
          <div className="flex items-center gap-2 text-green-400">
            <span className="text-sm">💎</span>
            <span className="font-semibold">{currentEarnings}</span>
            <span className="text-xs">Earnings</span>
          </div>
        )}
      </div>
    </div>
  );
}
