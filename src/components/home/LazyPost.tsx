/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
import { follow as followThunk, unfollow as unfollowThunk, getfollow } from "@/store/profile";
import VIPBadge from "@/components/VIPBadge";
import { URL as API_BASE } from "@/api/config";
const PROD_BASE = process.env.NEXT_PUBLIC_API || "";
import PostActions from "./PostActions";
import { toast } from "material-react-toastify";
import Image from "next/image";
import { getImageSource } from "@/lib/imageUtils";
import LazyImage from "./LazyImage";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import ExpandableText from "../ExpandableText";
import { generateInitials } from "@/utils/generateInitials";

// Video component for lazy-loaded videos - moved outside to prevent re-creation
const VideoComponent = ({ post, src, pathUrlPrimary, queryUrlFallback, pathUrlFallback, showControls, setShowControls, controlsTimerRef, isVideoLoaded, setIsVideoLoaded }: {
  post: any;
  src: string;
  pathUrlPrimary?: string;
  queryUrlFallback?: string;
  pathUrlFallback?: string;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  controlsTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  isVideoLoaded: boolean;
  setIsVideoLoaded: (loaded: boolean) => void;
}) => {
  const { videoRef, isPlaying, isVisible: videoVisible, autoPlayBlocked, hasUserInteracted, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
    autoPlay: true,
    muted: true,
    loop: true,
    postId: post?._id || post?.postid || post?.id || 'lazy-post'
  });
  
  return (
    <div className="relative w-full h-[400px] rounded overflow-hidden">
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
      >
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className="w-full h-[400px] object-cover rounded cursor-pointer"
          onLoadedData={() => {
            setIsVideoLoaded(true);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowControls(true);
            togglePlay();
            if (controlsTimerRef.current) {
              clearTimeout(controlsTimerRef.current);
            }
            controlsTimerRef.current = setTimeout(() => {
              setShowControls(false);
            }, 3000);
          }}
          onError={(e) => {
            const video = e.currentTarget as HTMLVideoElement & { dataset: any };
            if (!video.dataset.fallback1 && pathUrlPrimary) {
              video.dataset.fallback1 = "1";
              video.src = pathUrlPrimary;
              video.load();
              return;
            }
            if (!video.dataset.fallback2 && queryUrlFallback) {
              video.dataset.fallback2 = "1";
              video.src = queryUrlFallback;
              video.load();
              return;
            }
            if (!video.dataset.fallback3 && pathUrlFallback) {
              video.dataset.fallback3 = "1";
              video.src = pathUrlFallback;
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
              className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all duration-200"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
          </div>
        )}
        
        {/* Center Play/Pause Button - Shows when controls are visible OR when autoplay is blocked */}
        {(showControls || autoPlayBlocked) && (
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

        {/* Click to Play Overlay - Shows when autoplay is blocked and video is not playing */}
        {(autoPlayBlocked || !hasUserInteracted) && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="text-center text-white">
               <div 
                 onClick={(e) => {
                   e.stopPropagation();
                   togglePlay();
                 }}
                 className="bg-black bg-opacity-70 rounded-full p-6 hover:bg-opacity-90 hover:scale-110 cursor-pointer transition-all mb-4 mx-auto w-fit opacity-0"
               >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function to format relative time
const formatRelativeTime = (timestamp: string | number | Date): string => {
  try {
    const now = new Date();
    let time: Date;
    
    // Handle different timestamp formats
    if (typeof timestamp === 'number') {
      time = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    } else if (typeof timestamp === 'string') {
      if (/^\d+$/.test(timestamp)) {
        const numTimestamp = parseInt(timestamp, 10);
        time = new Date(numTimestamp < 10000000000 ? numTimestamp * 1000 : numTimestamp);
      } else {
        time = new Date(timestamp);
      }
    } else {
      time = new Date(timestamp);
    }
    
    if (isNaN(time.getTime())) {
      if (typeof timestamp === 'string') {
        const altTime = new Date(timestamp.replace(/[^\d]/g, ''));
        if (!isNaN(altTime.getTime())) {
          time = altTime;
        } else {
          return 'recently';
        }
      } else if (typeof timestamp === 'number') {
        if (timestamp > 1000000000000) {
          time = new Date(timestamp);
        } else if (timestamp > 1000000000) {
          time = new Date(timestamp * 1000);
        } else {
          return 'recently';
        }
      } else {
        return 'recently';
      }
      
      if (isNaN(time.getTime())) {
        return 'recently';
      }
    }
    
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      const futureDiff = Math.abs(diffInSeconds);
      if (futureDiff < 3600) {
        return 'in a moment';
      } else if (futureDiff < 86400) {
        const hours = Math.floor(futureDiff / 3600);
        return `in ${hours}h`;
      } else if (futureDiff < 31536000) {
        const days = Math.floor(futureDiff / 86400);
        return `in ${days}d`;
      } else {
        return 'recently';
      }
    }

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  } catch (error) {
    return 'recently';
  }
};

// Skeleton component for loading state
const PostSkeleton = () => (
  <div className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
    <div className="h-3 bg-gray-700 rounded w-20 mb-3"></div>
    <div className="space-y-2 mb-3">
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
    <div className="h-48 bg-gray-700 rounded mb-3"></div>
    <div className="flex gap-4 pt-2 border-t border-gray-700">
      <div className="h-6 bg-gray-700 rounded w-16"></div>
      <div className="h-6 bg-gray-700 rounded w-20"></div>
      <div className="h-6 bg-gray-700 rounded w-16"></div>
    </div>
  </div>
);

// Video skeleton component for loading state
const VideoSkeleton = () => (
  <div className="relative w-full h-[400px] rounded overflow-hidden bg-gray-700 animate-pulse">
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

interface LazyPostProps {
  post: any;
  ui: any;
  setUi: any;
  dispatch: any;
  loggedInUserId: string;
  selfId: string;
  token: string;
  followingList: string[];
  vipStatus: any;
  firstname: string;
  lastname: string;
  username: string;
  photolink: string;
  isFirstPost?: boolean;
}

const LazyPost: React.FC<LazyPostProps> = ({
  post,
  ui,
  setUi,
  dispatch,
  loggedInUserId,
  selfId,
  token,
  followingList,
  vipStatus,
  firstname,
  lastname,
  username,
  photolink,
  isFirstPost = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Modal state for image viewing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  
  // State and ref for auto-hiding video controls
  const [showControls, setShowControls] = useState(false);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Add a small delay to prevent too many posts loading at once
            setTimeout(() => {
              setIsVisible(true);
              setHasLoaded(true);
            }, isFirstPost ? 0 : 100); // First post loads immediately
          }
        });
      },
      {
        rootMargin: '200px', // Start loading when post is 200px away from viewport
        threshold: 0.1
      }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => {
      if (postRef.current) {
        observer.unobserve(postRef.current);
      }
    };
  }, [isFirstPost]);

  
  // Reset video loading state when post changes
  const postId = post?.postid || post?.id || post?._id;
  useEffect(() => {
    setIsVideoLoaded(false);
  }, [postId]);

  // Clear timeout when component unmounts
  useEffect(() => {
    if (hasLoaded) {
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
    }
  }, [hasLoaded]);

  // Modal functions
  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
    document.body.style.overflow = "unset";
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!post) return null;

  // Show skeleton while loading
  if (!isVisible) {
    return (
      <div ref={postRef} className="w-full">
        <PostSkeleton />
      </div>
    );
  }

  let postType: string = post?.posttype || post?.type || "text";
  if (!postType) {
    if (post?.postphoto || post?.image) postType = "image";
    else if (post?.postvideo || post?.video) postType = "video";
  }

  const mediaRef =
    post?.postfilelink ||
    post?.postphoto ||
    post?.postvideo ||
    post?.postlink ||
    post?.postFile ||
    post?.file ||
    post?.proxy_view ||
    post?.file_link ||
    post?.media ||
    post?.image ||
    post?.video ||
    post?.thumblink ||
    post?.postfilepublicid ||
    post?.publicId ||
    post?.public_id ||
    post?.imageId ||
    "";
  const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
  const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
  const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
  const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
  const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
  
  const imageSource = getImageSource(asString, 'post');
  const src = imageSource.src;
  
  const queryUrlPrimary = asString ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
  const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
  const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
  const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";

  const combinedName = [post?.user?.firstname, post?.user?.lastname].filter(Boolean).join(" ");
  let displayName =
    post?.user?.username ||
    post?.user?.name ||
    post?.user?.username ||
    combinedName ||
    post?.user?.fullname ||
    post?.user?.fullName ||
    post?.user?.author ||
    post?.user?.username ||
    post?.user?.name ||
    post?.profile?.username ||
    post?.postedBy?.username ||
    post?.postedBy?.name ||
    "User";
  
  const postAuthorId = post?.userid || post?.userId || post?.ownerid || post?.ownerId || post?.authorId || post?.createdBy;
  const isSelf = (
    (loggedInUserId && postAuthorId && String(postAuthorId) === String(loggedInUserId)) ||
    (selfId && postAuthorId && String(postAuthorId) === String(selfId))
  );
  if (isSelf && (!displayName || displayName === "User")) {
    const selfCombined = [firstname, lastname].filter(Boolean).join(" ");
    displayName = username || selfCombined || displayName;
  }
  const handleStr =
    post?.handle ||
    post?.user?.handle ||
    post?.username ||
    post?.user?.username ||
    post?.username ||
    post?.postedBy?.username ||
    null;

  const likeCount = Number(post?.likeCount || 0);
  const likedByArr = Array.isArray(post?.likedBy) ? post.likedBy : [];
  const commentsArr: any[] = Array.isArray(post?.comments)
    ? post?.comments
    : Array.isArray(post?.comment)
    ? post?.comment
    : [];
  const commentCount = Array.isArray(commentsArr)
    ? commentsArr.length
    : Number(post?.commentCount || post?.commentsCount || post?.comments || 0) || 0;

  const idStr = (v: any) => (v == null ? undefined : String(v));
  const selfIdStr = idStr(loggedInUserId) || idStr(selfId);
  const liked = !!(selfIdStr && likedByArr.includes(selfIdStr));

  const pid = post?.postid || post?.id || post?._id || 0;
  const uiState = ui[pid] || {};
  const uiLiked = uiState.liked ?? liked;
  const uiLikeCount = uiState.likeCount ?? likeCount;
  const uiOpen = !!uiState.open;
  const uiComments = uiState.comments ?? [];
  const uiInput = uiState.input ?? "";
  const uiLoading = !!uiState.loadingComments;
  const uiSending = !!uiState.sending;
  const hasUiComments = Object.prototype.hasOwnProperty.call(uiState, 'comments');
  const uiCommentCount = uiState.commentCount;
  const displayCommentCount = hasUiComments ? (uiCommentCount ?? uiComments.length) : commentCount;
  const uiIsFollowing = uiState.isFollowing ?? false;

  return (
    <div ref={postRef} className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="size-10 rounded-full overflow-hidden bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/Profile/${postAuthorId}`);
              }}
            >
              {(() => {
                const profileImage = isSelf ? photolink : 
                  post?.user?.photolink || 
                  post?.user?.photoLink || 
                  post?.user?.profileImage || 
                  post?.user?.avatar || 
                  post?.user?.image;
                
                const userName = isSelf ? `${firstname} ${lastname}`.trim() : 
                  `${post?.user?.firstname || ""} ${post?.user?.lastname || ""}`.trim();
                
                const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                
                if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                  const imageSource = getImageSource(profileImage, 'profile');
                  return (
                    <LazyImage
                      src={imageSource.src}
                      alt="Profile picture"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      priority={isFirstPost}
                    />
                  );
                }
                
                return (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold bg-gray-600">
                    {initials}
                  </div>
                );
              })()}
            </div>
            
            {/* VIP Lion Badge - show if the post author is VIP */}
            {(() => {
              // Check if current user is VIP
              if (isSelf && vipStatus?.isVip) {
                return <VIPBadge size="xl" className="absolute -top-5 -right-5" isVip={vipStatus.isVip} vipEndDate={vipStatus.vipEndDate} />;
              }

              // Check if post author is VIP
              if (!isSelf && post?.user?.isVip) {
                return <VIPBadge size="xl" className="absolute -top-5 -right-5" isVip={post.user.isVip} vipEndDate={post.user.vipEndDate} />;
              }

              return null;
            })()}
          </div>
          <div 
            className="flex-1 cursor-pointer" 
          >
            <p className="font-medium text-white ">{post?.user?.firstname} { post?.user?.lastname}</p>
            <span className="text-gray-400 text-sm">{handleStr ? `${handleStr}` : ""}</span>
          </div>
        </div>
      </div>

      {post?.createdAt && (
        <p className="my-3 text-gray-400 text-sm cursor-pointer" >
          {(() => {
            const formatted = formatRelativeTime(post.createdAt);
            if (formatted === 'Invalid time' || formatted === 'Unknown time') {
              return 'recently';
            }
            return formatted;
          })()}
        </p>
      )}
      
      {post?.content && (
        <ExpandableText 
          text={post.content}
          maxLength={100}
          className="my-2"
        />
      )}
      
      {postType == "image" && src && (
        <div className="w-full max-h-[400px] relative rounded overflow-hidden">
          <LazyImage
            src={src}
            alt={post?.content || "post image"}
            width={800}
            height={400}
            className="w-full h-[400px] object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
            onClick={() => openModal(src)}
            fallbackUrls={[pathUrlPrimary, queryUrlFallback, pathUrlFallback].filter(Boolean)}
            priority={isFirstPost}
          />
        </div>
      )}
      
      {postType == "video" && src && hasLoaded && (
        <VideoComponent 
          post={post}
          src={src}
          pathUrlPrimary={pathUrlPrimary}
          queryUrlFallback={queryUrlFallback}
          pathUrlFallback={pathUrlFallback}
          showControls={showControls}
          setShowControls={setShowControls}
          controlsTimerRef={controlsTimerRef}
          isVideoLoaded={isVideoLoaded}
          setIsVideoLoaded={setIsVideoLoaded}
        />
      )}
      
      
      <PostActions
        className="mt-3 border-t border-gray-700 pt-2"
        starred={uiIsFollowing}
        liked={uiLiked}
        likeCount={uiLikeCount}
        commentCount={displayCommentCount}
        post={post}
        onStar={async () => {
          const postAuthorId = post?.userid || post?.userId || post?.ownerid || post?.ownerId || post?.authorId || post?.createdBy;
          const localPid = post?.postid || post?.id || post?._id;
          
          if (!loggedInUserId || !postAuthorId || !token) {
            toast.error("Please log in to follow users");
            return;
          }

          const currentUiState = ui[localPid] || {};
          const currentlyFollowing = currentUiState.isFollowing ?? false;

          setUi(prev => ({
            ...prev,
            [localPid]: {
              ...prev[localPid],
              isFollowing: !currentlyFollowing,
            },
          }));

          try {
            if (currentlyFollowing) {
              await dispatch(unfollowThunk({ 
                userid: Array.isArray(postAuthorId) ? postAuthorId.join(',') : postAuthorId,
                followerid: loggedInUserId, 
                token 
              })).unwrap();
              
              toast.success("Unfollowed successfully!");
            } else {
              await dispatch(followThunk({
                userid: Array.isArray(postAuthorId) ? postAuthorId.join(',') : postAuthorId,
                followerid: loggedInUserId,
                token
              })).unwrap();
              
              toast.success("Followed successfully!");
            }
            
            dispatch(getfollow({ userid: loggedInUserId, token }));
            
          } catch {
            setUi(prev => ({
              ...prev,
              [localPid]: {
                ...prev[localPid],
                isFollowing: currentlyFollowing,
              },
            }));
            
            toast.error(`Failed to ${currentlyFollowing ? 'unfollow' : 'follow'}. Please try again.`);
          }
        }}
        onLike={async () => {
          console.log('🔥 LIKE BUTTON CLICKED - LazyPost');
          console.log('📊 Current state:', {
            loggedInUserId,
            selfId,
            token: token ? 'present' : 'missing',
            postId: post?.postid || post?.id || post?._id,
            currentLiked: liked,
            currentLikeCount: likeCount
          });
          
          const uid = String(loggedInUserId || selfId || "");
          const localPid = post?.postid || post?.id || post?._id;
          
          console.log('🔍 Like validation:', {
            uid,
            localPid,
            hasToken: !!token,
            validationPassed: !!(localPid && token)
          });
          
          if (!localPid || !token) {
            console.error('❌ Like validation failed - missing postId or token');
            toast.error("Please login to like posts");
            return;
          }
          
          const curr = ui[localPid] || {};
          const nextLiked = !(curr.liked ?? liked);
          const currentCount = curr.likeCount ?? likeCount;
          
          console.log('🎯 Like action:', {
            currentLiked: curr.liked ?? liked,
            nextLiked,
            currentCount,
            newCount: Math.max(0, currentCount + (nextLiked ? 1 : -1))
          });
          
          setUi((prev) => ({
            ...prev,
            [localPid]: {
              ...curr,
              liked: nextLiked,
              likeCount: Math.max(0, currentCount + (nextLiked ? 1 : -1)),
            },
          }));

          try {
            const likeData = {
              userid: uid,
              postid: localPid,
              token: token
            };
            
            console.log('🚀 Sending like request to backend:', likeData);
            console.log('📡 API URL:', `${process.env.NEXT_PUBLIC_API || ""}/like`);
            
            const result = await dispatch(postlike(likeData as any)).unwrap();
            
            console.log('✅ Like request successful:', result);
            toast.success(nextLiked ? "Post liked!" : "Post unliked!");
            
            // Refresh the post data to get updated like count from server
            setTimeout(() => {
              console.log('🔄 Refreshing feed after like...');
              window.dispatchEvent(new CustomEvent('refreshfeed'));
            }, 1000);
            
          } catch (error) {
            console.error('❌ Like request failed:', error);
            console.error('❌ Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
            setUi((prev) => ({
              ...prev,
              [localPid]: {
                ...prev[localPid],
                liked: !nextLiked,
                likeCount: currentCount,
              },
            }));
            toast.error("Failed to update like. Please try again.");
          }
        }}
        onComment={() => {
          const localPid = post?.postid || post?.id || post?._id;
          
          if (!localPid) {
            return;
          }
          
          const currentUiState = ui[localPid] || {};
          const isCurrentlyOpen = currentUiState.open;
          
          setUi((prev) => ({
            ...prev,
            [localPid]: { ...(prev[localPid] || {}), open: !isCurrentlyOpen }
          }));
          
          const curr = ui[localPid];
          
          if (curr && Array.isArray(curr.comments) && curr.comments.length > 0) {
            return;
          }
          
          const shouldFetch = !(curr && Array.isArray(curr.comments));
          
          if (shouldFetch) {
            setUi((prev) => ({
              ...prev,
              [localPid]: { ...(prev[localPid] || {}), loadingComments: true }
            }));
                
                (dispatch(getpostcomment({ postid: localPid } as any)) as any)
                  .unwrap()
                  .then((res: any) => {
                    const arr = (res && (res.comment || res.comments)) || [];
                    
                    setUi((prev) => {
                      const currentState = prev[localPid] || {};
                      return {
                        ...prev,
                        [localPid]: { 
                          ...currentState, 
                          comments: arr, 
                          loadingComments: false,
                          commentCount: arr.length,
                          // Explicitly preserve like and follow state
                          liked: currentState.liked,
                          likeCount: currentState.likeCount,
                          isFollowing: currentState.isFollowing
                        }
                      };
                    });
                  })
                  .catch((error) => {
                    console.error('💬 Comments fetch error:', error);
                    setUi((prev) => ({
                      ...prev,
                      [localPid]: { ...(prev[localPid] || {}), loadingComments: false }
                    }));
                  });
              }
            }}
          />
          
          {uiOpen && (
            <div className="mt-2 border-t border-gray-700 pt-2">
              {uiLoading ? (
                <p className="text-sm text-gray-400">Loading comments…</p>
              ) : (
                <div className="space-y-2">
                  {uiComments && uiComments.length > 0 ? (
                    [...uiComments]
                      .sort((a: any, b: any) => {
                        const aIsVip = a?.isVip && a?.vipEndDate && new Date(a.vipEndDate) > new Date();
                        const bIsVip = b?.isVip && b?.vipEndDate && new Date(b.vipEndDate) > new Date();
                        
                        if (aIsVip && !bIsVip) return -1;
                        if (bIsVip && !aIsVip) return 1;
                        
                        const aTime = a?.commenttime || a?.date || a?.createdAt || 0;
                        const bTime = b?.commenttime || b?.date || b?.createdAt || 0;
                        return bTime - aTime;
                      })
                      .map((c: any, i: number) => {
                        return (
                  <div key={i} className="text-sm text-gray-200 flex items-start gap-2 relative">
                    <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs overflow-hidden">
                      {(() => {
                        const profileImage = c?.commentuserphoto || c?.photo || c?.photolink || c?.photoLink || c?.profileImage || c?.avatar || c?.image;
                        
                        if (profileImage && profileImage.trim() && profileImage !== 'null' && profileImage !== 'undefined') {
                          const imageSource = getImageSource(profileImage, 'profile');
                          return (
                            <LazyImage
                              src={imageSource.src}
                              alt="Profile picture"
                              width={32}
                              height={32}
                              className="object-cover w-full h-full rounded-full"
                            />
                          );
                        }
                        
                        // Show initials as fallback when no profile image
                        return (
                          <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-xs text-white font-medium">
                            {(() => {
                              // Prioritize server-provided initials
                              if (c?.initials) return c.initials;
                              
                              // Generate from firstname and lastname if available
                              const firstName = c?.firstname || '';
                              const lastName = c?.lastname || '';
                              if (firstName || lastName) {
                                const nameParts = [firstName, lastName].filter(Boolean);
                                return nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                              }
                              
                              // Fallback to username if names not available
                              return (c?.commentusername || c?.username || 'U').charAt(0).toUpperCase();
                            })()}
                          </div>
                        );
                      })()}
                    </div>
                    
                    {(() => {
                      const isVipActive = c?.isVip && c?.vipEndDate && new Date(c.vipEndDate) > new Date();
                      return isVipActive && (
                        <VIPBadge size="lg" className="absolute -top-3 left-3 z-10" isVip={c.isVip} vipEndDate={c.vipEndDate} />
                      );
                    })()}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-300">
                          {(() => {
                            const combinedName = [c?.firstname, c?.lastname].filter(Boolean).join(" ");
                            return combinedName ||
                              c?.commentusername ||
                              c?.fullname ||
                              c?.fullName ||
                              c?.name ||
                              c?.username ||
                              c?.username ||
                              c?.author ||
                              'User';
                          })()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(() => {
                            const timestamp = c?.commenttime || 
                                            c?.date || 
                                            c?.createdAt || 
                                            c?.created_at || 
                                            c?.timestamp || 
                                            c?.time || 
                                            c?.postedAt || 
                                            c?.posted_at;
                            
                            if (!timestamp) {
                              return 'Unknown time';
                            }
                            
                            const formatted = formatRelativeTime(timestamp);
                            
                            if (formatted === 'Invalid time' || formatted === 'Unknown time') {
                              return 'recently';
                            }
                            
                            return formatted;
                          })()}
                        </span>
                      </div>
                      <div className="text-gray-200 mt-1">
                        {c?.content || c?.comment || String(c)}
                      </div>
                    </div>
                  </div>
                );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        value={uiInput}
                        onChange={(e) => {
                          const v = e.target.value;
                          setUi((prev) => ({
                            ...prev,
                            [pid]: { ...(prev[pid] || {}), input: v },
                          }));
                        }}
                        placeholder="Write a comment…"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-gray-500"
                      />
                      <button
                        disabled={!uiInput?.trim() || uiSending}
                        onClick={() => {
                          const text = (ui[pid]?.input || '').trim();
                          if (!text) return;
                          setUi((prev) => ({
                            ...prev,
                            [pid]: {
                              ...(prev[pid] || {}),
                              input: "",
                              sending: true,
                              comments: [
                                ...((prev[pid]?.comments as any[]) || []),
                                { 
                                  content: text, 
                                  comment: text, 
                                  username: [firstname, lastname].filter(Boolean).join(' ') || username || 'you',
                                  commentusername: [firstname, lastname].filter(Boolean).join(' ') || username || 'you',
                                  commentuserphoto: photolink || '',
                                  userid: String(loggedInUserId || selfId || ''),
                                  createdAt: new Date().toISOString(),
                                  commenttime: Date.now(),
                                  temp: true,
                                  initials: generateInitials(firstname, lastname, username),
                                  firstname: firstname || '',
                                  lastname: lastname || ''
                                },
                              ],
                              commentCount: ((prev[pid]?.comments as any[]) || []).length + 1,
                            },
                          }));
                          const uid = String(loggedInUserId || selfId || "");
                          const localPid = post?.postid || post?.id || post?._id;
                          if (uid && localPid && token) {
                            (dispatch(postcomment({ userid: uid, postid: localPid, content: text, token: token } as any)) as any)
                              .unwrap()
                              .then((_res: any) => {
                                dispatch(getpostcomment({ postid: localPid } as any))
                                  .unwrap()
                                  .then((commentRes: any) => {
                                    const serverComments = (commentRes && (commentRes.comment || commentRes.comments)) || [];
                                          setUi((prev) => {
                                            const currentState = prev[pid] || {};
                                            return {
                                              ...prev,
                                              [pid]: {
                                                ...currentState,
                                                sending: false,
                                                comments: serverComments,
                                                commentCount: serverComments.length,
                                                // Explicitly preserve like and follow state
                                                liked: currentState.liked,
                                                likeCount: currentState.likeCount,
                                                isFollowing: currentState.isFollowing
                                              },
                                            };
                                          });
                                  })
                                  .catch(() => {
                                    setUi((prev) => ({
                                      ...prev,
                                      [pid]: { ...(prev[pid] || {}), sending: false },
                                    }));
                                  });
                              })
                              .catch(() => {
                                setUi((prev) => ({
                                  ...prev,
                                  [pid]: { ...(prev[pid] || {}), sending: false },
                                }));
                              });
                          } else {
                            setUi((prev) => ({
                              ...prev,
                              [pid]: { ...(prev[pid] || {}), sending: false },
                            }));
                          }
                        }}
                        className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Modal */}
            {isModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                onClick={handleModalClick}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-16 right-1/3 bg-black  hover:bg-opacity-30 text-white text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 z-10"
                  aria-label="Close modal"
                >
                  ✕
                </button>

                <div className="relative max-w-full max-h-full lg:max-w-[33.333%] lg:max-h-[80vh]">
                  <Image
                    src={selectedImage}
                    alt="Fullscreen view"
                    width={1200}
                    height={800}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        );
      };

      export default LazyPost;
