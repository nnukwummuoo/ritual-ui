// Re-export Storj functions for backward compatibility
export { 
  uploadToStorj as uploadImage,
  deleteFromStorj as deleteImage,
  getStorjViewUrl as getViewUrl,
  saveToStorj as saveImage,
  type UploadResponse
} from "@/lib/storj";