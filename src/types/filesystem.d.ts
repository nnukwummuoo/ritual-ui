/**
 * Extended type definitions for File System Access API
 * These types extend the standard FileSystemDirectoryHandle and FileSystemFileHandle
 * to include methods that exist at runtime but aren't in the TypeScript lib
 */

interface FileSystemDirectoryHandle {
    /**
     * Query the current permission state for this directory handle
     * @param descriptor - Permission descriptor with mode 'read' or 'readwrite'
     * @returns Promise resolving to 'granted', 'denied', or 'prompt'
     */
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;

    /**
     * Request permission for this directory handle
     * @param descriptor - Permission descriptor with mode 'read' or 'readwrite'
     * @returns Promise resolving to 'granted', 'denied', or 'prompt'
     */
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemFileHandle {
    /**
     * Query the current permission state for this file handle
     * @param descriptor - Permission descriptor with mode 'read' or 'readwrite'
     * @returns Promise resolving to 'granted', 'denied', or 'prompt'
     */
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;

    /**
     * Request permission for this file handle
     * @param descriptor - Permission descriptor with mode 'read' or 'readwrite'
     * @returns Promise resolving to 'granted', 'denied', or 'prompt'
     */
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
}

declare global {
    interface Window {
        showDirectoryPicker(options?: {
            mode?: 'read' | 'readwrite';
            startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
        }): Promise<FileSystemDirectoryHandle>;

        showOpenFilePicker(options?: {
            multiple?: boolean;
            types?: Array<{
                description?: string;
                accept: Record<string, string[]>;
            }>;
            excludeAcceptAllOption?: boolean;
            startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
        }): Promise<FileSystemFileHandle[]>;

        showSaveFilePicker(options?: {
            suggestedName?: string;
            types?: Array<{
                description?: string;
                accept: Record<string, string[]>;
            }>;
            excludeAcceptAllOption?: boolean;
            startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
        }): Promise<FileSystemFileHandle>;
    }
}

export { };
