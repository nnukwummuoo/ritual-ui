/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { URL as API_URL } from "@/api/config";
import { X, Upload, HelpCircle, Lock } from "lucide-react";
import { toast } from "material-react-toastify";
import HeaderBackNav from "@/navs/HeaderBackNav";
import { Gennavigation } from "@/components/navs/Gennav";
import type { RootState } from "@/store/store";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import { getImageSource } from "@/lib/imageUtils";
import FileLimitPopup from "@/app/upload/_components/FileLimitPopup";

// Simple Video Component for preview
const VideoPreview = React.memo(function VideoPreview({ src }: { src: string }) {
  const { videoRef, togglePlay, isPlaying } = useVideoAutoPlay({
    autoPlay: false,
    muted: true,
    loop: true,
    postId: `upload-preview-${Math.random()}`
  });

  return (
    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black">
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
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
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
  const rawRouteSlug = (params?.slug ?? params?.userid) as string;
  const routeSlug = (() => { try { return rawRouteSlug ? decodeURIComponent(rawRouteSlug) : ""; } catch { return rawRouteSlug || ""; } })();
  const isSlugObjectId = routeSlug && /^[a-f0-9]{24}$/i.test(String(routeSlug));
    const postId = searchParams?.get("postId");
  const returnTo: string | null = searchParams?.get("returnTo") ?? null;
 const goBack = () => {
    if (returnTo && typeof returnTo === "string") {
      router.push(decodeURIComponent(returnTo));
    } else {
      router.push(`/${routeSlug}`);
    }
  };

  // Get authentication data from Redux
  const loggedInUserId = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.accesstoken);

  // Get local userid from localStorage as fallback
  const localUserid = typeof window !== 'undefined' ? (() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.userID || "";
      }
    } catch { }
    return "";
  })() : "";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.current?.click();
};


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
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [sizeWarningType, setSizeWarningType] = useState<"image" | "video">("video");

  // Fetch post data if in edit mode
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId || !routeSlug) return;

      setIsLoadingPost(true);
      setIsEditMode(true);

      try {
        const userid = loggedInUserId || localUserid;
        const authToken = token || (() => {
          try {
            const raw = localStorage.getItem("login");
            if (raw) {
              const data = JSON.parse(raw);
              return data?.accesstoken || data?.refreshtoken || "";
            }
          } catch { }
          return "";
        })();

        // Fetch all exclusive posts and find the one with matching ID
        const response = await axios.post(`${API_URL}/getallExclusivePosts`,
          isSlugObjectId ? { userid: routeSlug } : { username: routeSlug },
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
            goBack();
          }
        }
      } catch (error: any) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post data");
        goBack();
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPostData();
  }, [postId, routeSlug, isSlugObjectId, loggedInUserId, localUserid, token, router]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size based on file type
      const maxImageSize = 10 * 1024 * 1024; // 10MB in bytes
      const maxVideoSize = 50 * 1024 * 1024; // 50MB in bytes

      if (file.type.startsWith('image/')) {
        if (file.size > maxImageSize) {
         setSizeWarningType("image");
        setShowSizeWarning(true);
          // Reset the input
          e.target.value = '';
          return;
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > maxVideoSize) {
           setSizeWarningType("video");
           setShowSizeWarning(true);
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
            return data?.accesstoken || data?.refreshtoken || "";
          }
        } catch { }
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
          goBack();
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
          goBack();
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
    goBack();
  };

  return (
    <div className="min-h-screen bg-[#080b14]">
      {/* <HeaderBackNav />
      <Gennavigation /> */}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#111624] rounded-2xl border border-white/[0.06] shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/[0.06] px-6 py-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditMode ? "Edit Exclusive Content" : "Upload Exclusive Content"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Locked content fans unlock by paying Gold</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isLoadingPost ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading post data...</p>
              </div>
            ) : (
              <>
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content (Image or Video) {isEditMode && <span className="text-gray-500 text-xs">(Optional - only upload if changing)</span>}
                  </label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-[#6c63ff]/60 hover:bg-[#6c63ff]/[0.03] transition-colors">
                    {exclusiveContentPreview ? (
                      <div className="space-y-4">
                        {exclusiveContentFile?.type.startsWith('image/') ? (
                          <img
                            src={exclusiveContentPreview}
                            alt="Preview"
                            className="w-full aspect-[4/5] object-cover mx-auto rounded-xl"
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
                          className="text-sm text-[#c9c4ff] hover:text-white transition-colors"
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
                            className="w-full aspect-[4/5] object-cover mx-auto rounded-xl"
                          />
                        ) : existingMediaType === "video" ? (
                          <VideoPreview src={existingMediaUrl} />
                        ) : null}
                        <p className="text-sm text-gray-400">Current content</p>
                        <label className="cursor-pointer inline-block">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="text-sm text-[#c9c4ff] hover:text-white transition-colors">
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
                          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-6 h-6 text-gray-500" />
                          </div>
                          <p className="text-gray-300 font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-600">Image or Video</p>
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
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors resize-none"
                  />
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    Price
                    <span className="text-[#f5c451] text-base">🪙</span>
                    <span className="text-xs font-normal text-gray-600">(in Gold)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={exclusiveContentPrice}
                      onChange={(e) => setExclusiveContentPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 pr-11 bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPriceTooltip(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#9b59f5] transition-colors focus:outline-none"
                      aria-label="Gold to dollar conversion info"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5">Enter the price for this exclusive content in Gold</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 text-gray-300 hover:bg-white/[0.08] hover:text-white rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploadingExclusive}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white rounded-xl font-semibold shadow-[0_10px_24px_-8px_rgba(108,99,255,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

      {/* Gold Conversion Modal */}
      {showPriceTooltip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-[#111624] rounded-2xl max-w-md w-full border border-white/[0.06] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
               
                    <svg viewBox="0 0 24 24" width="36" height="36" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <circle cx="12" cy="12" r="10" fill="#F5C451" />
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#B8860B" strokeWidth="1.2" />
                    <circle cx="12" cy="12" r="7" fill="none" stroke="#B8860B" strokeWidth="0.8" opacity="0.45" />
                    <path d="M12 7.3l1.1 2.6 2.7.3-2 1.8.5 2.7-2.3-1.4-2.3 1.4.5-2.7-2-1.8 2.7-.3L12 7.3z" fill="#B8860B" opacity="0.55" />
                  </svg>
                  
                <h3 className="text-lg font-bold text-white">Gold Conversion</h3>
              </div>
              <button
                onClick={() => setShowPriceTooltip(false)}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                Prices on mmeko are set in <span className="text-[#f5c451] font-semibold">Gold</span>, the platform's currency.
              </p>
              <div className="mt-4 bg-[#f5c451]/[0.06] border border-[#f5c451]/25 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                <span className="text-[#f5c451] text-lg">🪙</span>
                <span className="text-white font-bold text-base">1 Gold = $0.04</span>
              </div>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                Enter your price as a number of Gold — for example, entering 50 means fans pay 50 Gold (≈ $2.00) to unlock this content.
              </p>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowPriceTooltip(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white rounded-xl font-semibold shadow-[0_10px_24px_-8px_rgba(108,99,255,0.5)] hover:-translate-y-0.5 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <FileLimitPopup
  open={showSizeWarning}
  type={sizeWarningType}
  onClose={() => setShowSizeWarning(false)}
  onChooseDifferent={() => {
    setShowSizeWarning(false);
    fileInputRef.current?.click();
  }}
/>
    </div>
  );
}