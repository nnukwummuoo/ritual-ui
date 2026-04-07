'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IoHeartOutline, IoHeart, IoShareSocialOutline, IoChatbubbleOutline, IoHome } from 'react-icons/io5';
import { FaThLarge } from 'react-icons/fa';
import { getImageSource } from '@/lib/imageUtils';
import { useStory } from '@/contexts/StoryContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useAnyaPageTracking } from '@/hooks/useAnyaPageTracking';
import { useAnyaSessionTracking } from '@/hooks/useAnyaSessionTracking';
import CommentModal from '@/components/CommentModal';

interface Panel { panel_number: number; text: string; imageUrl: string | null; }
interface Story {
   userId?: string;
  _id: string; story_number: number; title: string; emotional_core: string;
  panels: Panel[]; coverImage: string | null; views: number; likes: number;
  likedBy?: string[];
  comments?: Array<{ userId: string; username: string; text: string; createdAt: string; }>;
  createdAt: string;
  isCreatorRitual?: boolean;
}

// ── Per-ritual state (panel index + like count) ───────────────────────────────
function RitualRow({
  story,
  isActive,
  userId,
  onComment,
  toggleLike,
  likedStories,
  commentCounts,
  onMore,
  username,
}: {
  story: Story;
  isActive: boolean;
  userId: string;
  onComment: (story: Story) => void;
  toggleLike: (id: string, uid: string) => Promise<void>;
  likedStories: Set<string>;
  commentCounts: Map<string, number>;
  onMore: (story: Story) => void;
  username: string; 
}) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [likeCount, setLikeCount]   = useState(story.likes || 0);
  const trackRef   = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const router = useRouter();
  const [moreMenuStory, setMoreMenuStory] = useState<Story | null>(null);
  const [localLiked, setLocalLiked] = useState(() => likedStories.has(story._id));

  const [creatorPhoto, setCreatorPhoto] = useState<string | null>(null);
const [creatorName, setCreatorName] = useState<string | null>(null);


  const liked = likedStories.has(story._id);

  useEffect(() => {
  if (!story.userId || !isActive) return;
  axios.get(`/api/proxy/api/creator-rituals/user/${story.userId}`)
    .then(() => {}) // we don't need rituals here
    .catch(() => {});

  // Fetch actual profile
  import('@/api/config').then(({ URL: API_URL }) => {
    axios.post(`${API_URL}/getprofilebyID`, { userid: story.userId })
      .then(res => {
        const user = res.data?.user || res.data?.profile || res.data;
        setCreatorPhoto(user?.photolink || null);
        setCreatorName(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.username || null);
      })
      .catch(() => {});
  });
}, [story.userId, isActive]);

  // Reset to panel 0 when this row becomes active
  useEffect(() => {
    if (isActive) {
      setPanelIndex(0);
      trackRef.current?.scrollTo({ left: 0, behavior: 'instant' as any });
    }
  }, [isActive]);

  // Sync panel index on manual horizontal scroll
 useEffect(() => {
  const el = trackRef.current;
  if (!el) return;

  const onScroll = () => {
    const idx = Math.round(el.scrollLeft / window.innerWidth);
    setPanelIndex(idx);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.stopPropagation();
    }
  };

  el.addEventListener('scroll', onScroll, { passive: true });
  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    el.removeEventListener('scroll', onScroll);
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
  };
}, []);

  const goToPanel = (index: number) => {
    const c = Math.max(0, Math.min(index, story.panels.length - 1));
    setPanelIndex(c);
    trackRef.current?.scrollTo({ left: c * window.innerWidth, behavior: 'smooth' });
  };

  // Horizontal swipe inside this row
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only handle horizontal swipes here; vertical falls through to parent snap
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      e.stopPropagation();
      goToPanel(dx < 0 ? panelIndex + 1 : panelIndex - 1);
    }
  };

 useEffect(() => {
    setLocalLiked(likedStories.has(story._id));
}, [likedStories, story._id]);

