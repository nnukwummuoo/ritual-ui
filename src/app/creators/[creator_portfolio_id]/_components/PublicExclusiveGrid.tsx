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
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#6c63ff]/15 to-[#9b59f5]/15 border border-[#6c63ff]/30 rounded-full pl-2.5 pr-3 py-1.5 mb-3">
        <Lock className="w-3 h-3 text-[#c9c4ff]" />
        <span className="text-[12px] font-bold text-[#c9c4ff] tracking-wide">Exclusive Content</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {posts.map((post) => {
          const src = getImageSource(post.postfilelink, "post").src || post.postfilelink;
          const unlocked = isOwner || purchasedIds.has(post._id);
          return (
            <button
              key={post._id}
              type="button"
              onClick={() => openTile(post)}
              className="relative aspect-square rounded-xl overflow-hidden bg-black"
            >
              {post.posttype === "video" ? (
                <video src={src} className="w-full h-full object-cover" muted />
              ) : (
                <img src={src} alt="Exclusive content" className="w-full h-full object-cover" />
              )}

                {!unlocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="text-white text-center px-2">
                    <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-1.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-semibold">Unlock to view</p>
                    <p className="text-[12px] mt-0.5 font-semibold flex items-center justify-center gap-1 text-[#f5c451]">
                      <span>🪙</span>
                      {parseFloat(String(post.price)).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {unlocked && post.posttype === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                  <Play className="w-6 h-6 text-white" fill="white" />
                </div>
              )}

              {unlocked && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg py-1">
                  <span className="text-[#f5c451] text-[12px]">🪙</span>
                  <span className="text-[#f5c451] text-[12px] font-semibold">{parseFloat(String(post.price)).toFixed(2)}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="relative max-w-md w-full">
            <button
              type="button"
              onClick={() => setViewTarget(null)}
              className="absolute -top-10 right-0 text-white"
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>
            <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-black">
              {viewTarget.posttype === "video" ? (
                <video
                  src={getImageSource(viewTarget.postfilelink, "post").src || viewTarget.postfilelink}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={getImageSource(viewTarget.postfilelink, "post").src || viewTarget.postfilelink}
                  alt="Exclusive content"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {viewTarget.content && <p className="text-gray-300 text-sm mt-3">{viewTarget.content}</p>}
          </div>
        </div>
      )}
    </div>
  );
}