/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchposts, hydrateFromCache } from "@/store/post";
import { getprofile, follow as followThunk, unfollow as unfollowThunk, getfollow } from "@/store/profile";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
import { checkVipStatus } from "@/store/vip";
import VIPBadge from "@/components/VIPBadge";
import { URL as API_BASE } from "@/api/config";
const PROD_BASE = "https://mmekoapi.onrender.com";
import PostSkeleton from "../PostSkeleton";
import PostActions from "./PostActions";
import { toast } from "material-react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageSource } from "@/lib/imageUtils";

// Utility function to format relative time
const formatRelativeTime = (timestamp: string | number | Date): string => {
  try {
    const now = new Date();
    let time: Date;
    
    // Handle different timestamp formats
    if (typeof timestamp === 'number') {
      // If it's a number, check if it's in seconds or milliseconds
      time = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    } else if (typeof timestamp === 'string') {
      // Try to parse the string - first check if it's a numeric string
      if (/^\d+$/.test(timestamp)) {
        // It's a numeric string, treat it as a number
        const numTimestamp = parseInt(timestamp, 10);
        time = new Date(numTimestamp < 10000000000 ? numTimestamp * 1000 : numTimestamp);
      } else {
        // Try to parse as a regular date string
        time = new Date(timestamp);
      }
    } else {
      time = new Date(timestamp);
    }
    
    // Check if the date is valid
    if (isNaN(time.getTime())) {
      // Try alternative parsing methods for invalid timestamps
      if (typeof timestamp === 'string') {
        // Try parsing as ISO string or other formats
        const altTime = new Date(timestamp.replace(/[^\d]/g, ''));
        if (!isNaN(altTime.getTime())) {
          time = altTime;
        } else {
          return 'recently'; // Fallback for completely invalid timestamps
        }
      } else if (typeof timestamp === 'number') {
        // Try different number formats
        if (timestamp > 1000000000000) {
          // Already in milliseconds
          time = new Date(timestamp);
        } else if (timestamp > 1000000000) {
          // In seconds, convert to milliseconds
          time = new Date(timestamp * 1000);
        } else {
          return 'recently'; // Fallback for very small numbers
        }
      } else {
        return 'recently'; // Fallback for other types
      }
      
      // Final check after alternative parsing
      if (isNaN(time.getTime())) {
        return 'recently';
      }
    }
    
    // Check if the timestamp is in the future (more than 1 hour ahead)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    // If the timestamp is in the future, show a different message
    if (diffInSeconds < 0) {
      const futureDiff = Math.abs(diffInSeconds);
      if (futureDiff < 3600) { // Less than 1 hour in the future
        return 'in a moment';
      } else if (futureDiff < 86400) { // Less than 1 day in the future
        const hours = Math.floor(futureDiff / 3600);
        return `in ${hours}h`;
      } else if (futureDiff < 31536000) { // Less than 1 year in the future
        const days = Math.floor(futureDiff / 86400);
        return `in ${days}d`;
      } else {
        // If it's more than a year in the future, it's likely a data issue
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
    return 'recently'; // More user-friendly fallback
  }
};

export default function PostsCard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((s: RootState) => s.post.poststatus);
  const posts = useSelector((s: RootState) => s.post.allPost as any[]);
  
  // Get authentication data from Redux (same as Profile component)
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
  
  // Local state for auth data (fallback to localStorage)
  const [localUserid, setLocalUserid] = React.useState("");
  const [localToken, setLocalToken] = React.useState("");
  
  const loggedInUserId = reduxUserId || localUserid;
  const token = reduxToken || localToken;
  
  const { firstname, lastname, nickname, photolink } = useSelector((s: RootState) => s.profile);
  const vipStatus = useSelector((s: RootState) => s.vip.vipStatus);
  const [selfId, setSelfId] = React.useState<string | undefined>(undefined);
  const [selfNick, setSelfNick] = React.useState<string | undefined>(undefined);
  const [selfName, setSelfName] = React.useState<string | undefined>(undefined);
  const [postResolve, setPostResolve] = React.useState<any[]>(posts);
  const [timeUpdate, setTimeUpdate] = React.useState(0); // Used to trigger re-renders for time updates
  
  // Get current user's following list from Redux (same as Profile component)
  const followingList = useSelector((state: RootState) => {
    interface FollowData {
      following?: Array<{ id: string }>;
    }
    const followingData = state.profile.getfollow_data as FollowData;
    return followingData?.following?.map(u => u.id) || [];
  }, (left, right) => {
    if (left.length !== right.length) return false;
    return left.every((id, index) => id === right[index]);
  });

  // Local per-post UI state for optimistic updates and comment UI
  const [ui, setUi] = React.useState<Record<string | number, {
    liked?: boolean;
    likeCount?: number;
    comments?: any[];
    open?: boolean;
    input?: string;
    loadingComments?: boolean;
    sending?: boolean;
    starred?: boolean;
    isFollowing?: boolean;
    commentCount?: number;
  }>>({});

  // Update time display every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Load userid and token from localStorage if not in Redux (same as Profile)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          if (!reduxUserId && data?.userID) {
            setLocalUserid(data.userID);
          }
          
          if (!reduxToken && (data?.refreshtoken || data?.accesstoken)) {
            setLocalToken(data.refreshtoken || data.accesstoken);
          }
        }
      } catch (error) {
        console.error("[PostsCard] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserId, reduxToken]);

  // Load follow data when component mounts
  useEffect(() => {
    if (loggedInUserId && token) {
      dispatch(getfollow({ userid: loggedInUserId, token }));
    }
  }, [loggedInUserId, token, dispatch]);

  // Check VIP status for current user
  useEffect(() => {
    if (loggedInUserId) {
      dispatch(checkVipStatus(loggedInUserId));
    }
  }, [loggedInUserId, dispatch]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('feedUi');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setUi(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('feedPosts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) dispatch(hydrateFromCache(parsed));
      }
    } catch {}
    
    try {
      const raw = localStorage.getItem('login');
      if (raw) {
        const saved = JSON.parse(raw);
        const lid = saved?.userID || saved?.userid || saved?.id || undefined;
        setSelfId(lid);
        setSelfNick(saved?.nickname || saved?.username || undefined);
        const ln = [saved?.firstname, saved?.lastname].filter(Boolean).join(' ').trim();
        setSelfName(ln || saved?.name || undefined);
        try {
          const token = saved?.refreshtoken || saved?.accesstoken;
          if (lid && token) dispatch(getprofile({ userid: lid, token } as any));
        } catch {}
      } else {
        setSelfId(undefined);
      }
    } catch {}
    
    // Use fetchposts() instead of getallpost() to ensure userid is passed for blocking filter
    fetchFeed();
  }, [dispatch]);

  useEffect(() => {
    try {
      if (Array.isArray(posts)) {
        localStorage.setItem('feedPosts', JSON.stringify(posts));
      }
    } catch {}
  }, [posts]);

  const fetchFeed = async () => { 
    try {
      const resPosts = await fetchposts();
      if (resPosts?.post && Array.isArray(resPosts.post)) {
        // Fetch likes and comments for each post
        const postsWithLikesAndComments = await Promise.all(resPosts.post.map(async (post: any) => {
          try {
            // Get likes for this post
            const likeResponse = await fetch(`${API_BASE}/like?postid=${post._id || post.postid || post.id}`);
            const likeData = likeResponse.ok ? await likeResponse.json() : { likeCount: 0, likedBy: [] };
            
            // Get comments for this post
            const commentResponse = await fetch(`${API_BASE}/getpostcomment`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ postid: post._id || post.postid || post.id })
            });
            const commentData = commentResponse.ok ? await commentResponse.json() : { comment: [] };
            
            const comments = commentData.comment || commentData.comments || [];
            
            return {
              ...post,
              likeCount: likeData.likeCount || 0,
              likedBy: likeData.likedBy || [],
              comments: comments,
              commentCount: comments.length
            };
          } catch (err) {
            console.log('Error fetching post data:', err);
            return {
              ...post,
              likeCount: post.likeCount || 0,
              likedBy: post.likedBy || [],
              comments: post.comments || [],
              commentCount: post.commentCount || post.comments?.length || 0
            };
          }
        }));
        
        setUi(prev => {
          const newState = { ...prev };
          postsWithLikesAndComments.forEach((post: any) => {
            const postId = post?.postid || post?.id || post?._id;
            const postAuthorId = post?.userid || post?.userId || post?.ownerid || post?.ownerId || post?.authorId || post?.createdBy;
            
            if (postId) {
              const isFollowingPostAuthor = followingList.includes(
                Array.isArray(postAuthorId) ? postAuthorId.join(',') : String(postAuthorId)
              );
              
              newState[postId] = {
                ...prev[postId],
                likeCount: post.likeCount || 0,
                liked: post.likedBy?.includes(loggedInUserId || selfId),
                isFollowing: isFollowingPostAuthor,
                commentCount: post.commentCount || 0,
                comments: post.comments || []
              };
            }
          });
          return newState;
        });
        
        setPostResolve(postsWithLikesAndComments);
        localStorage.setItem('feedPosts', JSON.stringify(postsWithLikesAndComments));
        
        // Also update Redux store with filtered posts
        dispatch(hydrateFromCache(postsWithLikesAndComments));
      }
    } catch(error) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    (async () => {
      const cachedPosts = JSON.parse(localStorage.getItem('feedPosts') || "[]") || [];
      setPostResolve(cachedPosts);
      
      if (Array.isArray(cachedPosts)) {
        setUi(prev => {
          const newState = { ...prev };
          cachedPosts.forEach((post: any) => {
            const postId = post?.postid || post?.id || post?._id;
            const postAuthorId = post?.userid || post?.userId || post?.ownerid || post?.ownerId || post?.authorId || post?.createdBy;
            
            if (postId) {
              const isFollowingPostAuthor = followingList.includes(
                Array.isArray(postAuthorId) ? postAuthorId.join(',') : String(postAuthorId)
              );
              
              newState[postId] = {
                ...prev[postId],
                likeCount: post.likeCount || 0,
                liked: post.likedBy?.includes(loggedInUserId || selfId),
                isFollowing: isFollowingPostAuthor,
                commentCount: post.commentCount || 0,
                comments: post.comments || []
              };
            }
          });
          return newState;
        });
      }
    })();
    
    fetchFeed();
    window.addEventListener('refreshfeed', fetchFeed);
    return () => {
      window.removeEventListener('refreshfeed', fetchFeed);
    };
  }, [followingList, loggedInUserId, selfId]);

  useEffect(() => {
    try {
      localStorage.setItem('feedUi', JSON.stringify(ui));
    } catch {}
  }, [ui]);

  const handleFollow = async (postAuthorId: string, postId: string) => {
    if (!loggedInUserId || !postAuthorId || !token) {
      toast.error("Please log in to follow users");
      return;
    }

    const currentUiState = ui[postId] || {};
    const currentlyFollowing = currentUiState.isFollowing ?? false;

    setUi(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
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
      
      // Show success toast
      toast.success("Unfollowed successfully!");
      } else {
        await dispatch(followThunk({
          userid: Array.isArray(postAuthorId) ? postAuthorId.join(',') : postAuthorId,
          followerid: loggedInUserId,
          token
        })).unwrap();
        
        // Show success toast
        toast.success("Followed successfully!");
      }
      
      dispatch(getfollow({ userid: loggedInUserId, token }));
      
    } catch  {
      setUi(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isFollowing: currentlyFollowing,
        },
      }));
      
      // const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to ${currentlyFollowing ? 'unfollow' : 'follow'}. Please try again.`);
    }
  };

  if (status === "loading" && (!postResolve?.length )) {
    return <PostSkeleton />;
  }

  if (!postResolve?.length) {
    return (
      <div className="text-center text-gray-400 py-6">No posts yet.</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {postResolve.map((p: any, idx: number) => {
        let postType: string = p?.posttype || p?.type || "text";
        if (!postType) {
          if (p?.postphoto || p?.image) postType = "image";
          else if (p?.postvideo || p?.video) postType = "video";
        }

        const mediaRef =
          p?.postfilelink ||
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
          p?.postfilepublicid ||
          p?.publicId ||
          p?.public_id ||
          p?.imageId ||
          "";
        const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
        const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
        const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
        const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
        const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
        
        // Use bucket detection for Storj URLs
        const imageSource = getImageSource(asString, 'post');
        const src = imageSource.src;
        
        // Keep fallback URLs for error handling
        const queryUrlPrimary = asString ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
        const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
        const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
        const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";

        const combinedName = [p?.user?.firstname, p?.user?.lastname].filter(Boolean).join(" ");
        let displayName =
          p?.user?.username ||
          p?.user?.name ||
          p?.user?.nickname ||
          combinedName ||
          p?.user?.fullname ||
          p?.user?.fullName ||
          p?.user?.author ||
          p?.user?.username ||
          p?.user?.name ||
          p?.profile?.username ||
          p?.postedBy?.username ||
          p?.postedBy?.name ||
          "User";
      
        const postAuthorId = p?.userid || p?.userId || p?.ownerid || p?.ownerId || p?.authorId || p?.createdBy;
        const isSelf = (
          (loggedInUserId && postAuthorId && String(postAuthorId) === String(loggedInUserId)) ||
          (selfId && postAuthorId && String(postAuthorId) === String(selfId))
        );
        if (isSelf && (!displayName || displayName === "User")) {
          const selfCombined = [firstname, lastname].filter(Boolean).join(" ");
          displayName = nickname || selfCombined || selfNick || selfName || displayName;
        }
        const handleStr =
          p?.handle ||
          p?.user?.handle ||
          p?.nickname ||
          p?.user?.nickname ||
          p?.username ||
          p?.postedBy?.username ||
          null;

        const likeCount = Number(p?.likeCount || 0);
        const likedByArr = Array.isArray(p?.likedBy) ? p.likedBy : [];
        const commentsArr: any[] = Array.isArray(p?.comments)
          ? p?.comments
          : Array.isArray(p?.comment)
          ? p?.comment
          : [];
        const commentCount = Array.isArray(commentsArr)
          ? commentsArr.length
          : Number(p?.commentCount || p?.commentsCount || p?.comments || 0) || 0;

        const idStr = (v: any) => (v == null ? undefined : String(v));
        const selfIdStr = idStr(loggedInUserId) || idStr(selfId);
        const liked = !!(selfIdStr && likedByArr.includes(selfIdStr));
        // const starred = !!(p?.starred || p?.faved || p?.favorited);

        const pid = p?.postid || p?.id || p?._id || idx;
        const uiState = ui[pid] || {};
        const uiLiked = uiState.liked ?? liked;
        const uiLikeCount = uiState.likeCount ?? likeCount;
       // const uiStarred = uiState.starred ?? starred;
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
          <div key={`${p?.postid || p?.id || idx}`} className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
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
                        p?.user?.photolink || 
                        p?.user?.photoLink || 
                        p?.user?.profileImage || 
                        p?.user?.avatar || 
                        p?.user?.image;
                      
                      const userName = isSelf ? `${firstname} ${lastname}`.trim() : 
                        `${p?.user?.firstname || ""} ${p?.user?.lastname || ""}`.trim();
                      
                      const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                      
                      if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                        return (
                          <img
                            alt="Profile picture"
                            src={profileImage}
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
         if (!isSelf && p?.user?.isVip) {
           return <VIPBadge size="xl" className="absolute -top-5 -right-5" isVip={p.user.isVip} vipEndDate={p.user.vipEndDate} />;
         }

         return null;
       })()}
                </div>
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => {
                    router.push(`/post/${p?._id}`)
                  }}
                >
                  <p className="font-medium">{p?.user?.firstname} { p?.user?.lastname}</p>
                  <span className="text-gray-400 text-sm">{handleStr ? `${handleStr}` : ""}</span>
                </div>
              </div>
{/*               
              {!isSelf && postAuthorId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(postAuthorId, pid);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    uiIsFollowing 
                      ? "bg-gradient-to-r from-blue-700 to-purple-800 text-white" 
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105"
                  }`}
                >
                  {uiIsFollowing ? "Following" : "Follow"}
                </button>
              )} */}
            </div>

            {p?.createdAt && (
              <p className="my-3 text-gray-400 text-sm  cursor-pointer" onClick={()=>{
                router.push(`/post/${p?._id}`)
              }}>
                {(() => {
                  // Try to format the timestamp
                  const formatted = formatRelativeTime(p.createdAt);
                  
                  // If formatting failed, show a fallback
                  if (formatted === 'Invalid time' || formatted === 'Unknown time') {
                    return 'recently';
                  }
                  
                  return formatted;
                })()}
              </p>
            )}
            
            {p?.content && (
              <p className="my-2 whitespace-pre-wrap cursor-pointer" onClick={()=>{
                router.push(`/post/${p?._id}`)
              }}>{p.content}</p>
            )}
            
            {postType == "image" && src && (
              <div className="w-full max-h-[480px] relative rounded overflow-hidden">
                <Image
                  src={src}
                  alt={p?.content || "post image"}
                  width={800}
                  height={480}
                  className="w-full h-auto object-contain"
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
                    }
                  }}
                />
              </div>
            )}
            
            {postType == "video" && src && (
              <video
                src={src}
                controls
                className="w-full max-h-[480px] rounded"
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
            )}
            
            <PostActions
              className="mt-3 border-t border-gray-700 pt-2"
              starred={uiIsFollowing}
              liked={uiLiked}
              likeCount={uiLikeCount}
              commentCount={displayCommentCount}
              post={p}
              onStar={() => handleFollow(postAuthorId, pid)}
              onLike={async () => {
                const uid = String(loggedInUserId || selfId || "");
                const localPid = p?.postid || p?.id || p?._id;
                
                if (!localPid || !token) {
                  toast.error("Please login to like posts");
                  return;
                }
                
                const curr = ui[localPid] || {};
                const nextLiked = !(curr.liked ?? liked);
                const currentCount = curr.likeCount ?? likeCount;
                
                setUi((prev) => ({
                  ...prev,
                  [localPid]: {
                    ...curr,
                    liked: nextLiked,
                    likeCount: Math.max(0, currentCount + (nextLiked ? 1 : -1)),
                  },
                }));

                try {
                  await dispatch(postlike({
                    userid: uid,
                    postid: localPid,
                    token: token
                  } as any)).unwrap();
                } catch {
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
                const localPid = p?.postid || p?.id || p?._id;
                if (!localPid) return;
                setUi((prev) => ({
                  ...prev,
                  [localPid]: { ...(prev[localPid] || {}), open: !(prev[localPid]?.open) }
                }));
                const curr = ui[localPid];
                
                // If comments are already loaded, don't fetch again
                if (curr && Array.isArray(curr.comments) && curr.comments.length > 0) {
                  return;
                }
                
                // Only fetch if comments are not already loaded
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
                      setUi((prev) => ({
                        ...prev,
                        [localPid]: { 
                          ...(prev[localPid] || {}), 
                          comments: arr, 
                          loadingComments: false,
                          commentCount: arr.length 
                        }
                      }));
                    })
                    .catch(() => {
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
                      // Sort comments: VIP users first, then by timestamp
                      uiComments
                        .sort((a: any, b: any) => {
                          // Priority 1: VIP users first
                          const aIsVip = a?.isVip && a?.vipEndDate && new Date(a.vipEndDate) > new Date();
                          const bIsVip = b?.isVip && b?.vipEndDate && new Date(b.vipEndDate) > new Date();
                          
                          if (aIsVip && !bIsVip) return -1;
                          if (bIsVip && !aIsVip) return 1;
                          
                          // Priority 2: Sort by timestamp (most recent first)
                          const aTime = a?.commenttime || a?.date || a?.createdAt || 0;
                          const bTime = b?.commenttime || b?.date || b?.createdAt || 0;
                          return bTime - aTime;
                        })
                        .map((c: any, i: number) => (
                        <div key={i} className="text-sm text-gray-200 flex items-start gap-2">
                          <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                            {(() => {
                              // Use the same logic as post author profile picture
                              const profileImage = c?.commentuserphoto || c?.photo || c?.photolink || c?.photoLink || c?.profileImage || c?.avatar || c?.image;
                              
                              if (profileImage && profileImage.trim() && profileImage !== 'null' && profileImage !== 'undefined') {
                                return (
                                  <img
                                    alt="Profile picture"
                                    src={profileImage}
                                    className="object-cover w-full h-full rounded-full"
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
                              
                              return null;
                            })()}
                            <span style={{display: 'flex'}}>
                              {(c?.commentusername || c?.username || 'U').charAt(0).toUpperCase()}
                            </span>
                            
                            {/* VIP Badge for commenter */}
                            {(() => {
                              const isVipActive = c?.isVip && c?.vipEndDate && new Date(c.vipEndDate) > new Date();
                              return isVipActive && (
                                <VIPBadge size="lg" className="absolute -top-2 -right-2" isVip={c.isVip} vipEndDate={c.vipEndDate} />
                              );
                            })()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-300">
                                {c?.commentusername || c?.username || 'User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  // Try multiple possible timestamp fields, prioritizing commenttime from backend
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
                                  
                                  // Try to format the timestamp
                                  const formatted = formatRelativeTime(timestamp);
                                  
                                  // If formatting failed, show a fallback
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
                      ))
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
                                { content: text, comment: text, username: nickname || selfNick || 'you', temp: true },
                              ],
                              commentCount: ((prev[pid]?.comments as any[]) || []).length + 1,
                            },
                          }));
                          const uid = String(loggedInUserId || selfId || "");
                          const localPid = p?.postid || p?.id || p?._id;
                          if (uid && localPid && token) {
                            (dispatch(postcomment({ userid: uid, postid: localPid, content: text, token: token } as any)) as any)
                              .unwrap()
                              .then((_res: any) => {
                                // Refresh comments after successful post
                                dispatch(getpostcomment({ postid: localPid } as any))
                                  .unwrap()
                                  .then((commentRes: any) => {
                                    const serverComments = (commentRes && (commentRes.comment || commentRes.comments)) || [];
                                    setUi((prev) => ({
                                    ...prev,
                                    [pid]: {
                                      ...(prev[pid] || {}),
                                      sending: false,
                                        comments: serverComments,
                                        commentCount: serverComments.length,
                                      },
                                    }));
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
          </div>
        );
      })}
    </div>
  );
}