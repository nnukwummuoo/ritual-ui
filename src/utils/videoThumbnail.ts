/**
 * Video Thumbnail Generation Utilities
 * Extracts a frame from video and crops to 4:5 aspect ratio
 */

/**
 * Generate a thumbnail from a video file
 * @param videoFile - The video file to extract thumbnail from
 * @param seekTime - Time in seconds to capture frame (default: 1)
 * @returns Promise<Blob> - JPEG blob of the thumbnail
 */
export async function generateVideoThumbnail(
    videoFile: File,
    seekTime: number = 1
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        const objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;

        let capturedFrame = false;

        video.onloadedmetadata = () => {
            // Ensure seek time is within video duration
            const actualSeekTime = Math.min(seekTime, Math.max(0, video.duration - 0.1));
            video.currentTime = actualSeekTime;
        };

        video.onseeked = async () => {
            if (capturedFrame) return;
            capturedFrame = true;

            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Failed to get canvas context');
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob from canvas'));
                        }
                    },
                    'image/jpeg',
                    0.9
                );
            } catch (error) {
                URL.revokeObjectURL(objectUrl);
                reject(error);
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load video'));
        };
    });
}

/**
 * Crop an image to 4:5 aspect ratio (center crop)
 * @param imageBlob - The image blob to crop
 * @returns Promise<Blob> - Cropped image as JPEG blob
 */
export async function cropImageTo4x5(imageBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(imageBlob);

        img.onload = () => {
            try {
                const sourceWidth = img.width;
                const sourceHeight = img.height;

                // Calculate target dimensions for 4:5 ratio
                const targetRatio = 4 / 5; // width / height
                const sourceRatio = sourceWidth / sourceHeight;

                let cropWidth: number;
                let cropHeight: number;
                let cropX: number;
                let cropY: number;

                if (sourceRatio > targetRatio) {
                    // Source is wider than 4:5, crop width
                    cropHeight = sourceHeight;
                    cropWidth = cropHeight * targetRatio;
                    cropX = (sourceWidth - cropWidth) / 2;
                    cropY = 0;
                } else {
                    // Source is taller than 4:5, crop height
                    cropWidth = sourceWidth;
                    cropHeight = cropWidth / targetRatio;
                    cropX = 0;
                    cropY = (sourceHeight - cropHeight) / 2;
                }

                // Create canvas with 4:5 ratio
                const canvas = document.createElement('canvas');
                const maxWidth = 720; // Max width for thumbnail
                canvas.width = maxWidth;
                canvas.height = maxWidth / targetRatio; // 720 x 900

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Failed to get canvas context');
                }

                // Draw cropped image
                ctx.drawImage(
                    img,
                    cropX,
                    cropY,
                    cropWidth,
                    cropHeight,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob from canvas'));
                        }
                    },
                    'image/jpeg',
                    0.85
                );
            } catch (error) {
                URL.revokeObjectURL(objectUrl);
                reject(error);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };

        img.src = objectUrl;
    });
}

/**
 * Generate a 4:5 cropped thumbnail from a video file
 * Combines thumbnail extraction and cropping
 * @param videoFile - The video file
 * @param seekTime - Time in seconds to capture (default: 1)
 * @returns Promise<File> - Cropped thumbnail as File object
 */
export async function generateCroppedVideoThumbnail(
    videoFile: File,
    seekTime: number = 1
): Promise<File> {
    try {
        // Step 1: Extract frame from video
        const frameBlob = await generateVideoThumbnail(videoFile, seekTime);

        // Step 2: Crop to 4:5 ratio
        const croppedBlob = await cropImageTo4x5(frameBlob);

        // Step 3: Convert to File
        const thumbnailFile = new File(
            [croppedBlob],
            `thumbnail_${Date.now()}.jpg`,
            { type: 'image/jpeg' }
        );

        return thumbnailFile;
    } catch (error) {
        console.error('Error generating cropped thumbnail:', error);
        throw error;
    }
}

/**
 * Create a preview URL from a blob
 * @param blob - The blob to create URL from
 * @returns string - Object URL for preview
 */
export function createPreviewUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
}
