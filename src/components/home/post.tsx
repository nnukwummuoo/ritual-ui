/* eslint-disable @typescript-eslint/no-unused-vars */
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
const PROD_BASE = process.env.NEXT_PUBLIC_API || "";
import PostSkeleton from "../PostSkeleton";
import PostActions from "./PostActions";
import { toast } from "material-react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageSource } from "@/lib/imageUtils";
import CreatorCards from "./CreatorCards";
import FirstPost from "./FirstPost";
import RemainingPosts from "./RemainingPosts";
import LazyPost from "./LazyPost";
import VirtualizedPostList from "./VirtualizedPostList";
import { generateInitials } from "@/utils/generateInitials";
import { enrichCommentsWithUserInfo } from "@/utils/enrichComments";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useContentFilter } from "@/lib/context/content-filter-context";


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
  
  const { firstname, lastname, username, photolink } = useSelector((s: RootState) => s.profile);
  const vipStatus = useSelector((s: RootState) => s.vip.vipStatus);
  const [selfId, setSelfId] = React.useState<string>("");
  const [selfNick, setSelfNick] = React.useState<string | undefined>(undefined);
  const [selfName, setSelfName] = React.useState<string | undefined>(undefined);
  const [postResolve, setPostResolve] = React.useState<any[]>([]);
  const [timeUpdate, setTimeUpdate] = React.useState(0); // Used to trigger re-renders for time updates
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false); // Track if we've tried to fetch posts
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMorePosts, setHasMorePosts] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [directPosts, setDirectPosts] = React.useState<any[]>([]); // Direct API response storage
  const [useVirtualization, setUseVirtualization] = React.useState(false); // Disabled by default
  const loadMoreRef = React.useRef<HTMLDivElement>(null); // Ref for intersection observer
  const [autoLoadEnabled, setAutoLoadEnabled] = React.useState(true); // Enable/disable auto-load
  
  // Performance monitoring
  const { 
    metrics, 
    isMonitoring, 
    startRenderMeasure, 
    endRenderMeasure, 
    updatePostCount, 
    updateLazyLoadCount, 
    toggleMonitoring 
  } = usePerformanceMonitor();
  
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

  // Sync Redux posts with local state (fallback only)
  React.useEffect(() => {
    if (posts && posts.length > 0 && directPosts.length === 0) {
      setDirectPosts(posts);
      setPostResolve(posts);
    }
  }, [posts, directPosts.length]);

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

  // Reset video state when component mounts (user returns to homepage)
  useEffect(() => {
    // Clear any existing video state from localStorage
    localStorage.removeItem('videoUserInteraction');
    
    // Dispatch a custom event to reset video context
    window.dispatchEvent(new CustomEvent('resetVideoState'));
    
    return () => {
      // Pause all videos when leaving the page
      window.dispatchEvent(new CustomEvent('pauseAllVideos'));
    };
  }, []);

  // Listen for navigation events to reset video state
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.dispatchEvent(new CustomEvent('pauseAllVideos'));
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from cache, reset video state
        localStorage.removeItem('videoUserInteraction');
        window.dispatchEvent(new CustomEvent('resetVideoState'));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Remove localStorage UI state loading - start fresh each time

  // Define fetchFeed function first
  const fetchFeed = React.useCallback(async (page = 1, append = false) => { 
    try {
      setHasAttemptedFetch(true);
      if (append) {
        setLoadingMore(true);
      }
      
      // Fetch posts from backend with pagination
      const resPosts = await fetchposts(page);
      if (resPosts?.post && Array.isArray(resPosts.post)) {
        // First, show posts immediately with basic data
        const basicPosts = resPosts.post.map((post: any) => ({
          ...post,
          likeCount: post.likeCount || 0,
          likedBy: post.likedBy || [],
          comments: post.comments || [],
          commentCount: post.commentCount || post.comments?.length || 0
        }));

        // Backend now handles comment enrichment, so use basic posts directly
        const enrichedPosts = basicPosts;


        
        // Update UI state for enriched posts with proper like/follow status
        setUi(prev => {
          const newState = { ...prev };
          enrichedPosts.forEach((post: any) => {
            const postId = post?.postid || post?.id || post?._id;
            const postAuthorId = post?.userid || post?.userId || post?.ownerid || post?.ownerId || post?.authorId || post?.createdBy;
            
            if (postId) {
              // Get existing state to preserve follow status
              const existingState = prev[postId] || {};
              
              // Only update follow status if we have a valid followingList
              let updatedIsFollowing = existingState.isFollowing;
              if (followingList.length > 0) {
                const isFollowingPostAuthor = followingList.includes(
                  Array.isArray(postAuthorId) ? postAuthorId.join(',') : String(postAuthorId)
                );
                updatedIsFollowing = isFollowingPostAuthor;
              }
              
              // Check if current user has liked this post
              const likedByArr = Array.isArray(post.likedBy) ? post.likedBy : [];
              const currentUserId = String(loggedInUserId || selfId || "");
              const hasLiked = currentUserId && likedByArr.includes(currentUserId);
              
              newState[postId] = {
                ...prev[postId],
                likeCount: post.likeCount || 0,
                liked: hasLiked, // Set based on actual like status
                isFollowing: updatedIsFollowing, // Preserve existing or set based on follow status
                commentCount: post.commentCount || post.comments?.length || 0,
                comments: post.comments || []
              };
            }
          });
          return newState;
        });
        
        // Handle pagination - Store data directly in directPosts
        if (append && page > 1) {
          // Append to existing posts - use functional form to access current value
          setDirectPosts(prev => {
            const newPosts = [...prev, ...enrichedPosts];
            // Defer dispatch and setPostResolve to avoid updating during render
            queueMicrotask(() => {
              setPostResolve(newPosts);
              dispatch(hydrateFromCache(newPosts));
            });
            return newPosts;
          });
        } else {
          // Replace posts for first page
          const newPosts = enrichedPosts;
          setDirectPosts(newPosts);
          // Update other states (React will batch these)
          setPostResolve(newPosts);
          dispatch(hydrateFromCache(newPosts));
        }
        
        // Update pagination state
        setCurrentPage(page);
        setHasMorePosts(resPosts.pagination?.hasNextPage || false);
        
        // Backend already returns posts with likes and comments via aggregation
        // No need for additional API calls - the data is already complete!
        
        // Force a re-render by updating timeUpdate
        setTimeUpdate(prev => prev + 1);
      }
    } catch(error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, followingList, loggedInUserId, selfId]);

  useEffect(() => {
    // Load user data from localStorage for authentication
    try {
      const raw = localStorage.getItem('login');
      if (raw) {
        const saved = JSON.parse(raw);
        const lid = saved?.userID || saved?.userid || saved?.id || undefined;
        setSelfId(lid);
        setSelfNick(saved?.username || saved?.username || undefined);
        const ln = [saved?.firstname, saved?.lastname].filter(Boolean).join(' ').trim();
        setSelfName(ln || saved?.name || undefined);
        try {
          const token = saved?.refreshtoken || saved?.accesstoken;
          if (lid && token) dispatch(getprofile({ userid: lid, token } as any));
        } catch {}
      } else {
        setSelfId("");
      }
    } catch {}
    
    // Fetch fresh posts from backend
    fetchFeed();
  }, [dispatch, fetchFeed]);

  // Load more posts function
  const loadMorePosts = React.useCallback(async () => {
    if (hasMorePosts && !loadingMore) {
      const nextPage = currentPage + 1;
      await fetchFeed(nextPage, true);
    }
  }, [hasMorePosts, loadingMore, currentPage, fetchFeed]);

  useLayoutEffect(() => {
    // Initialize UI state for existing posts with proper like/follow status
    if (Array.isArray(posts) && posts.length > 0) {
        setUi(prev => {
          const newState = { ...prev };
        posts.forEach((post: any) => { 
            const postId = post?.postid || post?.id || post?._id;
            const postAuthorId = post?.userid || post?.userId || post?.ownerid || post?.ownerId || post?.authorId || post?.createdBy;
            
            if (postId) {
              // Get existing state to preserve follow status
              const existingState = prev[postId] || {};
              
              // Only update follow status if we have a valid followingList
              let updatedIsFollowing = existingState.isFollowing;
              if (followingList.length > 0) {
                const isFollowingPostAuthor = followingList.includes(
                  Array.isArray(postAuthorId) ? postAuthorId.join(',') : String(postAuthorId)
                );
                updatedIsFollowing = isFollowingPostAuthor;
              }
            
            // Check if current user has liked this post
            const likedByArr = Array.isArray(post.likedBy) ? post.likedBy : [];
            const currentUserId = String(loggedInUserId || selfId || "");
            const hasLiked = currentUserId && likedByArr.includes(currentUserId);
              
              newState[postId] = {
                ...prev[postId],
                likeCount: post.likeCount || 0,
              liked: hasLiked, // Set based on actual like status
              isFollowing: updatedIsFollowing, // Preserve existing or set based on follow status
                commentCount: post.commentCount || 0,
                comments: post.comments || []
              };
            }
          });
          return newState;
        });
      }
    
    const handleRefreshFeed = () => {
      fetchFeed();
    };
    
    window.addEventListener('refreshfeed', handleRefreshFeed);
    
    return () => {
      window.removeEventListener('refreshfeed', handleRefreshFeed);
    };
  }, [followingList, loggedInUserId, selfId, fetchFeed, posts]);

  // Remove localStorage UI state saving - no caching needed


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


  // Get content filter from context
  const { filter: contentFilter } = useContentFilter();

  // Filter posts based on content type
  const filterPostsByType = React.useCallback((postsToFilter: any[]) => {
    if (contentFilter === "all") {
      return postsToFilter;
    }

    return postsToFilter.filter((post) => {
      // Get explicit post type from post data
      let postType: string = post?.posttype || post?.type || "";
      
      // If no explicit type, determine from media fields
      if (!postType) {
        const mediaSrc = post?.postfilelink || post?.postphoto || post?.postvideo || post?.image || "";
        
        // Check if it's a video
        if (post?.postvideo || 
            (typeof mediaSrc === "string" && (
              mediaSrc.includes(".mp4") || 
              mediaSrc.includes(".webm") || 
              mediaSrc.includes(".mov")
            ))) {
          postType = "video";
        } 
        // Check if it has image/photo
        else if (post?.postphoto || post?.image || post?.postfilelink) {
          postType = "image";
        } 
        // Otherwise it's text
        else {
          postType = "text";
        }
      }

      // Normalize post type to lowercase
      postType = postType.toLowerCase();

      // Map filter values to post types
      if (contentFilter === "text") {
        return postType === "text";
      } else if (contentFilter === "video") {
        return postType === "video";
      } else if (contentFilter === "photo") {
        return postType === "image" || postType === "photo";
      }

      return true;
    });
  }, [contentFilter]);

  // Get the first post and remaining posts
  // Use directPosts as primary source, fallback to Redux, then local state
  const allPosts = directPosts.length > 0 ? directPosts : (posts.length > 0 ? posts : postResolve);
  const filteredPosts = filterPostsByType(allPosts);
  const firstPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  // Determine if we should use virtualization (for large lists)
  const shouldUseVirtualization = useVirtualization && filteredPosts.length > 20;

  // Auto-load posts when scrolling to bottom using Intersection Observer
  React.useEffect(() => {
    if (shouldUseVirtualization || !autoLoadEnabled || !hasMorePosts) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // When the sentinel element is visible (user scrolled to bottom)
        if (entry.isIntersecting && hasMorePosts && !loadingMore) {
          loadMorePosts();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMorePosts, loadingMore, shouldUseVirtualization, autoLoadEnabled, loadMorePosts]);

  // Update performance metrics only when monitoring is enabled
  React.useEffect(() => {
    if (isMonitoring) {
      updatePostCount(filteredPosts.length);
    }
  }, [filteredPosts.length, isMonitoring, updatePostCount]);

  // Measure render performance only when monitoring is enabled
  React.useEffect(() => {
    if (isMonitoring) {
      startRenderMeasure();
      return () => {
        endRenderMeasure();
      };
    }
  }, [filteredPosts, isMonitoring, startRenderMeasure, endRenderMeasure]);

  // Always show skeleton until posts are ready
  const hasPosts = directPosts.length > 0 || posts.length > 0 || postResolve.length > 0;
  if (status === "loading" || !hasPosts || !hasAttemptedFetch) {
    return <PostSkeleton />;
  }

  // Show message if no posts match the filter
  if (hasPosts && filteredPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-400 text-lg">
          No {contentFilter === "text" ? "text" : contentFilter === "video" ? "video" : "photo"} posts found.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Try selecting a different filter or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* First Post - Always render normally for better UX */}
      {firstPost && !shouldUseVirtualization && (
        <FirstPost
          post={firstPost}
          ui={ui}
          setUi={setUi}
          dispatch={dispatch}
          loggedInUserId={loggedInUserId || ""}
          selfId={selfId}
          token={token || ""}
          followingList={followingList}
          vipStatus={vipStatus}
          firstname={firstname}
          lastname={lastname}
          username={username}
          photolink={photolink}
        />
      )}

      {/* Creator Cards - Hidden on large devices */}
      <div className="lg:hidden">
        <CreatorCards />
      </div>

      {/* Posts Rendering - Choose between virtualized and lazy loading */}
      {shouldUseVirtualization ? (
        <VirtualizedPostList
          posts={remainingPosts}
          ui={ui}
          setUi={setUi}
          dispatch={dispatch}
          loggedInUserId={loggedInUserId || ""}
          selfId={selfId}
          token={token || ""}
          followingList={followingList}
          vipStatus={vipStatus}
          firstname={firstname}
          lastname={lastname}
          username={username}
          photolink={photolink}
        />
      ) : (
        <>
          {/* Lazy Loaded Posts - Only remaining posts, not including first post */}
          <div className="flex flex-col gap-6">
            {remainingPosts.map((post, index) => (
              <LazyPost
                key={post?.postid || post?.id || post?._id || index}
                post={post}
                ui={ui}
                setUi={setUi}
                dispatch={dispatch}
                loggedInUserId={loggedInUserId || ""}
                selfId={selfId}
                token={token || ""}
                followingList={followingList}
                vipStatus={vipStatus}
                firstname={firstname}
                lastname={lastname}
                username={username}
                photolink={photolink}
                isFirstPost={false}
              />
            ))}
          </div>
        </>
      )}

      {/* Intersection Observer Sentinel - Invisible element to detect when user scrolls to bottom */}
      {hasMorePosts && !shouldUseVirtualization && (
        <div ref={loadMoreRef} className="h-1 w-full" />
      )}

      {/* Load More Button - Only show when not using virtualization */}
      {hasMorePosts && !shouldUseVirtualization && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}

    </div>
  );
}