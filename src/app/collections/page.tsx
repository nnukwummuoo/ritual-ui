/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { MdShoppingBag, MdFavorite } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import { getcollection, deletecollection } from "@/store/profile";
import { remove_Crush } from "@/store/creatorSlice";
import { getImageSource } from "@/lib/imageUtils";
import { URL as API_BASE } from "@/api/config";
import axios from "axios";
import { X } from "lucide-react";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const PROD_BASE = process.env.NEXT_PUBLIC_API || "";

interface ImageCardProps {
  src: string;
  status: string;
  type: string;
  name: string;
  onClick?: () => void;
  isVideo?: boolean;
  pathUrlPrimary?: string;
  queryUrlFallback?: string;
  pathUrlFallback?: string;
}

// Custom Video Component (similar to ProfilePage)
const VideoComponent = React.memo(function VideoComponent({ 
  post, 
  src, 
  pathUrlPrimary, 
  queryUrlFallback, 
  pathUrlFallback 
}: {
  post: any;
  src: string;
  pathUrlPrimary?: string;
  queryUrlFallback?: string;
  pathUrlFallback?: string;
}) {
  const { videoRef, isPlaying, isVisible, autoPlayBlocked, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
    autoPlay: false,
    muted: true,
    loop: true,
    postId: post?._id || post?.postid || post?.id || `collection-video-${Math.random()}`
  });

  const [showControls, setShowControls] = React.useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const controlsTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setShowControls(true);
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded overflow-hidden">
      {!isVideoLoaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
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
        onClick={() => {
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
          onLoadedData={(e) => {
            const video = e.currentTarget as HTMLVideoElement;
            if (video.readyState >= 2) {
              setIsVideoLoaded(true);
            }
          }}
          onCanPlay={() => {
            setIsVideoLoaded(true);
          }}
          onLoadedMetadata={() => {
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

        {(showControls || autoPlayBlocked || !isPlaying) && (
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

const ImageCard: React.FC<ImageCardProps> = ({ 
  src, 
  status, 
  type, 
  name, 
  onClick, 
  isVideo = false,
  pathUrlPrimary: propPathUrlPrimary,
  queryUrlFallback: propQueryUrlFallback,
  pathUrlFallback: propPathUrlFallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSrc = Boolean(src);
  
  // Process image source similar to post components
  const mediaRef: any = src || "";
  const asString = typeof mediaRef === "string" ? mediaRef : (typeof mediaRef === "object" && mediaRef ? (mediaRef.publicId || mediaRef.public_id || mediaRef.url || "") : "");
  const imageSource = getImageSource(asString, 'post');
  const imageSrc = imageSource.src;
  
  // Fallback URLs similar to post components
  const pathUrlPrimary = propPathUrlPrimary || (asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "");
  const queryUrlFallback = propQueryUrlFallback || (asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "");
  const pathUrlFallback = propPathUrlFallback || (asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "");

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-lg bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      {!isLoaded && hasSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FaSpinner className="animate-spin text-white text-2xl" />
        </div>
      )}
      {hasSrc ? (
        <div className="relative w-full h-72">
          {isVideo ? (
            // Video thumbnail with play button overlay
            <>
              <video
                src={imageSrc}
                className={`w-full h-72 object-cover sm:rounded-xl transition-opacity duration-300 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                muted
                onLoadedData={() => setIsLoaded(true)}
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
                    return;
                  }
                }}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </>
          ) : (
            // Regular image
            <img
              src={imageSrc}
              alt="Preview"
              className={`w-full h-72 object-cover sm:rounded-xl transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
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
          )}
        </div>
      ) : (
        <div className="w-full h-72 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-slate-300">
          No image
        </div>
      )}
      {(isLoaded || !hasSrc) && (
        <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
          <BsThreeDotsVertical />
        </button>
      )}
      {(isLoaded || !hasSrc) && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${
              status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="text-white text-sm">{type}</span>
          <span className="text-white text-sm">{name}</span>
        </div>
      )}
    </div>
  );
};

type CollectionItem = Record<string, any>;
const Content: React.FC<{
  items: CollectionItem[];
  onDelete: (id: string) => void;
  onItemClick: (item: any) => void;
}> = ({ items, onDelete, onItemClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {items?.length ? (
        items.map((it: any, idx: number) => {
          const src = it.thumbnaillink || it.thumbnail || it.image || it.photolink || it.src || it.postfilelink || "";
          const name = it.contentname || it.name || it.title || "Content";
          const status = it.status || "active";
          const type = it.content_type || it.type || "premium";
          const id = it.id || it._id || it.contentid || it.contentId || String(idx);
          
          // Determine if it's a video
          const postType = it.posttype || it.type || it.content_type || "";
          const mediaSrc = it.postfilelink || it.thumbnaillink || it.thumbnail || it.image || it.photolink || it.src || "";
          const isVideoContent = postType === "video" || 
                                postType === "Video" || 
                                mediaSrc.includes(".mp4") || 
                                mediaSrc.includes(".webm") || 
                                mediaSrc.includes(".mov");
          
          // Get media source for fallback URLs
          const mediaRef: any = src || "";
          const asString = typeof mediaRef === "string" ? mediaRef : (typeof mediaRef === "object" && mediaRef ? (mediaRef.publicId || mediaRef.public_id || mediaRef.url || "") : "");
          const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
          const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
          const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
          
          return (
            <div key={id} className="relative">
              <ImageCard 
                src={src} 
                status={status} 
                type={type} 
                name={name}
                onClick={() => onItemClick(it)}
                isVideo={isVideoContent}
                pathUrlPrimary={pathUrlPrimary}
                queryUrlFallback={queryUrlFallback}
                pathUrlFallback={pathUrlFallback}
              />
              {!it.isExclusivePost && (
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(String(id));
                    }}
                    className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
              {it.isExclusivePost && it.price && (
                <div className="absolute top-2 right-2 bg-white text-gray-900 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-lg z-10">
                  <span>🪙</span>
                  {parseFloat(it.price).toFixed(2)}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center text-gray-400 py-10">No purchased content yet.</div>
      )}
    </div>
  );
};

const Crush: React.FC<{
  items: CollectionItem[];
  onRemove: (creator_portfolio_id: string) => void;
}> = ({ items, onRemove }) => {
  const router = useRouter();
  
  const handleCreatorClick = (creator: any) => {
    const creator_portfolio_id = creator.creator_portfolio_id || creator.creator_portfolio_id || creator.id || creator._id;
    if (creator_portfolio_id) {
      router.push(`/creators/${creator_portfolio_id}`);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-white text-center mb-6 text-2xl font-bold">
        💜 My Crush List
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.length ? (
          items.map((it: any, idx: number) => {
            const mediaRef = it.photolink || it.photo || it.image || it.src || "";
            const asString = typeof mediaRef === "string" ? mediaRef : (typeof mediaRef === "object" && mediaRef ? (mediaRef.publicId || mediaRef.public_id || (mediaRef as any).url || "") : "");
            
            // Use getImageSource for profile images
            const imageSource = getImageSource(asString, 'profile');
            const src = imageSource.src;
            
            // Fallback URLs similar to post components
            const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
            const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
            const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
            
            const name = it.creatorname || it.name || it.username || "Creator";
            const status = it.status || "active";
            const type = it.type || "standard";
            const creator_portfolio_id = it.creator_portfolio_id || it.creator_portfolio_id || it.id || it._id || String(idx);
            const location = it.location || "Unknown";
            const hosttype = it.hosttype || "Fan meet";
            
            return (
              <div 
                key={String(creator_portfolio_id)} 
                className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                onClick={() => handleCreatorClick(it)}
              >
                <div className="relative">
                  <img
                    src={src}
                    alt={name}
                    className="w-full h-48 object-cover"
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
                  
                  {/* Online Status */}
                  <div className="absolute top-3 right-3">
                    <div className={`w-3 h-3 rounded-full ${status === "active" ? "bg-green-500" : "bg-gray-400"}`}></div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(String(creator_portfolio_id));
                    }}
                    className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove from crush list"
                  >
                    ✕
                  </button>
                  
                  {/* Host Type Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {hosttype}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1 truncate">{name}</h3>
                  <p className="text-gray-400 text-sm mb-2">📍 {location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">
                      {status === "active" ? "🟢 Online" : "🔴 Offline"}
                    </span>
                    <span className="text-purple-400 text-sm font-medium">View Portfolio →</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Crush Yet</h3>
            <p className="text-gray-400 mb-6">Start adding creators to your crush list!</p>
            <button
              onClick={() => router.push('/creators')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Browse Creators
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"content" | "crush">("crush");
  const reduxUserid = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.refreshtoken);
  
  // Get userid and token from Redux or localStorage as fallback
  const [userid, setUserid] = useState<string>("");
  const [token, setToken] = useState<string>("");
  
  // Full-screen modal state
  const [fullScreenItem, setFullScreenItem] = useState<any | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  
  useEffect(() => {
    // Get userid
    if (reduxUserid) {
      setUserid(reduxUserid);
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setUserid(data?.userID || data?.userid || data?.id || "");
        }
      } catch (error) {
        console.error("Error getting userid from localStorage:", error);
      }
    }
    
    // Get token
    if (reduxToken) {
      setToken(reduxToken);
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setToken(data?.refreshtoken || data?.accesstoken || "");
        }
      } catch (error) {
        console.error("Error getting token from localStorage:", error);
      }
    }
  }, [reduxUserid, reduxToken]);
  const collectionstats = useSelector((s: RootState) => s.profile.collectionstats);
  const collection_error = useSelector((s: RootState) => s.profile.fllowmsg as string);
  const listofcontent = useSelector((s: RootState) => s.profile.listofcontent as any[]);
  const listofcrush = useSelector((s: RootState) => s.profile.listofcrush as any[]);
  
  // State for purchased exclusive posts
  const [purchasedExclusivePosts, setPurchasedExclusivePosts] = useState<any[]>([]);
  const [isLoadingExclusivePosts, setIsLoadingExclusivePosts] = useState(false);

  // Fetch purchased exclusive posts
  const fetchPurchasedExclusivePosts = React.useCallback(async () => {
    if (!userid || !token) return;
    
    setIsLoadingExclusivePosts(true);
    try {
      const response = await axios.post(`${API_BASE}/getPurchasedExclusivePosts`, {
        userid: userid,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.ok && response.data?.posts) {
        // Transform exclusive posts to match the content format
        const transformedPosts = response.data.posts.map((post: any) => ({
          ...post,
          thumbnaillink: post.postfilelink,
          contentname: post.content || "Exclusive Post",
          content_type: post.posttype || "exclusive",
          type: "exclusive",
          isExclusivePost: true,
        }));
        setPurchasedExclusivePosts(transformedPosts);
      }
    } catch (error) {
      console.error("Error fetching purchased exclusive posts:", error);
    } finally {
      setIsLoadingExclusivePosts(false);
    }
  }, [userid, token]);

  // Fetch collections when user is known
  useEffect(() => {
    if (userid && token) {
      dispatch(getcollection({ userid, token }));
      fetchPurchasedExclusivePosts();
    }
  }, [dispatch, userid, token, fetchPurchasedExclusivePosts]);

  // Combine regular content and exclusive posts, sorted by date (newest first)
  const allPurchasedContent = useMemo(() => {
    const combined = [...(listofcontent || []), ...purchasedExclusivePosts];
    // Sort by date (newest first)
    return combined.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.purchasedAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.purchasedAt || b.date || 0).getTime();
      return dateB - dateA; // Newest first
    });
  }, [listofcontent, purchasedExclusivePosts]);

  // Handle item click to open full-screen modal
  const handleItemClick = (item: any) => {
    // Determine if it's a video or image
    const postType = item.posttype || item.type || item.content_type || "";
    const mediaSrc = item.postfilelink || item.thumbnaillink || item.thumbnail || item.image || item.photolink || item.src || "";
    
    // Check if it's a video (exclusive posts have posttype, regular content might have type)
    const isVideoContent = postType === "video" || 
                          postType === "Video" || 
                          mediaSrc.includes(".mp4") || 
                          mediaSrc.includes(".webm") || 
                          mediaSrc.includes(".mov");
    
    setIsVideo(isVideoContent);
    setFullScreenItem(item);
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullScreenItem) {
        setFullScreenItem(null);
      }
    };

    if (fullScreenItem) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [fullScreenItem]);

  const getBtnStyle = (tab: "content" | "crush") =>
    activeTab === tab
      ? { backgroundColor: "#292d31", borderColor: "#d1d5db" }
      : { backgroundColor: "#18181b", borderColor: "#334155" };

  // Get media source for full-screen modal
  const getFullScreenMediaSrc = (item: any) => {
    const mediaRef = item.postfilelink || item.thumbnaillink || item.thumbnail || item.image || item.photolink || item.src || "";
    const asString = typeof mediaRef === "string" ? mediaRef : (typeof mediaRef === "object" && mediaRef ? (mediaRef.publicId || mediaRef.public_id || (mediaRef as any).url || "") : "");
    const imageSource = getImageSource(asString, isVideo ? 'post' : 'post');
    return {
      src: imageSource.src,
      asString,
      pathUrlPrimary: asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "",
      queryUrlFallback: asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "",
      pathUrlFallback: asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "",
    };
  };

  return (
    <div
      className="h-screen overflow-y-scroll bg-[#0e0f2a] text-white"
      style={{ scrollbarGutter: "stable both-edges" }}
    >
      <div className="w-full max-w-2xl mx-auto pt-16 px-4">
        <div className="w-full flex flex-col text-gray-400">
          {/* Sticky Tab Buttons */}
          <div className="sticky z-8 top-0 bg-[#0e0f2a] pb-4">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                className="flex items-center justify-center gap-2 border-2 transition-all duration-200 ease-in-out text-white py-3 px-4 rounded-lg font-medium w-full shadow-sm hover:shadow-md text-sm sm:text-base"
                style={getBtnStyle("content")}
                onClick={() => setActiveTab("content")}
              >
                <MdShoppingBag className="text-xl" />
                Purchased Content
              </button>
              <button
                className="flex items-center justify-center gap-2 border-2 transition-all duration-200 ease-in-out text-white py-3 px-4 rounded-lg font-medium w-full shadow-sm hover:shadow-md text-sm sm:text-base"
                style={getBtnStyle("crush")}
                onClick={() => setActiveTab("crush")}
              >
                <MdFavorite className="text-xl" />
                Crush List
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-6">
            {/* Loading */}
            {(collectionstats === "loading" || isLoadingExclusivePosts) && (
              <div className="flex items-center justify-center py-10 text-gray-300">
                <FaSpinner className="animate-spin mr-2" /> Loading collections...
              </div>
            )}

            {/* Error Banner */}
            {collectionstats === "failed" && (
              <div className="mb-3 rounded border border-red-500 bg-red-900/30 text-red-300 p-3 text-sm">
                {collection_error || "Failed to load collections."}
              </div>
            )}

            {/* Data */}
            {collectionstats !== "loading" && !isLoadingExclusivePosts && (
              activeTab === "content" ? (
                <Content
                  items={allPurchasedContent}
                  onDelete={async (id) => {
                    try {
                      // Check if it's an exclusive post (can't delete, only regular content can be deleted)
                      const item = allPurchasedContent.find((it: any) => String(it._id || it.id) === String(id));
                      if (item?.isExclusivePost) {
                        // Exclusive posts are permanent purchases, can't be deleted
                        return;
                      }
                      await dispatch(deletecollection({ userid, token, contentid: id })).unwrap();
                      await dispatch(getcollection({ userid, token }));
                    } catch (e) {
                      // noop: error banner above will show via fllowmsg/collectionstats if needed
                    }
                  }}
                  onItemClick={handleItemClick}
                />
              ) : (
                <Crush
                  items={listofcrush || []}
                  onRemove={async (creator_portfolio_id) => {
                    try {
                      await dispatch(remove_Crush({ userid, token, creator_portfolio_id })).unwrap();
                      await dispatch(getcollection({ userid, token }));
                    } catch (e) {
                      // noop
                    }
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {fullScreenItem && !isVideo && (
        <div 
          className="fixed inset-0 z-[99999] bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setFullScreenItem(null)}
          style={{ zIndex: 99999 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFullScreenItem(null);
            }}
            className="absolute top-4 right-4 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all duration-200 hover:scale-110"
            aria-label="Close full screen image"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const { src, pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getFullScreenMediaSrc(fullScreenItem);
              return (
                <>
                  <div className="fullscreen-skeleton absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse">
                    <SkeletonTheme baseColor="#202020" highlightColor="#444">
                      <Skeleton height="80vh" width="80vw" className="rounded" />
                    </SkeletonTheme>
                  </div>
                  <img
                    src={src || ''}
                    alt={fullScreenItem.contentname || fullScreenItem.name || "Full screen content"}
                    className="max-w-full max-h-full object-contain relative z-10"
                    onLoad={(e) => {
                      const skeleton = (e.currentTarget as HTMLElement).parentElement?.querySelector('.fullscreen-skeleton');
                      if (skeleton) {
                        (skeleton as HTMLElement).style.display = 'none';
                      }
                    }}
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
                      img.style.display = 'none';
                    }}
                  />
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Full-Screen Video Modal */}
      {fullScreenItem && isVideo && (
        <div 
          className="fixed inset-0 z-[99999] bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setFullScreenItem(null)}
          style={{ zIndex: 99999 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFullScreenItem(null);
            }}
            className="absolute top-4 right-4 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all duration-200 hover:scale-110"
            aria-label="Close full screen video"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const { src, pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getFullScreenMediaSrc(fullScreenItem);
              return (
                <div className="w-full max-w-6xl">
                  <VideoComponent
                    post={fullScreenItem}
                    src={src || ''}
                    pathUrlPrimary={pathUrlPrimary}
                    queryUrlFallback={queryUrlFallback}
                    pathUrlFallback={pathUrlFallback}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
