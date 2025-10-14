/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import Image from 'next/image';

interface VideoCallBillingProps {
  callId?: string;
  callerId?: string;
  currentUserId: string;
  isCreator: boolean;
  userBalance: number; // Current user's gold balance (used when they initiate calls)
  creatorEarnings: number; // Creator's earnings (only shown when creator answers calls)
  callRate: number; // Gold per minute rate
  isConnected: boolean;
  onInsufficientFunds: () => void; // Callback when caller runs out of money
  callData?: {
    callerId: string;
    isIncoming: boolean;
    answererId?: string;
  } | null;
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
  onInsufficientFunds,
  callData
}: VideoCallBillingProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(userBalance);
  const [currentEarnings, setCurrentEarnings] = useState(creatorEarnings);
  const [callSpecificEarnings, setCallSpecificEarnings] = useState(0); // Earnings from this specific call
  const [lastBilledMinute, setLastBilledMinute] = useState(0);
  
  // Use refs to avoid infinite re-renders
  const currentBalanceRef = useRef(userBalance);
  const callRateRef = useRef(callRate);
  const callDurationRef = useRef(0);
  const lastBilledMinuteRef = useRef(0);

  // Determine billing logic based on who initiated the call
  const isCaller = callData?.callerId === currentUserId;
  const isAnswerer = !isCaller;
  const shouldBeBilled = isCaller; // Only the caller (initiator) pays - regardless of user type
  const shouldEarn = isAnswerer && isCreator; // Only creators earn when they answer calls (from any caller)
  
  // Log billing logic for debugging
  console.log('💰 [Billing] Logic:', {
    currentUserId,
    callerId: callData?.callerId,
    isCaller,
    isAnswerer,
    isCreator,
    shouldBeBilled,
    shouldEarn
  });

  // Update balance when props change
  useEffect(() => {
    setCurrentBalance(userBalance);
    currentBalanceRef.current = userBalance;
  }, [userBalance, isCreator, callRate]);

  useEffect(() => {
    setCurrentEarnings(creatorEarnings);
  }, [creatorEarnings, isCreator]);
  
  // Update refs when values change
  useEffect(() => {
    callRateRef.current = callRate;
  }, [callRate]);
  
  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);
  
  useEffect(() => {
    lastBilledMinuteRef.current = lastBilledMinute;
  }, [lastBilledMinute]);
  
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
    // Starting call timer
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);
  }, []);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    // Stopping call timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setCallDuration(0);
  }, []);

  // Start billing system (ONLY for the caller, not the answerer)
  const startBilling = useCallback(() => {
    // Only start billing for the caller (whoever initiated the call)
    if (!shouldBeBilled) {
      return;
    }
    setLastBilledMinute(0);
    lastBilledMinuteRef.current = 0;
    
    const interval = setInterval(() => {
      const currentMinute = Math.floor(callDurationRef.current / 60);
      
      if (currentMinute > lastBilledMinuteRef.current) {
        // Billing for minute (caller only)
        
        // Check if caller has enough balance
        if (currentBalanceRef.current < callRateRef.current) {
          // Insufficient funds - ending call
          onInsufficientFunds();
          return;
        }
        
        setLastBilledMinute(currentMinute);
        lastBilledMinuteRef.current = currentMinute;
        
        // Emit billing event to backend (backend will handle balance deduction)
        if (socket && callId && callerId) {
      
          socket.emit('video_call_billing', {
            callId: callId,
            callerId: callerId,
            currentUserId,
            amount: callRateRef.current,
            minute: currentMinute
          });
        }
      }
    }, 1000); // Check every second
    
    billingIntervalRef.current = interval;
  }, [shouldBeBilled, socket, callId, callerId, currentUserId, onInsufficientFunds, isCaller]);

  // Stop billing system
  const stopBilling = useCallback(() => {
    // Stopping billing system
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
  }, []);

  // Handle balance updates from backend
  const handleBalanceUpdate = useCallback((data: any) => {
    if (data.type === 'deduct') {
      const newBalance = parseInt(data.balance) || 0;
      setCurrentBalance(newBalance);
      currentBalanceRef.current = newBalance;
    } else if (data.type === 'earn') {
      setCurrentEarnings(data.earnings);
      // Add to call-specific earnings
      if (data.callEarnings) {
        setCallSpecificEarnings(prev => prev + data.callEarnings);
      }
    }
  }, []);

  // Handle insufficient funds from backend (only for the caller)
  const handleInsufficientFunds = useCallback((data: any) => {
    // Only handle insufficient funds for the caller (whoever is paying)
    if (shouldBeBilled) {
      onInsufficientFunds();
    }
  }, [onInsufficientFunds, shouldBeBilled]);

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
        
        {/* Balance Display - Show for the caller (whoever is paying) */}
        {shouldBeBilled && (
          <div className="flex items-center gap-2 text-yellow-400">
            <Image
              src="/gold.png"
              alt="Gold"
              width={16}
              height={16}
            />
         
            <span className="font-semibold">{currentBalance}</span>
            <span className="text-xs">Gold</span>
          </div>
        )}
        
        {/* Creator Earnings Display - Show for creators when they answer calls */}
        {shouldEarn && (
          <div className="flex items-center gap-2 text-yellow-400">
            <Image
              src="/gold.png"
              alt="Gold"
              width={16}
              height={16}
            />
          
            <span className="font-semibold">{callSpecificEarnings}</span>
            <span className="text-xs">Gold</span>
          </div>
        )}
      </div>
    </div>
  );
}
