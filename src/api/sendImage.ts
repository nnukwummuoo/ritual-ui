import { URL as API_BASE } from "./config";
// Secondary base (production) used as a fallback when the local proxy is down
const PROD_BASE = "https://mmekoapi.onrender.com";

/**
 * Download an image from storage
 */
// API base is sourced from a single config: `src/api/config.ts`.
// In dev it points to "/api/proxy"; in prod it points to the live backend host.

export type UploadResponse = {
  url: string;
  publicId: string;
  [key: string]: any;
};

export async function uploadImage(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("image", file);

  const tryOnce = async (base: string) =>
    fetch(`${base}/api/image/save`, { method: "POST", body: form, credentials: "include" });

  let res: Response | undefined;
  try {
    res = await tryOnce(API_BASE);
  } catch {
    // network/proxy error
  }
  if (!res) {
    try {
      res = await tryOnce(PROD_BASE);
    } catch {}
  }
  if (!res) throw new Error("Upload failed: network error");

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  return (await res.json()) as UploadResponse;
}

export async function deleteImage(publicId: string): Promise<{ success?: boolean; [k: string]: any }> {
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
  } catch {}
  if (!res) {
    try {
      res = await tryOnce(PROD_BASE);
    } catch {}
  }
  if (!res) throw new Error("Delete failed: network error");

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Delete failed (${res.status}): ${text}`);
  }
  return (await res.json().catch(() => ({}))) as any;
}

export async function getViewUrl(publicId: string): Promise<string> {
  const tryOnce = async (base: string) =>
    fetch(`${base}/api/image/view?publicId=${encodeURIComponent(publicId)}`, {
      method: "GET",
      credentials: "include",
    });

  let res: Response | undefined;
  try {
    res = await tryOnce(API_BASE);
  } catch {}
  if (!res) {
    try {
      res = await tryOnce(PROD_BASE);
    } catch {}
  }
  if (!res) throw new Error("Get URL failed: network error");
  const contentType = res.headers.get('content-type') || '';
  // Read the body ONCE as ArrayBuffer so we can decide how to handle it
  const buf = await res.arrayBuffer().catch(() => new ArrayBuffer(0));
  const decoder = new TextDecoder();
  const asText = () => {
    try { return decoder.decode(new Uint8Array(buf)); } catch { return ''; }
  };

  if (!res.ok) {
    const bodyText = asText();
    throw new Error(`Get URL failed (${res.status}): ${bodyText}`);
  }

  // If server returned JSON or text, interpret accordingly
  if (contentType.includes('application/json') || contentType.startsWith('text/')) {
    const bodyText = asText();
    try {
      const data = JSON.parse(bodyText);
      if (typeof data === 'string') return data;
      if (data && typeof (data as any).url === 'string') return (data as any).url as string;
      return bodyText;
    } catch {
      return bodyText;
    }
  }

  // Otherwise, treat as binary and return a Blob URL the UI can open
  try {
    const blob = new Blob([buf], { type: contentType || 'application/octet-stream' });
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch {
    // Fallback: return empty string if blob creation fails
    return '';
  }
}

// Backwards compatibility helper. If a URL is given, return it; if a File-like is given, upload it.
export async function saveImage(fileOrUrl: any, _folder?: string): Promise<string> {
  try {
    if (typeof fileOrUrl === "string" && /^https?:\/\//i.test(fileOrUrl)) {
      return fileOrUrl;
    }
    const { publicId } = await uploadImage(fileOrUrl as File);
    return await getViewUrl(publicId);
  } catch (e) {
    console.error("saveImage failed", e);
    return "";
  }
}

