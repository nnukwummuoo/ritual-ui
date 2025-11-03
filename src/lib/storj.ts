/**
 * Storj Storage Helper for Frontend
 * Replaces Appwrite functionality with backend API calls that use Storj
 */

import { URL as API_BASE } from "@/api/config";

// Secondary base (production) used as a fallback when the local proxy is down
const PROD_BASE = process.env.NEXT_PUBLIC_API || "";

export type UploadResponse = {
  public_id: string;
  file_link: string;
  proxy_view?: string;
  proxy_download?: string;
  [key: string]: any;
};

/**
 * Upload a single file to Storj via backend API
 */
export async function uploadToStorj(file: File, folder: string = 'post'): Promise<string> {
  try {
    const formData = new FormData();
    
    // Determine the field name based on file type
    if (file.type.startsWith('image/')) {
      formData.append('image', file);
    } else if (file.type.startsWith('video/')) {
      formData.append('video', file);
    } else {
      formData.append('file', file);
    }

    console.log("🔍 [Storj] Uploading file:", { name: file.name, size: file.size, type: file.type, folder });

    const tryOnce = async (base: string) =>
      fetch(`${base}/api/image/save`, { 
        method: "POST", 
        body: formData, 
        credentials: "include" 
      });

    let res: Response | undefined;
    try {
      res = await tryOnce(API_BASE);
    } catch (error) {
      console.warn("🔍 [Storj] Primary API failed, trying fallback:", error);
    }
    
    if (!res || !res.ok) {
      try {
        res = await tryOnce(PROD_BASE);
      } catch (error) {
        console.error("🔍 [Storj] Fallback API also failed:", error);
      }
    }
    
    if (!res) {
      throw new Error("Upload failed: network error - both primary and fallback APIs failed");
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const result: UploadResponse = await res.json();
    console.log("✅ [Storj] Upload successful:", result);
    
    // Return the file_link (direct Storj URL) or proxy_view if available
    return result.file_link || result.proxy_view || "";
    
  } catch (error: any) {
    console.error("❌ [Storj] Upload failed:", error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to Storj via backend API
 */
export async function uploadMultipleFilesToStorj(files: File[], folder: string = 'post'): Promise<string[]> {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });

    console.log("🔍 [Storj] Uploading multiple files:", files.length, "files");

    const tryOnce = async (base: string) =>
      fetch(`${base}/upload-message-files`, { 
        method: "POST", 
        body: formData, 
        credentials: "include" 
      });

    let res: Response | undefined;
    try {
      res = await tryOnce(API_BASE);
    } catch (error) {
      console.warn("🔍 [Storj] Primary API failed, trying fallback:", error);
    }
    
    if (!res || !res.ok) {
      try {
        res = await tryOnce(PROD_BASE);
      } catch (error) {
        console.error("🔍 [Storj] Fallback API also failed:", error);
      }
    }
    
    if (!res) {
      throw new Error("Upload failed: network error - both primary and fallback APIs failed");
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const result = await res.json();
    console.log("✅ [Storj] Multiple files upload successful:", result);
    
    return result.fileUrls || [];
    
  } catch (error: any) {
    console.error("❌ [Storj] Multiple files upload failed:", error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Delete a file from Storj via backend API
 */
export async function deleteFromStorj(publicId: string): Promise<{ success?: boolean; [k: string]: any }> {
  try {
    const tryOnce = async (base: string) =>
      fetch(`${base}/api/image/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
        credentials: "include",
      });

    let res: Response | undefined;
    try {
      res = await tryOnce(API_BASE);
    } catch (error) {
      console.warn("🔍 [Storj] Primary API failed, trying fallback:", error);
    }
    
    if (!res || !res.ok) {
      try {
        res = await tryOnce(PROD_BASE);
      } catch (error) {
        console.error("🔍 [Storj] Fallback API also failed:", error);
      }
    }
    
    if (!res) {
      throw new Error("Delete failed: network error - both primary and fallback APIs failed");
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Delete failed (${res.status}): ${text}`);
    }
    
    return (await res.json().catch(() => ({}))) as any;
    
  } catch (error: any) {
    console.error("❌ [Storj] Delete failed:", error);
    throw new Error(`Delete failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get file view URL from Storj via backend API
 */
export async function getStorjViewUrl(publicId: string): Promise<string> {
  try {
    console.log("🔍 [Storj] Getting view URL for:", publicId);

    const tryOnce = async (base: string) =>
      fetch(`${base}/api/image/view?publicId=${encodeURIComponent(publicId)}`, {
        method: "GET",
        credentials: "include",
      });

    let res: Response | undefined;
    try {
      res = await tryOnce(API_BASE);
      console.log("🔍 [Storj] Response from API_BASE:", res.status);
    } catch (err) {
      console.error("🔍 [Storj] Error fetching from API_BASE:", err);
    }

    if (!res || !res.ok) {
      try {
        res = await tryOnce(PROD_BASE);
        console.log("🔍 [Storj] Response from PROD_BASE:", res?.status);
      } catch (err) {
        console.error("🔍 [Storj] Error fetching from PROD_BASE:", err);
      }
    }

    if (!res) {
      throw new Error("Get URL failed: network error - both primary and fallback APIs failed");
    }

    const contentType = res.headers.get('content-type') || '';
    console.log("🔍 [Storj] Content-Type:", contentType);

    const buf = await res.arrayBuffer().catch(() => new ArrayBuffer(0));
    const decoder = new TextDecoder();
    const asText = () => {
      try { return decoder.decode(new Uint8Array(buf)); } catch { return ''; }
    };

    if (!res.ok) {
      const bodyText = asText();
      console.error("🔍 [Storj] Fetch failed:", res.status, bodyText);
      throw new Error(`Get URL failed (${res.status}): ${bodyText}`);
    }

    if (contentType.includes('application/json') || contentType.startsWith('text/')) {
      const bodyText = asText();
      try {
        const data = JSON.parse(bodyText);
        console.log("🔍 [Storj] JSON response:", data);
        if (typeof data === 'string') return data;
        if (data && typeof (data as any).url === 'string') return (data as any).url as string;
        return bodyText;
      } catch (err) {
        console.warn("🔍 [Storj] Failed to parse JSON, returning text:", bodyText, err);
        return bodyText;
      }
    }

    try {
      const blob = new Blob([buf], { type: contentType || 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(blob);
      console.log("✅ [Storj] Blob URL created:", objectUrl);
      return objectUrl;
    } catch (err) {
      console.error("❌ [Storj] Failed to create Blob URL:", err);
      return '';
    }
  } catch (error: any) {
    console.error("❌ [Storj] Get view URL failed:", error);
    throw new Error(`Get URL failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Save image/file to Storj (compatible with existing saveImage function)
 */
export async function saveToStorj(fileOrUrl: any, folder?: string): Promise<string> {
  try {
    if (typeof fileOrUrl === "string" && /^https?:\/\//i.test(fileOrUrl)) {
      console.log("🔍 [Storj] Provided string URL, returning as-is:", fileOrUrl);
      return fileOrUrl;
    }
    
    console.log("🔍 [Storj] Uploading file:", fileOrUrl);
    const url = await uploadToStorj(fileOrUrl as File, folder);
    console.log("✅ [Storj] Uploaded successfully:", url);
    return url;
  } catch (error: any) {
    console.error("❌ [Storj] Save failed:", error);
    return "";
  }
}

// Export for backward compatibility
export const uploadImage = uploadToStorj;
export const deleteImage = deleteFromStorj;
export const getViewUrl = getStorjViewUrl;
export const saveImage = saveToStorj;
