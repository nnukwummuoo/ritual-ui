/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Play } from "lucide-react";
import { URL as API_URL } from "@/api/config";
import { getImageSource } from "@/lib/imageUtils";

type ExclusivePost = {
  _id: string;
  postfilelink: string;
  posttype: "image" | "video";
  price: number;
};

export default function ExclusiveContentSection({
  userid,
  username,
  token,
  enabled,
  onToggleEnabled,
}: {
  userid: string;
  username: string;
  token: string;
  enabled: boolean;
  onToggleEnabled: (next: boolean) => void;
}) {
    const router = useRouter();
  const pathname = usePathname();
  const [posts, setPosts] = useState<ExclusivePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!userid) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/getallExclusivePosts`,
        { userid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.ok) setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to load exclusive content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  const handleAdd = () => {
    if (!username) {
      toast.error("Please finish setting up your profile first");
      return;
    }
      router.push(`/${username}/upload-exclusive?returnTo=${encodeURIComponent(pathname)}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exclusive content? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await axios.patch(
        `${API_URL}/exclusive`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Exclusive content deleted");
      } else {
        toast.error(res.data?.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-1">
         <div className="flex items-center gap-2">
          <span style={{ display: "block", width: 16, height: 2, background: "#6c63ff", borderRadius: 2, flexShrink: 0 }} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Exclusive content</h3>
          <span className="text-[10.5px] font-medium text-gray-500 bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5 normal-case tracking-normal">
            Optional
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleEnabled(!enabled)}
          className={`relative w-10 h-[22px] rounded-full transition-colors ${
            enabled ? "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5]" : "bg-white/10"
          }`}
          aria-label="Toggle exclusive content visibility"
        >
          <span
            className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform ${
              enabled ? "translate-x-[18px]" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <p className="text-gray-600 text-xs mb-3">
        Gold-priced photos and videos fans unlock individually on your page.
      </p>

      {!enabled ? (
        <div className="rounded-[10px] border border-white/7 bg-[#111624] px-4 py-3">
          <span className="text-[11px] font-medium text-gray-500 bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5">
            Off
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => {
            const src = getImageSource(post.postfilelink, "post").src || post.postfilelink;
            return (
              <div key={post._id} className="relative aspect-square rounded-xl overflow-hidden bg-black group">
                {post.posttype === "video" ? (
                  <>
                    <video src={src} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </>
                ) : (
                  <img src={src} alt="Exclusive content" className="w-full h-full object-cover" />
                )}

                  {/* Gold price tag */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg py-1">
                  <span className="text-[#f5c451] text-[12px]">🪙</span>
                  <span className="text-[#f5c451] text-[12px] font-semibold">{parseFloat(String(post.price)).toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(post._id)}
                  disabled={deletingId === post._id}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors disabled:opacity-50"
                  aria-label="Delete exclusive content"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAdd}
            className="aspect-square rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] hover:border-[#6c63ff]/40 transition-colors"
            aria-label="Add exclusive content"
          >
            <Plus className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      )}

      {loading && (
        <p className="text-gray-600 text-xs mt-2">Loading your exclusive content...</p>
      )}
    </div>
  );
}