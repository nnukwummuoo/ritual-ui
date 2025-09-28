"use client";
import React, { useEffect, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchposts, getallpost, hydrateFromCache } from "@/store/post";
import { getprofile, follow as followThunk, unfollow as unfollowThunk } from "@/store/profile";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
import { URL as API_BASE } from "@/api/config";
const PROD_BASE = "https://mmekoapi.onrender.com"; // fallback when local proxy is down
import PostSkeleton from "../PostSkeleton";
import PostActions from "./PostActions";
import { toast } from "material-react-toastify";
import {useRouter} from "next/navigation"
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Example icons

export default function PostsCard({ type }: { type?: "video" | "image" | "text" }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((s: RootState) => s.post.poststatus);
  const posts = useSelector((s: RootState) => s.post.allPost as any[]);
  const loggedInUserId = useSelector((s: RootState) => s.register.userID);
  const authToken = useSelector((s: RootState) => s.register.refreshtoken || s.register.accesstoken);
  const { firstname, lastname, nickname, photolink } = useSelector((s: RootState) => s.profile);
  const [selfId, setSelfId] = React.useState<string | undefined>(undefined);
  const [selfNick, setSelfNick] = React.useState<string | undefined>(undefined);
  const [selfName, setSelfName] = React.useState<string | undefined>(undefined);
  const [postResolve,setPostResolve] = React.useState<any[]>(posts)
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
  }>>({});

  
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
    // Hydrate from local cache first for persistence across refresh
    try {
      const cached = localStorage.getItem('feedPosts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) dispatch(hydrateFromCache(parsed));
      }
    } catch {}
    // Pull self identity from localStorage as a fallback for display names
    try {
      const raw = localStorage.getItem('login');
      if (raw) {
        const saved = JSON.parse(raw);
        const lid = saved?.userID || saved?.userid || saved?.id || undefined;
        setSelfId(lid);
        setSelfNick(saved?.nickname || saved?.username || undefined);
        const ln = [saved?.firstname, saved?.lastname].filter(Boolean).join(' ').trim();
        setSelfName(ln || saved?.name || undefined);
        // Also fetch profile so firstname/lastname/nickname are available from Redux
        try {
          const token = saved?.refreshtoken || saved?.accesstoken;
          if (lid && token) dispatch(getprofile({ userid: lid, token } as any));
        } catch {}
      } else {
        setSelfId(undefined);
      }
    } catch {}
    // Then fetch all posts from backend
    dispatch(getallpost({} as any));
  }, [dispatch]);

  // Persist posts to localStorage to survive refresh and hydrate next mount
  useEffect(() => {
    try {
      if (Array.isArray(posts)) {
        localStorage.setItem('feedPosts', JSON.stringify(posts));
      }
    } catch {}
  }, [posts]);
