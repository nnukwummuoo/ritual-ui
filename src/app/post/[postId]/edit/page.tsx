/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef } from "react"
import { useParams } from "next/navigation";
import { useUserId } from "@/lib/hooks/useUserId";
import { fetchsinglepost, updatepost } from "@/store/post";
import { toast } from "material-react-toastify";
import {useRouter} from "next/navigation"
import { getImageSource, createImageFallbacks } from "@/lib/imageUtils";
import Image from "next/image";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";

// Video skeleton component for loading state
const VideoSkeleton = () => (
  <div className="relative w-full h-[500px] rounded overflow-hidden bg-gray-700 animate-pulse">
    <div className="w-full h-full flex items-center justify-center">
      {/* Play button skeleton */}
      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
        <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
      </div>
    </div>
    {/* Video controls skeleton */}
    <div className="absolute bottom-3 right-3">
      <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
    </div>
  </div>
);

function PostSingle() {
        const router = useRouter()
        const [thePost, setThePost] = React.useState<{
            _id?: string;
            content?: string;
            posttype?: string;
            postphoto?: string;
            postvideo?: string;
            postlink?: string;
            postFile?: string;
            file?: string;
            proxy_view?: string;
            file_link?: string;
            media?: string;
            image?: string;
            video?: string;
            thumblink?: string;
            publicId?: string;
            public_id?: string;
            imageId?: string;
            postfilepublicid?: string;
            postfilelink?: string;
            createdAt?: string;
            user?: { _id?: string };
        }>({});
        const [newImage, setNewImage] = React.useState<File | null>(null);
        const [imagePreview, setImagePreview] = React.useState<string>("");
        // const fileInputRef = useRef<HTMLInputElement>(null);
        
        // Video control state
        const [showControls, setShowControls] = React.useState(false);
        const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
        const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
        const p=thePost;
        const userid = useUserId();
    const { postId } = useParams();
    
    // Fix for concatenated post IDs - extract the first valid ID
    const extractPostId = (id: string | string[] | undefined): string => {
        if (!id) return "";
        const idStr = Array.isArray(id) ? id[0] : String(id);
        
        // If the ID contains multiple IDs concatenated (like "68d934b10f183828b1fafaf268d934b11d185344db9e")
        // Extract the first valid MongoDB ObjectId (24 characters)
        if (idStr.length > 24) {
            // Try to find the first valid ObjectId
            const match = idStr.match(/^[a-f\d]{24}/);
            if (match) {
                return match[0];
            }
        }
        
        return idStr;
    };
    
    const cleanPostId = extractPostId(postId);
    
    // Video auto-play hook
    const { videoRef, isPlaying, isVisible, autoPlayBlocked, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
        autoPlay: true,
        muted: true,
        loop: true,
        postId: cleanPostId || 'edit-post'
    });
    
    React.useLayoutEffect(()=>{
        (async () => {
            const tst = toast("Loading", { autoClose: false });
            try {
                const res=await fetchsinglepost(cleanPostId);
                setThePost(res);
            } catch (err) {
                console.error(err);
            }finally{
                toast.dismiss(tst)
            }
        })()
    }, [cleanPostId])
    
    // Clear timeout when component unmounts
    React.useEffect(() => {
        // Show controls initially when the video loads
        setShowControls(true);
        
        // Set timer to hide controls
        const initialTimer = setTimeout(() => {
            setShowControls(false);
        }, 3000);
        
        return () => {
            // Clean up all timeouts on unmount
            if (initialTimer) clearTimeout(initialTimer);
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        };
    }, []);
    
    // Only process images when we have actual post data
    const hasPostData = p && Object.keys(p).length > 0 && p._id;
    
    
    // Get media reference from post data (only when we have data)
    // Prioritize full URLs over public IDs for better image display
    const mediaRef: string | { publicId?: string; public_id?: string; url?: string } | undefined = hasPostData ? (
        p?.postfilelink ||  // Use full URL first
        p?.postphoto ||
        p?.postvideo ||
        p?.postlink ||
        p?.postFile ||
        p?.file ||
        p?.proxy_view ||
        p?.file_link ||
        p?.media ||
        p?.image ||
        p?.video ||
        p?.thumblink ||
        // support top-level identifiers
        p?.publicId ||
        p?.public_id ||
        p?.imageId ||
        p?.postfilepublicid ||  // Use public ID as fallback
        ""
    ) : "";
    
    const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef && typeof mediaRef === "object" ? ((mediaRef as { publicId?: string; public_id?: string; url?: string }).publicId || (mediaRef as { publicId?: string; public_id?: string; url?: string }).public_id || (mediaRef as { publicId?: string; public_id?: string; url?: string }).url || "") : "");
    
    
    
    // Use bucket detection for Storj URLs with proxy support (only when we have data)
    // For direct URLs (like Appwrite), use them as-is. For Storj URLs, process through proxy
    const imageSource = hasPostData ? getImageSource(asString, 'post') : { src: '', isStorj: false, bucket: 'post', key: '', originalUrl: '' };
    const imageFallbacks = hasPostData ? createImageFallbacks(asString, 'post') : { fallbacks: [] };
    
    // If it's a direct URL (not Storj), use it directly. Otherwise use the processed source
    const src = hasPostData && asString && !imageSource.isStorj && (asString.startsWith('http://') || asString.startsWith('https://')) 
        ? asString 
        : imageSource.src;
    
    
    
    
    // Handle new image selection
    // const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         // Check file size (5MB limit)
    //         if (file.size > 5 * 1024 * 1024) {
    //             toast.error("File size must be less than 5MB");
    //             return;
    //         }
            
    //         // Check file type
    //         if (!file.type.startsWith('image/')) {
    //             toast.error("Please select an image file");
    //             return;
    //         }
            
    //         setNewImage(file);
    //         const previewUrl = URL.createObjectURL(file);
    //         setImagePreview(previewUrl);
    //     }
    // };
    
    // Remove new image
    // const removeNewImage = () => {
    //     if (imagePreview) {
    //         URL.revokeObjectURL(imagePreview);
    //     }
    //     setNewImage(null);
    //     setImagePreview("");
    //     if (fileInputRef.current) {
    //         fileInputRef.current.value = "";
    //     }
    // };
    // Show loading state if we don't have post data yet
    if (!hasPostData) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-[#efefef20] p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-300">Loading post...</span>
                    </div>
                </div>
            </div>
        );
    }

    return <>
        <div className="container mx-auto p-4">
            <div className="bg-[#efefef20] p-6 rounded-lg shadow-md">
                <div className="d-flex"> 
                    <h1 className="text-lg font-bold">Edit Post</h1>
                    {thePost?.createdAt?<div>{(new Date(thePost?.createdAt)).toString().split("(")[0]}</div>:""}
                </div>  
                <div className="mt-3 d-flex mb-3">
                    <textarea value={thePost.content || ""} onChange={({target})=>{
                            setThePost((prev)=>({ ...prev, content: target.value }))
                    }} className="bg-[#efefef10] w-[100%] p-2 min-h-[25vh]"/>
                </div>
                
                {/* Current Image Display */}
                {thePost?.posttype == "image" && asString && !imagePreview && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Current Image:</h3>
                        <div className="relative">
                            <Image
                                src={src}
                                alt={p?.content || "post image"}
                                width={800}
                                height={400}
                                className="w-full max-h-[480px] object-contain rounded"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    // Try fallback URLs if proxy fails
                                    if (imageFallbacks.fallbacks.length > 0) {
                                        const currentSrc = img.src;
                                        const fallbackIndex = imageFallbacks.fallbacks.findIndex(fallback => fallback === currentSrc);
                                        const nextFallback = imageFallbacks.fallbacks[fallbackIndex + 1];
                                        if (nextFallback) {
                                            img.src = nextFallback;
                                        } else {
                                            // If all fallbacks fail, show a placeholder
                                            img.src = '/icons/icon-512x512.png';
                                            img.alt = 'Image failed to load';
                                        }
                                    } else {
                                        // No fallbacks available, show placeholder
                                        img.src = '/icons/icon-512x512.png';
                                        img.alt = 'Image failed to load';
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
                
                {/* Video Display */}
                {thePost?.posttype == "video" && asString && !imagePreview &&(
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Current Video:</h3>
                        <div className="relative w-full h-[500px] rounded overflow-hidden">
                            {/* Video skeleton - show while video is loading */}
                            {!isVideoLoaded && (
                                <VideoSkeleton />
                            )}
                            
                            {/* Video with controls that auto-hide */}
                            <div 
                                className={`relative w-full h-full ${!isVideoLoaded ? 'opacity-0 absolute top-0 left-0' : 'opacity-100 transition-opacity duration-300'}`}
                                onMouseMove={() => {
                                    // Show controls and reset the timer when mouse moves
                                    setShowControls(true);
                                    if (controlsTimerRef.current) {
                                        clearTimeout(controlsTimerRef.current);
                                    }
                                    controlsTimerRef.current = setTimeout(() => {
                                        setShowControls(false);
                                    }, 3000);
                                }}
                                onClick={() => {
                                    // Show controls and toggle play when clicking
                                    setShowControls(true);
                                    togglePlay();
                                    if (controlsTimerRef.current) {
                                        clearTimeout(controlsTimerRef.current);
                                    }
                                    controlsTimerRef.current = setTimeout(() => {
                                        setShowControls(false);
                                    }, 3000);
                                }}
                            >
                                <video
                                    ref={videoRef}
                                    src={src}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-[500px] object-cover rounded cursor-pointer"
                                    onLoadedData={() => {
                                        setIsVideoLoaded(true);
                                    }}
                                    onError={(e) => {
                                        const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                                        if (!video.dataset.fallback1 && imageFallbacks.fallbacks.length > 0) {
                                            video.dataset.fallback1 = "1";
                                            video.src = imageFallbacks.fallbacks[0];
                                            video.load();
                                            return;
                                        }
                                        if (!video.dataset.fallback2 && imageFallbacks.fallbacks.length > 1) {
                                            video.dataset.fallback2 = "1";
                                            video.src = imageFallbacks.fallbacks[1];
                                            video.load();
                                            return;
                                        }
                                        if (!video.dataset.fallback3 && imageFallbacks.fallbacks.length > 2) {
                                            video.dataset.fallback3 = "1";
                                            video.src = imageFallbacks.fallbacks[2];
                                            video.load();
                                        }
                                    }}
                                />
                                
                                {/* Volume Button - Shows only when showControls is true */}
                                {showControls && (
                                    <div className="absolute bottom-3 right-3 z-10 transition-opacity duration-300 opacity-100">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMute();
                                                // Reset auto-hide timer when interacting with controls
                                                if (controlsTimerRef.current) {
                                                    clearTimeout(controlsTimerRef.current);
                                                }
                                                controlsTimerRef.current = setTimeout(() => {
                                                    setShowControls(false);
                                                }, 3000);
                                            }} 
                                            className="bg-black bg-opacity-70 rounded-full p-2.5 hover:bg-opacity-90 transition-all hover:scale-110"
                                            aria-label={isMuted ? "Unmute video" : "Mute video"}
                                        >
                                            {isMuted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <line x1="23" y1="9" x2="17" y2="15"></line>
                                                    <line x1="17" y1="9" x2="23" y2="15"></line>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                )}
                                
                                {/* Center Play/Pause Button - Shows only when showControls is true */}
                                {showControls && (
                                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100">
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePlay();
                                                // Reset auto-hide timer when interacting with controls
                                                if (controlsTimerRef.current) {
                                                    clearTimeout(controlsTimerRef.current);
                                                }
                                                controlsTimerRef.current = setTimeout(() => {
                                                    setShowControls(false);
                                                }, 3000);
                                            }}
                                            className="bg-black bg-opacity-70 rounded-full p-5 hover:bg-opacity-90 hover:scale-110 cursor-pointer transition-all"
                                        >
                                            {isPlaying ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="6" y="4" width="4" height="16"></rect>
                                                    <rect x="14" y="4" width="4" height="16"></rect>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Image Upload Section */}
                {/* <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 text-gray-300">
                        {thePost?.posttype === "image" ? "Replace Image:" : "Add Image:"}
                    </h3> */}
                    
                    {/* Hidden file input */}
                    {/* <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    /> */}
                    
                    {/* Upload button */}
                    {/* <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        {thePost?.posttype === "image" ? "Replace Image" : "Select Image"}
                    </button> */}
                    
                    {/* New image preview */}
                    {/* {imagePreview && (
                        <div className="mt-4 relative">
                            <h4 className="text-sm font-medium mb-2 text-gray-300">New Image Preview:</h4>
                            <div className="relative inline-block">
                                <Image
                                    src={imagePreview}
                                    alt="New image preview"
                                    width={400}
                                    height={300}
                                    className="max-h-[300px] object-contain rounded border"
                                />
                                <button
                                    onClick={removeNewImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    title="Remove new image"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </div> */}
                
                <div className="ms-auto mt-3"> 
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={async () => {
                        if (p?.user?._id!==userid) {
                            toast.error("You Cannot edit this post");
                            return;
                        }
                        const tst= toast("Updating", { autoClose: false });
                        try{
                            // If there's a new image, we need to upload it first
                            let updatedPost = { ...thePost };
                            
                            if (newImage) {
                                // Create FormData for image upload
                                const formData = new FormData();
                                formData.append('image', newImage);
                                formData.append('userid', userid || '');
                                
                                // Upload the new image
                                const uploadResponse = await fetch('/api/image/save', {
                                    method: 'POST',
                                    body: formData
                                });
                                
                                if (uploadResponse.ok) {
                                    const uploadData = await uploadResponse.json();
                                    // Update post with new image data
                                    updatedPost = {
                                        ...updatedPost,
                                        postphoto: uploadData.publicId || uploadData.url,
                                        postfilepublicid: uploadData.publicId,
                                        postfilelink: uploadData.url
                                    };
                                } else {
                                    throw new Error('Image upload failed');
                                }
                            }
                            
                            const res = await updatepost(cleanPostId, updatedPost);
                            setThePost(res);
                            toast.success("Post updated");
                            router.push(`/post/${cleanPostId}`)
                        } catch (err) {
                            toast.error("Error updating post");
                            console.error(err)
                        } finally {
                            toast.dismiss(tst)
                        }
                    }}>Save</button>
            </div>
            </div>

            
        </div>
    </>
}

export default PostSingle