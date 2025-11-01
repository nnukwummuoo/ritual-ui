/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

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
  const [isBillingInProgress, setIsBillingInProgress] = useState(false);
  
  // Use refs to avoid infinite re-renders
  const currentBalanceRef = useRef(userBalance);
  const callRateRef = useRef(callRate);
  const callDurationRef = useRef(0);
  const lastBilledMinuteRef = useRef(0);
  const isBillingInProgressRef = useRef(false);

  // Determine billing logic based on who initiated the call
  const isCaller = callData?.callerId === currentUserId;
  const isAnswerer = !isCaller;
  const shouldBeBilled = isCaller; // Only the caller (initiator) pays - regardless of user type
  const shouldEarn = isAnswerer && isCreator; // Only creators earn when they answer calls (from any caller)
  
  

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
  
  useEffect(() => {
    isBillingInProgressRef.current = isBillingInProgress;
  }, [isBillingInProgress]);
  
  const callStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const billingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const endCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedMinuteRef = useRef<number>(-1); // Track which minute we last checked for next minute
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
    
    // Clear any existing billing interval first
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
    
    setLastBilledMinute(0);
    lastBilledMinuteRef.current = 0;
    
    const interval = setInterval(() => {
      const currentSeconds = callDurationRef.current;
      const currentMinute = Math.floor(currentSeconds / 60);
      const secondsIntoCurrentMinute = currentSeconds % 60;
      
      // Only bill if we haven't billed this minute yet, it's a new minute, and no billing is in progress
      if (currentMinute > lastBilledMinuteRef.current && currentMinute > 0 && !isBillingInProgressRef.current) {
        console.log(`💰 [Billing] Billing for minute ${currentMinute}, last billed: ${lastBilledMinuteRef.current}`);
        
        // Check if caller has enough balance for THIS minute
        if (currentBalanceRef.current < callRateRef.current) {
          console.log(`❌ [Billing] Insufficient funds for minute ${currentMinute}: ${currentBalanceRef.current} < ${callRateRef.current}`);
          // Insufficient funds - ending call immediately
          onInsufficientFunds();
          return;
        }
        
        // Set billing in progress to prevent duplicate events
        setIsBillingInProgress(true);
        isBillingInProgressRef.current = true;
        
        // Update the last billed minute BEFORE sending the event to prevent race conditions
        setLastBilledMinute(currentMinute);
        lastBilledMinuteRef.current = currentMinute;
        
        // Emit billing event to backend (backend will handle balance deduction)
        if (socket && callId && callerId) {
          console.log(`📤 [Billing] Sending billing event for minute ${currentMinute}`);
          socket.emit('fan_call_billing', {
            callId: callId,
            callerId: callerId,
            currentUserId,
            amount: callRateRef.current,
            minute: currentMinute
          });
          
          // Set a timeout to reset billing in progress flag if no response within 10 seconds
          setTimeout(() => {
            if (isBillingInProgressRef.current) {
              console.log(`⚠️ [Billing] Timeout waiting for billing response for minute ${currentMinute}`);
              setIsBillingInProgress(false);
              isBillingInProgressRef.current = false;
            }
          }, 10000);
        }
      }
      
      // Proactive check: At the END of each minute (around 58-59 seconds), check if user has enough for NEXT minute
      // This ensures the call ends gracefully before the next minute starts if they can't afford it
      // Only check once per minute to avoid multiple timeouts
      if (currentMinute > 0 && 
          secondsIntoCurrentMinute >= 58 && 
          secondsIntoCurrentMinute < 60 && 
          lastCheckedMinuteRef.current !== currentMinute) {
        
        // Mark that we've checked this minute
        lastCheckedMinuteRef.current = currentMinute;
        
        // Check if user has enough balance for the NEXT minute
        const nextMinute = currentMinute + 1;
        const projectedBalance = currentBalanceRef.current; // Current balance after this minute's billing
        
        // Check if they can afford the next minute
        if (projectedBalance < callRateRef.current) {
          console.log(`⚠️ [Billing] User cannot afford minute ${nextMinute}. Current balance: ${projectedBalance}, Required: ${callRateRef.current}`);
          console.log(`🔚 [Billing] Ending call at end of minute ${currentMinute} (${currentSeconds}s) - insufficient funds for next minute`);
          
          // Clear any existing end call timeout
          if (endCallTimeoutRef.current) {
            clearTimeout(endCallTimeoutRef.current);
          }
          
          // End call at the end of the current minute (at 60 seconds)
          // Calculate milliseconds until the minute ends
          const msUntilMinuteEnd = (60 - secondsIntoCurrentMinute) * 1000;
          endCallTimeoutRef.current = setTimeout(() => {
            console.log(`🔚 [Billing] Call ending now - minute ${currentMinute} completed, insufficient funds for minute ${nextMinute}`);
            onInsufficientFunds();
            endCallTimeoutRef.current = null;
          }, msUntilMinuteEnd);
        }
      }
    }, 1000); // Check every second
    
    billingIntervalRef.current = interval;
  }, [shouldBeBilled, socket, callId, callerId, currentUserId, onInsufficientFunds]);

  // Stop billing system
  const stopBilling = useCallback(() => {
    // Stopping billing system
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
    // Clear any pending end call timeout
    if (endCallTimeoutRef.current) {
      clearTimeout(endCallTimeoutRef.current);
      endCallTimeoutRef.current = null;
    }
    // Reset billing state
    setIsBillingInProgress(false);
    isBillingInProgressRef.current = false;
    // Reset check tracking
    lastCheckedMinuteRef.current = -1;
  }, []);

  // Handle balance updates from backend
  const handleBalanceUpdate = useCallback((data: any) => {
    if (data.type === 'deduct') {
      const newBalance = parseInt(data.balance) || 0;
      setCurrentBalance(newBalance);
      currentBalanceRef.current = newBalance;
      // Reset billing in progress flag after successful deduction
      setIsBillingInProgress(false);
      isBillingInProgressRef.current = false;
      
      // After deduction, check if user can afford the next minute
      // This is a proactive check to end the call gracefully
      const currentSeconds = callDurationRef.current;
      const currentMinute = Math.floor(currentSeconds / 60);
      const nextMinute = currentMinute + 1;
      
      // If they can't afford the next minute, schedule call end at the end of current minute
      if (newBalance < callRateRef.current) {
        const secondsIntoCurrentMinute = currentSeconds % 60;
        // Only schedule if we haven't already scheduled it for this minute
        if (lastCheckedMinuteRef.current !== currentMinute) {
          console.log(`⚠️ [Billing] After deduction: Balance ${newBalance} < ${callRateRef.current} required for minute ${nextMinute}`);
          
          // Clear any existing end call timeout
          if (endCallTimeoutRef.current) {
            clearTimeout(endCallTimeoutRef.current);
          }
          
          // Calculate time until current minute ends
          const msUntilMinuteEnd = Math.max(0, (60 - secondsIntoCurrentMinute) * 1000);
          
          if (msUntilMinuteEnd > 0) {
            endCallTimeoutRef.current = setTimeout(() => {
              console.log(`🔚 [Billing] Call ending after minute ${currentMinute} - insufficient funds for minute ${nextMinute}`);
              onInsufficientFunds();
              endCallTimeoutRef.current = null;
            }, msUntilMinuteEnd);
            lastCheckedMinuteRef.current = currentMinute;
          } else {
            // Already past the minute mark, end immediately
            console.log(`🔚 [Billing] Ending call immediately - insufficient funds`);
            onInsufficientFunds();
          }
        }
      }
    } else if (data.type === 'earn') {
      setCurrentEarnings(data.earnings);
      // Add to call-specific earnings
      if (data.callEarnings) {
        setCallSpecificEarnings(prev => prev + data.callEarnings);
      }
    }
  }, [onInsufficientFunds]);

  // Handle insufficient funds from backend (only for the caller)
  const handleInsufficientFunds = useCallback((data: any) => {
    // Only handle insufficient funds for the caller (whoever is paying)
    if (shouldBeBilled) {
      // Reset billing in progress flag
      setIsBillingInProgress(false);
      isBillingInProgressRef.current = false;
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
              <span className="text-xs">💰</span>
            <span className="font-semibold">{currentBalance}</span>
            <span className="text-xs">Gold</span>
          </div>
        )}
        
        {/* Creator Earnings Display - Show for creators when they answer calls */}
        {shouldEarn && (
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-xs">💰</span>
            <span className="font-semibold">{callSpecificEarnings}</span>
            <span className="text-xs">Gold</span>
          </div>
        )}
      </div>
    </div>
  );
}
