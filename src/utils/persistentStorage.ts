/**
 * Persistent Device ID Storage using OPFS (Origin Private File System)
 * This provides persistent storage that works across browser sessions
 * without requiring user permission prompts
 */

const DEVICE_ID_FILENAME = '.mmeko_device_id';

interface PersistentDeviceId {
    id: string;
    createdAt: number;
    lastAccessed: number;
    browserFingerprint: string;
}

/**
 * Check if OPFS (Origin Private File System) is supported
 */
function isOPFSSupported(): boolean {
    return typeof navigator !== 'undefined' &&
        'storage' in navigator &&
        'getDirectory' in navigator.storage;
}

/**
 * Open or create IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MmekoDeviceStorage', 2);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('deviceData')) {
                db.createObjectStore('deviceData');
            }
        };
    });
}

/**
 * Get root directory handle from OPFS
 */
async function getOPFSRoot(): Promise<FileSystemDirectoryHandle | null> {
    try {
        if (!isOPFSSupported()) {
            return null;
        }
        return await navigator.storage.getDirectory();
    } catch (error) {
        console.error('[OPFS] Error accessing OPFS root:', error);
        return null;
    }
}

/**
 * Read device ID from OPFS
 */
async function readDeviceIdFromOPFS(): Promise<PersistentDeviceId | null> {
    try {
        const root = await getOPFSRoot();
        if (!root) return null;

        const fileHandle = await root.getFileHandle(DEVICE_ID_FILENAME);
        const file = await fileHandle.getFile();
        const content = await file.text();

        return JSON.parse(content) as PersistentDeviceId;
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            return null; // File doesn't exist yet
        }
        console.error('[OPFS] Error reading device ID:', error);
        return null;
    }
}

/**
 * Write device ID to OPFS
 */
async function writeDeviceIdToOPFS(deviceData: PersistentDeviceId): Promise<boolean> {
    try {
        const root = await getOPFSRoot();
        if (!root) return false;

        const fileHandle = await root.getFileHandle(DEVICE_ID_FILENAME, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(deviceData, null, 2));
        await writable.close();

        console.log('[OPFS] ✅ Device ID written to OPFS');
        return true;
    } catch (error) {
        console.error('[OPFS] Error writing device ID:', error);
        return false;
    }
}

/**
 * Read device ID from IndexedDB
 */
async function readDeviceIdFromIndexedDB(): Promise<PersistentDeviceId | null> {
    try {
        const db = await openDB();
        const transaction = db.transaction(['deviceData'], 'readonly');
        const store = transaction.objectStore('deviceData');

        return new Promise((resolve, reject) => {
            const request = store.get('deviceId');
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('[IndexedDB] Error reading device ID:', error);
        return null;
    }
}

/**
 * Write device ID to IndexedDB
 */
async function writeDeviceIdToIndexedDB(deviceData: PersistentDeviceId): Promise<boolean> {
    try {
        const db = await openDB();
        const transaction = db.transaction(['deviceData'], 'readwrite');
        const store = transaction.objectStore('deviceData');

        return new Promise((resolve) => {
            const request = store.put(deviceData, 'deviceId');
            request.onsuccess = () => {
                console.log('[IndexedDB] ✅ Device ID written to IndexedDB');
                resolve(true);
            };
            request.onerror = () => {
                console.error('[IndexedDB] Error writing device ID:', request.error);
                resolve(false);
            };
        });
    } catch (error) {
        console.error('[IndexedDB] Error writing device ID:', error);
        return false;
    }
}

/**
 * Generate a cryptographically secure random ID
 */
function generateSecureId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Main function: Get or create persistent device ID
 * Storage priority: OPFS > IndexedDB > LocalStorage
 */
async function getPersistentDeviceId(browserFingerprint: string): Promise<string | null> {
    try {
        // 1. Try OPFS (most persistent)
        if (isOPFSSupported()) {
            const opfsData = await readDeviceIdFromOPFS();
            if (opfsData) {
                // Update last accessed time
                opfsData.lastAccessed = Date.now();
                await writeDeviceIdToOPFS(opfsData);

                // Sync to other storage layers
                localStorage.setItem('mmeko_device_id', opfsData.id);
                await writeDeviceIdToIndexedDB(opfsData);

                console.log('[Storage] ✅ Retrieved device ID from OPFS');
                return opfsData.id;
            }
        }

        // 2. Try IndexedDB
        const idbData = await readDeviceIdFromIndexedDB();
        if (idbData) {
            // Update last accessed time
            idbData.lastAccessed = Date.now();
            await writeDeviceIdToIndexedDB(idbData);

            // Sync to other storage layers
            localStorage.setItem('mmeko_device_id', idbData.id);
            if (isOPFSSupported()) {
                await writeDeviceIdToOPFS(idbData);
            }

            console.log('[Storage] ✅ Retrieved device ID from IndexedDB');
            return idbData.id;
        }

        // 3. Try localStorage
        const localStorageId = localStorage.getItem('mmeko_device_id');
        if (localStorageId) {
            // Upgrade to better storage
            const deviceData: PersistentDeviceId = {
                id: localStorageId,
                createdAt: Date.now(),
                lastAccessed: Date.now(),
                browserFingerprint,
            };

            await writeDeviceIdToIndexedDB(deviceData);
            if (isOPFSSupported()) {
                await writeDeviceIdToOPFS(deviceData);
            }

            console.log('[Storage] ✅ Migrated device ID from localStorage');
            return localStorageId;
        }

        // 4. Create new device ID and store in all available layers
        const newId = generateSecureId();
        const newData: PersistentDeviceId = {
            id: newId,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            browserFingerprint,
        };

        // Store in all available layers for maximum persistence
        localStorage.setItem('mmeko_device_id', newId);
        await writeDeviceIdToIndexedDB(newData);

        if (isOPFSSupported()) {
            await writeDeviceIdToOPFS(newData);
        }

        console.log('[Storage] ✅ Created new device ID with multi-layer storage');
        return newId;
    } catch (error) {
        console.error('[Storage] Error in getPersistentDeviceId:', error);

        // Emergency fallback: try to get from localStorage
        const fallbackId = localStorage.getItem('mmeko_device_id');
        if (fallbackId) {
            return fallbackId;
        }

        // Last resort: generate and store in localStorage only
        const emergencyId = generateSecureId();
        localStorage.setItem('mmeko_device_id', emergencyId);
        console.warn('[Storage] ⚠️ Using emergency fallback device ID');
        return emergencyId;
    }
}

/**
 * Check if device ID exists (for verification without creating)
 */
async function checkPersistentDeviceIdExists(): Promise<boolean> {
    try {
        // Check OPFS
        if (isOPFSSupported()) {
            const opfsData = await readDeviceIdFromOPFS();
            if (opfsData) return true;
        }

        // Check IndexedDB
        const idbData = await readDeviceIdFromIndexedDB();
        if (idbData) return true;

        // Check localStorage
        if (localStorage.getItem('mmeko_device_id')) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('[Storage] Error checking device ID existence:', error);
        return false;
    }
}

export {
    getPersistentDeviceId,
    checkPersistentDeviceIdExists,
    isOPFSSupported,
};
