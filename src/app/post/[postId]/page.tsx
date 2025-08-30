'use client';

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { useParams } from "next/navigation";
import { URL as API_BASE } from "@/api/config";
import { useUserId } from "@/lib/hooks/useUserId";
import { fetchsinglepost, getallpost, hydrateFromCache } from "@/store/post";
import { getprofile, follow as followThunk, unfollow as unfollowThunk } from "@/store/profile";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
const PROD_BASE = "https://mmekoapi.onrender.com"; // fallback when local proxy is down
import PostSkeleton from "../../../components/PostSkeleton";
import { toast } from "material-react-toastify";
import PostActions from "../../../components/home/PostActions";

function PostSingle() {
    const dispatch = useDispatch<AppDispatch>();
    const status = useSelector((s: RootState) => s.post.poststatus);
    const loggedInUserId = useSelector((s: RootState) => s.register.userID);
    const authToken = useSelector((s: RootState) => s.register.refreshtoken || s.register.accesstoken);
    const {  nickname } = useSelector((s: RootState) => s.profile);
    const [thePost, setThePost] = React.useState<any>({});
    const p=thePost;
    const userid = useUserId();
    const own = userid === thePost?.user?._id;
    const { postId } = useParams();
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

    const mediaRef =
        thePost?.postphoto ||
        thePost?.postvideo ||
        thePost?.postlink ||
        thePost?.postFile ||
        thePost?.file ||
        thePost?.proxy_view ||
        thePost?.file_link ||
        thePost?.media ||
        thePost?.image ||
        thePost?.video ||
        thePost?.thumblink ||
        // support top-level identifiers
        thePost?.publicId ||
        thePost?.public_id ||
        thePost?.imageId ||
        thePost?.postfilepublicid ||
        thePost?.postfilelink||
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
    const combinedName = [thePost?.user?.firstname, thePost?.user?.lastname].filter(Boolean).join(" ");
    let displayName =
        thePost?.user?.username ||
        thePost?.user?.name ||
        thePost?.user?.nickname ||
        combinedName ||
        thePost?.user?.fullname ||
        thePost?.user?.fullName ||
        thePost?.user?.author ||
        thePost?.user?.username ||
        thePost?.user?.name ||
        thePost?.profile?.username ||
        thePost?.postedBy?.username ||
        thePost?.postedBy?.name ||
        "User";
    
    const postAuthorId = thePost?.userid || thePost?.userId || thePost?.ownerid || thePost?.ownerId || thePost?.authorId || thePost?.createdBy;
    const handleStr =
        thePost?.handle ||
        thePost?.user?.handle ||
        thePost?.nickname ||
        thePost?.user?.nickname ||
        thePost?.username ||
        thePost?.postedBy?.username ||
        null;

    // Basic reactions/metrics derivation
    const likesArr: any[] = Array.isArray(p?.likes)
          ? p?.likes
          : Array.isArray(p?.like)
          ? p?.like
          : Array.isArray(p?.reactions)
          ? p?.reactions
          : [];
        const commentsArr: any[] = Array.isArray(p?.comments)
          ? p?.comments
          : Array.isArray(p?.comment)
          ? p?.comment
          : [];
        const likeCount = Array.isArray(likesArr)
          ? likesArr.length
          : Number(p?.likeCount || p?.likesCount || p?.likes || 0) || 0;
        const commentCount = Array.isArray(commentsArr)
          ? commentsArr.length
          : Number(p?.commentCount || p?.commentsCount || p?.comments || 0) || 0;

        const idStr = (v: any) => (v == null ? undefined : String(v));
        const selfIdStr = idStr(loggedInUserId) || idStr(userid);
        const arrHasSelf = (arr: any[]) =>
          !!selfIdStr &&
          Array.isArray(arr) &&
          arr.some((x) => {
            const val = x?.userid || x?.userId || x?.ownerId || x?.id || x;
            return idStr(val) === selfIdStr;
          });
        const liked = arrHasSelf(likesArr);
        const starred = !!(p?.starred || p?.faved || p?.favorited);

        // Merge with local optimistic state
        const pid = p?.postid || p?.id || p?._id ;
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

    React.useLayoutEffect(()=>{
        // setThePost((JSON.parse(localStorage.getItem('feedPosts') || "[]") || []).find((p: any) => p._id === postId) || {});
            (async () => {
                const tst = toast("Loading", { autoClose: false });
                try {
                    const res=await fetchsinglepost(String(postId));
                    setThePost(res);
                } catch (err) {
                    console.error(err);
                }finally{
                    toast.dismiss(tst)
                }
            })()
        }, [])
    return <>
        <div  className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3 mb-5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full overflow-hidden bg-gray-700" >
                          <img
                          alt="background img"
                          src={"/icons/profile.png"}
                          className="object-cover w-full h-full"
                          // onError={(e) => {
                          //   e.target.onerror = null;
                          //   e.target.src = DummyCoverImage;
                          // }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{thePost?.user?.firstname} { thePost?.user?.lastname}</p>
                        <span className="text-gray-400 text-sm">{handleStr ? `@${handleStr}` : ""}</span>
                      </div>
                    </div>
                    {/* Timestamp */}
                    {p?.createdAt && (
                      <p className="my-3 text-gray-400 text-sm">{new Date(p.createdAt).toLocaleString()}</p>
                    )}
                    {/* Content */}
                    {p?.content && (
                      <p className="my-2 whitespace-pre-wrap">{p.content}</p>
                    )}
                    {/* Media */}
                    {thePost?.posttype == "image" && src && (
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
                    {thePost?.posttype == "video" && src && (
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
                        const uid = String(loggedInUserId || userid || "");
                        if (!uid || !authToken || !authorId || String(authorId) === String(uid)) return;
                        const willFollow = !(ui[localPid]?.starred ?? starred);
                        const payload: any = { userid: uid, targetid: String(authorId), token: authToken };
                        if (willFollow) {
                          dispatch(followThunk(payload) as any);
                        } else {
                          dispatch(unfollowThunk(payload) as any);
                        }
                      }}
                      onLike={() => {
                        const uid = String(loggedInUserId || userid || "");
                        const localPid = p?.postid || p?.id || p?._id;
                        if (!localPid) return;
                        // Optimistic toggle
                        setUi((prev) => {
                          const curr = prev[localPid] || {};
                          const nextLiked = !(curr.liked ?? liked);
                          const baseCount = curr.likeCount ?? likeCount;
                          return {
                            ...prev,
                            [localPid]: {
                              ...curr,
                              liked: nextLiked,
                              likeCount: Math.max(0, baseCount + (nextLiked ? 1 : -1)),
                            },
                          };
                        });
                        if (!uid || !authToken) return;
                        dispatch(postlike({ userid: uid, postid: localPid, token: authToken } as any));
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
                                        { content: text, comment: text, username: nickname || 'you', temp: true },
                                      ],
                                    },
                                  }));
                                  const uid = String(loggedInUserId || userid || "");
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
    </>
}

export default PostSingle