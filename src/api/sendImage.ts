import axios from "axios";

/**
 * Uploads an image or returns the existing URL.
 * For now, this is a passthrough that returns the provided `fileOrUrl` if it's already a URL.
 * You can replace this with a real upload to your storage later.
 */
export async function saveImage(fileOrUrl: string, folder: string): Promise<string> {
  try {
    // If it's already a URL, just return it
    if (/^https?:\/\//i.test(fileOrUrl)) {
      return fileOrUrl;
    }

    // TODO: Implement real upload logic here if needed, e.g.:
    // const form = new FormData();
    // form.append('file', fileOrUrl as any);
    // form.append('folder', folder);
    // const res = await axios.post(`${process.env.NEXT_PUBLIC_UPLOAD_URL}/upload`, form, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    //   withCredentials: true,
    // });
    // return res.data.url;

    // Fallback: return the raw value for now
    return fileOrUrl;
  } catch (e) {
    console.error('saveImage failed', e);
    // In case of failure, return empty string as the original code expects
    return "";
  }
}
