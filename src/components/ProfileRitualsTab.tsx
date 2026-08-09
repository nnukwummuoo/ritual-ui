"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { IoHeartOutline, IoEyeOutline } from "react-icons/io5";
import { getImageSource } from "@/lib/imageUtils";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface RitualPanel {
  panel_number: number;
  imageUrl: string | null;
  subtitle: string;
}

interface Ritual {
  _id: string;
  title: string;
  panels: RitualPanel[];
  coverImage: string | null;
  views: number;
  likes: number;
  createdAt: string;
  isExpired?: boolean;
  expiresAt?: string;
}

interface ProfileRitualsTabProps {
  userId: string;
}

const ProfileRitualsTab: React.FC<ProfileRitualsTabProps> = ({ userId }) => {
  const router = useRouter();
  const [rituals, setRituals] = useState<Ritual[]>([]);
const [loading, setLoading] = useState(true);
const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    fetchRituals();
  }, [userId]);

  const fetchRituals = async () => {
    try {
      setLoading(true);
      // Fetch ALL rituals for this user (active + expired — permanent)
      const res = await axios.get(`/api/proxy/api/creator-rituals/user/${userId}`);
      setRituals(res.data.rituals || []);
      const counts: Record<string, number> = {};
(res.data.rituals || []).forEach((r: Ritual) => { counts[r._id] = r.likes || 0; });
setLikeCounts(counts);
    } catch {
      setRituals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (ritual: Ritual) => {
    router.push(`/anya/${ritual._id}?type=creator`);
  };

  const handleLike = async (e: React.MouseEvent, ritualId: string) => {
  e.stopPropagation();

  let userId = "";
  try {
    const raw = localStorage.getItem("login");
    if (raw) {
      const d = JSON.parse(raw);
      userId = d.userID || d.userId || d.id || "";
    }
  } catch {}

  if (!userId) return;

  const alreadyLiked = likedIds.has(ritualId);

  // Optimistic update
  setLikedIds(prev => {
    const next = new Set(prev);
    alreadyLiked ? next.delete(ritualId) : next.add(ritualId);
    return next;
  });
  setLikeCounts(prev => ({
    ...prev,
    [ritualId]: Math.max(0, (prev[ritualId] || 0) + (alreadyLiked ? -1 : 1))
  }));

  try {
    await axios.post(`/api/proxy/api/creator-rituals/${ritualId}/like`, { userId });
  } catch {
    // Revert on error
    setLikedIds(prev => {
      const next = new Set(prev);
      alreadyLiked ? next.add(ritualId) : next.delete(ritualId);
      return next;
    });
    setLikeCounts(prev => ({
      ...prev,
      [ritualId]: Math.max(0, (prev[ritualId] || 0) + (alreadyLiked ? 1 : -1))
    }));
  }
};

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#111624] rounded-lg animate-pulse">
            <SkeletonTheme baseColor="#111624" highlightColor="#1c2338">
              <Skeleton height="100%" className="rounded-lg" />
            </SkeletonTheme>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (rituals.length === 0) {
    return (
      <div className="col-span-3 text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 512 512" fill="none">
            <rect x="60" y="310" width="392" height="60" rx="30" fill="#9b59f5" opacity=".5"/>
            <rect x="60" y="390" width="392" height="60" rx="30" fill="#9b59f5" opacity=".8"/>
            <path d="M256 50C256 50 196 130 196 200C196 234 224 262 256 262C288 262 316 234 316 200C316 130 256 50 256 50Z" fill="#9b59f5"/>
          </svg>
        </div>
        <p className="text-gray-400 font-medium">No Rituals yet</p>
        <p className="text-sm text-gray-600 mt-1">Rituals will appear here after uploading</p>
      </div>
    );
  }

  // ── Grid ─────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-3 gap-1.5 md:gap-2">
      {rituals.map((ritual) => {
        const cover = ritual.coverImage
          || ritual.panels?.[0]?.imageUrl
          || null;

        const isExpired = ritual.isExpired;

        return (
          <div
            key={ritual._id}
            className="relative aspect-square group cursor-pointer rounded-lg overflow-hidden bg-[#111624] border border-white/[0.05]"
            onClick={() => handleClick(ritual)}
          >
            {/* Cover image */}
            {cover ? (
              <img
                src={getImageSource(cover, 'stories').src}
                alt={ritual.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={e => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=400';
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] to-[#0d1120]" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Expired badge */}
            {isExpired && (
              <div className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-black/60 backdrop-blur-sm text-white/50 border border-white/10">
                Archived
              </div>
            )}

            {/* Live badge */}
            {!isExpired && (
              <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-black/50 backdrop-blur-sm text-teal-400">
                <div className="w-1 h-1 rounded-full bg-teal-400" style={{ animation: 'pulse 1.5s infinite' }} />
                Live
              </div>
            )}

            {/* Bottom info — visible on hover */}
<div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <p className="text-white text-[9px] font-semibold line-clamp-1 mb-0.5">{ritual.title}</p>
  <div className="flex items-center gap-2 text-[8px] text-gray-300">
    <button
      onClick={(e) => handleLike(e, ritual._id)}
      className="flex items-center gap-0.5 transition-colors"
      style={{ color: likedIds.has(ritual._id) ? '#ef4444' : undefined }}
    >
      <IoHeartOutline className="w-2.5 h-2.5" />
      {likeCounts[ritual._id] ?? ritual.likes ?? 0}
    </button>
    <span className="flex items-center gap-0.5">
      <IoEyeOutline className="w-2.5 h-2.5" />
      {ritual.views || 0}
    </span>
    <span>{ritual.panels?.length || 0} panels</span>
  </div>
</div>

            {/* Hover tint */}
            <div className="absolute inset-0 bg-[#6c63ff]/0 group-hover:bg-[#6c63ff]/10 transition-colors duration-300" />
          </div>
        );
      })}
    </div>
  );
};

export default ProfileRitualsTab;