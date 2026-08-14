/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import { getcollection, deletecollection } from "@/store/profile";
import { remove_Crush } from "@/store/creatorSlice";
import { getImageSource } from "@/lib/imageUtils";
import { URL as API_BASE } from "@/api/config";
import axios from "axios";
import { X, Lock, Play, Trash2, Sparkles, ShoppingBag, Heart } from "lucide-react";
import { useVideoAutoPlay } from "@/hooks/useVideoAutoPlayNew";
import { CreatorCard } from "@/app/creators/_components/card";
const PROD_BASE = process.env.NEXT_PUBLIC_API || "";

// ── Video player used inside the fullscreen lightbox ──────────────────────
const VideoComponent = React.memo(function VideoComponent({
  post,
  src,
  pathUrlPrimary,
  queryUrlFallback,
  pathUrlFallback,
}: {
  post: any;
  src: string;
  pathUrlPrimary?: string;
  queryUrlFallback?: string;
  pathUrlFallback?: string;
}) {
  const { videoRef, isPlaying, autoPlayBlocked, togglePlay, toggleMute, isMuted } = useVideoAutoPlay({
    autoPlay: false,
    muted: true,
    loop: true,
    postId: post?._id || post?.postid || post?.id || `collection-video-${Math.random()}`,
  });

  const [showControls, setShowControls] = React.useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const controlsTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  const kickControlsTimer = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div className="relative w-full max-h-[80vh] rounded-lg overflow-hidden bg-black">
      {!isVideoLoaded && (
        <div className="absolute inset-0 w-full h-full bg-[#111624] animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <Play className="w-7 h-7 text-gray-400" fill="currentColor" />
          </div>
        </div>
      )}

      <div
        className={`relative w-full ${!isVideoLoaded ? "opacity-0 absolute top-0 left-0" : "opacity-100 transition-opacity duration-300"}`}
        onMouseMove={kickControlsTimer}
        onClick={() => {
          togglePlay();
          kickControlsTimer();
        }}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className="w-full max-h-[80vh] object-contain cursor-pointer"
          onLoadedData={(e) => {
            const video = e.currentTarget as HTMLVideoElement;
            if (video.readyState >= 2) setIsVideoLoaded(true);
          }}
          onCanPlay={() => setIsVideoLoaded(true)}
          onLoadedMetadata={() => setIsVideoLoaded(true)}
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
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
                kickControlsTimer();
              }}
              className="bg-black/70 rounded-full p-2.5 hover:bg-black/90 transition-all hover:scale-110"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
          </div>
        )}

        {(showControls || autoPlayBlocked || !isPlaying) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
                kickControlsTimer();
              }}
              className={`bg-black/70 rounded-full p-4 hover:bg-black/90 hover:scale-110 cursor-pointer transition-all ${autoPlayBlocked ? "animate-pulse" : ""}`}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <Play className="w-7 h-7 text-white" fill="white" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Purchased-content tile — same visual language as the exclusive grid ──
type CollectionItem = Record<string, any>;

const PurchasedTile: React.FC<{
  item: CollectionItem;
  onDelete: (id: string) => void;
  onClick: () => void;
}> = ({ item, onDelete, onClick }) => {
  const mediaSrc = item.postfilelink || item.thumbnaillink || item.thumbnail || item.image || item.photolink || item.src || "";
  const postType = item.posttype || item.type || item.content_type || "";
  const isVideoContent =
    postType === "video" || postType === "Video" || mediaSrc.includes(".mp4") || mediaSrc.includes(".webm") || mediaSrc.includes(".mov");

  const asString = typeof mediaSrc === "string" ? mediaSrc : "";
  const imageSource = getImageSource(asString, "post");
  const src = imageSource.src || asString;

  const [deleting, setDeleting] = useState(false);
  const price = item.isExclusivePost && item.price ? parseFloat(item.price) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-black border border-white/10 cursor-pointer group"
    >
      {isVideoContent ? (
        <video src={src} className="w-full h-full object-cover" muted />
      ) : (
        <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/postfall.jpg"; }} />
      )}

      {isVideoContent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <Play className="w-6 h-6 text-white" fill="white" />
        </div>
      )}

      {price !== null && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#f5c451] rounded-full px-2.5 py-1">
          <span className="text-[12px]">🪙</span>
          <span className="text-black text-[12px] font-bold">{price.toFixed(2)}</span>
        </div>
      )}

      {!item.isExclusivePost && (
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            setDeleting(true);
            await onDelete(String(item.id || item._id || item.contentid || item.contentId));
            setDeleting(false);
          }}
          disabled={deleting}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
          aria-label="Remove from collection"
        >
          {deleting ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
};

