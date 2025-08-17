"use client";

import { Client, Storage, ID } from "appwrite";

// ------------------ Setup ------------------
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject("668f9f8c0011a761d118"); // Your project ID

const storage = new Storage(client);

// ------------------ Types ------------------
export type BucketId = string;
export type FileId = string;

// ------------------ Functions ------------------
/**
 * Save an image to Appwrite Storage
 */
export const saveImage = async (image: File, bucket: BucketId): Promise<FileId> => {
  console.log("inside save fun");

  const response = await storage.createFile(bucket, ID.unique(), image);
  console.log("after inside save fun");

  return response.$id;
};

/**
 * Download an image from storage
 */
export const downloadImage = (photoLink: FileId, bucket: BucketId): URL => {
  return new URL(storage.getFileDownload(bucket, photoLink));
};

/**
 * Delete an image from storage
 */
export const deleteImage = async (photoLink: FileId, bucket: BucketId): Promise<void> => {
  await storage.deleteFile(bucket, photoLink);
};

/**
 * Replace/update an image in storage
 */
export const updateImage = async (
  photoLink: FileId,
  bucket: BucketId,
  image: File
): Promise<FileId> => {
  const response = await storage.createFile(bucket, photoLink, image);
  return response.$id;
};
