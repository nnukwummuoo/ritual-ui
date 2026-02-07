'use client';

import { useEffect } from 'react';
import { migrateLocalStorage } from '@/utils/localStorageMigration';

export default function StorageCleanup() {
    useEffect(() => {
        // 1. Run LocalStorage Migration
        migrateLocalStorage();

        // 2. Session Storage Cleanup
        // Logic: If 'session_initialized' is missing, it's a new session/tab. Clear stale session data.
        // If it is present, it's a reload, so we keep the session data.
        try {
            const isNewSession = !sessionStorage.getItem('session_initialized');

            if (isNewSession) {
                console.log('🆕 New session detected, clearing sessionStorage');
                sessionStorage.clear();
                sessionStorage.setItem('session_initialized', 'true');
            }
        } catch (e) {
            console.error('⚠️ Error accessing sessionStorage:', e);
        }

        // 3. BFCache Handling (Back/Forward Cache)
        // Browsers might cache the page state including sensitive data when navigating away.
        // This forces a reload if the user navigates back to this page from BFCache.
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                console.log('⚠️ Page loaded from bfcache, reloading for fresh state...');
                window.location.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    return null; // Headless component
}
