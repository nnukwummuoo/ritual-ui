/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { URL as API_URL } from "@/api/config";
import { X, Upload, HelpCircle } from "lucide-react";
import { toast } from "material-react-toastify";
import HeaderBackNav from "@/navs/HeaderBackNav";
import { Gennavigation } from "@/components/navs/Gennav";
import type { RootState } from "@/store/store";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import { getImageSource } from "@/lib/imageUtils";

// Simple Video Component for preview
const VideoPreview = React.memo(function VideoPreview({ src }: { src: string }) {
  const { videoRef, togglePlay, isPlaying } = useVideoAutoPlay({
    autoPlay: false,
    muted: true,
    loop: true,
    postId: `upload-preview-${Math.random()}`
  });

  return (
    <div className="relative w-full max-h-64 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});

export default function UploadExclusivePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeUserId = params?.userid as string;
  const postId = searchParams?.get("postId");

  // Get authentication data from Redux
  const loggedInUserId = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);

  // Get local userid from localStorage as fallback
  const localUserid = typeof window !== 'undefined' ? (() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.userID || "";
      }
    } catch {}
    return "";
  })() : "";

  // State for form
  const [exclusiveContentPrice, setExclusiveContentPrice] = useState<string>("");
  const [exclusiveContentFile, setExclusiveContentFile] = useState<File | null>(null);
  const [exclusiveContentPreview, setExclusiveContentPreview] = useState<string | null>(null);
  const [exclusiveContentDescription, setExclusiveContentDescription] = useState<string>("");
  const [isUploadingExclusive, setIsUploadingExclusive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [existingMediaType, setExistingMediaType] = useState<string | null>(null);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<{ title: string; message: string } | null>(null);

  // Fetch post data if in edit mode
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId || !routeUserId) return;

      setIsLoadingPost(true);
      setIsEditMode(true);

      try {
        const userid = loggedInUserId || localUserid;
        const authToken = token || (() => {
          try {
            const raw = localStorage.getItem("login");
            if (raw) {
              const data = JSON.parse(raw);
              return data?.refreshtoken || data?.accesstoken || "";
            }
          } catch {}
          return "";
        })();

        // Fetch all exclusive posts and find the one with matching ID
        const response = await axios.post(`${API_URL}/getallExclusivePosts`, 
          { userid: routeUserId }, 
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            timeout: 10000
          }
        );

        if (response.data && response.data.ok) {
          const posts = response.data.posts || [];
          const post = posts.find((p: any) => {
            const pId = p._id || p.postid || p.id;
            return String(pId) === String(postId);
          });

          if (post) {
            setEditingPost(post);
            setExclusiveContentDescription(post.content || "");
            setExclusiveContentPrice(post.price?.toString() || "");
            
            // Set existing media with proxy URL
            if (post.postfilelink) {
              const imageSource = getImageSource(post.postfilelink, 'post');
              setExistingMediaUrl(imageSource.src || post.postfilelink);
              setExistingMediaType(post.posttype || "image");
            }
          } else {
            toast.error("Post not found");
            router.push(`/Profile/${routeUserId}`);
          }
        }
      } catch (error: any) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post data");
        router.push(`/Profile/${routeUserId}`);
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPostData();
  }, [postId, routeUserId, loggedInUserId, localUserid, token, router]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size based on file type
      const maxImageSize = 5 * 1024 * 1024; // 5MB in bytes
      const maxVideoSize = 10 * 1024 * 1024; // 10MB in bytes
      
      if (file.type.startsWith('image/')) {
        if (file.size > maxImageSize) {
          setFileSizeError({
            title: "File Too Large",
            message: "Max size is 5 MB. Please trim or compress before uploading."
          });
          setShowFileSizeError(true);
          // Reset the input
          e.target.value = '';
          return;
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > maxVideoSize) {
          setFileSizeError({
            title: "File Too Large",
            message: "Max size is 10 MB. Please trim or compress before uploading."
          });
          setShowFileSizeError(true);
          // Reset the input
          e.target.value = '';
          return;
        }
      }
      
      // File size is valid, proceed with file selection
      setExclusiveContentFile(file);
      setExistingMediaUrl(null); // Clear existing media when new file is selected
      setShowFileSizeError(false);
      setFileSizeError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setExclusiveContentPreview(reader.result as string);
      };
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle upload/update
  const handleUpload = async () => {
    // In edit mode, file is optional (only update if new file is selected)
    if (!isEditMode && !exclusiveContentFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!exclusiveContentPrice || parseFloat(exclusiveContentPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // In edit mode, must have either existing media or new file
    if (isEditMode && !exclusiveContentFile && !existingMediaUrl) {
      toast.error("Please select a file or keep existing media");
      return;
    }

    setIsUploadingExclusive(true);

    try {
      // Get user ID and token
      const userid = loggedInUserId || localUserid;
      const authToken = token || (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken || "";
          }
        } catch {}
        return "";
      })();

      if (!userid) {
        toast.error("Please log in to upload content");
        setIsUploadingExclusive(false);
        return;
      }

      if (isEditMode && editingPost) {
        // Update existing post
        const formData = new FormData();
        
        // Only append file if a new one is selected
        if (exclusiveContentFile) {
          formData.append("file", exclusiveContentFile);
        }

        formData.append("data", JSON.stringify({
          postid: editingPost._id || editingPost.postid || editingPost.id,
          userid,
          content: exclusiveContentDescription || "",
          price: parseFloat(exclusiveContentPrice),
        }));

        const response = await axios.put(`${API_URL}/updateExclusivePost`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });

        if (response.data.ok) {
          toast.success("Exclusive post updated successfully!");
          router.push(`/Profile/${routeUserId}`);
        } else {
          toast.error(response.data.message || "Update failed");
        }
      } else {
        // Create new post
        const formData = new FormData();
        formData.append("file", exclusiveContentFile!);
        formData.append("data", JSON.stringify({
          userid,
          content: exclusiveContentDescription || "",
          price: parseFloat(exclusiveContentPrice),
        }));

        const response = await axios.post(`${API_URL}/exclusivepost`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });

        if (response.data.ok) {
          toast.success("Exclusive content uploaded successfully!");
          router.push(`/Profile/${routeUserId}`);
        } else {
          toast.error(response.data.message || "Upload failed");
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || (isEditMode ? "Update failed. Please try again." : "Upload failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsUploadingExclusive(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setExclusiveContentFile(null);
    setExclusiveContentPreview(null);
    setExclusiveContentPrice("");
    setExclusiveContentDescription("");
    router.push(`/Profile/${routeUserId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-800">
      {/* <HeaderBackNav />
      <Gennavigation /> */}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-700">
          {/* Header */}
          <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEditMode ? "Edit Exclusive Content" : "Upload Exclusive Content"}
            </h2>
         
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isLoadingPost ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading post data...</p>
              </div>
            ) : (
              <>
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content (Image or Video) {isEditMode && <span className="text-gray-500 text-xs">(Optional - only upload if changing)</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-600 dark:border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                    {exclusiveContentPreview ? (
                      <div className="space-y-4">
                        {exclusiveContentFile?.type.startsWith('image/') ? (
                          <img
                            src={exclusiveContentPreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                        ) : exclusiveContentFile?.type.startsWith('video/') ? (
                          <VideoPreview src={exclusiveContentPreview} />
                        ) : null}
                        <p className="text-sm text-gray-400">{exclusiveContentFile?.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExclusiveContentFile(null);
                            setExclusiveContentPreview(null);
                          }}
                          className="text-sm text-orange-500 hover:text-orange-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : existingMediaUrl ? (
                      <div className="space-y-4">
                        {existingMediaType === "image" ? (
                          <img
                            src={existingMediaUrl}
                            alt="Current content"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                        ) : existingMediaType === "video" ? (
                          <VideoPreview src={existingMediaUrl} />
                        ) : null}
                        <p className="text-sm text-gray-400">Current content</p>
                        <label className="cursor-pointer inline-block">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="text-sm text-orange-500 hover:text-orange-600">
                            Replace with new file
                          </span>
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div>
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">Image or Video</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

            {/* Content/Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={exclusiveContentDescription}
                onChange={(e) => setExclusiveContentDescription(e.target.value)}
                placeholder="Add a description for your exclusive content..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 dark:border-gray-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                Price
                <span className="text-yellow-400 text-lg">🪙</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={exclusiveContentPrice}
                  onChange={(e) => setExclusiveContentPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 pr-10 bg-gray-800 dark:bg-gray-700 border border-gray-600 dark:border-gray-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPriceTooltip(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none"
                  aria-label="Price recommendation info"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Set the price for this exclusive content in gold </p>
            </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploadingExclusive}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingExclusive 
                      ? (isEditMode ? "Updating..." : "Uploading...") 
                      : (isEditMode ? "Update" : "Upload")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price Recommendation Modal */}
      {showPriceTooltip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Price Recommendation</h3>
              <button
                onClick={() => setShowPriceTooltip(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                Recommended content price will be <span className="text-yellow-400 font-semibold">50 gold</span> and the equivalent in dollar is <span className="text-green-400 font-semibold">$6.99</span>
              </p>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowPriceTooltip(false)}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Size Error Modal */}
      {showFileSizeError && fileSizeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 shadow-xl overflow-hidden">
            {/* Red Header */}
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">{fileSizeError.title}</h3>
            </div>
            {/* Dark Blue Body */}
            <div className="bg-blue-900 px-6 py-6">
              <p className="text-white text-base leading-relaxed">
                {fileSizeError.message}
              </p>
            </div>
            {/* Action Button */}
            <div className="bg-blue-900 px-6 pb-6 flex justify-end">
              <button
                onClick={() => {
                  setShowFileSizeError(false);
                  setFileSizeError(null);
                }}
                className="px-6 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

