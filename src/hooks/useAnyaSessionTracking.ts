'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/**
 * Custom hook to track user session duration on Anya pages
 * @param pageType - 'main' for /anya or 'story' for /anya/[id]
 * @param storyId - Only required for story pages
 */
export const useAnyaSessionTracking = (pageType: 'main' | 'story', storyId?: string) => {
    const reduxUserId = useSelector((state: RootState) => state.register.userID);
    const sessionIdRef = useRef<string | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const visitorIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Get or create visitor ID
        if (typeof window !== 'undefined') {
            let visitorId = localStorage.getItem('anya_visitor_id');
            if (!visitorId) {
                visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('anya_visitor_id', visitorId);
            }
            visitorIdRef.current = visitorId;
        }

        // Get user ID
        let userId = reduxUserId;
        if (!userId && typeof window !== 'undefined') {
            try {
                const loginData = localStorage.getItem('login');
                if (loginData) {
                    const parsed = JSON.parse(loginData);
                    userId = parsed.userID || '';
                }
            } catch (error) {
                console.error('Error reading login data:', error);
            }
        }

        // Start session
        const startSession = async () => {
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API}/api/ai-story/session/start`,
                    {
                        pageType,
                        storyId: storyId || null,
                        userId: userId || null,
                        visitorId: visitorIdRef.current
                    }
                );

                if (response.data.ok) {
                    sessionIdRef.current = response.data.sessionId;
                    console.log(`📊 Session started: ${pageType}${storyId ? ` - Story: ${storyId}` : ''}`);

                    // Start heartbeat
                    startHeartbeat();
                }
            } catch (error) {
                console.error('Error starting session:', error);
            }
        };

        // Send heartbeat to update last activity
        const sendHeartbeat = async () => {
            if (!sessionIdRef.current && !visitorIdRef.current) return;

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API}/api/ai-story/session/heartbeat`,
                    {
                        sessionId: sessionIdRef.current,
                        visitorId: visitorIdRef.current
                    }
                );
                console.log('💓 Heartbeat sent');
            } catch (error) {
                console.error('Error sending heartbeat:', error);
            }
        };

        // Start sending heartbeats every 30 seconds
        const startHeartbeat = () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // 30 seconds
        };

        // End session
        const endSession = async () => {
            if (!sessionIdRef.current && !visitorIdRef.current) return;

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API}/api/ai-story/session/end`,
                    {
                        sessionId: sessionIdRef.current,
                        visitorId: visitorIdRef.current
                    }
                );
                console.log('📊 Session ended');
            } catch (error) {
                console.error('Error ending session:', error);
            }
        };

        // Handle page visibility change (tab switching)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Page hidden - stop heartbeat but don't end session
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }
            } else {
                // Page visible again - resume heartbeat
                sendHeartbeat(); // Send immediate heartbeat
                startHeartbeat();
            }
        };

        // Start session after a short delay
        const startTimer = setTimeout(startSession, 1000);

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup function
        return () => {
            clearTimeout(startTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Stop heartbeat
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }

            // End session
            endSession();
        };
    }, [pageType, storyId, reduxUserId]);
};
