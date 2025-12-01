/**
 * Hybrid Device Fingerprint Hook
 * Combines advanced fingerprinting with persistent file storage
 * This is the most robust anti-fraud device identification system
 * Used by: TikTok, Binance, PayPal, Skrill, and betting platforms
 */

import { useState, useEffect } from 'react';
import { generateAdvancedFingerprint } from '@/utils/advancedFingerprint';
import {
    getPersistentDeviceId,
    checkPersistentDeviceIdExists,
    isOPFSSupported
} from '@/utils/persistentStorage';

interface HybridDeviceId {
    // Primary ID from file system (persists across browsers)
    persistentId: string | null;

    // Browser fingerprint (unique to this browser)
    browserFingerprint: string | null;

    // Combined ID (most secure)
    hybridId: string | null;

    // Metadata
    hasOPFSSupport: boolean;
    isExistingDevice: boolean;
}

export function useHybridDeviceFingerprint() {
    const [deviceData, setDeviceData] = useState<HybridDeviceId>({
        persistentId: null,
        browserFingerprint: null,
        hybridId: null,
        hasOPFSSupport: false,
        isExistingDevice: false,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initializeDeviceId() {
            try {
                console.log('[HybridFingerprint] 🚀 Initializing device identification...');

                // Step 1: Generate advanced browser fingerprint
                console.log('[HybridFingerprint] 📊 Generating browser fingerprint...');
                const browserFp = await generateAdvancedFingerprint();
                console.log('[HybridFingerprint] ✅ Browser fingerprint:', browserFp);

                // Step 2: Check if device ID already exists
                const existsInStorage = await checkPersistentDeviceIdExists();
                console.log('[HybridFingerprint] 📁 Device ID exists in storage:', existsInStorage);

                // Step 3: Get or create persistent device ID
                console.log('[HybridFingerprint] 💾 Getting persistent device ID...');
                const persistentId = await getPersistentDeviceId(browserFp);

                if (!persistentId) {
                    console.warn('[HybridFingerprint] ⚠️ Could not get persistent ID, using browser fingerprint only');
                }

                // Step 4: Create hybrid ID (combination of both for maximum security)
                const hybridId = persistentId
                    ? `${persistentId}::${browserFp}`
                    : browserFp;

                console.log('[HybridFingerprint] 🎯 Hybrid ID generated:', hybridId);

                setDeviceData({
                    persistentId,
                    browserFingerprint: browserFp,
                    hybridId,
                    hasOPFSSupport: isOPFSSupported(),
                    isExistingDevice: existsInStorage,
                });

                setIsLoading(false);
                console.log('[HybridFingerprint] ✅ Device identification complete');
            } catch (err: any) {
                console.error('[HybridFingerprint] ❌ Error initializing device ID:', err);
                setError(err.message || 'Failed to generate device fingerprint');
                setIsLoading(false);
            }
        }

        initializeDeviceId();
    }, []);

    return {
        ...deviceData,
        isLoading,
        error,
    };
}

/**
 * Legacy hook for backward compatibility
 * Returns just the hybrid ID string
 */
export function useDeviceFingerprint(): string | null {
    const { hybridId, isLoading } = useHybridDeviceFingerprint();

    if (isLoading) {
        return null;
    }

    return hybridId;
}
