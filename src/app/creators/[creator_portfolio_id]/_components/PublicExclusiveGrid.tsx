/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, X, Play } from "lucide-react";
import { URL as API_URL } from "@/api/config";
import { getImageSource } from "@/lib/imageUtils";
import Notifybuy from "@/app/(Profile)/_components/Notifybuy";

type ExclusivePost = {
  _id: string;
  postfilelink: string;
  posttype: "image" | "video";
  price: number;
  content?: string;
};

export default function PublicExclusiveGrid({
  creatorUserId,
  viewerId,
  token,
  isOwner,
}: {
  creatorUserId: string;
  viewerId: string;
  token: string;
  isOwner: boolean;
}) {
  const [posts, setPosts] = useState<ExclusivePost[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [buyTarget, setBuyTarget] = useState<ExclusivePost | null>(null);
  const [viewTarget, setViewTarget] = useState<ExclusivePost | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!creatorUserId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/getallExclusivePosts`, { userid: creatorUserId });
      if (res.data?.ok) setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to load exclusive content", err);
    } finally {
      setLoading(false);
    }
  }, [creatorUserId]);

  const fetchPurchaseStatus = useCallback(async (postIds: string[]) => {
    if (!viewerId || !token || postIds.length === 0) return;
    try {
      const res = await axios.post(
        `${API_URL}/checkExclusivePostPurchase`,
        { userid: viewerId, postids: postIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.ok) {
        setPurchasedIds(new Set((res.data.purchasedPostIds || []).map(String)));
      }
    } catch (err) {
      console.error("Failed to check purchase status", err);
    }
  }, [viewerId, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (posts.length > 0 && !isOwner) {
      fetchPurchaseStatus(posts.map((p) => p._id));
    }
  }, [posts, isOwner, fetchPurchaseStatus]);

  const openTile = (post: ExclusivePost) => {
    if (isOwner || purchasedIds.has(post._id)) {
      setViewTarget(post);
    } else {
      if (!viewerId) {
        toast.info("login to access this operation", { autoClose: 2000 });
        return;
      }
      setBuyTarget(post);
    }
  };

  const handleBuy = async () => {
    if (!buyTarget || !viewerId || !token) return;
    try {
      const res = await axios.post(
        `${API_URL}/purchaseExclusivePost`,
        { userid: viewerId, postid: buyTarget._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.ok) {
        setPurchasedIds((prev) => new Set([...prev, buyTarget._id]));
        setBalance(res.data.newBalance ?? null);
        toast.success("Unlocked!", { autoClose: 1800 });
        setViewTarget(buyTarget);
        setBuyTarget(null);
      } else {
        toast.error(res.data?.message || "Purchase failed", { autoClose: 2500 });
        setBuyTarget(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Purchase failed", { autoClose: 2500 });
      setBuyTarget(null);
    }
  };

  if (!loading && posts.length === 0) return null;

  return (
    <div className="mcp-section">
      <div className="mcp-sec-title">Exclusive Content</div>

     <div className="grid grid-cols-3 gap-2">
  {posts.map((post) => {
    const src = getImageSource(post.postfilelink, "post").src || post.postfilelink;
    const unlocked = isOwner || purchasedIds.has(post._id);
    return (
      <button
        key={post._id}
        type="button"
        onClick={() => openTile(post)}
        className="relative aspect-square rounded-lg overflow-hidden bg-black border border-white/10"
      >
        {post.posttype === "video" ? (
          <video
            src={src}
            className={`w-full h-full object-cover ${!unlocked ? "blur-md scale-110 opacity-60" : ""}`}
            muted
          />
        ) : (
          <img
            src={src}
            alt=""
            className={`w-full h-full object-cover ${!unlocked ? "blur-md scale-110 opacity-60" : ""}`}
          />
        )}

        {!unlocked && (
          <>
            <div className="absolute inset-0 bg-black/40" />

            {/* Gold price pill */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#f5c451] rounded-full px-2.5 py-1">
              <span className="text-[12px]">🪙</span>
              <span className="text-black text-[12px] font-bold">{parseFloat(String(post.price)).toFixed(2)}</span>
            </div>

            {/* Lock badge */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
          </>
        )}

        {unlocked && post.posttype === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        )}

        {unlocked && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#f5c451] rounded-full px-2.5 py-1">
            <span className="text-[12px]">🪙</span>
            <span className="text-black text-[12px] font-bold">{parseFloat(String(post.price)).toFixed(2)}</span>
          </div>
        )}
      </button>
    );
  })}
</div>
      {buyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Notifybuy price={buyTarget.price} buy={handleBuy} cancel={() => setBuyTarget(null)} />
        </div>
      )}

  {viewTarget && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setViewTarget(null)}
        >
          <button
            type="button"
            onClick={() => setViewTarget(null)}
            className="absolute top-16 right-1/3 bg-black hover:bg-opacity-30 text-white text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 z-10"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="relative max-w-full max-h-full lg:max-w-[33.333%] lg:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            {viewTarget.posttype === "video" ? (
              <video
                src={getImageSource(viewTarget.postfilelink, "post").src || viewTarget.postfilelink}
                className="max-w-full max-h-full object-contain rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={getImageSource(viewTarget.postfilelink, "post").src || viewTarget.postfilelink}
                alt="Exclusive content"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            {viewTarget.content && (
              <p className="text-gray-300 text-sm mt-3 text-center">{viewTarget.content}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}