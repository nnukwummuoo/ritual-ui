'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IoHeartOutline, IoHeart, IoChatbubbleOutline, IoHome } from 'react-icons/io5';
import { getImageSource } from '@/lib/imageUtils';
import { useStory } from '@/contexts/StoryContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import CommentModal from '@/components/CommentModal';
import { useAnyaMusic } from '@/hooks/useAnyaMusic';
import { useAnyaPageTracking } from '@/hooks/useAnyaPageTracking';
import { useAnyaSessionTracking } from '@/hooks/useAnyaSessionTracking';
import AnyaEmptyState from './AnyaEmptyState';

interface Panel {
  panel_number: number;
  text: string;
  imageUrl: string | null;
}

interface Story {
  _id: string;
  story_number: number;
  title: string;
  emotional_core: string;
  panels: Panel[];
  coverImage: string | null;
  views: number;
  likes: number;
  likedBy?: string[];
  comments?: Array<{ userId: string; username: string; text: string; createdAt: string; }>;
  createdAt: string;
  isCreatorRitual?: boolean;
}

export default function AnyaPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories]                     = useState<Story[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [commentModalOpen, setCommentModalOpen]   = useState(false);
  const [selectedStoryId, setSelectedStoryId]     = useState('');
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');

  const { likedStories, commentCounts, likeCounts, toggleLike, refreshStoryData } = useStory();

  useAnyaMusic();
  useAnyaPageTracking('main');
  useAnyaSessionTracking('main');

  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const [userId, setUserId]     = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (reduxUserId) setUserId(reduxUserId);
    if (typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsed = JSON.parse(loginData);
          if (!reduxUserId) setUserId(parsed.userID || '');
          setUsername(parsed.username || '');
        }
      } catch {}
    }
  }, [reduxUserId]);

  // ── Race both APIs — redirect the instant the first one returns anything ──
  useEffect(() => {
    let redirected = false;

    const tryRedirect = (stories: Story[]) => {
      if (redirected || stories.length === 0) return;
      redirected = true;
      const story = stories[Math.floor(Math.random() * Math.min(stories.length, 5))];
      const type = story.isCreatorRitual ? 'creator' : 'ai';
      router.replace(`/anya/${story._id}?type=${type}`);
    };

    // Fire both fetches simultaneously — whoever responds first wins
    axios.get('/api/proxy/api/creator-rituals/feed').then(res => {
      const rituals: Story[] = (res.data.rituals || []).map((r: any) => ({
        _id: r._id, story_number: 0, title: r.title, emotional_core: '',
        panels: (r.panels || []).map((p: any) => ({
          panel_number: p.panel_number, text: p.subtitle || '', imageUrl: p.imageUrl || null,
        })),
        coverImage: r.coverImage || null, views: r.views || 0, likes: r.likes || 0,
        likedBy: r.likedBy || [], comments: r.comments || [],
        createdAt: r.createdAt, isCreatorRitual: true,
      }));
      tryRedirect(rituals);
      setStories(rituals);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  // fetchStories kept for grid refresh on pull-to-refresh
  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/proxy/api/creator-rituals/feed');
      const rituals: Story[] = (res.data.rituals || []).map((r: any) => ({
        _id: r._id, story_number: 0, title: r.title, emotional_core: '',
        panels: (r.panels || []).map((p: any) => ({
          panel_number: p.panel_number, text: p.subtitle || '', imageUrl: p.imageUrl || null,
        })),
        coverImage: r.coverImage || null, views: r.views || 0, likes: r.likes || 0,
        likedBy: r.likedBy || [], comments: r.comments || [],
        createdAt: r.createdAt, isCreatorRitual: true,
      }));
      setStories(rituals);
      rituals.forEach(s => refreshStoryData(s._id));
    } catch {}
    finally { setLoading(false); }
  };

  const handleStoryClick = (story: Story) => {
    const type = story.isCreatorRitual ? 'creator' : 'ai';
    router.push(`/anya/${story._id}?type=${type}`);
  };

  const handleLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!userId) return;
    await toggleLike(storyId, userId);
  };

  const handleComment = (e: React.MouseEvent, story: Story) => {
    e.stopPropagation();
    setSelectedStoryId(story._id);
    setSelectedStoryTitle(story.title);
    setCommentModalOpen(true);
  };

  // ── Loading: transparent screen while race completes (usually < 300ms) ──
  if (loading && stories.length === 0) {
    return <div style={{ position: 'fixed', inset: 0, background: '#080b14' }} />;
  }

    // ── Empty ─────────────────────────────────────────────────────────────────
  if (stories.length === 0) {
    return <AnyaEmptyState />;
  }

  // ── Grid view ─────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Daily Rituals
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">Tap any ritual to start watching</p>
            </div>
            {/* Start random button */}
            <button
              onClick={() => {
                const story = stories[Math.floor(Math.random() * stories.length)];
                const type = story.isCreatorRitual ? 'creator' : 'ai';
                router.push(`/anya/${story._id}?type=${type}`);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              ▶ Watch
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="h-screen overflow-y-auto pt-24 pb-20 px-3 sm:px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
          {stories.map((story) => (
            <motion.div
              key={story._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-xl cursor-pointer group"
              onClick={() => handleStoryClick(story)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {story.coverImage ? (
                  <img
                    src={getImageSource(story.coverImage, 'stories').src}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={e => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=2000';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badge: creator vs AI */}
                {story.isCreatorRitual && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    🔥 Creator
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h3 className="text-sm md:text-base font-bold mb-0.5 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">
                    {story.story_number > 0 ? `Ep. ${story.story_number} · ` : ''}
                    {story.panels?.length || 0} panels
                  </p>

                  {/* Like + Comment */}
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <button
                      onClick={(e) => handleLike(e, story._id)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      {likedStories.has(story._id)
                        ? <IoHeart className="w-3.5 h-3.5 text-red-500" />
                        : <IoHeartOutline className="w-3.5 h-3.5" />}
                      <span>{likeCounts.get(story._id) || story.likes || 0}</span>
                    </button>
                    <button
                      onClick={(e) => handleComment(e, story)}
                      className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                    >
                      <IoChatbubbleOutline className="w-3.5 h-3.5" />
                      <span>{commentCounts.get(story._id) || story.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Hover tint */}
                <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Home button */}
      <div className="fixed left-4 bottom-4 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/')}
          aria-label="Home"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
            <IoHome className="w-6 h-6" />
          </div>
        </motion.button>
      </div>

      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        storyId={selectedStoryId}
        storyTitle={selectedStoryTitle}
        userId={userId}
        username={username}
      />
    </div>
  );
}