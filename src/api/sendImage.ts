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
    fetch(`${base}/api/image/save`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

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

export async function deleteImage(
  publicId: string
): Promise<{ success?: boolean; [k: string]: any }> {
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
  console.log("[getViewUrl] publicId:", publicId);

  const tryOnce = async (base: string) =>
    fetch(`${base}/api/image/view?publicId=${encodeURIComponent(publicId)}`, {
      method: "GET",
      credentials: "include",
    });

  let res: Response | undefined;
  try {
    res = await tryOnce(API_BASE);
    console.log("[getViewUrl] Response from API_BASE:", res.status);
  } catch (err) {
    console.error("[getViewUrl] Error fetching from API_BASE:", err);
  }

  if (!res) {
    try {
      res = await tryOnce(PROD_BASE);
      console.log("[getViewUrl] Response from PROD_BASE:", res.status);
    } catch (err) {
      console.error("[getViewUrl] Error fetching from PROD_BASE:", err);
    }
  }

  if (!res) throw new Error("Get URL failed: network error");

  const contentType = res.headers.get("content-type") || "";
  console.log("[getViewUrl] Content-Type:", contentType);

  const buf = await res.arrayBuffer().catch(() => new ArrayBuffer(0));
  const decoder = new TextDecoder();
  const asText = () => {
    try {
      return decoder.decode(new Uint8Array(buf));
    } catch {
      return "";
    }
  };

  if (!res.ok) {
    const bodyText = asText();
    console.error("[getViewUrl] Fetch failed:", res.status, bodyText);
    throw new Error(`Get URL failed (${res.status}): ${bodyText}`);
  }

  if (
    contentType.includes("application/json") ||
    contentType.startsWith("text/")
  ) {
    const bodyText = asText();
    try {
      const data = JSON.parse(bodyText);
      console.log("[getViewUrl] JSON response:", data);
      if (typeof data === "string") return data;
      if (data && typeof (data as any).url === "string")
        return (data as any).url as string;
      return bodyText;
    } catch (err) {
      console.warn(
        "[getViewUrl] Failed to parse JSON, returning text:",
        bodyText,
        err
      );
      return bodyText;
    }
  }

  try {
    const blob = new Blob([buf], {
      type: contentType || "application/octet-stream",
    });
    const objectUrl = URL.createObjectURL(blob);
    console.log("[getViewUrl] Blob URL created:", objectUrl);
    return objectUrl;
  } catch (err) {
    console.error("[getViewUrl] Failed to create Blob URL:", err);
    return "";
  }
}

// Updated saveImage
export async function saveImage(
  fileOrUrl: any,
  _folder?: string
): Promise<string> {
  try {
    if (typeof fileOrUrl === "string" && /^https?:\/\//i.test(fileOrUrl)) {
      console.log(
        "[saveImage] Provided string URL, returning as-is:",
        fileOrUrl
      );
      return fileOrUrl;
    }
    console.log("[saveImage] Uploading file:", fileOrUrl);
    const { publicId } = await uploadImage(fileOrUrl as File);
    console.log("[saveImage] Uploaded, publicId:", publicId);
    const url = await getViewUrl(publicId);
    console.log("[saveImage] Resolved URL:", url);
    return url;
  } catch (e) {
    console.error("[saveImage] Failed:", e);
    return "";
  }
}