const fetchFeed=async() => { 
    const tst = toast.loading("loading");
      try {
        const resPosts = await fetchposts();
        // Initialize UI state with proper like counts from backend
        if (resPosts?.post && Array.isArray(resPosts.post)) {
          // Update UI state for each post
          setUi(prev => {
            const newState = { ...prev };
            resPosts.post.forEach((post: any) => {
              const postId = post?.postid || post?.id || post?._id;
              if (postId) {
                newState[postId] = {
                  ...prev[postId],
                  likeCount: post.likeCount || 0,
                  liked: post.likedBy?.includes(loggedInUserId || selfId),
                };
              }
            });
            return newState;
          });
        }
        setPostResolve(resPosts?.post || []);
        localStorage.setItem('feedPosts', JSON.stringify(resPosts.post));
      }catch(error){
        console.error(error)
      } finally{
        toast.dismiss(tst)
      }
    }
  useLayoutEffect(() => {
    (async () => {
      const cachedPosts = JSON.parse(localStorage.getItem('feedPosts') || "[]") || [];
      setPostResolve(cachedPosts);
      
      // Initialize UI state from cached posts
      if (Array.isArray(cachedPosts)) {
        setUi(prev => {
          const newState = { ...prev };
          cachedPosts.forEach((post: any) => {
            const postId = post?.postid || post?.id || post?._id;
            if (postId) {
              newState[postId] = {
                ...prev[postId],
                likeCount: post.likeCount || 0,
                liked: post.likedBy?.includes(loggedInUserId || selfId),
              };
            }
          });
          return newState;
        });
      }
    })();
    
    fetchFeed();
    window.addEventListener('refreshfeed', fetchFeed);
    return ()=>{
      window.removeEventListener('refreshfeed', fetchFeed);
    }
  },[])
  
  useEffect(() => {
    try {
      localStorage.setItem('feedUi', JSON.stringify(ui));
    } catch {}
  }, [ui]);

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
        // Infer post type: prefer explicit fields if present
        let postType: string = p?.posttype || p?.type || "text";
        if (!postType) {
          if (p?.postphoto || p?.image) postType = "image";
          else if (p?.postvideo || p?.video) postType = "video";
        }

        // Resolve media reference (cover more backend key variants)
        const mediaRef =
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
          p?.postfilepublicid ||
          p?.postfilelink||
          "";
        const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
        const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
        const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
        const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
        const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
        const queryUrlPrimary = asString ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
        const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
        const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
        const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
        const src = isUrl ? asString : queryUrlPrimary;

        // Derive display name and handle from multiple possible fields
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

        // Basic reactions/metrics derivation
        // Use likeCount and likedBy from backend
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
        const starred = !!(p?.starred || p?.faved || p?.favorited);

        // Merge with local optimistic state
        const pid = p?.postid || p?.id || p?._id || idx;
        const uiState = ui[pid] || {};
        const uiLiked = uiState.liked ?? liked;
        const uiLikeCount = uiState.likeCount ?? likeCount;
        const uiStarred = uiState.starred ?? starred;
        const uiOpen = !!uiState.open;
        const uiComments = uiState.comments ?? [];
        const uiInput = uiState.input ?? "";
        const uiLoading = !!uiState.loadingComments;
        const uiSending = !!uiState.sending;
        const hasUiComments = Object.prototype.hasOwnProperty.call(uiState, 'comments');
        const displayCommentCount = hasUiComments ? uiComments.length : commentCount;


        return (
          <div key={`${p?.postid || p?.id || idx}`} className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div 
                className="size-10 rounded-full overflow-hidden bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent post click
                  router.push(`/Profile/${postAuthorId}`);
                }}
              >
                <img
                  alt="Profile picture"
                  src={
                    // If it's the current user's post, use their profile image from Redux
                    isSelf ? (photolink || "/icons/icons8-profile_user.png") :
                    // Otherwise, try various user image fields from the post data
                    p?.user?.photolink || 
                    p?.user?.photoLink || 
                    p?.user?.profileImage || 
                    p?.user?.avatar || 
                    p?.user?.image ||
                    "/icons/icons8-profile_user.png"
                  }
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/icons/icons8-profile_user.png";
                  }}
                />
              </div>
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => {
                  router.push(`/post/${p?._id}`)
                }}
              >
                <p className="font-medium">{p?.user?.firstname} { p?.user?.lastname}</p>
                <span className="text-gray-400 text-sm">{handleStr ? `@${handleStr}` : ""}</span>
              </div>
            </div>
            {/* Timestamp */}
            {p?.createdAt && (
              <p className="my-3 text-gray-400 text-sm  cursor-pointer" onClick={()=>{
                router.push(`/post/${p?._id}`)
              }}>{new Date(p.createdAt).toLocaleString()}</p>
            )}
            {/* Content */}
            {p?.content && (
              <p className="my-2 whitespace-pre-wrap cursor-pointer" onClick={()=>{
                router.push(`/post/${p?._id}`)
              }}>{p.content}</p>
            )}
            {/* Media */}
            {postType == "image" && src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={p?.content || "post image"}
                className="w-full max-h-[480px] object-contain rounded"
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
            {postType == "video" && src && (
              <video
                src={src}
                controls
                className="w-full max-h-[480px] rounded"
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
            )}
            {/* Actions */}
            <PostActions
              className="mt-3 border-t border-gray-700 pt-2"
              starred={uiStarred}
              liked={uiLiked}
              likeCount={uiLikeCount}
              commentCount={displayCommentCount}
              post={p}
              onStar={() => {
                const localPid = p?.postid || p?.id || p?._id;
                if (!localPid) return;
                const authorId = p?.userid || p?.userId || p?.ownerid || p?.ownerId || p?.authorId || p?.createdBy;
                // Optimistic toggle
                setUi((prev) => {
                  const curr = prev[localPid] || {};
                  const nextStarred = !(curr.starred ?? starred);
                  return { ...prev, [localPid]: { ...curr, starred: nextStarred } };
                });
                // Backend call (follow/unfollow) if possible
                const uid = String(loggedInUserId || selfId || "");
                if (!uid || !authToken || !authorId || String(authorId) === String(uid)) return;
                const willFollow = !(ui[localPid]?.starred ?? starred);
                const payload: any = { userid: uid, targetid: String(authorId), token: authToken };
                if (willFollow) {
                  dispatch(followThunk(payload) as any);
                } else {
                  dispatch(unfollowThunk(payload) as any);
                }
              }}
              onLike={async () => {
                const uid = String(loggedInUserId || selfId || "");
                const localPid = p?.postid || p?.id || p?._id;
                if (!localPid || !authToken) {
                  toast.error("Please login to like posts");
                  return;
                }
                
                // Get current state
                const curr = ui[localPid] || {};
                const nextLiked = !(curr.liked ?? liked);
                const currentCount = curr.likeCount ?? likeCount;
                
                // Immediate optimistic UI update
                setUi((prev) => ({
                  ...prev,
                  [localPid]: {
                    ...curr,
                    liked: nextLiked,
                    likeCount: Math.max(0, currentCount + (nextLiked ? 1 : -1)),
                  },
                }));

                try {
                  // Send to backend
                  await dispatch(postlike({
                    userid: uid,
                    postid: localPid,
                    token: authToken
                  } as any)).unwrap();
                } catch (err) {
                  // On error, revert the optimistic update
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
                // If opening and not loaded yet, fetch comments
                const curr = ui[localPid];
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
                        [localPid]: { ...(prev[localPid] || {}), comments: arr, loadingComments: false }
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
              onMore={() => {
                // TODO: open overflow menu
                console.debug("more clicked", p?.id || p?.postid);
              }}
            />
            {uiOpen && (
              <div className="mt-2 border-t border-gray-700 pt-2">
                {uiLoading ? (
                  <p className="text-sm text-gray-400">Loading comments…</p>
                ) : (
                  <div className="space-y-2">
                    {uiComments && uiComments.length > 0 ? (
                      uiComments.map((c: any, i: number) => (
                        <div key={i} className="text-sm text-gray-200">
                          <span className="text-gray-400 mr-2">@{c?.username || c?.author || c?.user?.username || 'user'}</span>
                          <span>{c?.comment || c?.content || String(c)}</span>
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
                          // Optimistically append
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
                            },
                          }));
                          const uid = String(loggedInUserId || selfId || "");
                          const localPid = p?.postid || p?.id || p?._id;
                          if (uid && localPid && authToken) {
                            (dispatch(postcomment({ userid: uid, postid: localPid, comment: text, token: authToken } as any)) as any)
                              .unwrap()
                              .then((res: any) => {
                                // Merge server list with optimistic list (keep optimistic if server lags)
                                const server = (res && (res.comment || res.comments)) as any[] | undefined;
                                setUi((prev) => {
                                  const current = (prev[pid]?.comments as any[]) || [];
                                  let merged = current;
                                  if (Array.isArray(server)) {
                                    // If server has fewer/equal items, keep optimistic items
                                    merged = server.length >= current.length ? server : current;
                                  }
                                  return {
                                    ...prev,
                                    [pid]: {
                                      ...(prev[pid] || {}),
                                      sending: false,
                                      comments: merged,
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