const Content: React.FC<{
  items: CollectionItem[];
  onDelete: (id: string) => void;
  onItemClick: (item: any) => void;
}> = ({ items, onDelete, onItemClick }) => {
  if (!items?.length) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7 text-gray-600" />
        </div>
        <p className="text-gray-300 font-semibold">No purchased content yet</p>
        <p className="text-sm text-gray-500 mt-1">Content you unlock from creators will show up here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it: any, idx: number) => {
        const id = it.id || it._id || it.contentid || it.contentId || String(idx);
        return (
          <PurchasedTile
            key={id}
            item={it}
            onDelete={onDelete}
            onClick={() => onItemClick(it)}
          />
        );
      })}
    </div>
  );
};

// ── Crush list — reuses the exact same card used on the creators page ────
const Crush: React.FC<{
  items: CollectionItem[];
  onRemove: (creator_portfolio_id: string) => void;
}> = ({ items, onRemove }) => {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!items?.length) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-gray-600" />
        </div>
        <p className="text-gray-300 font-semibold">No crush yet</p>
        <p className="text-sm text-gray-500 mt-1 mb-5">Start adding creators to your crush list!</p>
        <button
          onClick={() => router.push("/creators")}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Browse Creators
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((it: any, idx: number) => {
        const creator_portfolio_id = it.creator_portfolio_id || it.id || it._id || String(idx);
        const hostid = it.hostid || it.creator_portfolio_id || it.id || it._id;
        const key = String(creator_portfolio_id) + idx;

        return (
          <div key={key} className="relative group">
            <CreatorCard
              photolink={it.photolink || it.photo || it.image || it.src || null}
              hosttype={it.hosttype || "Fan meet"}
              name={it.creatorname || it.name || it.username || "Creator"}
              age={it.age || 0}
              gender={it.gender || ""}
              location={it.location || "Unknown"}
              interest={it.interest || []}
              amount={it.amount || 0}
              creator_portfolio_id={String(creator_portfolio_id)}
              userid={it.userid || ""}
              createdAt={it.createdAt || ""}
              hostid={String(hostid)}
              isOnline={it.status === "active"}
            />

            {/* Remove-from-crush button, overlaid on top of the shared card */}
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                setRemovingId(key);
                await onRemove(String(creator_portfolio_id));
                setRemovingId(null);
              }}
              disabled={removingId === key}
              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all disabled:opacity-70"
              aria-label="Remove from crush list"
              title="Remove from crush list"
            >
              {removingId === key ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"content" | "crush">("crush");
  const reduxUserid = useSelector((s: RootState) => s.register.userID);
  const reduxToken = useSelector((s: RootState) => s.register.accesstoken);

  const [userid, setUserid] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const [fullScreenItem, setFullScreenItem] = useState<any | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    if (reduxUserid) {
      setUserid(reduxUserid);
    } else {
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

    if (reduxToken) {
      setToken(reduxToken);
    } else {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          setToken(data?.accesstoken || data?.refreshtoken || "");
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

  const [purchasedExclusivePosts, setPurchasedExclusivePosts] = useState<any[]>([]);
  const [isLoadingExclusivePosts, setIsLoadingExclusivePosts] = useState(false);

  const fetchPurchasedExclusivePosts = React.useCallback(async () => {
    if (!userid || !token) return;

    setIsLoadingExclusivePosts(true);
    try {
      const response = await axios.post(
        `${API_BASE}/getPurchasedExclusivePosts`,
        { userid: userid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.ok && response.data?.posts) {
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

  useEffect(() => {
    if (userid && token) {
      dispatch(getcollection({ userid, token }));
      fetchPurchasedExclusivePosts();
    }
  }, [dispatch, userid, token, fetchPurchasedExclusivePosts]);

  const allPurchasedContent = useMemo(() => {
    const combined = [...(listofcontent || []), ...purchasedExclusivePosts];
    return combined.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.purchasedAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.purchasedAt || b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [listofcontent, purchasedExclusivePosts]);

  const handleItemClick = (item: any) => {
    const postType = item.posttype || item.type || item.content_type || "";
    const mediaSrc = item.postfilelink || item.thumbnaillink || item.thumbnail || item.image || item.photolink || item.src || "";

    const isVideoContent =
      postType === "video" || postType === "Video" || mediaSrc.includes(".mp4") || mediaSrc.includes(".webm") || mediaSrc.includes(".mov");

    setIsVideo(isVideoContent);
    setFullScreenItem(item);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullScreenItem) {
        setFullScreenItem(null);
      }
    };

    if (fullScreenItem) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [fullScreenItem]);

  const getFullScreenMediaSrc = (item: any) => {
    const mediaRef = item.postfilelink || item.thumbnaillink || item.thumbnail || item.image || item.photolink || item.src || "";
    const asString = typeof mediaRef === "string" ? mediaRef : "";
    const imageSource = getImageSource(asString, "post");
    return {
      src: imageSource.src,
      asString,
      pathUrlPrimary: asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "",
      queryUrlFallback: asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "",
      pathUrlFallback: asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "",
    };
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <div className="w-full max-w-2xl mx-auto pt-14 px-4 pb-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-white">My Collection</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Everything you've unlocked and everyone you're crushing on.</p>
        </div>

        {/* Segmented tab control */}
        <div className="sticky z-10 top-0 bg-[#080b14] pb-5 pt-1 -mt-1">
          <div className="relative flex bg-white/[0.04] border border-white/10 rounded-full p-1">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] transition-transform duration-300 ease-out"
              style={{ transform: activeTab === "crush" ? "translateX(0%)" : "translateX(calc(100% + 8px))" }}
            />
            <button
              type="button"
              onClick={() => setActiveTab("crush")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[13.5px] font-semibold transition-colors ${
                activeTab === "crush" ? "text-white" : "text-gray-400"
              }`}
            >
              <Heart className="w-4 h-4" />
              Crush List
              {listofcrush?.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "crush" ? "bg-white/20" : "bg-white/10"}`}>
                  {listofcrush.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[13.5px] font-semibold transition-colors ${
                activeTab === "content" ? "text-white" : "text-gray-400"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Purchased
              {allPurchasedContent?.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "content" ? "bg-white/20" : "bg-white/10"}`}>
                  {allPurchasedContent.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div>
          {(collectionstats === "loading" || isLoadingExclusivePosts) && (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <FaSpinner className="animate-spin" />
              <span className="text-sm">Loading your collection...</span>
            </div>
          )}

          {collectionstats === "failed" && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 p-3.5 text-sm">
              {collection_error || "Failed to load collections."}
            </div>
          )}

          {collectionstats !== "loading" && !isLoadingExclusivePosts && (
            activeTab === "content" ? (
              <Content
                items={allPurchasedContent}
                onDelete={async (id) => {
                  try {
                    const item = allPurchasedContent.find((it: any) => String(it._id || it.id) === String(id));
                    if (item?.isExclusivePost) return;
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

      {/* Fullscreen lightbox — matches the exclusive-content viewer exactly */}
      {fullScreenItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullScreenItem(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFullScreenItem(null);
            }}
            className="absolute top-16 right-1/3 bg-black hover:bg-opacity-30 text-white text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 z-10"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="relative max-w-full max-h-full lg:max-w-[33.333%] lg:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const { src, pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getFullScreenMediaSrc(fullScreenItem);
              return isVideo ? (
                <VideoComponent
                  post={fullScreenItem}
                  src={src || ""}
                  pathUrlPrimary={pathUrlPrimary}
                  queryUrlFallback={queryUrlFallback}
                  pathUrlFallback={pathUrlFallback}
                />
              ) : (
                <img
                  src={src || ""}
                  alt={fullScreenItem.contentname || fullScreenItem.name || "Purchased content"}
                  className="max-w-full max-h-full object-contain rounded-lg"
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
              );
            })()}
            {fullScreenItem.contentname && fullScreenItem.contentname !== "Exclusive Post" && (
              <p className="text-gray-300 text-sm mt-3 text-center">{fullScreenItem.contentname}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;