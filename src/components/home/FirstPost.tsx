/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
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
import { toast } from "react-toastify";
import Image from "next/image";
import { getImageSource } from "@/lib/imageUtils";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import ExpandableText from "../ExpandableText";
import { generateInitials } from "@/utils/generateInitials";
import { BadgeCheck } from "lucide-react";


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

// Video skeleton component for loading state
const VideoSkeleton = () => (
  <div className="relative w-full aspect-[4/5] rounded overflow-hidden bg-gray-700 animate-pulse">
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

interface FirstPostProps {
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
}

const FirstPost: React.FC<FirstPostProps> = ({
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
  photolink
}) => {
  // Modal state for image viewing
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState("");
  const router = useRouter();

  // State for animation - always true since FirstPost is always visible
  const [isInView] = React.useState(true);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  // Wait 4 seconds after component mounts before starting animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 4000); // 4 second delay

    return () => clearTimeout(timer);
  }, []);

  // State and ref for auto-hiding video controls
  const [showControls, setShowControls] = React.useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const controlsTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Video auto-play hook with post ID for global management
  const { videoRef, isPlaying, isVisible, autoPlayBlocked, hasUserInteracted, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
    autoPlay: true,
    muted: true,
    loop: true,
    postId: post?._id || post?.postid || post?.id || 'first-post'
  });

  // Clear timeout when component unmounts and track fullscreen changes
  React.useEffect(() => {
    // Show controls initially when the video loads
    setShowControls(true);

    // Set timer to hide controls
    const initialTimer = setTimeout(() => {
      setShowControls(false);
    }, 1000); // Changed from 3000ms to 1000ms

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        setShowControls(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      // Clean up all timeouts on unmount
      if (initialTimer) clearTimeout(initialTimer);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);



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

  const posterRef =
    post?.thumblink ||
    post?.postphoto ||
    post?.image ||
    post?.thumbnail ||
    "";

  const posterSource = posterRef ? getImageSource(typeof posterRef === "string" ? posterRef : (posterRef?.publicId || posterRef?.public_id || posterRef?.url || ""), 'post').src : "";
  const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
  const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
  const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
  const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
  const isUrl = isHttpUrl || isBlobUrl || isDataUrl;

  const imageSource = getImageSource(asString, 'post');
  let src = imageSource.src;

  // Handle video streaming with range requests
  if (postType === "video") {
    // Use the extracted key from getImageSource (handles Storj URLs automatically)
    const videoFileKey = imageSource.key || (!isUrl ? asString : null);

    // If we have a video file key, use streaming endpoint
    if (videoFileKey) {
      src = `${API_BASE}/api/video/stream/${encodeURIComponent(videoFileKey)}`;
    }
  }

  const queryUrlPrimary = asString ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
  const pathUrlPrimary = asString ? `${API_BASE}/${postType == "video" ? 'api/video/stream' : 'api/image/view'}/${encodeURIComponent(asString)}` : "";
  const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
  const pathUrlFallback = asString ? `${PROD_BASE}/${postType == "video" ? 'api/video/stream' : 'api/image/view'}/${encodeURIComponent(asString)}` : "";

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
  const uiComments = uiState.comments ?? commentsArr;
  const uiInput = uiState.input ?? "";
  const uiLoading = !!uiState.loadingComments;
  const uiSending = !!uiState.sending;
  const hasUiComments = Object.prototype.hasOwnProperty.call(uiState, 'comments');
  const uiCommentCount = uiState.commentCount;
  const displayCommentCount = hasUiComments ? (uiCommentCount ?? uiComments.length) : commentCount;
  const isFollowing = followingList.includes(
    Array.isArray(postAuthorId) ? postAuthorId.join(',') : String(postAuthorId)
  );
  const uiIsFollowing = uiState.isFollowing ?? isFollowing;



  return (
    <div className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 w-full">
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
                    <img
                      alt="Profile picture"
                      src={imageSource.src}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const nextElement = target.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.setProperty('display', 'flex');
                        }
                      }}
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
            <p className="font-medium text-white flex items-center gap-1 text-sm sm:text-base" onClick={(e) => {
              e.stopPropagation();
              router.push(`/Profile/${postAuthorId}`);
            }}>
              {post?.user?.firstname} {post?.user?.lastname}
              {(() => {
                const isVerified = post?.user?.creator_verified;
                return isVerified && (
                  <>
                    <span> <BadgeCheck size={17} fill="white" className="text-black" /> </span>
                  </>
                );
              })()}
            </p>
            <span className="text-gray-400 text-xs sm:text-sm">{handleStr ? `${handleStr}` : ""}</span>
          </div>
          {post?.user?.creator_portfolio_id && (
            <div className="flex items-end gap-1">
              <button
                onClick={() => router.push(`/creators/${post?.user?.creator_portfolio_id}`)}
                className={`text-white px-2 bg-gradient-to-r from-orange-500 to-red-600 cursor-pointer text-sm py-1 rounded ${shouldAnimate ? 'animate-wiggle-periodic' : ''}`}>
                {post?.user?.hosttype}
              </button>
            </div>)}
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
        <div className="w-full aspect-[4/5] relative rounded overflow-hidden">
          <Image
            src={src}
            alt={post?.content || "post image"}
            width={800}
            height={400}
            className="w-full h-full aspect-[4/5] object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
            onClick={() => openModal(src)}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement & { dataset: any };
              if (!img.dataset.fallback1 && pathUrlPrimary) {
                img.dataset.fallback1 = "1";
                img.src = pathUrlPrimary;
                return;
              }
              if (!img.dataset.fallback2 && queryUrlFallback) {
                img.dataset.fallback2 = "1";
                img.src = queryUrlFallback;
                return;
              }
              if (!img.dataset.fallback3 && pathUrlFallback) {
                img.dataset.fallback3 = "1";
                img.src = pathUrlFallback;
                return;
              }
              if (!img.dataset.fallback4) {
                img.dataset.fallback4 = "1";
                img.src = "/postfall.jpg";
              }
            }}
          />
        </div>
      )}

      {postType == "video" && src && (
        <div className="relative w-full aspect-[4/5] rounded overflow-hidden">
          {/* Video skeleton - show while video is loading and no poster is available */}
          {!isVideoLoaded && !posterSource && (
            <VideoSkeleton />
          )}

          {/* Video with controls that auto-hide */}
          <div
            className={`relative w-full h-full ${(isVideoLoaded || posterSource) ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'} transition-opacity duration-300`}
            onMouseMove={() => {
              // Show controls and reset the timer when mouse moves
              setShowControls(true);
              if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
              }
              controlsTimerRef.current = setTimeout(() => {
                setShowControls(false);
              }, 1000); // Changed from 3000ms to 1000ms
            }}
          >
            <video
              ref={videoRef}
              src={src}
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSource}
              className={`w-full object-cover rounded cursor-pointer transition-all ${isFullscreen ? 'h-screen' : 'aspect-[4/5]'}`}
              onLoadedData={() => {
                setIsVideoLoaded(true);
              }}
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                setCurrentTime(video.currentTime);
                setDuration(video.duration);
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
                }, 1000); // Changed from 3000ms to 1000ms
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
                }
              }}
            />

            {/* Video Controls Bar - Shows only when showControls is true */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                {/* Progress Bar */}
                <div className="mb-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #fff ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
                    }}
                  />
                </div>

                {/* Bottom Controls Row */}
                <div className="flex items-center justify-between gap-2 text-white">
                  {/* Left: Timestamp */}
                  <div className="text-xs font-medium">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </div>

                  {/* Right: Control Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Volume Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                        if (controlsTimerRef.current) {
                          clearTimeout(controlsTimerRef.current);
                        }
                        controlsTimerRef.current = setTimeout(() => {
                          setShowControls(false);
                        }, 1000);
                      }}
                      className="p-2 hover:bg-white/20 rounded transition-all"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>

                    {/* Fullscreen Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const videoContainer = videoRef.current?.parentElement;
                        if (videoContainer) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            videoContainer.requestFullscreen().catch(err => {
                              console.log('Fullscreen error:', err);
                            });
                          }
                        }
                        if (controlsTimerRef.current) {
                          clearTimeout(controlsTimerRef.current);
                        }
                        controlsTimerRef.current = setTimeout(() => {
                          setShowControls(false);
                        }, 1000);
                      }}
                      className="p-2 hover:bg-white/20 rounded transition-all"
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Center Play/Pause Button - Shows when controls are visible OR when autoplay is blocked */}
            {(showControls || autoPlayBlocked) && (
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 pointer-events-none">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                    //Reset auto-hide timer when interacting with controls
                    if (controlsTimerRef.current) {
                      clearTimeout(controlsTimerRef.current);
                    }
                    controlsTimerRef.current = setTimeout(() => {
                      setShowControls(false);
                    }, 1000); // Changed from 3000ms to 1000ms
                  }}
                  className="bg-black bg-opacity-70 rounded-full p-5 hover:bg-opacity-90 hover:scale-110 cursor-pointer transition-all pointer-events-auto"
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
          const currentlyFollowing = currentUiState.isFollowing ?? isFollowing;

          setUi((prev: any) => ({
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
            setUi((prev: any) => ({
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
          console.log('🔥 LIKE BUTTON CLICKED - FirstPost');
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

          setUi((prev: any) => ({
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

            // No need to refresh feed - rely on optimistic update to avoid race condition

          } catch (error) {
            console.error('❌ Like request failed:', error);
            console.error('❌ Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
            setUi((prev: any) => ({
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
          // console.log('💬 COMMENT BUTTON CLICKED - FirstPost');
          const localPid = post?.postid || post?.id || post?._id;
          // console.log('💬 Comment post ID:', localPid);

          if (!localPid) {
            // console.error('❌ No post ID found for comments');
            return;
          }

          const currentUiState = ui[localPid] || {};
          const isCurrentlyOpen = currentUiState.open;

          // console.log('💬 Current comment state:', {
          //   isCurrentlyOpen,
          //   hasComments: !!(currentUiState.comments && currentUiState.comments.length > 0),
          //   commentCount: currentUiState.commentCount,
          //   loadingComments: currentUiState.loadingComments
          // });

          setUi((prev: any) => ({
            ...prev,
            [localPid]: { ...(prev[localPid] || {}), open: !isCurrentlyOpen }
          }));

          const curr = ui[localPid];

          if (curr && Array.isArray(curr.comments) && curr.comments.length > 0) {
            // console.log('💬 Comments already loaded, not fetching again');
            return;
          }

          const shouldFetch = !(curr && Array.isArray(curr.comments));
          // console.log('💬 Should fetch comments:', shouldFetch);

          if (shouldFetch) {
            // console.log('💬 Fetching comments for post:', localPid);
            setUi((prev: any) => ({
              ...prev,
              [localPid]: { ...(prev[localPid] || {}), loadingComments: true }
            }));

            (dispatch(getpostcomment({ postid: localPid } as any)) as any)
              .unwrap()
              .then((res: any) => {
                // console.log('💬 Comments fetch response:', res);
                const arr = (res && (res.comment || res.comments)) || [];
                // console.log('💬 Processed comments array:', arr);

                setUi((prev: any) => {
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
              .catch((error: any) => {
                console.error('💬 Comments fetch error:', error);
                setUi((prev: any) => ({
                  ...prev,
                  [localPid]: { ...(prev[localPid] || {}), loadingComments: false }
                }));
              });
          }
        }}
      />

      {
        uiOpen && (
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
                                  <img
                                    alt="Profile picture"
                                    src={imageSource.src}
                                    className="object-cover w-full h-full rounded-full"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const fallbackDiv = document.createElement('div');
                                        fallbackDiv.className = 'w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-xs text-white font-medium';
                                        // Generate initials from firstname/lastname, fallback to username
                                        let initialsText = c?.initials;
                                        if (!initialsText) {
                                          const firstName = c?.firstname || '';
                                          const lastName = c?.lastname || '';
                                          if (firstName || lastName) {
                                            const nameParts = [firstName, lastName].filter(Boolean);
                                            initialsText = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                                          } else {
                                            initialsText = (c?.commentusername || c?.username || 'U').charAt(0).toUpperCase();
                                          }
                                        }
                                        fallbackDiv.textContent = initialsText;
                                        parent.appendChild(fallbackDiv);
                                      }
                                    }}
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
                                    return (c?.commentusername || c?.username || 'U').charAt(1).toUpperCase();
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
                                {(() => {
                                  const isVerified = c?.isVerified;
                                  return isVerified && (
                                    <span> <BadgeCheck size={14} fill="white" className="text-black inline" /> </span>
                                  );
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
                      setUi((prev: any) => ({
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
                      setUi((prev: any) => ({
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
                                setUi((prev: any) => {
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
                                setUi((prev: any) => ({
                                  ...prev,
                                  [pid]: { ...(prev[pid] || {}), sending: false },
                                }));
                              });
                          })
                          .catch(() => {
                            setUi((prev: any) => ({
                              ...prev,
                              [pid]: { ...(prev[pid] || {}), sending: false },
                            }));
                          });
                      } else {
                        setUi((prev: any) => ({
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
        )
      }

      {/* Image Modal */}
      {
        isModalOpen && (
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
        )
      }
    </div >
  );
};

export default FirstPost;

