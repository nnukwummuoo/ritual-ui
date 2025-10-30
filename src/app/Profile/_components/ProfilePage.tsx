/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect, useRef, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Tabs from "./Tabs";
import DropdownMenu from "./DropDonMenu";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getprofile, getfollow, getAllUsers, follow, unfollow, getAllUserRatings, getFanRatings } from "@/store/profile";
import { getViewingProfile, getViewingFollow, getAllUsersForViewing, clearViewingProfile } from "@/store/viewingProfile";
import { checkVipStatus } from "@/store/vip";
import type { AppDispatch, RootState } from "@/store/store";
import { getImageSource } from "@/lib/imageUtils";
import { generateInitials } from "@/utils/generateInitials";
import { updateEdit } from "@/store/comprofile";
import { getSocket } from "@/lib/socket";
import { BiPencil } from "react-icons/bi";
import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";
import axios from "axios";
import { Heart, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { URL as API_URL } from "@/api/config";
import PostActions from "@/components/home/PostActions";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import { toast } from "material-react-toastify";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
import VIPBadge from "@/components/VIPBadge";
import { checkVipCelebration, markVipCelebrationViewed } from "@/api/vipCelebration";

// Add the same constants from PostsCard
const PROD_BASE = "https://backendritual.work"; // fallback when local proxy is down

// Helper function to format numbers (e.g., 1000 -> 1K)
const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

// Utility function to format relative time (same as RemainingPosts and FirstPost)
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

// const Months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

export const Profile = () => {
  const params = useParams();
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
 // const fileRef = useRef<HTMLInputElement | null>(null);
  
  // State for user posts
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
   const [clickedPostId, setClickedPostId] = useState<string | null>(null);
  // Get current user profile data (for side menu and current user info)
  const currentUserProfile = useSelector((s: RootState) => s.profile);
  
  // Get viewing profile data (for the profile being viewed)
  const viewingProfile = useSelector((s: RootState) => s.viewingProfile);
  
  // Get VIP status from Redux
  const vipStatus = useSelector((s: RootState) => s.vip.vipStatus);
  
  // Get ratings from Redux
  const { ratings, ratings_stats, totalRatings, averageRating, ratingCounts } = useSelector((s: RootState) => s.profile);
  
  // Get fan ratings from Redux
  const { fanRatings, fanRatings_stats, totalFanRatings, averageFanRating, fanRatingCounts } = useSelector((s: RootState) => s.profile);
  
  
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  
  // VIP status state for the profile owner (the user whose profile is being viewed)
  const [profileOwnerVipStatus, setProfileOwnerVipStatus] = useState<boolean>(false);
  
  // VIP celebration animation state
  const [showVipCelebration, setShowVipCelebration] = useState(false);
  
  // VIP celebration tracking state
  const [vipCelebrationShown, setVipCelebrationShown] = useState(false);
  const [celebrationChecked, setCelebrationChecked] = useState(false);

  // Get viewingUserId from params
  const viewingUserId = (params as any)?.userid as string;
  
  // Determine which profile data to use based on whether we're viewing our own profile
  const isViewingOwnProfile = viewingUserId === currentUserProfile.userId;
  const profileData = isViewingOwnProfile ? currentUserProfile : viewingProfile;
  
  const {
    status,
    firstname,
    lastname,
    nickname,
  } = profileData;
  
  // Access properties that might not exist on both types
  const bio = (profileData as any).bio || "";
  const photolink = (profileData as any).photolink || "";
  
  const error = useSelector((s: RootState) => s.profile.error);
  const createdAt = useSelector((s: RootState) => (s as any).profile?.createdAt as string | undefined);
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
  
  // Get userid and token from localStorage if not in Redux
  const [localUserid, setLocalUserid] = React.useState("");
  const [localToken, setLocalToken] = React.useState("");
  
  const loggedInUserId = reduxUserId || localUserid;
  const token = reduxToken || localToken;
  const isSelf = Boolean(loggedInUserId && viewingUserId && loggedInUserId === viewingUserId);

  // Get all selectors unconditionally
  const currentProfileStatus = useSelector((state: RootState) => state.profile.status);
  const viewingProfileStatus = useSelector((state: RootState) => state.viewingProfile.status);
  const currentProfile = useSelector((state: RootState) => state.profile);
  const viewingProfileData = useSelector((state: RootState) => state.viewingProfile);
  const currentFollowData = useSelector((state: RootState) => state.profile.getfollow_data as any);
  const viewingFollowData = useSelector((state: RootState) => state.viewingProfile.getfollow_data as any);
  const currentFollowStats = useSelector((state: RootState) => state.profile.getfollow_stats);
  const viewingFollowStats = useSelector((state: RootState) => state.viewingProfile.getfollow_stats);
  const currentAllUsersData = useSelector((state: RootState) => state.profile.getAllUsers_data as any);
  const viewingAllUsersData = useSelector((state: RootState) => state.viewingProfile.getAllUsers_data as any);
  
  // Use conditional logic to select the right data
  const getprofilebyidstats = isViewingOwnProfile ? currentProfileStatus : viewingProfileStatus;
  const profile = isViewingOwnProfile ? currentProfile : viewingProfileData;
  const getfollow_data = isViewingOwnProfile ? currentFollowData : viewingFollowData;
  const getfollow_stats = isViewingOwnProfile ? currentFollowStats : viewingFollowStats;
  const getAllUsers_data = isViewingOwnProfile ? currentAllUsersData : viewingAllUsersData;
  
  const userid = useSelector((state: RootState) => state.register.userID);
  const { postuserid } = useParams();
  
  // Load userid and token from localStorage if not in Redux
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          // Set user ID if not in Redux
          if (!reduxUserId && data?.userID) {
            setLocalUserid(data.userID);
          }
          
          // Set token if not in Redux
          if (!reduxToken && (data?.refreshtoken || data?.accesstoken)) {
            setLocalToken(data.refreshtoken || data.accesstoken);
          }
        }
      } catch (error) {
        console.error("[ProfilePage] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserId, reduxToken]);
  
  // Use postuserid from URL params as the target user ID (the profile we're viewing)
  const targetUserId = viewingUserId || postuserid || userid || localUserid;
  
  // URL params and auth info ready
  const formatter = new Intl.NumberFormat("en-US");

  const [creator_portfolio_id, setcreator_portfolio_id] = useState<string[]>([]);
  const [isFollowing, setisFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fetchedCreatorsRef = useRef<Set<string>>(new Set());

  // Check VIP status for the profile owner (the user whose profile is being viewed)
  useEffect(() => {
    if (viewingUserId) {
      dispatch(checkVipStatus(viewingUserId));
    }
  }, [viewingUserId, dispatch]);

  // Check if VIP celebration should be shown (database-based)
  const checkVipCelebrationStatus = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId || !token) return false;
    
    try {
      const response = await checkVipCelebration(userId, viewerId, token);
      return response.shouldShowCelebration;
    } catch (error) {
      console.error('Error checking VIP celebration status:', error);
      return false;
    }
  }, [token]);

  // Mark VIP celebration as viewed (database-based)
  const markVipCelebrationAsViewed = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId || !token) return;
    
    try {
      await markVipCelebrationViewed(userId, viewerId, token);
    } catch (error) {
      console.error('Error marking VIP celebration as viewed:', error);
    }
  }, [token]);

  // Update VIP status when Redux state changes
  useEffect(() => {
    setProfileOwnerVipStatus(vipStatus?.isVip || false);
  }, [vipStatus]);

  // Check VIP celebration status when VIP status is confirmed
  useEffect(() => {
    const checkCelebration = async () => {
      if (vipStatus?.isVip && status !== 'loading' && viewingUserId && loggedInUserId && !celebrationChecked) {
        setCelebrationChecked(true);
        
        try {
          const shouldShow = await checkVipCelebrationStatus(viewingUserId, loggedInUserId);
          
          if (shouldShow) {
            setShowVipCelebration(true);
            setVipCelebrationShown(true);
            
            // Mark as viewed in database
            await markVipCelebrationAsViewed(viewingUserId, loggedInUserId);
            
            // Hide the celebration after 5 seconds
            setTimeout(() => {
              setShowVipCelebration(false);
            }, 5000);
          }
        } catch (error) {
          console.error('Error checking VIP celebration:', error);
        }
      }
    };

    checkCelebration();
  }, [vipStatus, status, viewingUserId, loggedInUserId, celebrationChecked, checkVipCelebrationStatus, markVipCelebrationAsViewed]);

  useEffect(() => {
    // Use the viewingUserId from params (the profile we're viewing)
    if (!viewingUserId) return;
    
    // Read token from Redux first, then fall back to localStorage
    const tokenFromRedux = (() => {
      try {
        return (window as any).__REDUX_TOKEN__ ?? undefined;
      } catch {
        return undefined;
      }
    })();

    const tokenFromRegister = ((): string | undefined => {
      try {
        const state = (dispatch as any).getState?.() as RootState | undefined;
        return state?.register?.refreshtoken || state?.register?.accesstoken || undefined;
      } catch {
        return undefined;
      }
    })();

    let token: string | undefined = tokenFromRegister || tokenFromRedux;
    if (!token) {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const saved = JSON.parse(raw);
          token = saved?.refreshtoken || saved?.accesstoken;
        }
      } catch {}
    }
    
    // Clear viewing profile first
    dispatch(clearViewingProfile());
    
    // If viewing own profile, use current user profile, otherwise fetch viewing profile
    if (viewingUserId === loggedInUserId) {
      // Load current user profile if not already loaded
      if (currentUserProfile.status === "idle") {
        dispatch(getprofile({ userid: viewingUserId, token } as any));
      }
    } else {
      // Load viewing profile for other users
      dispatch(getViewingProfile({ userid: String(viewingUserId), token: token || "" }));
    }
  }, [viewingUserId, dispatch, loggedInUserId, currentUserProfile.status]);

  // Cleanup effect to restore current user profile when navigating away
  useEffect(() => {
    return () => {
      // Clear viewing profile when component unmounts or when navigating away
      dispatch(clearViewingProfile());
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (avatarSrc && avatarSrc.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
    };
  }, [avatarSrc]);

  // Ensure follow data is loaded for both current user and viewed user profiles
  useEffect(() => {
    if (targetUserId && token) {
      if (isViewingOwnProfile) {
        // For current user's own profile, use regular getfollow
        dispatch(getfollow({ userid: String(targetUserId), token }));
        dispatch(getAllUsers({ token, userid: String(targetUserId) }));
      } else {
        // For other user's profile, use viewing profile thunks
        dispatch(getViewingFollow({ userid: String(targetUserId), token }));
        dispatch(getAllUsersForViewing({ token }));
      }
    }
  }, [targetUserId, token, isViewingOwnProfile, dispatch]);

  useEffect(() => {
    const profileStatus = isViewingOwnProfile ? currentUserProfile.status : viewingProfile.status;
    
    if (profileStatus === "succeeded") {
      
      // Fetch follower data and all users if not already loaded
      // Use the target user ID (the profile we're viewing) for getfollow
      if (targetUserId && token) {
        if (isViewingOwnProfile) {
          dispatch(getfollow({ userid: String(targetUserId), token }));
        dispatch(getAllUsers({ token, userid: String(targetUserId) }));
        } else {
          dispatch(getViewingFollow({ userid: String(targetUserId), token }));
          dispatch(getAllUsersForViewing({ token }));
        }
      }
      
      cantfandc();
    }

    if (getprofilebyidstats === "failed") {
      // dispatch(comprofilechangeStatus("idle"));
    }
  }, [getprofilebyidstats, userid, postuserid]);

  // Get followers/following from API response - EXACTLY like following page
  const apiFollowers = React.useMemo(() => {
    return (getfollow_data?.followers as any[]) || [];
  }, [getfollow_data]);
  
  const apiFollowing = React.useMemo(() => {
    return (getfollow_data?.following as any[]) || [];
  }, [getfollow_data]);
  
  // Use useMemo to prevent unnecessary re-renders
  const allUsers = React.useMemo(() => {
    return (getAllUsers_data as any[]) || [];
  }, [getAllUsers_data]);
  
  // Track stats data
  
  // Calculate follower/following counts and total likes
  const profileStats = React.useMemo(() => {
    // Try to get counts from API data first
    let followersCount = apiFollowers.length;
    let followingCount = apiFollowing.length;
    
    // Calculate total likes from all user posts
    const totalLikes = userPosts.reduce((sum, post) => {
      return sum + (post.totalLikes || post.likeCount || post.likes?.length || 0);
    }, 0);
    
    // Fallback to profile data if API data is not available
    if (followersCount === 0 && profileData) {
      followersCount = (profileData as any).followers || 0;
    }
    if (followingCount === 0 && profileData) {
      followingCount = (profileData as any).following || 0;
    }
    
    return { 
      followersCount, 
      followingCount,
      totalLikes
    };
  }, [apiFollowers.length, apiFollowing.length, getfollow_data, isViewingOwnProfile, profileData, userPosts]);

  // Get current user's following list from Redux (EXACT same as following page)
  const followingList = useSelector((state: RootState) => {
    interface FollowData {
      following?: Array<{ id: string }>;
    }
    const followingData = state.profile.getfollow_data as FollowData;
    return followingData?.following?.map(u => u.id) || [];
  }, (left, right) => {
    // Custom equality check to prevent unnecessary re-renders
    if (left.length !== right.length) return false;
    return left.every((id, index) => id === right[index]);
  });

  // Check if logged-in user is following the profile being viewed (EXACT same as following page)
  useEffect(() => {
    if (loggedInUserId && targetUserId && targetUserId !== loggedInUserId) {
      // Use the same logic as following page
      if (followingList.includes(Array.isArray(targetUserId) ? targetUserId.join(',') : String(targetUserId))) {
        setisFollowing(true);
      } else {
        setisFollowing(false);
      }
    }
  }, [followingList, loggedInUserId, targetUserId]);
  
  // Setup socket for real-time follow/unfollow updates
  useEffect(() => {
    if (!loggedInUserId || !targetUserId) return;
    
    // Try to get socket connection
    const socket = getSocket();
    if (!socket) {
      // Fallback: poll for updates every 10 seconds if socket is not available
      const intervalId = setInterval(() => {
        if (loggedInUserId && token) {
          if (isViewingOwnProfile) {
            dispatch(getfollow({ userid: loggedInUserId, token }));
          } else {
            dispatch(getViewingFollow({ userid: String(targetUserId), token }));
          }
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
    
    // Listen for follow/unfollow events
    const handleFollowUpdate = (data: any) => {
      // Check if this update is relevant to the current profile
      if (data.target === targetUserId || data.actor === loggedInUserId) {
        // Refresh follow data
        if (loggedInUserId && token) {
          if (isViewingOwnProfile) {
            dispatch(getfollow({ userid: loggedInUserId, token }));
          } else {
            dispatch(getViewingFollow({ userid: String(targetUserId), token }));
          }
        }
      }
    };
    
    socket.on('follow_update', handleFollowUpdate);
    
    return () => {
      socket.off('follow_update', handleFollowUpdate);
    };
  }, [loggedInUserId, targetUserId, token, dispatch, isViewingOwnProfile]);
  
  // Mock data for development/testing when API fails
  const mockPosts = React.useMemo(() => [
    {
      _id: 'mock1',
      content: 'This is a sample post to show when the API is unavailable',
      likes: Array(15),
      comments: Array(5),
      user: {
        firstname: firstname || 'User',
        lastname: lastname || '',
        nickname: nickname || '@user',
        photolink: photolink || avatarSrc || '/icons/profile.png'
      },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock2',
      content: 'Another sample post with some image content',
      postfilelink: ['/icons/mmekoDummy.png'],
      likes: Array(32),
      comments: Array(8),
      user: {
        firstname: firstname || 'User',
        lastname: lastname || '',
        nickname: nickname || '@user',
        photolink: photolink || avatarSrc || '/icons/profile.png'
      },
      createdAt: new Date().toISOString()
    }
  ], [firstname, lastname, nickname]);

  // Fetch user posts - wrapped in useCallback to avoid dependency cycle
  const fetchUserPosts = React.useCallback(async (userId: string) => {
    if (!userId || !token) {
      return;
    }
    
    setIsLoadingPosts(true);
    
    try {
      // Use the URL constant from config for backend requests
      const response = await axios.post(`${API_URL}/getalluserpost`, 
        { 
          userid: userId,
          sort: 'newest' // Request posts sorted by newest first
        }, 
        { 
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
          timeout: 10000
        }
      );
      
      
      // Extract posts from response - handle different response formats
      let posts = [];
      
      if (response.data) {
        // Try different possible response structures
        if (Array.isArray(response.data)) {
          posts = response.data;
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          posts = response.data.posts;
        } else if (response.data.post && Array.isArray(response.data.post)) {
          posts = response.data.post;
        } else if (response.data.data && response.data.data.posts && Array.isArray(response.data.data.posts)) {
          posts = response.data.data.posts;
        }
      }

      // Fetch likes and comments for each post, just like in fetchposts function
      const postsWithLikesAndComments = await Promise.all(posts.map(async (post: any) => {
        try {
          // Get likes for this post
          const likeResponse = await axios.get(`${API_URL}/like`, {
            params: { postid: post._id || post.postid || post.id }
          });
          
          // Get comments for this post
          const commentResponse = await axios.put(`${API_URL}/getpostcomment`, {
            postid: post._id || post.postid || post.id
          });
          
          // Enrich comments with user information
          if (commentResponse.data && commentResponse.data.comment && Array.isArray(commentResponse.data.comment)) {
            const { enrichCommentsWithUserInfo } = await import('@/utils/enrichComments');
            const enrichedComments = await enrichCommentsWithUserInfo(commentResponse.data.comment);
            commentResponse.data.comment = enrichedComments;
          }
          
          const postData = { ...post };
          
          if (likeResponse.data.ok) {
            postData.likeCount = likeResponse.data.likeCount;
            postData.likedBy = likeResponse.data.likedBy;
          }
          
          if (commentResponse.data.ok) {
            const comments = commentResponse.data.comment || commentResponse.data.comments || [];
            postData.comments = comments;
            postData.commentCount = comments.length;
          }
          
          return postData;
        } catch (err) {
          // Handle error gracefully
          return {
            ...post,
            likeCount: post.likeCount || 0,
            likedBy: post.likedBy || [],
            comments: post.comments || [],
            commentCount: post.commentCount || post.comments?.length || 0
          };
        }
      }));
      
      // Use the posts with likes and comments instead of original posts
      posts = postsWithLikesAndComments;
      
      // Filter posts to ensure they belong to the specific user and count total likes
      const filteredPosts = posts.filter((post: any) => {
        // Check if post belongs to the user we're viewing
        const postUserId = post.userid || post.user?.userid || post.user?._id || post.userId;
        const belongsToUser = String(postUserId) === String(userId);
        
        if (belongsToUser) {
          // Get total likes for this post
          let totalLikes = 0;
          
          // Try different possible structures where likes might be stored
          if (Array.isArray(post.likes)) {
            totalLikes = post.likes.length;
          } else if (Array.isArray(post.like)) {
            totalLikes = post.like.length;
          } else if (typeof post.likeCount === 'number') {
            totalLikes = post.likeCount;
          }
          
          // Attach the total likes count to the post
          post.totalLikes = totalLikes;
          
        }
        
        return belongsToUser;
      });
      
      setUserPosts(filteredPosts);
   
    } catch (error) {
      // Only use mock data for current user in development
        if (typeof window !== 'undefined' && 
            window.location.hostname === 'localhost' && 
          userId === loggedInUserId) {
          setUserPosts(mockPosts);
        } else {
          setUserPosts([]);
        }
    } finally {
      setIsLoadingPosts(false);
    }
  }, [token, mockPosts, loggedInUserId]);
  
  // Clear posts when switching users to prevent showing wrong posts
  useEffect(() => {
    setUserPosts([]);
  }, [viewingUserId]);

  // Reset VIP celebration tracking when switching users
  useEffect(() => {
    setVipCelebrationShown(false);
    setShowVipCelebration(false);
    setCelebrationChecked(false);
  }, [viewingUserId]);

  // Fetch posts and reviews when profile is loaded - ONLY for the specific user being viewed
  useEffect(() => {
    if (targetUserId && token) {
      // Add a small delay to ensure other API calls complete first
      const timer = setTimeout(() => {
        fetchUserPosts(String(targetUserId));
        
        // Always fetch fan ratings (creator-to-fan) for all users
        dispatch(getFanRatings({ fanId: String(targetUserId), token }));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [targetUserId, token, fetchUserPosts, dispatch]);

  // Separate effect for creator ratings to avoid infinite loops
  useEffect(() => {
    if (targetUserId && token && profileData) {
      const creatorId = (profileData as any)?.creator_portfolio_id || targetUserId;
      
      // Fetch creator ratings (fan-to-creator) if this is a creator profile
      if ((
          (profileData as any).creator === true ||
          (profileData as any).creator_portfolio_id ||
          (profileData as any).creatorname ||
          (profileData as any).creator_verified === true
        )) {
          // Check if we've already fetched for this creator to prevent duplicate calls
          if (!fetchedCreatorsRef.current.has(creatorId)) {
            fetchedCreatorsRef.current.add(creatorId);
            dispatch(getAllUserRatings({ userId: creatorId, token }));
          }
        }
    }
  }, [targetUserId, token, dispatch, profileData?.creator, profileData?.creator_portfolio_id, profileData?.creatorname, profileData?.creator_verified]);

  // Clear fetched creators ref when target user changes
  useEffect(() => {
    fetchedCreatorsRef.current.clear();
  }, [targetUserId]);

  // Handle follow/unfollow button click - EXACT same pattern as following page
  const onFollowClick = async () => {
    if (!loggedInUserId || !targetUserId || isProcessing) {
      return;
    }
    
    // Get token from localStorage if not in Redux state (EXACT same as following page)
    let authToken = token;
    if (!authToken) {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          authToken = parsedData.refreshtoken || parsedData.accesstoken;
        }
      } catch (error) {
        console.error("[ProfilePage] Error retrieving token from localStorage:", error);
      }
    }
    
    if (!authToken) {
      alert("Please log in to follow/unfollow users");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Perform follow/unfollow action (EXACT same as following page)
      if (isFollowing) {
        try {
          await dispatch(unfollow({ 
            userid: Array.isArray(targetUserId) ? targetUserId.join(',') : targetUserId,
            followerid: loggedInUserId, 
            token: authToken 
          })).unwrap();
          
          // Update local state
          setisFollowing(false);
          
          // Show success toast
          toast.success("Unfollowed successfully!");
        } catch (error: unknown) {
          // If the error is "not following this user", update the UI state
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not following")) {
            setisFollowing(false);
          } else {
            throw error; // Re-throw for the outer catch
          }
        }
      } else {
        try {
          await dispatch(follow({
            userid: Array.isArray(targetUserId) ? targetUserId.join(',') : targetUserId,
            followerid: loggedInUserId,
            token: authToken
          })).unwrap();

          
          // Update local state
          setisFollowing(true);
          
          // Show success toast
          toast.success("Followed successfully!");
        } catch (error: unknown) {
          // Handle empty error objects or objects without message property
          let errorMessage = "";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            // Try to extract message from response data if available
            const errorObj = error as Record<string, unknown>;
            errorMessage = 
              (errorObj.message as string) || 
              ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 
              JSON.stringify(error);
          } else {
            errorMessage = String(error);
          }
          
          // If the error is "already followed", update UI to show Following
          if (errorMessage.includes("already followed")) {
            setisFollowing(true);
            // Don't throw error - this is expected behavior
          } else {
            // For other errors, still assume following (safer approach)
            setisFollowing(true);
          }
        }
      }
      
      // Try to emit socket event to notify other users (EXACT same as following page)
      try {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('follow_update', {
            actor: loggedInUserId,
            target: targetUserId,
            action: isFollowing ? 'unfollow' : 'follow'
          });
        }
      } catch {
        // Socket error - continue with normal flow
      }
      
      // Always refresh followers/following lists regardless of socket status (EXACT same as following page)
      dispatch(getfollow({ userid: loggedInUserId, token: authToken }));
      
    } catch (error: unknown) {
      // Handle empty error objects or objects without message property
      let errorMessage = "";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract message from response data if available
        const errorObj = error as Record<string, unknown>;
        errorMessage = 
              (errorObj.message as string) || 
              ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string ||
              JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      // For follow errors (which are most common), assume it's "already followed"
      if (!isFollowing || errorMessage.includes("already followed")) {
        setisFollowing(true);
        
        // Update DOM attributes to reflect the followed state
        const element = document.querySelector(`[data-userid="${targetUserId}"]`);
        if (element) {
          element.setAttribute('data-following', 'true');
        }
      } else if (errorMessage.includes("not following")) {
        setisFollowing(false);
        
        // Update DOM attributes to reflect the unfollowed state
        const element = document.querySelector(`[data-userid="${targetUserId}"]`);
        if (element) {
          element.setAttribute('data-following', 'false');
        }
      } else {
        // For other errors, show an alert
        alert("Failed to " + (isFollowing ? "unfollow" : "follow") + ". Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const cantfandc = () => {
    if (loggedInUserId && viewingUserId) {
      setcreator_portfolio_id([viewingUserId, loggedInUserId]);
    }
  };

  // Function to get media source with fallbacks (same as in PostsCard)
  const getMediaSource = (post: any) => {
    // Infer post type: prefer explicit fields if present
    let postType: string = post?.posttype || post?.type || "text";
    if (!postType) {
      if (post?.postphoto || post?.image) postType = "image";
      else if (post?.postvideo || post?.video) postType = "video";
    }

    // Resolve media reference (cover more backend key variants) - same as PostsCard
    const mediaRef =
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
      // support top-level identifiers
      post?.publicId ||
      post?.public_id ||
      post?.imageId ||
      post?.postfilepublicid ||
      post?.postfilelink ||
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
    const queryUrlPrimary = asString ? `${API_URL}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
    const pathUrlPrimary = asString ? `${API_URL}/api/image/view/${encodeURIComponent(asString)}` : "";
    const queryUrlFallback = asString ? `${API_URL}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
    const pathUrlFallback = asString ? `${API_URL}/api/image/view/${encodeURIComponent(asString)}` : "";

    return {
      src,
      postType,
      asString,
      queryUrlPrimary,
      pathUrlPrimary,
      queryUrlFallback,
      pathUrlFallback
    };
  };

  // Post modal component
//   const PostModal = () => {
//     if (!selectedPost) return null;

//     const { src, postType } = getMediaSource(selectedPost);

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
//         <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//           {/* Header */}
//           <div className="p-4 border-b border-gray-800 flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
//                 {selectedPost.user?.photolink ? (
//                   <Image 
//                     src={selectedPost.user.photolink} 
//                     alt="Profile" 
//                     width={40} 
//                     height={40} 
//                     className="object-cover w-full h-full"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
//                     {selectedPost.user?.firstname?.charAt(0) || '?'}
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <p className="font-medium">{selectedPost.user?.firstname} {selectedPost.user?.lastname}</p>
//                 <p className="text-xs text-gray-400">{selectedPost.user?.nickname}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setShowPostModal(false)}
//               className="text-gray-400 hover:text-white"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           {/* Content */}
//           <div className="flex-1 overflow-auto">
//             {/* Media display with proper fallbacks */}
//             {postType === "image" && src && (
//               <div className="relative aspect-square bg-black">
//                 <img
//                   src={src}
//                   alt={selectedPost?.content || "post image"}
//                   className="w-full h-full object-contain"
//                   onError={(e) => {
//                     const img = e.currentTarget as HTMLImageElement & { dataset: any };
//                     const { pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(selectedPost);
                    
//                     // First fallback: switch to path URL on same base
//                     if (!img.dataset.fallback1 && pathUrlPrimary) {
//                       img.dataset.fallback1 = "1";
//                       img.src = pathUrlPrimary;
//                       return;
//                     }
//                     // Second fallback: try query on PROD base
//                     if (!img.dataset.fallback2 && queryUrlFallback) {
//                       img.dataset.fallback2 = "1";
//                       img.src = queryUrlFallback;
//                       return;
//                     }
//                     // Final fallback: try path on PROD base
//                     if (!img.dataset.fallback3 && pathUrlFallback) {
//                       img.dataset.fallback3 = "1";
//                       img.src = pathUrlFallback;
//                     }
//                   }}
//                 />
//               </div>
//             )}
            
//             {postType === "video" && src && (
//               <div className="relative aspect-square bg-black">
//                 <video
//                   src={src}
//                   controls
//                   className="w-full h-full object-contain"
//                   onError={(e) => {
//                     const video = e.currentTarget as HTMLVideoElement & { dataset: any };
//                     const { pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(selectedPost);
                    
//                     // First fallback: switch to path URL on same base
//                     if (!video.dataset.fallback1 && pathUrlPrimary) {
//                       video.dataset.fallback1 = "1";
//                       video.src = pathUrlPrimary;
//                       video.load();
//                       return;
//                     }
//                     // Second fallback: try query on PROD base
//                     if (!video.dataset.fallback2 && queryUrlFallback) {
//                       video.dataset.fallback2 = "1";
//                       video.src = queryUrlFallback;
//                       video.load();
//                       return;
//                     }
//                     // Final fallback: try path on PROD base
//                     if (!video.dataset.fallback3 && pathUrlFallback) {
//                       video.dataset.fallback3 = "1";
//                       video.src = pathUrlFallback;
//                       video.load();
//                     }
//                   }}
//                 />
//               </div>
//             )}
            
//             {/* Post content */}
//             <div className="p-4">
//               <p className="mb-4">{selectedPost.content}</p>
              
//               {/* Stats */}
// {/* Use Post Action Here */}
//               {/* <div className="flex items-center gap-4 text-sm text-gray-400">
//                 <div className="flex items-center gap-1">
//                   <Heart  className="w-4 h-4" />
//                   <span>{formatNumber(selectedPost.totalLikes || selectedPost.likeCount || selectedPost.likes?.length || 0)}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <MessageCircle className="w-4 h-4" />
//                   <span>{formatNumber(selectedPost.comments?.length || 0)} comments</span>
//                 </div>
//               </div> */}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

   // Video Component for profile modal - using the same approach as FirstPost and RemainingPosts
   const VideoComponent = React.memo(function VideoComponent({ post, src, pathUrlPrimary, queryUrlFallback, pathUrlFallback, isFirstVideo = false }: {
     post: any;
     src: string;
     pathUrlPrimary?: string;
     queryUrlFallback?: string;
     pathUrlFallback?: string;
     isFirstVideo?: boolean;
   }) {
     // Use useVideoAutoPlay hook but disable auto-play for profile modal
     const { videoRef, isPlaying, isVisible, autoPlayBlocked, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
       autoPlay: false, // Disable auto-play for profile modal
       muted: true,
       loop: true,
       postId: post?._id || post?.postid || post?.id || `profile-post-${Math.random()}`
     });
     
     // State and ref for auto-hiding video controls (same as FirstPost/RemainingPosts)
     const [showControls, setShowControls] = React.useState(false);
     const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
     const controlsTimerRef = React.useRef<NodeJS.Timeout | null>(null);
     
     // Clear timeout when component unmounts
     React.useEffect(() => {
       // Show controls initially when the video loads (for profile modal)
       setShowControls(true);
       
       // Don't auto-hide controls initially since videos don't auto-play
       // Controls will hide after user interaction
       
       return () => {
         // Clean up all timeouts on unmount
         if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
       };
     }, []);

     return (
       <div className="relative w-full h-[500px] rounded overflow-hidden">
         {/* Video skeleton - show while video is loading */}
         {!isVideoLoaded && (
           <div className="absolute inset-0 w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
             <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                 <polygon points="5 3 19 12 5 21 5 3"></polygon>
               </svg>
             </div>
           </div>
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
             muted
             loop
             playsInline
             className="w-full h-[500px] object-cover rounded cursor-pointer"
             onLoadedData={() => {
               setIsVideoLoaded(true);
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
           
           {/* Center Play/Pause Button - Always show initially since videos don't auto-play */}
           {(showControls || autoPlayBlocked || !isPlaying) && (
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
                 className={`bg-black bg-opacity-70 rounded-full p-5 hover:bg-opacity-90 hover:scale-110 cursor-pointer transition-all ${
                   autoPlayBlocked ? 'animate-pulse' : ''
                 }`}
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
               {autoPlayBlocked && (
                 <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                   Click to play
                 </div>
               )}
             </div>
           )}
         </div>
       </div>
     );
   });

// Post Modal component - Full screen modal showing all posts using RemainingPosts
const PostModal = () => {
  // State for managing UI state for all posts in the modal
  const [modalUi, setModalUi] = React.useState<Record<string, any>>({});
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to clicked post when modal opens
  React.useEffect(() => {
    if (clickedPostId && scrollContainerRef.current && showPostModal) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const postElement = scrollContainerRef.current?.querySelector(`[data-post-id="${clickedPostId}"]`);
        if (postElement) {
          // Scroll to the post with smooth behavior
          postElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [clickedPostId, showPostModal]);

  // Reset clicked post ID when modal closes
  React.useEffect(() => {
    if (!showPostModal) {
      setClickedPostId(null);
    }
  }, [showPostModal]);

  if (!userPosts || userPosts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
            {(() => {
              const profileImage = isViewingOwnProfile ? photolink : profileData?.photolink;
              const userName = isViewingOwnProfile ? `${firstname} ${lastname}`.trim() : 
                `${profileData?.firstname || ""} ${profileData?.lastname || ""}`.trim();
              const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
              
              if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                const imageSource = getImageSource(profileImage, 'profile');
                return (
                  <Image 
                    src={imageSource.src} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full"
                  />
                );
              }
              
              return (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                  {initials}
                </div>
              );
            })()}
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">
              {isViewingOwnProfile ? `${firstname} ${lastname}`.trim() : 
                `${profileData?.firstname || ""} ${profileData?.lastname || ""}`.trim()}
            </h2>
            <p className="text-gray-400 text-sm">
              {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowPostModal(false)}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Posts Content */}
       <div ref={scrollContainerRef} className="h-[calc(100vh-80px)] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {userPosts.map((post, index) => {
            const { src, postType } = getMediaSource(post);
            
            // Generate fallback URLs for video error handling
            const mediaRef = post?.postfilelink || post?.postphoto || post?.postvideo || post?.postlink || 
                            post?.postFile || post?.file || post?.proxy_view || post?.file_link || 
                            post?.media || post?.image || post?.video || post?.thumblink || 
                            post?.postfilepublicid || post?.publicId || post?.public_id || 
                            post?.imageId || "";
            const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
            
            const queryUrlPrimary = asString ? `${API_URL}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
            const pathUrlPrimary = asString ? `${API_URL}/api/image/view/${encodeURIComponent(asString)}` : "";
            const queryUrlFallback = asString ? `https://backendritual.work/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
            const pathUrlFallback = asString ? `https://backendritual.work/api/image/view/${encodeURIComponent(asString)}` : "";

  return (
               <div 
                 key={post._id || post.postid || index} 
                 data-post-id={post._id || post.postid || post.id}
                 className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3"
               >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="size-10 rounded-full overflow-hidden bg-gray-700">
              {(() => {
                          const profileImage = isViewingOwnProfile ? photolink : profileData?.photolink;
                          const userName = isViewingOwnProfile ? `${firstname} ${lastname}`.trim() : 
                            `${profileData?.firstname || ""} ${profileData?.lastname || ""}`.trim();
                const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                
                if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                  const imageSource = getImageSource(profileImage, 'profile');
                  return (
                    <Image 
                      src={imageSource.src} 
                      alt="Profile" 
                                      width={40}
                                      height={40}
                      className="object-cover w-full h-full"
                    />
                  );
                }
                
                return (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                  </div>
                );
              })()}
              </div>
            </div>
                          <div className="flex-1">
                      <p className="font-medium text-white">
                        {isViewingOwnProfile ? `${firstname} ${lastname}`.trim() : 
                          `${profileData?.firstname || ""} ${profileData?.lastname || ""}`.trim()}
                      </p>
                      <span className="text-gray-400 text-sm">
                        {isViewingOwnProfile ? nickname : profileData?.nickname || ""}
                    </span>
              </div>
            </div>
          </div>

                {/* Post Timestamp */}
                {post?.createdAt && (
                  <p className="my-3 text-gray-400 text-sm cursor-pointer">
                    {(() => {
                      const formatted = formatRelativeTime(post.createdAt);
                      if (formatted === 'Invalid time' || formatted === 'Unknown time') {
                        return 'recently';
                      }
                      return formatted;
                    })()}
                  </p>
                )}

                {/* Post Content */}
                {post?.content && (
                  <div className="my-2">
                    <p className="text-white">{post.content}</p>
        </div>
                )}
        
                {/* Post Media */}
          {postType === "image" && src && (
                  <div className="w-full max-h-[480px] relative rounded overflow-hidden">
                                <Image
                src={src}
                      alt={post?.content || "post image"}
                      width={800}
                      height={480}
                      className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity duration-200"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement & { dataset: any };
                        const { pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(post);
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
          
                {postType === "video" && (
                  (() => {
                    // For videos, use the direct URL from postfilelink (like RemainingPosts does)
                    const mediaRef = post?.postfilelink || post?.postphoto || post?.postvideo || post?.postlink || 
                                    post?.postFile || post?.file || post?.proxy_view || post?.file_link || 
                                    post?.media || post?.image || post?.video || post?.thumblink || 
                                    post?.postfilepublicid || post?.publicId || post?.public_id || 
                                    post?.imageId || "";
                    const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
                    const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
                    const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
                    const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
                    const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
                    
                    // Use getImageSource for all videos (same as RemainingPosts)
                    const imageSource = getImageSource(asString, 'post');
                    const videoSrc = imageSource.src;
                    
                    console.log('🎬 [POST DEBUG] Rendering video:', {
                      postId: post._id || post.postid || post.id,
                      postType,
                      mediaRef,
                      asString,
                      isUrl,
                      originalSrc: src,
                      videoSrc,
                      hasVideoSrc: !!videoSrc,
                      pathUrlPrimary,
                      queryUrlFallback,
                      pathUrlFallback,
                      post: post
                    });
                    
                    // Only render if we have a valid video source
                    if (!videoSrc) {
                      console.log('❌ [POST DEBUG] No video source found for post:', post._id || post.postid || post.id);
                      return <div className="w-full h-[500px] bg-gray-800 rounded flex items-center justify-center text-white">No video source</div>;
                            }
                            
                                  return (
                 <VideoComponent
                   post={post}
                   src={videoSrc}
                   pathUrlPrimary={pathUrlPrimary}
                   queryUrlFallback={queryUrlFallback}
                   pathUrlFallback={pathUrlFallback}
                 />
                    );
                  })()
                )}

                {/* Post Actions */}
                <PostActions
                  className="mt-3 border-t border-gray-700 pt-2"
                  starred={false}
                  liked={false}
                  likeCount={post.likeCount || post.likes?.length || 0}
                  commentCount={post.commentCount || post.comments?.length || 0}
                  post={post}
                  onStar={() => {}}
                  onLike={async () => {
                    const uid = String(loggedInUserId || localUserid || "");
                    const postId = post._id || post.postid || post.id;
                    
                    if (!postId || !token) {
                      toast.error("Please login to like posts");
                      return;
                    }

                    try {
                      await dispatch(postlike({
                        userid: uid,
                        postid: postId,
                        token: token
                      } as any)).unwrap();
                      
                      toast.success("Post liked!");
                      // Refresh posts
                      fetchUserPosts(String(targetUserId));
                    } catch (err) {
                      toast.error("Failed to like post");
                    }
                  }}
                  onComment={() => {
                    // Simple comment toggle for modal
                    const postId = post._id || post.postid || post.id;
                    setModalUi(prev => ({
                          ...prev,
                      [postId]: {
                        ...prev[postId],
                        open: !prev[postId]?.open
                      }
                    }));
                  }}
                />

                {/* Comments Section */}
                {modalUi[post._id || post.postid || post.id]?.open && (
                  <div className="mt-2 border-t border-gray-700 pt-2">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Comments feature coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

  // Profile Picture Modal Component
  const ProfilePictureModal = () => {
    if (!showProfilePictureModal) return null;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4" style={{zIndex: 9999}}>
        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            onClick={() => setShowProfilePictureModal(false)}
            className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Profile Picture */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-md h-96 flex items-center justify-center">
                {(() => {
                  const profileImage = photolink || avatarSrc;
                  const userName = `${firstname || ""} ${lastname || ""}`.trim();
                  const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                  
                  
                  if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                    // Check if it's a base64 image
                    const isBase64 = profileImage.startsWith('data:image/');
                    
                    if (isBase64) {
                      return (
                        <img
                          alt="Profile Picture"
                          src={profileImage}
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      );
                    } else {
                      const imageSource = getImageSource(profileImage, 'profile');
                      return (
                        <Image
                          alt="Profile Picture"
                          src={imageSource.src}
                          width={400}
                          height={400}
                          className="object-contain rounded-lg"
                        />
                      );
                    }
                  }
                  
                  return (
                    <div className="w-full h-full rounded-lg bg-gray-600 flex items-center justify-center text-white text-6xl font-bold">
                      {initials}
                    </div>
                  );
                })()}
                
                {/* VIP Lion Badge */}
                {profileOwnerVipStatus && <VIPBadge size="xxl" className="absolute top-2 right-2" isVip={profileOwnerVipStatus} vipEndDate={vipStatus?.vipEndDate} />}
            </div>
          </div>
          
          {/* User Info */}
          <div className="mt-4 text-center">
            <p className="text-white text-xl font-bold">
              {firstname} {lastname}
            </p>
            <p className="text-gray-300">{nickname}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12"
      style={{ overflowY: "scroll" }}
    >
      {/* VIP Celebration Animation */}
      {showVipCelebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <Image
              src="/lion.gif"
              alt="VIP Celebration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
      
      {/* Post Modal */}
      {showPostModal && <PostModal />}
      {/* Profile Picture Modal */}
      {showProfilePictureModal && <ProfilePictureModal />}
      <div
        className="w-full mx-auto mt-4 text-white md:mr-auto md:ml-0"
      >
        <div className="pb-6">
          {(status === "loading" || status === "idle") && (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <div className="flex flex-col gap-6">
                {/* Profile header skeleton */}
                <div className="relative w-full flex items-center justify-between px-2">
                  <div className="flex items-center justify-center w-1/3">
                    <div className="w-24 h-24 rounded-full p-1">
                      <Skeleton circle width={96} height={96} />
                    </div>
                  </div>
                  <div className="flex flex-col items-start pl-7 gap-2 w-2/3">
                    <Skeleton width={120} height={24} className="rounded-md" />
                    <div className="flex justify-start gap-4 w-full">
                      <Skeleton width={60} height={20} />
                      <Skeleton width={60} height={20} />
                      <Skeleton width={60} height={20} />
                    </div>
                  </div>
                </div>
                {/* Bio and nickname skeleton */}
                <div className="mt-3 ml-6">
                  <Skeleton width={80} height={18} />
                  <Skeleton width={180} height={16} />
                </div>
                {/* Follow grid skeleton */}
                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  <Skeleton width={180} height={18} />
                  <Skeleton width={180} height={18} />
                </div>
              </div>
            </SkeletonTheme>
          )}
          {status === "failed" && (
            <div className="w-full px-4 py-6 text-center">
              <div className="mb-3 text-sm text-red-400">
                {error || "Failed to load profile."}
              </div>
              <button
                onClick={() => viewingUserId && dispatch(getprofile({ userid: viewingUserId, token } as any))}
                className="px-3 py-1 text-sm rounded bg-orange-500 text-white hover:bg-orange-600"
              >
                Retry
              </button>
            </div>
          )}
          {status === "succeeded" && (
            <div className="flex flex-col">
              <div className="relative w-full ">
               
              <div className=" w-max absolute -top-5 right-0 px-4">
                  <div className="flex items-center justify-between">
                    
                    <DropdownMenu userId={viewingUserId} isOwnProfile={viewingUserId === loggedInUserId} />
                  </div>
                </div>
                <div className="w-full px-2 ">
                  <div className="flex items-center  justify-between">
                    <div className="flex items-center justify-center w-1/3">
                      <div className="relative">
                        <div 
                        onClick={() => setShowProfilePictureModal(true)}
                        className="w-24 h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer hover:scale-105 transition-transform">
                          {(() => {
                            const profileImage = photolink || avatarSrc;
                            const userName = `${firstname || ""} ${lastname || ""}`.trim();
                            const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                            
                            if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                              const imageSource = getImageSource(profileImage, 'profile');
                              return (
                                <Image
                                  alt="profile picture"
                                  src={imageSource.src}
                                  width={128}
                                  height={128}
                                  className="object-cover w-full h-full rounded-full"
                                />
                              );
                            }
                            
                            return (
                              <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-bold">
                                {initials}
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* VIP Lion Badge */}
                          {(() => {
                            return profileOwnerVipStatus && <VIPBadge size="xxl" className="absolute -top-8 -right-8 pointer-events-none" isVip={profileOwnerVipStatus} vipEndDate={vipStatus?.vipEndDate} />;
                          })()}
                      </div>
                    </div>
                      <div className="flex flex-col items-start pl-7 gap-2 w-2/3">
                      <p className="pt-2 text-xl font-bold text-slate-200">
                          {firstname} {lastname}
                  </p>
                  <div className="flex justify-start gap-4 w-full">
                  <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
                      {formatter.format(profileStats.totalLikes)}{" "}
                      <span className="font-semibold tracking-wider text-[15px]">Likes</span>
                    </p>
         <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
           {profileStats.followersCount} <span className="font-semibold tracking-wider text-[15px]">Fans</span>
         </p>
         <p className="font-bold text-lg text-slate-400 flex flex-col items-center">
           {profileStats.followingCount} <span className="font-semibold tracking-wider text-[15px]">Following</span>
         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-3 ml-6 ">
                 
                  <p className="text-blue-500">{nickname}</p>
                
                
                  {(profile as any).creator_portfolio && (
                    <button
                      className="bg-[#7e3500] text-[#eedfcb] rounded-lg p-1 px-2 mt-3"
                    >
                      Request {(profile as any).creatortDype}
                    </button>
                  )}
              {/* Bio */}
                  <div className="w-full overflow-x-hidden   mt-2">
                    <p className="text-slate-400 break-words">{bio || "Hey, I am using mmeko"}</p>
                  </div>
              <div className="w-full -ml-2 flex items-center justify-center">
                    {viewingUserId !== loggedInUserId ? (
                      <div className="flex flex-row-reverse w-full gap-2 mt-4">
                        {/* Message Button */}
                        <button
                          className={`flex-1 bg-gray-800 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-gray-700 transition-colors text-center`}
                          onClick={() => {
                            // Pass only the target user ID (the user being viewed) as creator_portfolio_id
                            // The Chat component will use this to fetch the target user's profile details
                            const targetUserId = viewingUserId;
                            router.push(`/message/${targetUserId}`);
                          }}
                        >
                          Message
                        </button>
                        
                        {/* Fan Meet Button - Only show if the profile owner has creator portfolio */}
                        {(() => {
                          // Check for creator properties based on the actual data structure
                          const hasCreatorPortfolio = profileData && (
                            (profileData as any).creator === true ||
                            (profileData as any).creator_portfolio_id ||
                            (profileData as any).creatorname ||
                            (profileData as any).creator_verified === true
                          );
                          
                          // Get host type from profile data or default to "Fan meet"
                          const hostType = (profileData as any)?.hosttype || "Fan meet";
                          
                          return hasCreatorPortfolio && (
                            <button
                              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 cursor-pointer py-1.5 px-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 hover:scale-105 text-center"
                              onClick={() => {
                                // Get the actual creator ID from profile data
                                const creator_portfolio_id = (profileData as any)?.creator_portfolio_id || 
                                               (profileData as any)?.creator_portfolio_id || 
                                               (profileData as any)?.creator_id ||
                                               (profileData as any)?._id || // Fallback to profile ID
                                               viewingUserId; // Last resort fallback
                                
                                // Navigate to creator profile using the actual creator ID
                                router.push(`/creators/${creator_portfolio_id}`);
                              }}
                            >
                              {hostType}
                            </button>
                          );
                        })()}
                        
                        {/* Follow Button */}
                        <button
                          key={`follow-button-${isFollowing}`}
                          onClick={onFollowClick}
                          disabled={isProcessing}
                          className={`flex-1 flex justify-center gap-x-1 items-center py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isFollowing 
                              ? "bg-gradient-to-r !from-blue-700 !to-purple-800" 
                              : "bg-gradient-to-r !from-blue-500 !to-purple-600"
                          } ${isProcessing ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
                        >
                          <Image
                            src={isFollowing ? StarIcon2 : StarIcon}
                            width={20}
                            height={20}
                            className="size-5"
                            alt="rating"
                          />

                          <span className="font-medium">
                            {isProcessing 
                              ? "..." 
                              : isFollowing === true 
                                ? "Following" 
                                : "Follow"
                            }
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-2 flex items-center justify-center gap-x-1 bg-gradient-to-r !from-blue-500 !to-purple-600 text-center text-sm rounded-lg mt-4"
                        onClick={() => router.push(`/Profile/${viewingUserId}/editprofile`)}
                      >
                        <BiPencil />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
                    </div>
          )}
                    </div>
                  </div>
      <div className="mx-4 sm:max-w-xl">
        <Tabs
          tabs={[
            {
              id: "posts",
              icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              count: userPosts.length,
              content: (
              <div>
                  {/* 🔒 SAFETY: Only show posts belonging to the specific user being viewed */}
                  {isLoadingPosts ? (
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <div key={index} className="aspect-square bg-gray-800 rounded-sm animate-pulse">
                          <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <Skeleton height="100%" className="rounded-sm" />
                          </SkeletonTheme>
                        </div>
                      ))}
                  </div>
                  ) : userPosts.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No posts yet</p>
                      {viewingUserId === loggedInUserId ? (
                        <div>
                          <p className="text-sm mb-2">Share your first post with your followers</p>
                          <button 
                            onClick={() => router.push('/upload')}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
                          >
                            Create Post
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm">Posts will appear here when created</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
  {userPosts.map((post) => {
    const { src, postType, pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(post);
    
    return (
      <div
        key={post._id}
        className="relative aspect-square group cursor-pointer rounded-sm overflow-hidden bg-black"
        onClick={() => { 
           const postId = post._id || post.postid || post.id;
           setClickedPostId(postId);
          setShowPostModal(true); 
        }}
      >
        {/* Image Post */}
        {postType === "image" && src && (
          <img
            src={src}
            alt={post?.content || "post image"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement & { dataset: any };
              // First fallback: switch to path URL on same base
              if (!img.dataset.fallback1 && pathUrlPrimary) {
                img.dataset.fallback1 = "1";
                img.src = pathUrlPrimary;
                return;
              }
              // Second fallback: try query on PROD base
              if (!img.dataset.fallback2 && queryUrlFallback) {
                img.dataset.fallback2 = "1";
                img.src = queryUrlFallback;
                return;
              }
              // Final fallback: try path on PROD base
              if (!img.dataset.fallback3 && pathUrlFallback) {
                img.dataset.fallback3 = "1";
                img.src = pathUrlFallback;
              }
            }}
          />
        )}
        
        {/* Video Post */}
        {postType === "video" && src && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
            <video
              src={src}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              onError={(e) => {
                const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                // First fallback: switch to path URL on same base
                if (!video.dataset.fallback1 && pathUrlPrimary) {
                  video.dataset.fallback1 = "1";
                  video.src = pathUrlPrimary;
                  video.load();
                  return;
                }
                // Second fallback: try query on PROD base
                if (!video.dataset.fallback2 && queryUrlFallback) {
                  video.dataset.fallback2 = "1";
                  video.src = queryUrlFallback;
                  video.load();
                  return;
                }
                // Final fallback: try path on PROD base
                if (!video.dataset.fallback3 && pathUrlFallback) {
                  video.dataset.fallback3 = "1";
                  video.src = pathUrlFallback;
                  video.load();
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
        
        {/* Text Post or No Media */}
        {(!src || postType === "text") && (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <span className="text-center text-white text-base font-semibold line-clamp-2">{post.content}</span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-white text-center p-2">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{formatNumber(post.totalLikes || post.likeCount || post.likes?.length || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{formatNumber(post.commentCount || post.comments?.length || 0)}</span>
              </div>
            </div>
            <p className="text-xs line-clamp-2">{post.content}</p>
          </div>
        </div>
      </div>
    );
  })}
</div>
                  )}
                </div>
              ),
            },
            {
              id: "exclusive",
              icon: ({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              count: 0,
              content: (
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    <p>No exclusive content yet</p>
                    <p className="text-sm">Exclusive content will appear here</p>
                    </div>
                </div>
              ),
            },
            // Show reviews tab for all users (both creator and fan ratings)
            {
              id: "reviews",
              icon: ({ className }: { className?: string }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ),
              count: totalRatings + totalFanRatings,
              content: (
                <div className="space-y-4 py-4">
                  {/* Combined Rating Summary */}
                  {(totalRatings > 0 || totalFanRatings > 0) && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-white">
                            {((totalRatings * averageRating + totalFanRatings * averageFanRating) / (totalRatings + totalFanRatings)).toFixed(1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => {
                                const combinedAverage = (totalRatings * averageRating + totalFanRatings * averageFanRating) / (totalRatings + totalFanRatings);
                                return (
                                <svg 
                                  key={i} 
                                    className={`w-5 h-5 ${i < Math.floor(combinedAverage) ? "text-yellow-400" : "text-gray-600"}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                );
                              })}
                            </div>
                            <p className="text-gray-400 text-sm">Based on {totalRatings + totalFanRatings} review{(totalRatings + totalFanRatings) !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Reviews List - Combined */}
                  {(ratings_stats === "loading" || fanRatings_stats === "loading") ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-gray-900 rounded-lg p-4 animate-pulse">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full mr-3" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
                              <div className="h-3 bg-gray-700 rounded w-16" />
                            </div>
                          </div>
                          <div className="h-4 bg-gray-700 rounded w-full mb-2" />
                          <div className="h-4 bg-gray-700 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : (ratings.length === 0 && fanRatings.length === 0) ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p>No reviews yet</p>
                      <p className="text-sm">Reviews will appear here when users rate their experiences</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      
                      {/* Fan-to-Creator Ratings */}
                      {ratings.map((review) => (
                        <div key={`fan-to-creator-${review._id || review.requestId}`} className="bg-gray-900 rounded-lg p-4 flex flex-col relative">
                          {/* VIP Badge for fan reviewer - on main container */}
                          {review.fanIsVip && (
                            <VIPBadge 
                              size="lg" 
                              className="absolute top-3 left-9 z-[1]"
                              isVip={review.fanIsVip} 
                              vipEndDate={review.fanVipEndDate} 
                            />
                          )}
                        <div className="flex items-center mb-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 ">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black">
                              {(() => {
                                const profileImage = review.fanPhoto;
                                const userName = review.fanName;
                                const initials = userName.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                                
                                if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                  return (
                                    <Image 
                                      src={profileImage} 
                                      alt={review.fanName} 
                                      width={40} 
                                      height={40} 
                                      className="w-full h-full object-cover"
                                    />
                                  );
                                }
                                
                                return (
                                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                                    {initials}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {review.fanNickname && (
                                <p className="text-gray-400 text-sm">{review.fanNickname}</p>
                              )}
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Fan</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-gray-400 text-xs flex items-center gap-1 ml-2">
                                {review.hostType} • {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300">{review.feedback}</p>
                      </div>
                      ))}

                      {/* Creator-to-Fan Ratings */}
                      {fanRatings.map((rating) => (
                        <div key={`creator-to-fan-${rating._id || rating.requestId}`} className="bg-gray-900 rounded-lg p-4 flex flex-col relative">
                          {/* VIP Badge for creator reviewer - on main container */}
                          {rating.creatorIsVip && (
                            <VIPBadge 
                              size="lg" 
                              className="absolute top-2 left-9 z-[1]" 
                              isVip={rating.creatorIsVip} 
                              vipEndDate={rating.creatorVipEndDate} 
                            />
                          )}
                          <div className="flex items-center mb-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-green-500 to-teal-600 p-0.5 ">
                              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                {(() => {
                                  const profileImage = rating.creatorPhoto;
                                  const userName = rating.creatorName;
                                  const initials = userName.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                                  
                                  if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                    return (
                                      <Image 
                                        src={profileImage} 
                                        alt={rating.creatorName} 
                                        width={40} 
                                        height={40} 
                                        className="w-full h-full object-cover"
                                      />
                                    );
                                  }
                                  
                                  return (
                                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                                      {initials}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {rating.creatorNickname && (
                                  <p className="text-gray-400 text-sm">{rating.creatorNickname}</p>
                                )}
                                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Creator</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg 
                                    key={i} 
                                    className={`w-4 h-4 ${i < rating.rating ? "text-yellow-400" : "text-gray-600"}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-gray-400 text-xs flex items-center gap-1 ml-2">
                                  {rating.hostType} • {new Date(rating.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300">{rating.feedback}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            }
          ]}
        />
      </div>
    </div>
  );
};

export default Profile;