const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLikeCount(p => wasLiked ? p - 1 : p + 1);
    if (story.isCreatorRitual) {
        try {
            await axios.post(`/api/proxy/api/creator-rituals/${story._id}/like`, { userId, username });
        } catch {
            setLocalLiked(wasLiked);
            setLikeCount(p => wasLiked ? p + 1 : p - 1);
        }
    } else {
        await toggleLike(story._id, userId);
    }
};

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/anya/${story._id}?type=${story.isCreatorRitual ? 'creator' : 'ai'}`;
    if (navigator.share) {
      try { await navigator.share({ title: story.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  return (
    <div className="h-screen w-full snap-start snap-always relative flex-shrink-0">


      {/* RITUAL TITLE (shown when on panel 0) */}
      {/* {panelIndex === 0 && (
        <div className="absolute top-[84px] left-0 right-0 z-20 text-center px-8 pt-2">
          <p className="text-white/60 text-xs font-medium tracking-wide">{story.title}</p>
        </div>
      )} */}



      {/* HORIZONTAL PANELS */}
     <div
  ref={trackRef}
  className="h-full w-full flex snap-x snap-mandatory"
  style={{
    overflowX: 'scroll',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    touchAction: 'pan-x',  
    animation: isActive ? 'ritualEnter .4s ease both' : 'none',
  }}
>
        <style jsx>{`
          div::-webkit-scrollbar{display:none}
          @keyframes ritualEnter{from{opacity:.4;transform:scale(.98)}to{opacity:1;transform:scale(1)}}
        `}</style>

        {story.panels.map((panel, index) => (
          <div
            key={panel.panel_number}
            className="h-full flex-shrink-0 snap-start snap-always relative"
            style={{ width: '100vw' }}
          >
            {/* Background image */}
            {panel.imageUrl ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={getImageSource(panel.imageUrl, 'stories').src}
                  alt={`Scene ${panel.panel_number}`}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
            )}

            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium">
                Scene {panel.panel_number} / {story.panels.length}
              </span>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end pb-36 px-6 text-center max-w-2xl mx-auto w-full">
              <motion.p
                key={`${story._id}-panel-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: index === panelIndex ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl leading-relaxed drop-shadow-2xl"
              >
                {panel.text}
              </motion.p>
            </div>

            {/* Desktop arrows */}
            {index > 0 && (
              <button onClick={() => goToPanel(index - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center hover:bg-white/20 transition-all hidden md:flex">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {index < story.panels.length - 1 && (
              <button onClick={() => goToPanel(index + 1)}
  className="absolute right-20 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center hover:bg-white/20 transition-all hidden md:flex">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* First panel swipe hint — cascading chevrons left + right like reference image */}
            {index === 0 && story.panels.length > 1 && isActive && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

                  {/* ← Left arrows (mirror of right, pointing left — fading right→left) */}
                  <svg width="68" height="36" viewBox="0 0 68 36">
                    <style>{`
                      @keyframes chaseLeft {
                        0%,100% { opacity: 1 }
                        50%     { opacity: 0.15 }
                      }
                      .cl1 { animation: chaseLeft 1.2s 0.54s ease-in-out infinite }
                      .cl2 { animation: chaseLeft 1.2s 0.36s ease-in-out infinite }
                      .cl3 { animation: chaseLeft 1.2s 0.18s ease-in-out infinite }
                      .cl4 { animation: chaseLeft 1.2s 0s   ease-in-out infinite }
                    `}</style>
                    {/* Leftmost = darkest (bold), fading rightward */}
                    <polyline className="cl1" points="4,3  14,18 4,33"  fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline className="cl2" points="18,3 28,18 18,33" fill="none" stroke="white" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline className="cl3" points="32,3 42,18 32,33" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline className="cl4" points="46,3 56,18 46,33" fill="none" stroke="white" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>

                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                    swipe
                  </span>

                  {/* → Right arrows (fading left→right, darkest on right like the image) */}
                  <svg width="68" height="36" viewBox="0 0 68 36">
                    <style>{`
                      @keyframes chaseRight {
                        0%,100% { opacity: 1 }
                        50%     { opacity: 0.15 }
                      }
                      .cr1 { animation: chaseRight 1.2s 0s   ease-in-out infinite }
                      .cr2 { animation: chaseRight 1.2s 0.18s ease-in-out infinite }
                      .cr3 { animation: chaseRight 1.2s 0.36s ease-in-out infinite }
                      .cr4 { animation: chaseRight 1.2s 0.54s ease-in-out infinite }
                    `}</style>
                    {/* Lightest on left, darkest on right — exactly like the reference image */}
                    <polyline className="cr1" points="4,3  14,18 4,33"  fill="none" stroke="white" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline className="cr2" points="18,3 28,18 18,33" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline className="cr3" points="32,3 42,18 32,33" fill="none" stroke="white" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline className="cr4" points="46,3 56,18 46,33" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Last panel: swipe up hint */}
            {index === story.panels.length - 1 && (
              <motion.div
                animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/40 text-xs pointer-events-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Swipe up for next ritual
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* ACTION BAR — right side */}
<div className="absolute right-4 md:right-6 bottom-48 md:bottom-1/3 z-20 flex flex-col gap-6">
         {/* CREATOR AVATAR — now inside action bar */}
  {isActive && (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer"
      onClick={(e) => { e.stopPropagation(); router.push(`/${story.userId}`); }}
    >
      <div className="w-12 h-12 rounded-full p-[2px]"
        style={{ background: 'linear-gradient(135deg,#6c63ff,#9b59f5)' }}>
        <div className="w-full h-full rounded-full overflow-hidden bg-black">
          {creatorPhoto ? (
            <img
              src={getImageSource(creatorPhoto, 'profile').src}
              alt="Creator"
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#1a0830,#0a0418)' }}>
              {creatorName?.[0]?.toUpperCase() || story.title?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </div>
      <span className="text-white/60 text-[10px] text-center leading-tight">Profile</span>
    </motion.div>
  )}

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className="flex flex-col items-center gap-1">
    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
       {localLiked ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6c63ff" />
                <stop offset="100%" stopColor="#9b59f5" />
            </linearGradient>
        </defs>
        <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="url(#heartGrad)"
        />
    </svg>
) : (
    <IoHeartOutline className="w-6 h-6 text-white" />
)}
    </div>
    <span className="text-xs text-white">{likeCount}</span>
</motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onComment(story); }} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <IoChatbubbleOutline className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white">{commentCounts.get(story._id) || story.comments?.length || 0}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onMore(story); }} className="flex flex-col items-center gap-1">
  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
    </svg>
  </div>
</motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <IoShareSocialOutline className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white">Share</span>
        </motion.button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StoryViewPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const storyId      = params.id as string;
  const isCreator    = searchParams.get('type') === 'creator';

  const [stories, setStories]           = useState<Story[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeIndex, setActiveIndex]   = useState(0);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentStory, setCommentStory] = useState<Story | null>(null);

  const [moreMenuStory, setMoreMenuStory] = useState<Story | null>(null);

  // Vertical snap container
  const verticalRef = useRef<HTMLDivElement>(null);

  const { likedStories, commentCounts, toggleLike, refreshStoryData } = useStory();
  useAnyaPageTracking('story', storyId);
  useAnyaSessionTracking('story', storyId);

  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const [userId, setUserId]     = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (reduxUserId) setUserId(reduxUserId);
    if (typeof window !== 'undefined') {
      try {
        const d = JSON.parse(localStorage.getItem('login') || '{}');
        if (!reduxUserId && d.userID) setUserId(d.userID);
        if (d.username) setUsername(d.username);
      } catch {}
    }
  }, [reduxUserId]);

  // ── Load all rituals, scroll to the clicked one ───────────────────────────
  useEffect(() => {
    if (!storyId) return;
    (async () => {
      try {
        setLoading(true);

        // Fetch creator rituals only
        const creatorRes = await Promise.allSettled([
  axios.get('/api/proxy/api/creator-rituals/feed'),
]);

let creatorRituals: Story[] = creatorRes[0].status === 'fulfilled'
  ? (creatorRes[0].value.data.rituals || []).map((r: any) => ({
      _id: r._id,
      userId: r.userId || '', 
      story_number: 0,
      title: r.title,
      emotional_core: '',
      panels: (r.panels || []).map((p: any) => ({
        panel_number: p.panel_number,
        text: p.subtitle || '',
        imageUrl: p.imageUrl || null,
      })),
      coverImage: r.coverImage || null,
      views: r.views || 0,
      likes: r.likes || 0,
      likedBy: r.likedBy || [],
      comments: r.comments || [],
      createdAt: r.createdAt,
      isCreatorRitual: true,
    }))
  : [];

// If the target ritual isn't in the active feed (expired),
// fetch it directly by ID so profile viewers can still watch it
const foundInFeed = creatorRituals.some(s => s._id === storyId);
if (!foundInFeed) {
  try {
    const single = await axios.get(`/api/proxy/api/creator-rituals/${storyId}`);
    const r = single.data.ritual;
    if (r) {
      const singleStory: Story = {
        _id: r._id,
        userId: r.userId || '', 
        story_number: 0,
        title: r.title,
        emotional_core: '',
        panels: (r.panels || []).map((p: any) => ({
          panel_number: p.panel_number,
          text: p.subtitle || '',
          imageUrl: p.imageUrl || null,
        })),
        coverImage: r.coverImage || null,
        views: r.views || 0,
        likes: r.likes || 0,
        likedBy: r.likedBy || [],
        comments: r.comments || [],
        createdAt: r.createdAt,
        isCreatorRitual: true,
      };
      // Put it at the front so it's index 0
      creatorRituals = [singleStory, ...creatorRituals];
    }
  } catch (err) {
    console.warn('[StoryViewPage] Could not fetch single ritual:', err);
  }
}

const all = [...creatorRituals];
setStories(all);

        // Find the clicked story and scroll to it
        const targetIdx = all.findIndex(s => s._id === storyId);
        const scrollTo  = Math.max(0, targetIdx);
        setActiveIndex(scrollTo);

        // Scroll vertically to the correct ritual
        setTimeout(() => {
          if (verticalRef.current) {
            verticalRef.current.scrollTo({
              top: scrollTo * window.innerHeight,
              behavior: 'instant' as any,
            });
          }
        }, 50);

        all.forEach(s => refreshStoryData(s._id, s.isCreatorRitual));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [storyId]);

  // Track active ritual as user scrolls vertically
  useEffect(() => {
    const el = verticalRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / window.innerHeight);
      setActiveIndex(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [stories]);

  const activeStory = stories[activeIndex] || null;

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#080b14',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 40, fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* bg glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(108,99,255,.06) 0%, transparent 70%)', animation: 'bgBreath 3s ease-in-out infinite' }} />

        {/* rings + logo */}
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(108,99,255,.12)', animation: 'ringRotate 3s linear infinite' }}>
            <div style={{ position: 'absolute', inset: -1.5, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#6c63ff', borderRightColor: 'rgba(155,89,245,.5)', animation: 'ringRotate 1.8s cubic-bezier(.5,0,.5,1) infinite', filter: 'drop-shadow(0 0 6px rgba(108,99,255,.6))' }} />
          </div>
          <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', border: '1px solid rgba(108,99,255,.07)' }}>
            <div style={{ position: 'absolute', inset: -1, borderRadius: '50%', border: '1px solid transparent', borderBottomColor: '#9b59f5', borderLeftColor: 'rgba(108,99,255,.4)', animation: 'ringRotate 2.4s cubic-bezier(.5,0,.5,1) infinite reverse', filter: 'drop-shadow(0 0 4px rgba(155,89,245,.5))' }} />
          </div>
          <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px solid rgba(108,99,255,.05)' }}>
            <div style={{ position: 'absolute', inset: -1, borderRadius: '50%', border: '1px solid transparent', borderTopColor: 'rgba(212,168,83,.6)', animation: 'ringRotate 1.2s cubic-bezier(.5,0,.5,1) infinite', filter: 'drop-shadow(0 0 4px rgba(212,168,83,.4))' }} />
          </div>
          {/* orbit dots */}
          <div style={{ position: 'absolute', inset: 0, animation: 'ringRotate 2.5s linear infinite' }}><div style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, borderRadius: '50%', background: '#6c63ff', boxShadow: '0 0 8px #6c63ff', transform: 'translate(-50%,-50%) translateY(-76px)' }} /></div>
          <div style={{ position: 'absolute', inset: 0, animation: 'ringRotate 3.5s linear infinite reverse' }}><div style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, borderRadius: '50%', background: '#9b59f5', boxShadow: '0 0 6px #9b59f5', transform: 'translate(-50%,-50%) translateY(-68px)' }} /></div>
          <div style={{ position: 'absolute', inset: 0, animation: 'ringRotate 4.5s linear infinite' }}><div style={{ position: 'absolute', top: '50%', left: '50%', width: 5, height: 5, borderRadius: '50%', background: 'rgba(212,168,83,.8)', boxShadow: '0 0 8px rgba(212,168,83,.6)', transform: 'translate(-50%,-50%) translateY(-60px)' }} /></div>
          {/* logo */}
          <div style={{ position: 'relative', zIndex: 10, animation: 'logoPulse 2s ease-in-out infinite' }}>
            <div style={{ width: 72, height: 72, borderRadius: '22.6%', overflow: 'hidden', position: 'relative' }}>
              <svg width="72" height="72" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ll" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#9b59f5"/></linearGradient>
                  <linearGradient id="ls" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity=".15"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></linearGradient>
                </defs>
                <rect width="512" height="512" rx="116" fill="url(#ll)"/>
                <rect width="512" height="256" rx="116" fill="url(#ls)"/>
                <text x="256" y="345" textAnchor="middle" fontFamily="Georgia,serif" fontSize="300" fontWeight="700" fill="white">M</text>
              </svg>
              <div style={{ position: 'absolute', top: '-100%', left: '-100%', width: '60%', height: '200%', background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%)', animation: 'shineSweep 3s ease-in-out infinite', transform: 'skewX(-15deg)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', color: '#f1f5f9', opacity: 0, animation: 'fadeInUp .8s .4s ease forwards' }}>mmeko</div>
          <div style={{ width: 120, height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden', opacity: 0, animation: 'fadeInUp .8s .6s ease forwards' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#6c63ff,#9b59f5)', borderRadius: 2, boxShadow: '0 0 8px rgba(108,99,255,.6)', animation: 'progressLoad 3s cubic-bezier(.4,0,.2,1) .8s infinite' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, opacity: 0, animation: 'fadeInUp .8s .8s ease forwards' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#475569', animation: `dotBounce 1.4s ${i*.2}s ease-in-out infinite` }} />)}
          </div>
        </div>

        <style>{`
          @keyframes bgBreath{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
          @keyframes ringRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes logoPulse{0%,100%{transform:scale(1);filter:drop-shadow(0 0 12px rgba(108,99,255,.4))}50%{transform:scale(1.04);filter:drop-shadow(0 0 24px rgba(108,99,255,.7))}}
          @keyframes shineSweep{0%{left:-100%;top:-100%}30%{left:150%;top:-100%}100%{left:150%;top:-100%}}
          @keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes progressLoad{0%{width:0%;opacity:1}70%{width:100%;opacity:1}90%{width:100%;opacity:0}100%{width:0%;opacity:0}}
          @keyframes dotBounce{0%,80%,100%{transform:scale(1);background:#475569}40%{transform:scale(1.4);background:#6c63ff}}
        `}</style>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">This Ritual has passed</h2>
          <button onClick={() => router.push('/anya?view=grid')}
            className="px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">
            Back to Rituals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">

      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
<button onClick={() => router.push('/anya?view=grid')} aria-label="Grid view">
            <FaThLarge className="w-8 h-8 text-gray-400" />
          </button>
          <div className="flex-1 mx-4 text-center">
            <h1 className="text-lg font-bold line-clamp-1">
              {activeStory?.title || 'Rituals'}
            </h1>
            {activeStory && activeStory.story_number > 0 && (
              <p className="text-sm text-gray-400">Episode {activeStory.story_number}</p>
            )}
          </div>
          <button onClick={() => router.push('/')} aria-label="Home">
            <IoHome className="w-8 h-8 text-gray-400" />
          </button>
        </div>
      </div>

      {/* VERTICAL SNAP CONTAINER — one full-screen row per ritual */}
     <div
  ref={verticalRef}
  className="h-screen w-full flex flex-col snap-y snap-mandatory overflow-y-scroll"
  style={{ scrollbarWidth: 'none', touchAction: 'pan-y' }}
>
        <style jsx>{`div::-webkit-scrollbar{display:none}`}</style>

      {stories.map((story, idx) => (
    <RitualRow
        key={story._id}
        story={story}
        isActive={idx === activeIndex}
        userId={userId}
        username={username}   // ← add this
        onComment={(s) => { setCommentStory(s); setCommentModalOpen(true); }}
        toggleLike={toggleLike}
        likedStories={likedStories}
        commentCounts={commentCounts}
        onMore={(s) => setMoreMenuStory(s)}
    />
))}
      </div>

      {/* COMMENT MODAL */}
     <CommentModal
    isOpen={commentModalOpen}
    onClose={() => setCommentModalOpen(false)}
    storyId={commentStory?._id || ''}
    storyTitle={commentStory?.title || ''}
    userId={userId}
    username={username}
    isCreatorRitual={commentStory?.isCreatorRitual ?? false}  // ← add this
/>

      {/* MORE MENU MODAL */}
{moreMenuStory && (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center"
    style={{ background: 'rgba(0,0,0,0.6)' }}
    onClick={() => setMoreMenuStory(null)}
  >
    <div
      className="w-full max-w-lg mb-6 mx-4 rounded-2xl overflow-hidden"
      style={{ background: '#161b2e', border: '1px solid rgba(255,255,255,.1)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-1">
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }} />
      </div>

      {/* Title */}
      <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        <p className="text-white font-semibold text-sm line-clamp-1">{moreMenuStory.title}</p>
      </div>

      {/* Delete option — only show if it's the user's own ritual */}
      {moreMenuStory.userId === userId ? (
        <button
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left"
          onClick={async () => {
            if (!confirm('Delete this ritual? This cannot be undone.')) return;
            try {
              await axios.post(`/api/proxy/api/creator-rituals/${moreMenuStory._id}/delete`, { userId });
              setMoreMenuStory(null);
              // Remove from local list
              setStories(prev => prev.filter(s => s._id !== moreMenuStory._id));
            } catch (err: any) {
              alert(err?.response?.data?.message || 'Failed to delete ritual');
            }
          }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,.12)' }}>
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-red-400 font-semibold text-sm">Delete Ritual</p>
            <p className="text-gray-500 text-xs">Permanently remove this ritual</p>
          </div>
        </button>
      ) : (
        <div className="px-5 py-4 text-gray-500 text-sm">No actions available</div>
      )}

      {/* Cancel */}
      <div className="px-4 pb-4 pt-1">
        <button
          onClick={() => setMoreMenuStory(null)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition"
          style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.07)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}