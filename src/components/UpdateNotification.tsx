'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const UpdateNotification = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        checkForUpdates();

        // Check every 5 minutes
        const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const checkForUpdates = async () => {
        try {
            // Get API URL from environment or default
            const apiUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3100';
            const response = await fetch(`${apiUrl}/api/version`);

            if (!response.ok) {
                console.error('Failed to check version');
                return;
            }

            const { version } = await response.json();
            const currentVersion = localStorage.getItem('app_version');

            // Show update if we have a stored version AND server version is different
            // Banner will show on EVERY page load until user clicks "Update Now"
            if (currentVersion && currentVersion !== version) {
                console.log(`🔄 Update available: ${currentVersion} → ${version}`);
                setUpdateAvailable(true);
            }

            // Only update stored version if this is the first time or if versions match
            // Don't auto-update when new version is detected (let user click Update Now)
            if (!currentVersion || currentVersion === version) {
                localStorage.setItem('app_version', version);
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    };

    const handleUpdate = async () => {
        setIsRefreshing(true);

        try {
            // Get the new version before clearing cache
            const apiUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3100';
            const response = await fetch(`${apiUrl}/api/version`);
            const { version } = await response.json();

            // Clear service worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                console.log('✅ Service worker caches cleared');
            }

            // Preserve auth and important data
            const preserveKeys = [
                'login',  // CRITICAL: Contains username, userID, tokens, etc.
                'token',
                'userID',
                'userId',
                'access_token',
                'refresh_token',
                'user',
                'auth',
                'session',
            ];

            // Also preserve keys by pattern (session IDs, push prefs, etc.)
            const preservePatterns = [
                /^mmeko_session_start_/,
                /^visitor_session_id/,
                /^push_notifications_/,
                /^media-chrome-pref-/,
                 /^ritual_/,
            ];

            const preservedData: Record<string, string> = {};

            // Preserve specific keys
            preserveKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) preservedData[key] = value;
            });

            // Preserve keys matching patterns
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && preservePatterns.some(pattern => pattern.test(key))) {
                    const value = localStorage.getItem(key);
                    if (value) preservedData[key] = value;
                }
            }

            const preservedSessionData: Record<string, string> = {};
            preserveKeys.forEach(key => {
                const value = sessionStorage.getItem(key);
                if (value) preservedSessionData[key] = value;
            });

            // Clear everything
            localStorage.clear();
            sessionStorage.clear();

            // Restore auth data and set new version
            Object.entries(preservedData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });

            Object.entries(preservedSessionData).forEach(([key, value]) => {
                sessionStorage.setItem(key, value);
            });

            // Set the new version after update
            localStorage.setItem('app_version', version);

            console.log('✅ Cache cleared, auth data preserved, version updated');

            // Hard reload
            window.location.reload();
        } catch (error) {
            console.error('Error clearing cache:', error);
            setIsRefreshing(false);
        }
    };

    const dismissUpdate = () => {
        // Just hide the banner temporarily - it will come back on refresh
        setUpdateAvailable(false);
    };

    if (!updateAvailable) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">A new update is available!</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUpdate}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                        {isRefreshing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Update Now
                            </>
                        )}
                    </button>

                    <button
                        onClick={dismissUpdate}
                        disabled={isRefreshing}
                        className="text-white hover:text-blue-100 p-2 transition-colors disabled:opacity-50"
                        title="Dismiss this update"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateNotification;
