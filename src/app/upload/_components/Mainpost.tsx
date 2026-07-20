/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaImage, FaVideo, FaPlus, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getallpost, hydrateFromCache } from "@/store/post";
import { createMultiMediaPost } from "@/store/post";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/hooks/useUserId";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { uploadPostMediaFiles } from "@/lib/storj";
import FileLimitPopup from "@/app/upload/_components/FileLimitPopup";

const MAX_FILES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

type SelectedFile = {
  file: File;
  previewUrl: string;
  type: "image" | "video";
};

export const Mainpost = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { firstname, lastname, username } = useSelector((s: RootState) => s.profile);
  const posts = useSelector((s: RootState) => s.post.allPost as any[]);

  const userid = useUserId();
  const token = useAuthToken();

  const [postcontent, setpostcontent] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const [showBanWarning, setShowBanWarning] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [oversizedFileType, setOversizedFileType] = useState<"image" | "video" | null>(null);

  const getAuthorFields = () => {
    const currentUsername = username || (() => { try { return localStorage.getItem('username') || ''; } catch { return ''; } })();
    const currentName = [firstname, lastname].filter(Boolean).join(' ') || currentUsername;
    return { currentUsername, currentName };
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = MAX_FILES - selectedFiles.length;
    if (remaining <= 0) {
      toast.info(`You can only attach up to ${MAX_FILES} files per post`);
      return;
    }

    const incoming = Array.from(files).slice(0, remaining);
    if (incoming.length < files.length) {
      toast.info(`Only ${MAX_FILES} files are allowed per post — some files were skipped`);
    }

    const validFiles: SelectedFile[] = [];
    for (const file of incoming) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a supported image or video file`);
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setOversizedFileType("image");
        setShowSizeWarning(true);
        continue;
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setOversizedFileType("video");
        setShowSizeWarning(true);
        continue;
      }

      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? "image" : "video",
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      try { URL.revokeObjectURL(next[index].previewUrl); } catch {}
      next.splice(index, 1);
      return next;
    });
  };

  const resetForm = () => {
    selectedFiles.forEach((f) => { try { URL.revokeObjectURL(f.previewUrl); } catch {} });
    setSelectedFiles([]);
    setpostcontent("");
    setShowModal(false);
    setUploadProgress(null);
  };

  const submitPost = async () => {
    if (!userid || !token) {
      toast.error("Please log in to post");
      return;
    }
    if (!postcontent.trim() && selectedFiles.length === 0) {
      toast.error("Write something or attach media before posting");
      return;
    }

    try {
      setLoading(true);
      const { currentUsername, currentName } = getAuthorFields();

      let mediaItems: { url: string; publicId: string; type: "image" | "video" }[] = [];

      if (selectedFiles.length > 0) {
        setUploadProgress({ current: 0, total: selectedFiles.length });
        mediaItems = await uploadPostMediaFiles(
          selectedFiles.map((f) => f.file),
          (current, total) => setUploadProgress({ current, total })
        );
      }

      await dispatch(
        createMultiMediaPost({
          userid,
          token,
          content: postcontent,
          mediaItems,
          authorUsername: currentUsername || undefined,
          authorName: currentName || undefined,
          handle: currentUsername || undefined,
        }) as any
      ).unwrap();

      toast.success("Post created", { autoClose: 800 });
      resetForm();

      try {
        await dispatch(getallpost({} as any)).unwrap();
      } catch (err) {
        console.error(err);
      }

      setTimeout(() => router.push("/"), 100);
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message || "Failed to create post";
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const handlePostClick = () => {
    if (selectedFiles.length > 0) {
      setShowBanWarning(true);
    } else {
      submitPost();
    }
  };

  return (
    <div className="bg-[#080b14] text-white p-4 rounded-md space-y-4 max-w-4xl mx-auto border border-gray-700">
      <div className="flex flex-col gap-3">
        <textarea
          className="w-full p-2 text-white bg-transparent border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What's hot?!"
          rows={3}
          value={postcontent}
          onChange={(e) => setpostcontent(e.target.value)}
        />
        <p className="text-xs text-gray-400">
          Tip: Add hashtags like #fun #lifestyle to help others discover your posts
        </p>

        {selectedFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {selectedFiles.map((f, i) => (
              <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-black border border-gray-700">
                {f.type === "image" ? (
                  <img src={f.previewUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <video src={f.previewUrl} className="w-full h-full object-cover" muted />
                )}
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white text-xs"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}
            {selectedFiles.length < MAX_FILES && (
              <label className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:bg-[#111624]">
                <FaPlus className="text-gray-400" />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
                />
              </label>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-[#111624] text-sm">
              <FaImage className="text-green-400" />
              <span>Photo/Video</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
              />
            </label>
          </div>

          <button
            disabled={loading || (!postcontent.trim() && selectedFiles.length === 0)}
            onClick={handlePostClick}
            className="px-6 py-2 font-semibold text-white transition bg-orange-600 rounded-lg hover:bg-orange-500 disabled:opacity-60 flex items-center justify-center gap-2 min-w-[100px]"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {uploadProgress ? `Uploading ${uploadProgress.current}/${uploadProgress.total}` : loading ? "Posting" : "Post"}
          </button>
        </div>
      </div>

      {showBanWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60" style={{ zIndex: 1001 }}>
          <div className="w-full max-w-lg mx-4 bg-[#0b0f1f] border border-gray-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-red-800 rounded-t-2xl">
              <span className="text-white font-semibold">Warning: Permanent Ban Policy</span>
            </div>
            <div className="p-4 space-y-4 text-white">
              <p>Uploading explicit, sexual, or pornographic content is strictly forbidden. 1st violation → permanent ban. No second chances.</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="rounded border-gray-600 bg-[#111624] text-green-400 focus:ring-2 focus:ring-green-500"
                />
                <span>I understand and agree.</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowBanWarning(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!agreedToPolicy) return;
                  setShowBanWarning(false);
                  submitPost();
                }}
                disabled={!agreedToPolicy}
                className="px-4 py-2 font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-500 disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <FileLimitPopup
        open={showSizeWarning}
        type={oversizedFileType || "video"}
        onClose={() => setShowSizeWarning(false)}
        onChooseDifferent={() => setShowSizeWarning(false)}
      />
    </div>
  );
};