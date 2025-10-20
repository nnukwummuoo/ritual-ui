import { URL as API_BASE } from "@/api/config";

/**
 * Extracts bucket name from a Storj URL
 * @param url The Storj URL (e.g., https://gateway.storjshare.io/post/filename.jpg)
 * @returns The bucket name (e.g., 'post', 'creator', 'profile')
 */
export function extractBucketFromStorjUrl(url: string): string {
  if (!url || !url.startsWith('https://gateway.storjshare.io/')) {
    return 'post'; // Default fallback
  }
  
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'gateway.storjshare.io') + 1;
  return urlParts[bucketIndex] || 'post'; // Default to 'post' for legacy images
}

/**
 * Extracts the file key from a Storj URL
 * @param url The Storj URL
 * @returns The file key (filename)
 */
export function extractKeyFromStorjUrl(url: string): string {
  if (!url) return '';
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] || '';
}

/**
 * Creates a proxy URL for Storj images using the backend API
 * @param originalUrl The original Storj URL
 * @param fallbackBucket Optional fallback bucket if extraction fails
 * @returns The proxy URL for the backend API
 */
export function createStorjProxyUrl(originalUrl: string, fallbackBucket: string = 'post'): string {
  if (!originalUrl) return '';
  
  const isStorj = originalUrl.startsWith('https://gateway.storjshare.io/');
  if (!isStorj) return originalUrl;
  
  const bucket = extractBucketFromStorjUrl(originalUrl) || fallbackBucket;
  const key = extractKeyFromStorjUrl(originalUrl);
  
  if (!key) return originalUrl;
  
  return `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=${bucket}`;
}

/**
 * Determines the best image source for display, handling Storj URLs with proxy fallback
 * @param originalUrl The original image URL
 * @param fallbackBucket Optional fallback bucket for Storj URLs
 * @returns Object with src, isStorj, bucket, and key information
 */
export function getImageSource(originalUrl: string, fallbackBucket: string = 'post') {
  if (!originalUrl) {
    return {
      src: '',
      isStorj: false,
      bucket: fallbackBucket,
      key: '',
      proxyUrl: ''
    };
  }
  
  const isStorj = originalUrl.startsWith('https://gateway.storjshare.io/');
  
  if (isStorj) {
    const bucket = extractBucketFromStorjUrl(originalUrl) || fallbackBucket;
    const key = extractKeyFromStorjUrl(originalUrl);
    const proxyUrl = key ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=${bucket}` : '';
    
    return {
      src: proxyUrl || originalUrl, // Use proxy URL if available, fallback to original
      isStorj: true,
      bucket,
      key,
      proxyUrl,
      originalUrl
    };
  }
  
  return {
    src: originalUrl,
    isStorj: false,
    bucket: fallbackBucket,
    key: '',
    proxyUrl: '',
    originalUrl
  };
}

/**
 * Creates fallback URLs for image error handling
 * @param originalUrl The original image URL
 * @param fallbackBucket Optional fallback bucket
 * @returns Object with primary and fallback URLs
 */
export function createImageFallbacks(originalUrl: string, fallbackBucket: string = 'post') {
  const imageSource = getImageSource(originalUrl, fallbackBucket);
  
  if (!imageSource.isStorj) {
    return {
      primary: originalUrl,
      fallbacks: []
    };
  }
  
  const bucket = imageSource.bucket;
  const key = imageSource.key;
  
  if (!key) {
    return {
      primary: originalUrl,
      fallbacks: []
    };
  }
  
  return {
    primary: imageSource.proxyUrl,
    fallbacks: [
      originalUrl, // Direct Storj URL as first fallback
      imageSource.proxyUrl // Proxy URL as second fallback
    ]
  };
}
