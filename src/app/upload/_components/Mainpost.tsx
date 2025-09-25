"use client"
import React, { useState, useEffect } from "react";
import { toast } from "material-react-toastify";
// import { useDispatch, useSelector } from "react-redux";
// import { createpost } from "../../app/features/post/post";
// import { PostImage } from "./postImage";
// import { Postvideo } from "./Postvideo";
// import person from "../../icons/icons8-profile_Icon.png";
// import "../../styles/Toastify__toast.css";

import { FaImage, FaVideo, FaPlus, FaCheck } from "react-icons/fa";
import FileInput from "../../../components/fileUpload";
import { uploadImage, getViewUrl } from "../../../api/sendImage";
import { URL as API_BASE } from "@/api/config";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { createpost, getallpost, hydrateFromCache } from "@/store/post";
import { useRouter } from "next/navigation";
import { useUserId } from "@/lib/hooks/useUserId";
import { useAuthToken } from "@/lib/hooks/useAuthToken";

export const Mainpost = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // const photo = useSelector((state) => state.comprofile.profilephoto);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const poststatus = useSelector((state) => state.post.poststatus);
  const { firstname, lastname, nickname } = useSelector((s: RootState) => s.profile);
  const posts = useSelector((s: RootState) => s.post.allPost as any[]);
  // const userid = useSelector((state) => state.register.userID);
  // const [propics, setpropics] = useState(person);
  const [postcontent, setpostcontent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedPublicId, setUploadedPublicId] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<File | undefined>(undefined);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoUploading, setVideoUploading] = useState<boolean>(false);
  const [videoCaption, setVideoCaption] = useState<string>("");
  const [showBanWarning, setShowBanWarning] = useState<boolean>(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState<boolean>(false);

  // Auth consistent with Profile page
  const userid = useUserId();
  const token = useAuthToken();

  // useEffect(() => {
  //   if (photo) setpropics(photo);
  // }, [photo]);

  // const mypost = async () => {
  //   if (!postcontent.trim()) {
  //     toast.error("You have not said anything", { autoClose: 2000 });
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     // const response = await dispatch(
  //     //   createpost({
  //     //     userid,
  //     //     postlink: "",
  //     //     content: postcontent,
  //     //     token,
  //     //     posttype: "text",
  //     //   })
  //     // );
  //     console.log(response);
  //     if (response.payload.ok) {
  //       toast.success(response.payload.message, { autoClose: 1000 });

  //       setpostcontent("");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUploadStart = (fileType: 'image' | 'video') => {
    if (fileType === 'image' && imageFile) {
      setShowBanWarning(true);
    } else if (fileType === 'video' && videoFile) {
      setShowBanWarning(true);
    }
  };

  const handleContinueUpload = async (fileType: 'image' | 'video') => {
    setShowBanWarning(false);
    if (fileType === 'image' && imageFile) {
      await handleImagePost();
    } else if (fileType === 'video' && videoFile) {
      await handleVideoPost();
    }
  };

  const handleImagePost = async () => {
    if (!userid || !token || !imageFile) {
      toast.error('Please log in to post');
      return;
    }
    try {
      setLoading(true);
      const currentUsername = (() => {
        try {
          return (
            nickname ||
            localStorage.getItem('username') ||
            localStorage.getItem('userName') ||
            localStorage.getItem('profileusername') ||
            ''
          );
        } catch { return ''; }
      })();
      const currentName = (() => {
        try {
          return (
            [firstname, lastname].filter(Boolean).join(' ') ||
            localStorage.getItem('fullname') ||
            localStorage.getItem('fullName') ||
            localStorage.getItem('name') ||
            ''
          );
        } catch { return ''; }
      })();

      const result = await dispatch(
        createpost({
          userid: userid!,
          token: token!,
          content: postcontent,
          posttype: "image",
          filelink: imageFile,
          // Provide display fields for optimistic post header
          authorUsername: currentUsername || undefined,
          authorName: currentName || undefined,
          handle: (currentUsername || '').toString() || undefined,
        }) as any
      )
        .unwrap()
        .then(async (payload: any) => {
          const pub = payload?.publicId || payload?.public_id || payload?.data?.publicId || payload?.data?.public_id;
          const url = payload?.url || payload?.secure_url || payload?.data?.url || payload?.data?.secure_url;
          toast.success('Post created', { autoClose: 600 });
          // Refresh feed to ensure persistence immediately 
          try {
            toast.success('Post created', { autoClose: 800 });
            await dispatch(getallpost({} as any)).unwrap();
          } catch (err) {
            toast.error("Something Went Wrong");
            console.error(err);
          }
          setTimeout(() => router.push('/'), 100);
        })
        .catch((e: any) => {
          const msg = typeof e === 'string' ? e : (e?.message || 'Failed to create post');
          if (imagePreview) {
            try {
              const currentUsername = (() => {
                try {
                  return (
                    nickname ||
                    localStorage.getItem('username') ||
                    localStorage.getItem('userName') ||
                    localStorage.getItem('profileusername') ||
                    ''
                  );
                } catch { return ''; }
              })();
              const currentName = (() => {
                try {
                  return (
                    [firstname, lastname].filter(Boolean).join(' ') ||
                    localStorage.getItem('fullname') ||
                    localStorage.getItem('fullName') ||
                    localStorage.getItem('name') ||
                    ''
                  );
                } catch { return ''; }
              })();
              const localPost: any = {
                postid: Date.now(),
                userid: userid || 'you',
                content: postcontent,
                posttype: 'image',
                image: imagePreview, // blob/object URL for demo
                createdAt: new Date().toISOString(),
                username: currentUsername || 'you',
                name: currentName || currentUsername || 'You',
                handle: currentUsername || undefined,
              };
              const nextPosts = [localPost, ...(Array.isArray(posts) ? posts : [])];
              try { localStorage.setItem('feedPosts', JSON.stringify(nextPosts)); } catch {}
              dispatch(hydrateFromCache(nextPosts as any));
              toast.success('Post created (local demo)', { autoClose: 800 });
              setTimeout(() => router.push('/'), 100);
              return;
            } catch {}
          }
          toast.error(msg);
        });
    } catch (e: any) {
    const msg = e?.message || 'Failed to create post';
    toast.error(msg);
    } finally {
      setUploading(false);
      setLoading(false);
      setShowImageModal(false);
      setImageFile(undefined);
      setImagePreview("");
      setUploadedPublicId("");
      setUploadedUrl("");
      setpostcontent("");
    }
  };
  

  const handleVideoPost = async () => {
    if (!userid || !token || !videoFile) {
      toast.error('Please log in to post');
      return;
    }
    try {
      setVideoUploading(true);
      setLoading(true);

      const currentUsername = (() => {
        try {
          return (
            nickname ||
            localStorage.getItem('username') ||
            localStorage.getItem('userName') ||
            localStorage.getItem('profileusername') ||
            ''
          );
        } catch { return ''; }
      })();

      const currentName = (() => {
        try {
          return (
            [firstname, lastname].filter(Boolean).join(' ') ||
            localStorage.getItem('fullname') ||
            localStorage.getItem('fullName') ||
            localStorage.getItem('name') ||
            ''
          );
        } catch { return ''; }
      })();

      const result = await dispatch(
        createpost({
          userid: userid!,
          token: token!,
          content: videoCaption,
          posttype: "video",
          filelink: videoFile,
          // Provide display fields for optimistic post header
          authorUsername: currentUsername || undefined,
          authorName: currentName || undefined,
          handle: (currentUsername || '').toString() || undefined,
        }) as any
      )
        .unwrap()
        .then(async (payload: any) => {
          const pub = payload?.publicId || payload?.public_id || payload?.data?.publicId || payload?.data?.public_id;
          const url = payload?.url || payload?.secure_url || payload?.data?.url || payload?.data?.secure_url;
          toast.success('Post created', { autoClose: 600 });

          try {
            await dispatch(getallpost({} as any)).unwrap();
          } catch (err) {
            toast.error("Something Went Wrong");
            console.error(err);
          }
          setVideoUploading(false);
          setLoading(false);
          setShowVideoModal(false);
          setVideoFile(undefined);
          setVideoPreview("");
          setVideoCaption("");
          setTimeout(() => router.push('/'), 100);
        })
        .catch((e: any) => {
        // 👇 This will show "You can only upload 5 videos per day."
        const msg = e?.message || 'Failed to create post';
        toast.error(msg); 
        setVideoUploading(false);
        setLoading(false);
      });
        } catch (e: any) {
          const msg = e?.message || 'Failed to create post';
          toast.error(msg);
        }
      };

          // fallback demo post if preview exists
          // if (videoPreview) {
          //   try {
          //     const localPost: any = {
          //       postid: Date.now(),
          //       userid: userid || 'you',
          //       content: videoCaption,
          //       posttype: 'video',
          //       video: videoPreview, // blob/object URL for demo
          //       createdAt: new Date().toISOString(),
          //       username: currentUsername || 'you',
          //       name: currentName || currentUsername || 'You',
          //       handle: currentUsername || undefined,
          //     };
          //     const nextPosts = [localPost, ...(Array.isArray(posts) ? posts : [])];
          //     try { localStorage.setItem('feedPosts', JSON.stringify(nextPosts)); } catch {}
          //     dispatch(hydrateFromCache(nextPosts as any));
          //     toast.success('Post created (local demo)', { autoClose: 800 });
          //     setTimeout(() => router.push('/'), 100);
          //     return;
          //   } catch {}
          // }

          const handleImageSelected = async (file: File) => {
          if (uploading) return;
          try {
            const url = URL.createObjectURL(file);
            setImageFile(file);
            setImagePreview(url);
            setUploadedPublicId("");
            setUploadedUrl("");
          } catch (error) {
            console.error("Image selection failed:", error);
            toast.error("Failed to load image.");
          }
        };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-md space-y-5 max-w-4xl mx-auto border border-gray-700">

      {/* Text Post Section */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <textarea
            className="w-full p-2 text-white bg-transparent border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's hot?!"
            rows={3}
            value={postcontent}
            onChange={(e) => setpostcontent(e.target.value)}
          />
        </div>
        {/* Live preview card removed as requested */}

        <div className="flex justify-end">
          <button
            onClick={async () => {
              if (!userid || !token) {
                toast.error('Please log in to post');
                return;
              }
              try {
                if (!userid || !token) {
                  toast.error('Not authenticated');
                  return;
                }
                setLoading(true);
                const currentUsername = (() => {
                  try {
                    return (
                      nickname ||
                      localStorage.getItem('username') ||
                      localStorage.getItem('userName') ||
                      localStorage.getItem('profileusername') ||
                      ''
                    );
                  } catch { return ''; }
                })();
                const currentName = (() => {
                  try {
                    return (
                      [firstname, lastname].filter(Boolean).join(' ') ||
                      localStorage.getItem('fullname') ||
                      localStorage.getItem('fullName') ||
                      localStorage.getItem('name') ||
                      ''
                    );
                  } catch { return ''; }
                })();

                const result = await dispatch(
                  createpost({
                    userid: userid!,
                    token: token!,
                    content: postcontent,
                    posttype: "text",
                    filelink: "",
                    // Provide display fields for optimistic post header
                    authorUsername: currentUsername || undefined,
                    authorName: currentName || undefined,
                    handle: (currentUsername || '').toString() || undefined,
                  }) as any
                )
                  .unwrap()
                  .then(async (payload: any) => {
                    const pub = payload?.publicId || payload?.public_id || payload?.data?.publicId || payload?.data?.public_id;
                    const url = payload?.url || payload?.secure_url || payload?.data?.url || payload?.data?.secure_url;
                    toast.success('Post created', { autoClose: 600 });
                    // Refresh feed to ensure persistence immediately 
                    try {
                      toast.success('Post created', { autoClose: 800 });
                      await dispatch(getallpost({} as any)).unwrap();
                    } catch (err) {
                      toast.error("Something Went Wrong");
                      console.error(err);
                    }
                    setTimeout(() => router.push('/'), 100);
                  })
                  .catch((e: any) => {
                    const msg = typeof e === 'string' ? e : (e?.message || 'Failed to create post');
                    if (imagePreview) {
                      try {
                        const currentUsername = (() => {
                          try {
                            return (
                              nickname ||
                              localStorage.getItem('username') ||
                              localStorage.getItem('userName') ||
                              localStorage.getItem('profileusername') ||
                              ''
                            );
                          } catch { return ''; }
                        })();
                        const currentName = (() => {
                          try {
                            return (
                              [firstname, lastname].filter(Boolean).join(' ') ||
                              localStorage.getItem('fullname') ||
                              localStorage.getItem('fullName') ||
                              localStorage.getItem('name') ||
                              ''
                            );
                          } catch { return ''; }
                        })();
                        const localPost: any = {
                          postid: Date.now(),
                          userid: userid || 'you',
                          content: postcontent,
                          posttype: 'text',
                          image: "", // blob/object URL for demo
                          createdAt: new Date().toISOString(),
                          username: currentUsername || 'you',
                          name: currentName || currentUsername || 'You',
                          handle: currentUsername || undefined,
                        };
                        const nextPosts = [localPost, ...(Array.isArray(posts) ? posts : [])];
                        try { localStorage.setItem('feedPosts', JSON.stringify(nextPosts)); } catch {}
                        dispatch(hydrateFromCache(nextPosts as any));
                        toast.success('Post created (local demo)', { autoClose: 800 });
                        setTimeout(() => router.push('/'), 100);
                        return;
                      } catch {}
                    }
                    toast.error(msg);
                  });
              } catch (e: any) {
                const msg = typeof e === 'string' ? e : (e?.message || 'Failed to create post');
                toast.error(msg);
              } finally {
                setUploading(false);
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-2 font-semibold text-white transition bg-orange-600 rounded-lg hover:bg-orange-500"
          >
            {loading ? "Posting" : "Post"}
          </button>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3 p-4 border border-gray-500 border-dashed rounded-lg">
        <div className="flex items-center gap-3">
          <FaImage className="text-xl text-green-400" />
          <span className="text-sm">Upload image</span>
        </div>

        <FileInput
          label="Click to post image"
          name="image"
          accept="image/*"
          icon={<FaImage />}
          openAsModal
          onOpenModal={() => setShowImageModal(true)}
        />
        <div className="flex gap-3" />  
      </div>
      {showImageModal && (
        <div className="fixed inset-0  flex items-center justify-center bg-black/60" style={{zIndex:1000}}>
          <div className="w-full max-w-lg mx-4 bg-[#0b0f1f] border border-gray-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageFile(undefined);
                  setImagePreview("");
                }}
                className="text-gray-300 hover:text-white"
                aria-label="Back"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold">Post</h3>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageFile(undefined);
                  setImagePreview("");
                }}
                className="text-gray-300 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  const el = document.getElementById('image-upload-modal') as HTMLInputElement | null;
                  if (el && !uploading) el.click();
                }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  if (uploading) return;
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    await handleImageSelected(file);
                  } else {
                    toast.error('Only image files are allowed');
                  }
                }}
              >
                <FaPlus className="w-10 h-10 mb-2 text-slate-300 opacity-70" />
                <p className="text-slate-300">
                  {uploading ? 'Uploading…' : 'Click or drag an image to upload'}
                </p>
                <input
                  id="image-upload-modal"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || undefined;
                    if (!file) return;
                    await handleImageSelected(file);
                  }}
                />
              </div>

              <div
                className="mt-2 border border-gray-700 rounded-xl h-64 flex items-center justify-center bg-[#0b1026]"
              >
                {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="max-h-64 max-w-full object-contain rounded-md"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/fallback.jpg"; // 👈 replace with your fallback asset
                        }}
                      />
                    )}
                    </div>

              <textarea
                className="w-full h-28 p-2 rounded-lg bg-[#2a2a2a] text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="What's on your mind?"
                value={postcontent}
                onChange={(e) => setpostcontent(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
              <button
                disabled={uploading || !imageFile}
                className="w-full py-2 font-semibold text-white transition bg-green-600 hover:bg-green-500 rounded-lg disabled:opacity-60"
                onClick={() => handleUploadStart('image')}
              >
                {uploading ? 'Uploading…' : (imageFile ? 'Post' : 'Choose image')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0  flex items-center justify-center bg-black/60" style={{zIndex:1000}}>
          <div className="w-full max-w-lg mx-4 bg-[#0b0f1f] border border-gray-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoFile(undefined);
                  setVideoPreview("");
                  setVideoCaption("");
                }}
                className="text-gray-300 hover:text-white"
                aria-label="Back"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold">Post</h3>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoFile(undefined);
                  setVideoPreview("");
                  setVideoCaption("");
                }}
                className="text-gray-300 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  const el = document.getElementById('video-upload-modal') as HTMLInputElement | null;
                  if (el && !videoUploading) el.click();
                }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (videoUploading) return;
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('video/')) {
                    const url = URL.createObjectURL(file);
                    setVideoFile(file);
                    setVideoPreview(url);
                  } else {
                    toast.error('Only video files are allowed');
                  }
                }}
              >
                <FaPlus className="w-10 h-10 mb-2 text-slate-300 opacity-70" />
                <p className="text-slate-300">
                  {videoUploading ? 'Uploading…' : 'Click or drag a video to upload'}
                </p>
                <input
                  id="video-upload-modal"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || undefined;
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setVideoFile(file);
                    setVideoPreview(url);
                  }}
                />
              </div>

              <div className="mt-2 border border-gray-700 rounded-xl h-64 flex items-center justify-center bg-[#0b1026] overflow-hidden">
                {videoPreview ? (
                  <video src={videoPreview} controls className="w-full h-full object-contain" />
                ) : (
                  <p className="text-slate-300">Preview Upload</p>
                )}
              </div>

              <textarea
                className="w-full h-28 p-2 rounded-lg bg-[#2a2a2a] text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="What's on your mind?"
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
              <button
                disabled={videoUploading || !videoFile}
                className="w-full py-2 font-semibold text-white transition bg-green-600 hover:bg-green-500 rounded-lg disabled:opacity-60"
                onClick={() => handleUploadStart('video')}
              >
                {videoUploading ? 'Uploading…' : (videoFile ? 'Post' : 'Choose video')}
              </button>
            </div>
          </div>
        </div>
     )}

      {/* Video Upload Section */}
      <div
        className="flex items-center gap-3 p-4 transition border border-gray-500 border-dashed rounded-lg cursor-pointer hover:bg-gray-800"
        onClick={() => setShowVideoModal(true)}
      >
        <FaVideo className="text-xl text-purple-400" />
        <span className="text-sm">Click to post video</span>
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
                  className="rounded border-gray-600 bg-gray-800 text-green-400 focus:ring-2 focus:ring-green-500"
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
                onClick={() => agreedToPolicy && handleContinueUpload(showImageModal ? 'image' : 'video')}
                disabled={!agreedToPolicy}
                className="px-4 py-2 font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-500 disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




// Helper component to cleanup object URLs when they change/unmount
function CleanupObjectUrl({ url }: { url: string }) {
  useEffect(() => {
    return () => {
      try { URL.revokeObjectURL(url); } catch {}
    };
  }, [url]);
  return null;
}
