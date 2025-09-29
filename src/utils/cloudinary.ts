// Cloudinary configuration and upload utility
export const CLOUDINARY_CONFIG = {
  cloudName: 'dumwtqzzy',
  apiKey: '267392956139921',
  apiSecret: 'TqQrztevtUqgOxBEjDcyrqNrJ-o',
  uploadPreset: 'ml_default' // You can create a preset in Cloudinary dashboard
};

// Alternative configuration for unsigned uploads
export const CLOUDINARY_UNSIGNED_CONFIG = {
  cloudName: 'dumwtqzzy',
  uploadPreset: 'ml_default' // This needs to be created in Cloudinary dashboard
};

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: Record<string, unknown>;
  tags?: string[];
}

/**
 * Upload image to Cloudinary using unsigned upload
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise with upload response
 */
export const uploadToCloudinary = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  
  // Add the file
  formData.append('file', file);
  
  // Add upload preset (unsigned upload)
  formData.append('upload_preset', CLOUDINARY_UNSIGNED_CONFIG.uploadPreset);
  
  // Add cloud name
  formData.append('cloud_name', CLOUDINARY_UNSIGNED_CONFIG.cloudName);
  
  // Add optional parameters
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  console.log('Cloudinary upload request:', {
    cloudName: CLOUDINARY_UNSIGNED_CONFIG.cloudName,
    uploadPreset: CLOUDINARY_UNSIGNED_CONFIG.uploadPreset,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder: options.folder,
    tags: options.tags
  });

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_UNSIGNED_CONFIG.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Try to get more detailed error information
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
        console.error('Cloudinary error details:', errorData);
      } catch (e) {
        errorDetails = await response.text();
      }
      
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
    }

    const result = await response.json();
    
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      size: result.bytes
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise with deletion response
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    
    // Note: For production, you should use server-side deletion with api_secret
    // This is a simplified version for client-side deletion
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.warn(`Failed to delete image ${publicId}: ${response.status}`);
      return false;
    }

    const result = await response.json();
    console.log('Cloudinary deletion result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return false;
  }
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in MB
 * @returns Validation result
 */
export const validateImageFile = (file: File, maxSizeInMB: number = 5): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeInMB}MB`
    };
  }

  return { valid: true };
};
