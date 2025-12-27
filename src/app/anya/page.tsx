'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IoSparkles, IoTrashOutline, IoHeartOutline, IoHeart, IoChatbubbleOutline, IoShareSocialOutline, IoArrowBack } from 'react-icons/io5';
import { getImageSource } from '@/lib/imageUtils';
import { useStory } from '@/contexts/StoryContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import CommentModal from '@/components/CommentModal';
import { useAnyaMusic } from '@/hooks/useAnyaMusic';

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
  comments?: Array<{
    userId: string;
    username: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function AnyaPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Comment Modal State
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [selectedStoryTitle, setSelectedStoryTitle] = useState('');

  // Story Context for likes and comments
  const { likedStories, commentCounts, likeCounts, toggleLike } = useStory();

  // Initialize background music
  useAnyaMusic();

  // Get user ID from Redux store
  const reduxUserId = useSelector((state: RootState) => state.register.userID);

  // Fallback to localStorage if Redux doesn't have it
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (reduxUserId) {
      setUserId(reduxUserId);
    }

    if (typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsed = JSON.parse(loginData);
          if (!reduxUserId) {
            setUserId(parsed.userID || '');
          }
          setUsername(parsed.username || '');
        }
      } catch (error) {
        console.error('Error reading login data:', error);
      }
    }
  }, [reduxUserId]);

  // Track previous page for smart back navigation (Next.js compatible)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingReferrer = sessionStorage.getItem('anya_referrer');
      const previousPath = sessionStorage.getItem('anya_previous_path');

      console.log('🔍 Anya Page Load - Navigation Check:', {
        previousPath,
        existingReferrer,
        isAnyaPath: previousPath?.includes('/anya')
      });

      // CRITICAL: If coming from ANY /anya path, do ABSOLUTELY NOTHING
      if (previousPath && previousPath.includes('/anya')) {
        console.log('✅ Coming from /anya - preserving existing referrer:', existingReferrer);
        // Clear the temporary previous path tracker
        sessionStorage.removeItem('anya_previous_path');
        return; // Stop here - preserve the original referrer
      }

      // CRITICAL: If we already have a saved referrer, don't overwrite it
      if (existingReferrer) {
        console.log('✅ Already have referrer - not overwriting:', existingReferrer);
        // Clear the temporary previous path tracker
        sessionStorage.removeItem('anya_previous_path');
        return; // Stop here - preserve the original
      }

      // If we have a previous path that's NOT /anya, save it
      if (previousPath && !previousPath.includes('/anya')) {
        console.log('💾 Saving new referrer from previous path:', previousPath);
        sessionStorage.setItem('anya_referrer', previousPath);
      } else {
        console.log('⚠️ No valid referrer to save');
      }

      // Clear the temporary previous path tracker
      sessionStorage.removeItem('anya_previous_path');
    }
  }, []);

  // Smart back navigation
  const handleBackNavigation = () => {
    if (typeof window !== 'undefined') {
      const referrer = sessionStorage.getItem('anya_referrer');

      console.log('🔙 Back button clicked, referrer:', referrer);

      if (referrer) {
        // Referrer is already a path (e.g., '/message', '/'), use it directly
        console.log('✅ Navigating to saved referrer:', referrer);
        router.push(referrer);
      } else if (window.history.length > 2) {
        // Use browser back if history exists
        console.log('↩️ Using browser back');
        router.back();
      } else {
        // Fallback to home
        console.log('🏠 Fallback to home');
        router.push('/');
      }
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/proxy/api/ai-story/stories');
      const fetchedStories = res.data.stories || [];

      // Debug: Log the structure of the first story
      if (fetchedStories.length > 0) {
        console.log('📚 First story structure:', fetchedStories[0]);
        console.log('📸 Panels/Scenes:', fetchedStories[0].panels || fetchedStories[0].scenes);
      }

      setStories(fetchedStories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStories = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      const res = await axios.post('/api/proxy/api/ai-story/generate');

      if (res.data.success) {
        await fetchStories();
      }
    } catch (error) {
      console.error('Failed to generate stories:', error);
      alert('Failed to generate stories. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL stories? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await axios.delete('/api/proxy/api/ai-story/stories');
      setStories([]);
    } catch (error) {
      console.error('Failed to delete stories:', error);
      alert('Failed to delete stories. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStoryClick = (storyId: string) => {
    router.push(`/anya/${storyId}`);
  };

  const handleLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!userId) {
      console.warn('User not logged in');
      return;
    }
    await toggleLike(storyId, userId);
  };

  const handleComment = (e: React.MouseEvent, story: Story) => {
    e.stopPropagation();
    setSelectedStoryId(story._id);
    setSelectedStoryTitle(story.title);
    setCommentModalOpen(true);
  };

  const handleShare = async (e: React.MouseEvent, story: Story) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this AI-generated story: ${story.title}`,
          url: `${window.location.origin}/anya/${story._id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/anya/${story._id}`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-pink-500 border-b-transparent rounded-full animate-spin-reverse"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading stories...</p>
        </motion.div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="h-screen bg-black text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                  aria-label="Go back"
                >
                  <IoArrowBack className="w-5 h-5" />
                </button>

                <div>
                  <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    MMEKO Rituals
                  </h1>
               </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <IoSparkles className="w-24 h-24 text-purple-500 mb-8" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            No Stories Yet
          </h2>
          <p className="text-gray-400 text-lg max-w-md">
            New stories are automatically generated daily. Check back soon!
          </p>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-spin-reverse {
            animation: spin 1s linear infinite reverse;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={handleBackNavigation}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="Go back"
              >
                <IoArrowBack className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  MMEKO Rituals
                </h1>
               
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Story Cards - Like Reels */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth pt-20"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stories.map((story, index) => (
          <div
            key={story._id}
            className="h-screen w-full snap-start snap-always relative flex items-center justify-center px-4"
            onClick={() => handleStoryClick(story._id)}
          >
            {/* Background Image */}
            {story.coverImage ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={getImageSource(story.coverImage, 'stories').src}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=2000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/70"></div>
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30"></div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 max-w-4xl mx-auto text-center cursor-pointer">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Story Title */}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-2xl">
                  {story.title}
                </h2>

                {/* Emotional Core Badge */}
                <div className="mb-6">
                  <span className="inline-block px-6 py-3 bg-purple-600/80 backdrop-blur-sm rounded-full text-lg font-semibold">
                    {story.emotional_core}
                  </span>
                </div>

                {/* Scene Count */}
                <p className="text-xl text-gray-300 mb-8">
                  {(() => {
                    // Check multiple possible field names for scene/panel count
                    const sceneCount = story.panels?.length
                      || (story as any).scenes?.length
                      || (story as any).panelCount
                      || (story as any).scene_count
                      || (story as any).total_panels
                      || 0;
                    return `${sceneCount} ${sceneCount === 1 ? 'Scene' : 'Scenes'}`;
                  })()}
                </p>

                {/* Tap to View */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-gray-400"
                >
                  Tap to view rituals
                </motion.div>
              </motion.div>
            </div>

            {/* Action Bar - Like Reels */}
            <div className="absolute right-4 bottom-24 z-50 flex flex-col gap-6">
              {/* Like Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleLike(e, story._id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                  {likedStories.has(story._id) ? (
                    <IoHeart className="w-6 h-6 text-red-500" />
                  ) : (
                    <IoHeartOutline className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs font-medium">{likeCounts.get(story._id) || story.likes || 0}</span>
              </motion.button>

              {/* Comment Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleComment(e, story)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                  <IoChatbubbleOutline className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">{commentCounts.get(story._id) || story.comments?.length || 0}</span>
              </motion.button>

              {/* Share Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleShare(e, story)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                  <IoShareSocialOutline className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Share</span>
              </motion.button>
            </div>

            {/* Scroll Hint (only on first story) */}
            {index === 0 && stories.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.5
                }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
              >
                <div className="flex flex-col items-center gap-2 text-white/60">
                  <span className="text-sm">Scroll for more</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Hide Scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        .animate-spin-reverse {
          animation: spin 1s linear infinite reverse;
        }
      `}</style>

      {/* Comment Modal */}
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