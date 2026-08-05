/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoHeartOutline, IoEyeOutline } from "react-icons/io5";
import axios from "axios";
import { getImageSource } from "@/lib/imageUtils";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Ritual {
  _id: string;
  title: string;
  panels: any[];
  coverImage: string | null;
  views: number;
  likes: number;
  createdAt: string;
  isCreatorRitual?: boolean;
}

const RitualsCard: React.FC = () => {
  const router = useRouter();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRituals(); }, []);

  const fetchRituals = async () => {
    try {
      setLoading(true);
      // ── Fetch creator rituals only (AI stories removed from feed) ──
      const res = await axios.get('/api/proxy/api/creator-rituals/feed');
      const fetched = (res.data.rituals || []).slice(0, 5).map((r: any) => ({
        _id:        r._id,
        title:      r.title,
        panels:     r.panels || [],
        coverImage: r.coverImage || null,
        views:      r.views  || 0,
        likes:      r.likes  || 0,
        createdAt:  r.createdAt,
        isCreatorRitual: true,
      }));
      setRituals(fetched);
    } catch {
      setRituals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (ritual: Ritual) => {
    router.push(`/ritual/${ritual._id}?type=creator`);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-medium">Rituals</h3>
            <p className="text-gray-400 text-xs mt-1">Swipe through today's Ritual</p>
          </div>
          <button className="text-purple-400 text-sm hover:underline" onClick={() => router.push('/ritual')}>
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48">
              <SkeletonTheme baseColor="#374151" highlightColor="#4B5563">
                <div className="bg-gray-700 rounded-lg overflow-hidden">
                  <Skeleton height={256} />
                  <div className="p-3">
                    <Skeleton width="80%" height={16} className="mb-2" />
                    <Skeleton width="60%" height={12} />
                  </div>
                </div>
              </SkeletonTheme>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state — client's new banner design ──────────────────────────────
  if (rituals.length === 0) {
    return (
      <div style={{
        width: '100%', background: '#111624',
        border: '1px solid rgba(108,99,255,.18)',
        borderRadius: 18, overflow: 'hidden', position: 'relative',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)' }} />
        {/* Ambient glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 0%,rgba(108,99,255,.08),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.02em' }}>Rituals</div>
            <button onClick={() => router.push('/ritual')}
              style={{ fontSize: 13, fontWeight: 600, color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              See all
            </button>
          </div>

          {/* Empty body */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px 8px', textAlign: 'center', gap: 12 }}>

            {/* Animated icon */}
            <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulse rings */}
              <div style={{ position: 'absolute', width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(108,99,255,.2)', animation: 'ritualPulse 3s ease-out infinite' }} />
              <div style={{ position: 'absolute', width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(108,99,255,.2)', animation: 'ritualPulse 3s .5s ease-out infinite' }} />
              {/* Icon circle */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(108,99,255,.2),rgba(155,89,245,.15))', border: '1px solid rgba(108,99,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, animation: 'ritualFloat 4s ease-in-out infinite' }}>
                <svg width="20" height="20" viewBox="0 0 512 512" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(108,99,255,.5))' }}>
                  <rect x="60" y="310" width="392" height="60" rx="30" fill="white" opacity=".4"/>
                  <rect x="60" y="390" width="392" height="60" rx="30" fill="white" opacity=".65"/>
                  <path d="M256 50C256 50 196 130 196 200C196 234 224 262 256 262C288 262 316 234 316 200C316 130 256 50 256 50Z" fill="white"/>
                  <path d="M256 140C256 140 226 170 226 195C226 212 239 226 256 226C273 226 286 212 286 195C286 170 256 140 256 140Z" fill="rgba(108,99,255,.5)"/>
                </svg>
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-.01em', lineHeight: 1.3 }}>
              No Rituals yet today
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55, maxWidth: 260 }}>
              Check back soon — creators share their fan meet stories daily. You don't want to miss it.
            </div>

            {/* Live pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,.08)', border: '1px solid rgba(108,99,255,.15)', borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 600, color: '#a89cff', marginTop: 2 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 6px #2dd4bf', animation: 'ritualBlink 2s ease-in-out infinite' }} />
              Checking for new Rituals
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,.04)', margin: '14px 0 0' }} />
        </div>

        {/* Creator nudge footer */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
            Are you a creator? <strong style={{ color: '#94a3b8', fontWeight: 600 }}>Be the first today.</strong>
          </div>
          <button
            onClick={() => router.push('/upload-ritual')}
            style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#6c63ff,#9b59f5)', color: 'white', fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 3px 12px rgba(108,99,255,.3)', fontFamily: 'inherit' }}>
            Post Ritual →
          </button>
        </div>

        <style>{`
          @keyframes ritualPulse { 0%{transform:scale(.7);opacity:0} 50%{opacity:1} 100%{transform:scale(1.1);opacity:0} }
          @keyframes ritualFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes ritualBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
        `}</style>
      </div>
    );
  }

  // ── Ritual cards (horizontal scroll) ─────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Rituals</h3>
          <p className="text-gray-400 text-xs mt-1">Swipe through today's Ritual</p>
        </div>
        <button className="text-purple-400 text-sm hover:underline" onClick={() => router.push('/ritual')}>
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {rituals.map((ritual) => (
          <div
            key={ritual._id}
            onClick={() => handleClick(ritual)}
            className="relative bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-lg overflow-hidden w-48 flex-shrink-0 cursor-pointer hover:from-purple-900/40 hover:via-gray-800/60 hover:to-blue-900/40 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 group"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {ritual.coverImage ? (
                <img
                  src={getImageSource(ritual.coverImage, 'stories').src}
                  alt={ritual.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={e => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Creator badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                🔥 Creator
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="text-sm font-bold mb-1 line-clamp-2">{ritual.title}</h3>
                <p className="text-xs text-gray-300 mb-2">{ritual.panels?.length || 0} panels</p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <IoHeartOutline className="w-4 h-4" />
                    <span>{ritual.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoEyeOutline className="w-4 h-4" />
                    <span>{ritual.views || 0}</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RitualsCard;


// ── RitualsPromoCard — unchanged, kept for compatibility ──────────────────────
export const RitualsPromoCard: React.FC = () => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push('/ritual')}
      className="relative bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-xl p-6 cursor-pointer hover:from-purple-900/40 hover:via-gray-800/60 hover:to-blue-900/40 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <svg width="24" height="24" viewBox="0 0 512 512" fill="none">
              <rect x="60" y="310" width="392" height="60" rx="30" fill="#a89cff" opacity=".7"/>
              <rect x="60" y="390" width="392" height="60" rx="30" fill="#a89cff"/>
              <path d="M256 50C256 50 196 130 196 200C196 234 224 262 256 262C288 262 316 234 316 200C316 130 256 50 256 50Z" fill="#a89cff"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">🔥 Today's Rituals</h3>
            <p className="text-purple-300 text-xs">Creator fan meet stories — live for 24h</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Creators share their daily fan meet stories in 15 panels. Watch before they're gone.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">⏱️ 24h only</span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">🔄 Daily fresh</span>
        </div>
        <button onClick={() => router.push('/ritual')} className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all">
          View Today's Rituals →
        </button>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
    </div>
  );
};