"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaCompass, FaTimes } from "react-icons/fa";
import { URL as API_BASE } from "@/api/config";
const PROD_BASE = process.env.NEXT_PUBLIC_API || "";
const RENDER_BASE = "https://mmekoapi.onrender.com";
import { useRouter, useSearchParams } from "next/navigation";
import { getImageSource } from "@/lib/imageUtils";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
import { follow as followThunk, unfollow as unfollowThunk, getfollow } from "@/store/profile";
import PostActions from "@/components/home/PostActions";
import { toast } from "material-react-toastify";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import ExpandableText from "@/components/ExpandableText";
import { generateInitials } from "@/utils/generateInitials";
import VIPBadge from "@/components/VIPBadge";
import { useAuthToken } from "@/lib/hooks/useAuthToken";

interface UserWithFans {
  userId: string;
  name: string;
  username: string;
  photoLink: string;
  followersCount?: number;
  isCreator: boolean;
  creatorPortfolioId: string | null;
  hosttype?: string | null;
  resultType?: 'user' | 'creator'; // Distinguish between user and creator entries
  isVip?: boolean;
  vipEndDate?: string | null;
}

interface CreatorWithViews {
  creatorId: string;
  userId: string;
  name: string;
  hosttype: string;
  displayImage: string;
  viewsCount: number;
  price: number;
  location: string;
  isVip?: boolean;
  vipEndDate?: string | null;
}

interface PostWithHashtag {
  postId: string;
  _id?: string;
  postid?: string;
  id?: string;
  userId: string;
  userid?: string;
  content: string;
  postfilelink?: string;
  postphoto?: string;
  postvideo?: string;
  posttype: string;
  type?: string;
  hashtags: string[];
  createdAt: string;
  created_at?: string;
  user: {
    name: string;
    firstname?: string;
    lastname?: string;
    username: string;
    photoLink: string;
    photolink?: string;
    isVip?: boolean;
    vipEndDate?: string;
  };
  likeCount?: number;
  likedBy?: string[];
  comments?: unknown[];
  commentCount?: number;
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DiscoverPageContent />
    </Suspense>
  );
}

function DiscoverPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashtagParam = searchParams?.get('hashtag');
  const token = useAuthToken();
  const { firstname, lastname, username, photolink } = useSelector((s: RootState) => s.profile);
  const loggedInUserId = useSelector((s: RootState) => s.register.userID);
  const selfId = useSelector((s: RootState) => s.profile?.userId || s.profile?.creator_portfolio_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vipStatus = useSelector((s: RootState) => (s.profile as any)?.vipStatus);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [topFans, setTopFans] = useState<UserWithFans[]>([]);
  const [topViews, setTopViews] = useState<CreatorWithViews[]>([]);
  const [hashtagPosts, setHashtagPosts] = useState<PostWithHashtag[]>([]);
  const [searchUsers, setSearchUsers] = useState<UserWithFans[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchType, setSearchType] = useState<'hashtag' | 'user' | null>(null);
  const [ui, setUi] = useState<Record<string, {
    liked?: boolean;
    likeCount?: number;
    open?: boolean;
    comments?: unknown[];
    input?: string;
    loadingComments?: boolean;
    sending?: boolean;
    commentCount?: number;
    isFollowing?: boolean;
  }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    fetchDiscoverData();
  }, []);

  useEffect(() => {
    if (hashtagParam) {
      setSearchQuery(hashtagParam);
      searchHashtags(hashtagParam);
    }
  }, [hashtagParam]);

  const fetchDiscoverData = async () => {
    try {
      setLoading(true);
      const [fansRes, viewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/discover/top-fans?limit=10`),
        fetch(`${API_BASE}/api/discover/top-views?limit=20`)
      ]);

      if (fansRes.ok) {
        const fansData = await fansRes.json();
        setTopFans(fansData.users || []);
      }

      if (viewsRes.ok) {
        const viewsData = await viewsRes.json();
        setTopViews(viewsData.creators || []);
      }
    } catch (error) {
      console.error("Error fetching discover data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchHashtags = async (hashtag: string) => {
    try {
      setSearchLoading(true);
      setSearchType('hashtag');
      setSearchUsers([]); // Clear user results
      const response = await fetch(`${API_BASE}/api/discover/search-hashtags?hashtag=${encodeURIComponent(hashtag)}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        const posts = data.posts || [];
        setHashtagPosts(posts);
        
        // Initialize UI state with likes from backend (similar to home route)
        setUi(prev => {
          const newState = { ...prev };
          posts.forEach((post: PostWithHashtag) => {
            const postId = post?.postId || post?.postid || post?.id || post?._id;
            if (postId) {
              const likeCount = Number(post?.likeCount || 0);
              const likedByArr = Array.isArray(post?.likedBy) ? post.likedBy : [];
              const selfIdStr = String(loggedInUserId || selfId || "");
              const hasLiked = selfIdStr && likedByArr.includes(selfIdStr);
              
              // Only initialize if not already set (preserve user interactions)
              if (!newState[postId]) {
                newState[postId] = {
                  likeCount: likeCount,
                  liked: hasLiked,
                  commentCount: post?.commentCount || (Array.isArray(post?.comments) ? post.comments.length : 0),
                  comments: post?.comments || []
                };
              } else {
                // Update like info from backend if available
                newState[postId] = {
                  ...newState[postId],
                  likeCount: likeCount,
                  liked: hasLiked,
                  commentCount: post?.commentCount || newState[postId].commentCount || 0
                };
              }
            }
          });
          return newState;
        });
      }
    } catch (error) {
      console.error("Error searching hashtags:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchUsersByName = async (query: string) => {
    try {
      setSearchLoading(true);
      setSearchType('user');
      setHashtagPosts([]); // Clear hashtag results
      const response = await fetch(`${API_BASE}/api/discover/search-users?query=${encodeURIComponent(query)}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setSearchUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

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

  // Utility function to format relative time
  const formatRelativeTime = (timestamp: string | number | Date): string => {
    try {
      const now = new Date();
      let time: Date;
      
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
        return 'recently';
      }
      
      const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) return `${diffInMonths}mo ago`;
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears}y ago`;
    } catch {
      return 'recently';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      
      // Check if query starts with # (hashtag search)
      if (query.startsWith('#')) {
        const hashtag = query.replace(/^#/, '');
        router.push(`/discover?hashtag=${encodeURIComponent(hashtag)}`);
        searchHashtags(hashtag);
      } else {
        // User search by username or full name
        router.push(`/discover?search=${encodeURIComponent(query)}`);
        searchUsersByName(query);
      }
    }
  };

  // Handle search from URL params
  useEffect(() => {
    const searchParam = searchParams?.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      searchUsersByName(searchParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Discover</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 px-4 py-3">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search users or #hashtags"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Clear results when input is cleared
                  if (!value.trim()) {
                    setSearchType(null);
                    setHashtagPosts([]);
                    setSearchUsers([]);
                    router.push('/discover');
                  }
                }}
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
              <div className="flex items-center gap-2 ml-2">
                {searchType !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchType(null);
                      setHashtagPosts([]);
                      setSearchUsers([]);
                      router.push('/discover');
                    }}
                    className="text-red-500 hover:text-red-400 transition-colors p-1"
                    aria-label="Clear search"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="text-gray-400 hover:text-white transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Search"
                  >
                    <FaSearch className="text-lg" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tip: Type # to search hashtags, or search by username/full name
            </p>
          </form>
        </div>

        {/* User and Creator Search Results */}
        {searchType === 'user' && searchUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Users & Creators matching &quot;{searchQuery}&quot;
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {searchUsers.map((user, index) => {
                const isCreatorEntry = user.resultType === 'creator';
                const uniqueKey = `${user.userId}-${user.resultType || 'user'}-${index}`;
                const href = isCreatorEntry && user.creatorPortfolioId 
                  ? `/creators/${user.creatorPortfolioId}` 
                  : `/Profile/${user.userId}`;
                
                return (
                  <Link
                    key={uniqueKey}
                    href={href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      isCreatorEntry 
                        ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-600 hover:border-purple-500' 
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="relative">
                      <div className={`relative w-20 h-20 rounded-full overflow-hidden border-2 ${
                        isCreatorEntry ? 'border-purple-500' : 'border-gray-700'
                      }`}>
                        {(() => {
                          const profileImage = user.photoLink || "";
                          const initials = user.name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                          
                          if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                            const imageSource = getImageSource(profileImage, isCreatorEntry ? 'creator' : 'profile');
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
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold bg-gray-700">
                              {initials}
                            </div>
                          );
                        })()}
                      </div>
                      {/* VIP Badge */}
                      {(() => {
                        const isVipActive = user.isVip && user.vipEndDate && new Date(user.vipEndDate) > new Date();
                        return isVipActive && (
                          <VIPBadge size="xl" className="absolute -top-1 -right-2" isVip={user.isVip} vipEndDate={user.vipEndDate} />
                        );
                      })()}
                      {/* Creator Badge */}
                      {isCreatorEntry && (
                        <div className="absolute -bottom-1 -left-1 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Creator
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-center font-semibold truncate w-full">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate w-full">{user.username}</p>
                    {isCreatorEntry && user.hosttype && (
                      <p className="text-xs text-purple-400 truncate w-full">{user.hosttype}</p>
                    )}
                    {!isCreatorEntry && (
                      <p className="text-xs text-gray-500 truncate w-full">User</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* User Search - No Results */}
        {searchType === 'user' && !searchLoading && searchUsers.length === 0 && searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Users & Creators matching &quot;{searchQuery}&quot;
            </h2>
            <p className="text-gray-400">No users or creators found</p>
          </div>
        )}

        {/* Hashtag Search Results */}
        {(hashtagParam || searchType === 'hashtag') && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Posts with #{hashtagParam || searchQuery.replace(/^#/, '')}
            </h2>
            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : hashtagPosts.length === 0 ? (
              <p className="text-gray-400">No posts found with this hashtag</p>
            ) : (
              <div className="space-y-4 max-w-[30rem] mx-auto">
                {hashtagPosts.map((p: PostWithHashtag, idx: number) => {
                  let postType: string = p?.posttype || p?.type || "text";
                  if (!postType) {
                    if (p?.postfilelink || p?.postphoto) postType = "image";
                    else if (p?.postvideo) postType = "video";
                  }

                  const mediaRef =
                    p?.postfilelink ||
                    p?.postphoto ||
                    p?.postvideo ||
                    "";
                  const asString = typeof mediaRef === "string" ? mediaRef : "";
                  const imageSource = getImageSource(asString, 'post');
                  const src = imageSource.src;
                  
                  const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
                  const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
                  const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";

                  const combinedName = [p?.user?.firstname, p?.user?.lastname].filter(Boolean).join(" ");
                  let displayName =
                    p?.user?.name ||
                    combinedName ||
                    p?.user?.username ||
                    "User";
                  
                  const postAuthorId = p?.userId || p?.userid || "";
                  const isSelf = (
                    (loggedInUserId && postAuthorId && String(loggedInUserId) === String(postAuthorId)) ||
                    (selfId && postAuthorId && String(selfId) === String(postAuthorId))
                  );
                  if (isSelf && (!displayName || displayName === "User")) {
                    const selfCombined = [firstname, lastname].filter(Boolean).join(" ");
                    displayName = username || selfCombined || displayName;
                  }
                  const handleStr = p?.user?.username || "";

                  const likeCount = Number(p?.likeCount || 0);
                  const likedByArr = Array.isArray(p?.likedBy) ? p.likedBy : [];
                  const commentsArr: unknown[] = Array.isArray(p?.comments) ? p?.comments : [];
                  const commentCount = Array.isArray(commentsArr) ? commentsArr.length : Number(p?.commentCount || 0) || 0;

                  const idStr = (v: unknown) => (v == null ? undefined : String(v));
                  const selfIdStr = idStr(loggedInUserId) || idStr(selfId);
                  const liked = !!(selfIdStr && likedByArr.includes(selfIdStr));

                  const pid = p?.postId || p?.postid || p?.id || p?._id || idx;
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

                  // Video Component
                  const VideoComponent = ({ post, src, pathUrlPrimary, queryUrlFallback, pathUrlFallback }: {
                    post: PostWithHashtag;
                    src: string;
                    pathUrlPrimary?: string;
                    queryUrlFallback?: string;
                    pathUrlFallback?: string;
                  }) => {
                    const { videoRef, isPlaying, autoPlayBlocked, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
                      autoPlay: true,
                      muted: true,
                      loop: true,
                      postId: post?.postId || post?.postid || post?.id || post?._id || `post-${Math.random()}`
                    });
                    
                    const [showControls, setShowControls] = React.useState(false);
                    const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
                    const controlsTimerRef = React.useRef<NodeJS.Timeout | null>(null);
                    
                    React.useEffect(() => {
                      setShowControls(true);
                      const initialTimer = setTimeout(() => {
                        setShowControls(false);
                      }, 3000);
                      
                      return () => {
                        if (initialTimer) clearTimeout(initialTimer);
                        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
                      };
                    }, []);

                    return (
                      <div className="relative w-full h-[400px] rounded overflow-hidden">
                        {!isVideoLoaded && (
                          <div className="relative w-full h-[400px] rounded overflow-hidden bg-gray-700 animate-pulse">
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div 
                          className={`relative w-full h-full ${!isVideoLoaded ? 'opacity-0 absolute top-0 left-0' : 'opacity-100 transition-opacity duration-300'}`}
                          onMouseMove={() => {
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
                              const video = e.currentTarget as HTMLVideoElement & { dataset: Record<string, string> };
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
                          
                          {showControls && (
                            <div className="absolute bottom-3 right-3 z-10 transition-opacity duration-300 opacity-100">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMute();
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
                          
                          {(showControls || autoPlayBlocked) && (
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePlay();
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
                    );
                  };

                  return (
                    <div key={pid} className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
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
                                  p?.user?.photoLink || 
                                  p?.user?.photolink || 
                                  "";
                                
                                const userName = isSelf ? `${firstname} ${lastname}`.trim() : 
                                  `${p?.user?.firstname || ""} ${p?.user?.lastname || ""}`.trim();
                                
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
                              // Use post user VIP status (backend always includes it)
                              // For self posts, prefer Redux vipStatus if available, otherwise use post data
                              const userVipStatus = isSelf 
                                ? (vipStatus?.isVip ?? p?.user?.isVip ?? false)
                                : (p?.user?.isVip ?? false);
                              const userVipEndDate = isSelf
                                ? (vipStatus?.vipEndDate ?? p?.user?.vipEndDate ?? null)
                                : (p?.user?.vipEndDate ?? null);

                              // Check if post author is VIP
                              if (userVipStatus) {
                                return <VIPBadge size="xl" className="absolute -top-5 -right-5" isVip={userVipStatus} vipEndDate={userVipEndDate} />;
                              }

                              return null;
                            })()}
                          </div>
                          <div 
                            className="flex-1 cursor-pointer" 
                          >
                            <p className="font-medium text-white" onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/Profile/${postAuthorId}`);
                            }}>{displayName}</p>
                            <span className="text-gray-400 text-sm">{handleStr ? `${handleStr}` : ""}</span>
                          </div>
                        </div>
                      </div>

                      {p?.createdAt && (
                        <p className="my-3 text-gray-400 text-sm cursor-pointer">
                          {(() => {
                            const formatted = formatRelativeTime(p.createdAt);
                            if (formatted === 'Invalid time' || formatted === 'Unknown time') {
                              return 'recently';
                            }
                            return formatted;
                          })()}
                        </p>
                      )}
                      
                      {p?.content && (
                        <ExpandableText 
                          text={p.content}
                          maxLength={100}
                          className="my-2"
                        />
                      )}
                      
                      {postType == "image" && src && (
                        <div className="w-full max-h-[400px] relative rounded overflow-hidden">
                          <Image
                            src={src}
                            alt={p?.content || "post image"}
                            width={800}
                            height={400}
                            className="w-full h-[400px] object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            onClick={() => openModal(src)}
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement & { dataset: Record<string, string> };
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
                        <VideoComponent
                          post={p}
                          src={src}
                          pathUrlPrimary={pathUrlPrimary}
                          queryUrlFallback={queryUrlFallback}
                          pathUrlFallback={pathUrlFallback}
                        />
                      )}
                      
                      <PostActions
                        className="mt-3 border-t border-gray-700 pt-2"
                        starred={uiIsFollowing}
                        liked={uiLiked}
                        likeCount={uiLikeCount}
                        commentCount={displayCommentCount}
                        post={p}
                        onStar={async () => {
                          if (!loggedInUserId || !postAuthorId || !token) {
                            toast.error("Please log in to follow users");
                            return;
                          }

                          const currentUiState = ui[pid] || {};
                          const currentlyFollowing = currentUiState.isFollowing ?? false;

                          setUi(prev => ({
                            ...prev,
                            [pid]: {
                              ...prev[pid],
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
                              [pid]: {
                                ...prev[pid],
                                isFollowing: currentlyFollowing,
                              },
                            }));
                            
                            toast.error(`Failed to ${currentlyFollowing ? 'unfollow' : 'follow'}. Please try again.`);
                          }
                        }}
                        onLike={async () => {
                          const uid = String(loggedInUserId || selfId || "");
                          const localPid = p?.postId || p?.postid || p?.id || p?._id;
                          
                          if (!localPid || !token) {
                            toast.error("Please login to like posts");
                            return;
                          }
                          
                          const curr = ui[pid] || {};
                          const nextLiked = !(curr.liked ?? liked);
                          const currentCount = curr.likeCount ?? likeCount;
                          
                          setUi((prev) => ({
                            ...prev,
                            [pid]: {
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
                            
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            await (dispatch(postlike(likeData as any)) as any).unwrap();
                            
                            toast.success(nextLiked ? "Post liked!" : "Post unliked!");
                            
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('refreshfeed'));
                            }, 1000);
                            
                          } catch {
                            setUi((prev) => ({
                              ...prev,
                              [pid]: {
                                ...prev[pid],
                                liked: !nextLiked,
                                likeCount: currentCount,
                              },
                            }));
                            toast.error("Failed to update like. Please try again.");
                          }
                        }}
                        onComment={() => {
                          const localPid = p?.postId || p?.postid || p?.id || p?._id;
                          
                          if (!localPid) {
                            return;
                          }
                          
                          const currentUiState = ui[pid] || {};
                          const isCurrentlyOpen = currentUiState.open;
                          
                          setUi((prev) => ({
                            ...prev,
                            [pid]: { ...(prev[pid] || {}), open: !isCurrentlyOpen }
                          }));
                          
                          const curr = ui[pid];
                          
                          if (curr && Array.isArray(curr.comments) && curr.comments.length > 0) {
                            return;
                          }
                          
                          const shouldFetch = !(curr && Array.isArray(curr.comments));
                          
                          if (shouldFetch) {
                            setUi((prev) => ({
                              ...prev,
                              [pid]: { ...(prev[pid] || {}), loadingComments: true }
                            }));
                            
                            (dispatch(getpostcomment({ postid: localPid } as { postid: string })) as unknown as { unwrap: () => Promise<{ comment?: unknown[]; comments?: unknown[] }> })
                              .unwrap()
                              .then((res: { comment?: unknown[]; comments?: unknown[] }) => {
                                const arr = (res && (res.comment || res.comments)) || [];
                                
                                setUi((prev) => {
                                  const currentState = prev[pid] || {};
                                  return {
                                    ...prev,
                                    [pid]: { 
                                      ...currentState, 
                                      comments: arr, 
                                      loadingComments: false,
                                      commentCount: arr.length,
                                      liked: currentState.liked,
                                      likeCount: currentState.likeCount,
                                      isFollowing: currentState.isFollowing
                                    }
                                  };
                                });
                              })
                              .catch(() => {
                                setUi((prev) => ({
                                  ...prev,
                                  [pid]: { ...(prev[pid] || {}), loadingComments: false }
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
                                  .sort((a, b) => {
                                    const aRecord = a as Record<string, unknown>;
                                    const bRecord = b as Record<string, unknown>;
                                    
                                    const aVipEndDate = typeof aRecord?.vipEndDate === 'string' ? aRecord.vipEndDate : null;
                                    const bVipEndDate = typeof bRecord?.vipEndDate === 'string' ? bRecord.vipEndDate : null;
                                    const aIsVip = Boolean(aRecord?.isVip) && aVipEndDate && new Date(aVipEndDate) > new Date();
                                    const bIsVip = Boolean(bRecord?.isVip) && bVipEndDate && new Date(bVipEndDate) > new Date();
                                    
                                    if (aIsVip && !bIsVip) return -1;
                                    if (bIsVip && !aIsVip) return 1;
                                    
                                    const aTime = typeof aRecord?.commenttime === 'number' ? aRecord.commenttime :
                                                  typeof aRecord?.date === 'number' ? aRecord.date :
                                                  typeof aRecord?.createdAt === 'number' ? aRecord.createdAt :
                                                  typeof aRecord?.commenttime === 'string' ? new Date(aRecord.commenttime).getTime() :
                                                  typeof aRecord?.date === 'string' ? new Date(aRecord.date).getTime() :
                                                  typeof aRecord?.createdAt === 'string' ? new Date(aRecord.createdAt).getTime() : 0;
                                    
                                    const bTime = typeof bRecord?.commenttime === 'number' ? bRecord.commenttime :
                                                  typeof bRecord?.date === 'number' ? bRecord.date :
                                                  typeof bRecord?.createdAt === 'number' ? bRecord.createdAt :
                                                  typeof bRecord?.commenttime === 'string' ? new Date(bRecord.commenttime).getTime() :
                                                  typeof bRecord?.date === 'string' ? new Date(bRecord.date).getTime() :
                                                  typeof bRecord?.createdAt === 'string' ? new Date(bRecord.createdAt).getTime() : 0;
                                    
                                    return bTime - aTime;
                                  })
                                  .map((c, i) => {
                                    const cRecord = c as Record<string, unknown>;
                                    return (
                                      <div key={i} className="text-sm text-gray-200 flex items-start gap-2 relative">
                                        <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs overflow-hidden">
                                          {(() => {
                                            const profileImage = typeof cRecord?.commentuserphoto === 'string' ? cRecord.commentuserphoto :
                                                                 typeof cRecord?.photo === 'string' ? cRecord.photo :
                                                                 typeof cRecord?.photolink === 'string' ? cRecord.photolink :
                                                                 typeof cRecord?.photoLink === 'string' ? cRecord.photoLink : "";
                                            
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
                                                      let initialsText: string = typeof cRecord?.initials === 'string' ? cRecord.initials : '';
                                                      if (!initialsText) {
                                                        const firstName = typeof cRecord?.firstname === 'string' ? cRecord.firstname : '';
                                                        const lastName = typeof cRecord?.lastname === 'string' ? cRecord.lastname : '';
                                                        if (firstName || lastName) {
                                                          const nameParts = [firstName, lastName].filter(Boolean);
                                                          initialsText = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                                                        } else {
                                                          const username = typeof cRecord?.commentusername === 'string' ? cRecord.commentusername :
                                                                           typeof cRecord?.username === 'string' ? cRecord.username : 'U';
                                                          initialsText = username.charAt(0).toUpperCase();
                                                        }
                                                      }
                                                      fallbackDiv.textContent = initialsText;
                                                      parent.appendChild(fallbackDiv);
                                                    }
                                                  }}
                                                />
                                              );
                                            }
                                            
                                            return (
                                              <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-xs text-white font-medium">
                                                {(() => {
                                                  if (typeof cRecord?.initials === 'string') return cRecord.initials;
                                                  const firstName = typeof cRecord?.firstname === 'string' ? cRecord.firstname : '';
                                                  const lastName = typeof cRecord?.lastname === 'string' ? cRecord.lastname : '';
                                                  if (firstName || lastName) {
                                                    const nameParts = [firstName, lastName].filter(Boolean);
                                                    return nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                                                  }
                                                  const username = typeof cRecord?.commentusername === 'string' ? cRecord.commentusername :
                                                                   typeof cRecord?.username === 'string' ? cRecord.username : 'U';
                                                  return username.charAt(0).toUpperCase();
                                                })()}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                        
                                        {(() => {
                                          const isVip = Boolean(cRecord?.isVip);
                                          const vipEndDate = typeof cRecord?.vipEndDate === 'string' ? cRecord.vipEndDate : null;
                                          const isVipActive = isVip && vipEndDate && new Date(vipEndDate) > new Date();
                                          return isVipActive ? (
                                            <VIPBadge size="lg" className="absolute -top-3 left-3 z-10" isVip={isVip} vipEndDate={vipEndDate} />
                                          ) : null;
                                        })()}
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-300">
                                              {(() => {
                                                const firstname = typeof cRecord?.firstname === 'string' ? cRecord.firstname : '';
                                                const lastname = typeof cRecord?.lastname === 'string' ? cRecord.lastname : '';
                                                const combinedName = [firstname, lastname].filter(Boolean).join(" ");

                                                return combinedName ||
                                                  (typeof cRecord?.commentusername === 'string' ? cRecord.commentusername : '') ||
                                                  (typeof cRecord?.fullname === 'string' ? cRecord.fullname : '') ||
                                                  (typeof cRecord?.fullName === 'string' ? cRecord.fullName : '') ||
                                                  (typeof cRecord?.name === 'string' ? cRecord.name : '') ||
                                                  (typeof cRecord?.username === 'string' ? cRecord.username : '') ||
                                                  (typeof cRecord?.author === 'string' ? cRecord.author : '') ||
                                                  'User';
                                              })()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {(() => {
                                                const timestamp = cRecord?.commenttime || 
                                                                cRecord?.date || 
                                                                cRecord?.createdAt || 
                                                                cRecord?.timestamp;
                                                
                                                if (!timestamp) {
                                                  return 'Unknown time';
                                                }
                                                
                                                const formatted = formatRelativeTime(timestamp as string | number | Date);
                                                
                                                if (formatted === 'Invalid time' || formatted === 'Unknown time') {
                                                  return 'recently';
                                                }
                                                
                                                return formatted;
                                              })()}
                                            </span>
                                          </div>
                                          <div className="text-gray-200 mt-1">
                                            {typeof cRecord?.content === 'string' ? cRecord.content :
                                             typeof cRecord?.comment === 'string' ? cRecord.comment :
                                             String(cRecord)}
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
                                          ...((prev[pid]?.comments as unknown[]) || []),
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
                                        commentCount: ((prev[pid]?.comments as unknown[]) || []).length + 1,
                                      },
                                    }));
                                    const uid = String(loggedInUserId || selfId || "");
                                    const localPid = p?.postId || p?.postid || p?.id || p?._id;
                                    if (uid && localPid && token) {
                                      (dispatch(postcomment({ userid: uid, postid: localPid, content: text, token: token } as { userid: string; postid: string; content: string; token: string })) as unknown as { unwrap: () => Promise<unknown> })
                                        .unwrap()
                                        .then(() => {
                                          dispatch(getpostcomment({ postid: localPid } as { postid: string }))
                                            .unwrap()
                                            .then((commentRes: { comment?: unknown[]; comments?: unknown[] }) => {
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
                    </div>
                  );
                })}
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
              className="absolute top-16 right-1/3 bg-black hover:bg-opacity-30 text-white text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 z-10"
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !hashtagParam && !searchType && (
          <>
            {/* Top Fans Section - Horizontal Scrollable */}
            <div className="mb-8">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {topFans.length === 0 ? (
                  <p className="text-gray-400">No users found</p>
                ) : (
                  topFans.map((user) => (
                    <Link
                      key={user.userId}
                      href={user.isCreator && user.creatorPortfolioId 
                        ? `/Profile/${user.userId}` 
                        : `/Profile/${user.userId}`}
                      className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="relative">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700">
                          {(() => {
                            const profileImage = user.photoLink || "";
                            const initials = user.name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                            
                            if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                              const imageSource = getImageSource(profileImage, user.isCreator ? 'creator' : 'profile');
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
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold bg-gray-700">
                                {initials}
                              </div>
                            );
                          })()}
                        </div>
                        {/* VIP Badge */}
                        {(() => {
                          const isVipActive = user.isVip && user.vipEndDate && new Date(user.vipEndDate) > new Date();
                          return isVipActive && (
                            <VIPBadge size="xl" className="absolute -top-1 -right-2" isVip={user.isVip} vipEndDate={user.vipEndDate} />
                          );
                        })()}
                      </div>
                      <p className="text-sm text-center max-w-[80px] truncate">{user.name}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Creators with Most Views - Grid Layout */}
            <div>
  
              {topViews.length === 0 ? (
                <p className="text-gray-400">No creators found</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {topViews.map((creator) => (
                    <Link
                      key={creator.creatorId}
                      href={`/creators/${creator.creatorId}`}
                      className="relative group cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-gray-700">
                        {(() => {
                          const displayImage = creator.displayImage || "";
                          
                          if (displayImage && displayImage.trim() && displayImage !== "null" && displayImage !== "undefined") {
                            const imageSource = getImageSource(displayImage, 'creator');
                            
                            // Prepare fallback URLs (same as creator card)
                            const fallbackKey = imageSource.isStorj && imageSource.key 
                              ? imageSource.key 
                              : (displayImage || "");
                            
                            // Start with the proxy URL from getImageSource (query format with bucket)
                            const initialSrc = imageSource.src;
                            
                            // Fallback URLs in order of preference
                            const pathUrlPrimary = fallbackKey ? `${API_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
                            const queryUrlFallback = imageSource.isStorj && imageSource.key && imageSource.bucket
                              ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(imageSource.key)}&bucket=${imageSource.bucket}`
                              : (fallbackKey ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(fallbackKey)}` : "");
                            const pathUrlFallback = fallbackKey ? `${PROD_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
                            const renderQueryUrl = imageSource.isStorj && imageSource.key && imageSource.bucket
                              ? `${RENDER_BASE}/api/image/view?publicId=${encodeURIComponent(imageSource.key)}&bucket=${imageSource.bucket}`
                              : (fallbackKey ? `${RENDER_BASE}/api/image/view?publicId=${encodeURIComponent(fallbackKey)}` : "");
                            const renderPathUrl = fallbackKey ? `${RENDER_BASE}/api/image/view/${encodeURIComponent(fallbackKey)}` : "";
                            
                            return (
                              <>
                                <img
                                  alt={creator.name}
                                  src={initialSrc}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement & { dataset: Record<string, string> };
                                    
                                    // Try fallback URLs in sequence (same as creator card)
                                    if (!target.dataset.fallback1 && pathUrlPrimary && target.src !== pathUrlPrimary) {
                                      target.dataset.fallback1 = "1";
                                      target.src = pathUrlPrimary;
                                      return;
                                    }
                                    
                                    if (!target.dataset.fallback2 && queryUrlFallback && target.src !== queryUrlFallback) {
                                      target.dataset.fallback2 = "1";
                                      target.src = queryUrlFallback;
                                      return;
                                    }
                                    
                                    if (!target.dataset.fallback3 && pathUrlFallback && target.src !== pathUrlFallback) {
                                      target.dataset.fallback3 = "1";
                                      target.src = pathUrlFallback;
                                      return;
                                    }
                                    
                                    if (!target.dataset.fallback4 && renderQueryUrl && target.src !== renderQueryUrl) {
                                      target.dataset.fallback4 = "1";
                                      target.src = renderQueryUrl;
                                      return;
                                    }
                                    
                                    if (!target.dataset.fallback5 && renderPathUrl && target.src !== renderPathUrl) {
                                      target.dataset.fallback5 = "1";
                                      target.src = renderPathUrl;
                                      return;
                                    }
                                    
                                    // Try original Storj URL as last resort
                                    if (imageSource.isStorj && imageSource.originalUrl && target.src !== imageSource.originalUrl) {
                                      target.dataset.fallback6 = "1";
                                      target.src = imageSource.originalUrl;
                                      return;
                                    }
                                    
                                    // All fallbacks exhausted - show placeholder
                                    target.style.display = 'none';
                                    const nextElement = target.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.setProperty('display', 'flex');
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center" style={{ display: 'none' }}>
                                  <FaCompass className="text-4xl text-gray-600" />
                                </div>
                              </>
                            );
                          }
                          
                          return (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <FaCompass className="text-4xl text-gray-600" />
                            </div>
                          );
                        })()}
                        {/* VIP Badge */}
                        {(() => {
                          const isVipActive = creator.isVip && creator.vipEndDate && new Date(creator.vipEndDate) > new Date();
                          return isVipActive && (
                            <VIPBadge size="xxl" className="absolute -top-2 -left-2 z-10" isVip={creator.isVip} vipEndDate={creator.vipEndDate} />
                          );
                        })()}
                        {/* Overlay with name and hosttype */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white font-semibold text-sm">{creator.name}</p>
                          <p className="text-gray-300 text-xs">{creator.hosttype}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

