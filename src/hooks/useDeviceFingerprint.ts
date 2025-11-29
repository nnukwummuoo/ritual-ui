import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function useDeviceFingerprint() {
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        async function getFingerprint() {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                // The unique, persistent identifier for the device
                setDeviceId(result.visitorId);
            } catch (error) {
                console.error("Failed to generate device fingerprint:", error);
            }
        }

        getFingerprint();
    }, []);

    return deviceId;
}
