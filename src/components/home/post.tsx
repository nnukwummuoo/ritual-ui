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
const PROD_BASE = "https://mmekoapi.onrender.com";
import PostSkeleton from "../PostSkeleton";
import PostActions from "./PostActions";
import { toast } from "material-react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageSource } from "@/lib/imageUtils";
import CreatorCards from "./CreatorCards";
import FirstPost from "./FirstPost";
import RemainingPosts from "./RemainingPosts";
import { generateInitials } from "@/utils/generateInitials";
import { enrichCommentsWithUserInfo } from "@/utils/enrichComments";


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
  }, [posts, directPosts.length, postResolve.length]);

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

  // Remove localStorage UI state loading - start fresh each time

  useEffect(() => {
    // Load user data from localStorage for authentication
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
        setSelfId("");
      }
    } catch {}
    
    // Fetch fresh posts from backend
    fetchFeed();
  }, [dispatch]);

  // Remove localStorage posts caching - always fetch fresh from backend

  const fetchFeed = async (page = 1, append = false) => { 
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
          // Append to existing posts
          const combinedPosts = [...directPosts, ...enrichedPosts];
          setDirectPosts(combinedPosts);
          setPostResolve(combinedPosts);
          dispatch(hydrateFromCache(combinedPosts));
        } else {
          // Replace posts for first page
          setDirectPosts(enrichedPosts);
          setPostResolve(enrichedPosts);
          dispatch(hydrateFromCache(enrichedPosts));
        }
        
        // Update pagination state
        setCurrentPage(page);
        setHasMorePosts(resPosts.pagination?.hasNextPage || false);
        
        // Backend already returns posts with likes and comments via aggregation
        // No need for additional API calls - the data is already complete!
        console.log('✅ [PERFORMANCE] Using backend data directly - no redundant API calls needed');
        
        // Force a re-render by updating timeUpdate
        setTimeUpdate(prev => prev + 1);
      }
    } catch(error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load more posts function
  const loadMorePosts = async () => {
    if (hasMorePosts && !loadingMore) {
      const nextPage = currentPage + 1;
      await fetchFeed(nextPage, true);
    }
  };

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
    
    // Fetch fresh posts from backend
    fetchFeed();
    
    const handleRefreshFeed = () => {
      fetchFeed();
    };
    
    window.addEventListener('refreshfeed', handleRefreshFeed);
    
    return () => {
      window.removeEventListener('refreshfeed', handleRefreshFeed);
    };
  }, [followingList, loggedInUserId, selfId]);

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


  // Always show skeleton until posts are ready
  const hasPosts = directPosts.length > 0 || posts.length > 0 || postResolve.length > 0;
  if (status === "loading" || !hasPosts || !hasAttemptedFetch) {
    return <PostSkeleton />;
  }

  // Get the first post and remaining posts
  // Use directPosts as primary source, fallback to Redux, then local state
  const displayPosts = directPosts.length > 0 ? directPosts : (posts.length > 0 ? posts : postResolve);
  const firstPost = displayPosts[0];
  const remainingPosts = displayPosts.slice(1);

  return (
    <div className="flex flex-col gap-6">
      {/* First Post */}
      {firstPost && (
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
          nickname={nickname}
          photolink={photolink}
        />
      )}

      {/* Creator Cards */}
      <CreatorCards />

      {/* Remaining Posts */}
      <RemainingPosts
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
        nickname={nickname}
        photolink={photolink}
      />

      {/* Load More Button */}
      {hasMorePosts && (
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

      {/* Pagination Info */}
      {displayPosts.length > 0 && (
        <div className="text-center text-gray-500 text-sm py-2">
          Showing {displayPosts.length} posts • Page {currentPage}
        </div>
      )}

    </div>
  );
}