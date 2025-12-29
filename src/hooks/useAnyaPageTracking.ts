'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/**
 * Custom hook to track Anya page visits
 * @param pageType - 'main' for /anya or 'story' for /anya/[id]
 * @param storyId - Only required for story pages
 */
export const useAnyaPageTracking = (pageType: 'main' | 'story', storyId?: string) => {
    const reduxUserId = useSelector((state: RootState) => state.register.userID);

    useEffect(() => {
        const trackVisit = async () => {
            try {
                // Get or create visitor ID
                let visitorId = localStorage.getItem('anya_visitor_id');
                if (!visitorId) {
                    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    localStorage.setItem('anya_visitor_id', visitorId);
                }

                // Get user ID if logged in
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

                // Get referrer
                const referrer = typeof document !== 'undefined' ? document.referrer : '';

                // Track the visit
                await axios.post(`${process.env.NEXT_PUBLIC_API}/api/ai-story/track-visit`, {
                    pageType,
                    storyId: storyId || null,
                    userId: userId || null,
                    visitorId,
                    referrer
                });

                console.log(`📊 Anya page visit tracked: ${pageType}${storyId ? ` - Story: ${storyId}` : ''}`);
            } catch (error) {
                console.error('Error tracking Anya page visit:', error);
                // Fail silently - don't break the user experience
            }
        };

        // Track visit after a short delay to ensure page is loaded
        const timer = setTimeout(trackVisit, 1000);

        return () => clearTimeout(timer);
    }, [pageType, storyId, reduxUserId]);
};
