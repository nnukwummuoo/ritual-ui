"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getallpost, hydrateFromCache } from "@/store/post";
import { getprofile } from "@/store/profile";
import { URL as API_BASE } from "@/api/config";
const PROD_BASE = "https://mmekoapi.onrender.com"; // fallback when local proxy is down
import PostSkeleton from "../PostSkeleton";
import TextPostCard from "./text-post-card";

export default function PostsCard({ type }: { type?: "video" | "image" | "text" }) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((s: RootState) => s.post.poststatus);
  const posts = useSelector((s: RootState) => s.post.allPost as any[]);
  const loggedInUserId = useSelector((s: RootState) => s.register.userID);
  const { firstname, lastname, nickname } = useSelector((s: RootState) => s.profile);
  const [selfId, setSelfId] = React.useState<string | undefined>(undefined);
  const [selfNick, setSelfNick] = React.useState<string | undefined>(undefined);
  const [selfName, setSelfName] = React.useState<string | undefined>(undefined);

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

  if (status === "loading" && (!posts || posts.length === 0)) {
    return <PostSkeleton />;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-6">No posts yet.</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((p: any, idx: number) => {
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
          "";
        const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
        const isUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
        const queryUrlPrimary = asString ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
        const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
        const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
        const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
        // Prefer the public host for non-local viewers so media is accessible to everyone
        const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
        const src = isUrl
          ? asString
          : (isLocalhost ? queryUrlPrimary : queryUrlFallback);

        // Derive display name and handle from multiple possible fields
        const combinedName = [p?.firstname, p?.lastname].filter(Boolean).join(" ");
        let displayName =
          p?.username ||
          p?.name ||
          p?.nickname ||
          combinedName ||
          p?.fullname ||
          p?.fullName ||
          p?.author ||
          p?.user?.username ||
          p?.user?.name ||
          p?.profile?.username ||
          p?.postedBy?.username ||
          p?.postedBy?.name ||
          "User";
        // If it's the current user's post and we still have 'User', fallback to profile/localStorage names
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
          p?.user?.username ||
          p?.username ||
          p?.postedBy?.username ||
          null;

        const avatarUrl =
          p?.avatar ||
          p?.photo ||
          p?.profileImage ||
          p?.user?.avatar ||
          p?.user?.photo ||
          p?.profile?.avatar ||
          null;

        const isTextOnly = (postType === "text" || (!asString && !isUrl)) && !!p?.content;
        const hasMedia = !!(src && (postType === "image" || postType === "video"));

        // Render specialized text card and skip generic block when text-only
        if (isTextOnly) {
          return (
            <TextPostCard
              key={`${p?.postid || p?.id || idx}`}
              name={displayName}
              handle={handleStr}
              content={p?.content}
              avatarUrl={avatarUrl}
              createdAt={p?.createdAt}
            />
          );
        }

        // If post has BOTH text and media, render text in TextPostCard and media as a separate block
        if (hasMedia && p?.content) {
          return (
            <div key={`${p?.postid || p?.id || idx}`} className="flex flex-col gap-3">
              <TextPostCard
                name={displayName}
                handle={handleStr}
                content={p?.content}
                avatarUrl={avatarUrl}
                createdAt={p?.createdAt}
              />
              <div className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
                {postType === "image" && src && (
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
                {postType === "video" && src && (
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
              </div>
            </div>
          );
        }

        return (
          <div key={`${p?.postid || p?.id || idx}`} className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full overflow-hidden bg-gray-700" />
              <div>
                <p className="font-medium">{displayName}</p>
                <span className="text-gray-400 text-sm">{handleStr ? `@${handleStr}` : ""}</span>
              </div>
            </div>
            {/* Timestamp */}
            {p?.createdAt && (
              <p className="my-3 text-gray-400 text-sm">{new Date(p.createdAt).toLocaleString()}</p>
            )}
            {/* Content (non text-only, shows alongside media) */}
            {p?.content && (
              <p className="my-2 whitespace-pre-wrap">{p.content}</p>
            )}
            {/* Media */}
            {postType === "image" && src && (
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
            {postType === "video" && src && (
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
          </div>
        );
      })}
    </div>
  );
}
