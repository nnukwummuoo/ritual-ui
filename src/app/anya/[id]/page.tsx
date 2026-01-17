'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IoHeartOutline, IoHeart, IoShareSocialOutline, IoChatbubbleOutline, IoHome } from 'react-icons/io5';
import { FaThLarge } from 'react-icons/fa';
import { getImageSource } from '@/lib/imageUtils';
import { useStory } from '@/contexts/StoryContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useAnyaMusic } from '@/hooks/useAnyaMusic';
import { useAnyaPageTracking } from '@/hooks/useAnyaPageTracking';
import { useAnyaSessionTracking } from '@/hooks/useAnyaSessionTracking';
import CommentModal from '@/components/CommentModal';

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

export default function StoryViewPage() {
    const params = useParams();
    const router = useRouter();
    const storyId = params.id as string;

    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
    const [localLikeCount, setLocalLikeCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Story Context for likes and comments
    const { likedStories, commentCounts, toggleLike, refreshStoryData } = useStory();

    // Initialize background music (different random track than main page)
    useAnyaMusic();

    // Track page visit
    useAnyaPageTracking('story', storyId);

    // Track session duration
    useAnyaSessionTracking('story', storyId);

    // Get user ID from Redux
    const reduxUserId = useSelector((state: RootState) => state.register.userID);

    // Fallback to localStorage if Redux doesn't have it
    const [userId, setUserId] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    // Comment Modal State
    const [commentModalOpen, setCommentModalOpen] = useState(false);

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

    // Compute liked state from context
    const liked = likedStories.has(storyId);

    // Prevent this detail page from being saved as a referrer
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUrl = window.location.href;
            const savedReferrer = sessionStorage.getItem('anya_referrer');

            // If somehow this page got saved as referrer, remove it
            if (savedReferrer && savedReferrer.includes('/anya')) {
                sessionStorage.removeItem('anya_referrer');
            }
        }
    }, []);

    const [nextStory, setNextStory] = useState<Story | null>(null);

    // ... existing hooks ...

    useEffect(() => {
        if (storyId) {
            fetchStory();
            fetchNextStory();
            refreshStoryData(storyId);
        }
    }, [storyId]);

    const fetchStory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}`);
            console.log('Story data:', res.data.story);
            setStory(res.data.story);
            // Initialize local like count with the story's current likes
            setLocalLikeCount(res.data.story?.likes || 0);
        } catch (error) {
            console.error('Failed to fetch story:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNextStory = async () => {
        try {
            const res = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}/next`);
            if (res.data.nextStory) {
                console.log('Next Story:', res.data.nextStory);
                setNextStory(res.data.nextStory);
            }
        } catch (error) {
            console.error('Failed to fetch next story:', error);
        }
    };

    // Detect which panel is in view and handle scroll
    useEffect(() => {
        let lastScrollTop = 0;
        let isScrollingToTop = false;

        const handleScroll = () => {
            if (!containerRef.current || !story || isScrollingToTop) return;

            const container = containerRef.current;
            const scrollPosition = container.scrollTop;
            const windowHeight = window.innerHeight;
            const panelIndex = Math.round(scrollPosition / windowHeight);

            setCurrentPanelIndex(panelIndex);

            // Index logic:
            // 0..N-1 : Panels
            // N : End Page
            // N+1 : Next Story Preview (if exists)

            const endPageIndex = story.panels.length;
            const nextStoryIndex = nextStory ? endPageIndex + 1 : -1;

            // 1. Navigation to Next Story
            if (nextStory && panelIndex === nextStoryIndex) {
                // User scrolled to the "Next Ritual" slide
                // Navigate immediately or after small delay
                router.push(`/anya/${nextStory._id}`);
                return;
            }

            // 2. "Scroll Up" Loop (Commented out again as it might confusion standard scrolling)
            /*
            const isScrollingUp = scrollPosition < lastScrollTop;

            if (panelIndex === endPageIndex && isScrollingUp) {
                // User wants to go back to start?
                isScrollingToTop = true;
                container.scrollTo({ top: 0, behavior: 'smooth' });
                
                setTimeout(() => {
                    isScrollingToTop = false;
                }, 1000);
                return;
            }
            */

            lastScrollTop = scrollPosition;
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [story, nextStory]); // Add nextStory dependency



    const handleLike = async () => {
        if (!userId) {
            console.warn('User not logged in');
            return;
        }

        // Optimistic UI update
        const isCurrentlyLiked = liked;
        setLocalLikeCount(prev => isCurrentlyLiked ? prev - 1 : prev + 1);

        // Call the actual API
        await toggleLike(storyId, userId);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: story?.title,
                    text: `Check out this AI-generated story: ${story?.title}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleComment = () => {
        setCommentModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Loading rituals...</p>
                </div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Rituals not found</h2>
                    <button
                        onClick={() => router.push('/anya')}
                        className="px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                    >
                        Back to Rituals
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white overflow-hidden overflow-x-hidden relative">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push('/anya?view=grid')}
                            className="flex items-center justify-center"
                            aria-label="Back to Rituals"
                        >
                            <FaThLarge className="w-8 h-8 text-gray-400" />
                        </button>

                        <div className="flex-1 mx-4 text-center">
                            <h1 className="text-lg md:text-xl font-bold line-clamp-1">{story.title}</h1>
                            {/* <p className="text-sm text-gray-400">{story.emotional_core}</p> */}
                        </div>

                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center justify-center"
                            aria-label="Go to Home"
                        >
                            <IoHome className="w-8 h-8 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Bar - Side (Like Original Anya Page) */}
            <div className="fixed right-4 bottom-48 z-50 flex flex-col gap-6">
                {/* Like Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                        {liked ? (
                            <IoHeart className="w-6 h-6 text-red-500" />
                        ) : (
                            <IoHeartOutline className="w-6 h-6" />
                        )}
                    </div>
                    <span className="text-xs font-medium">{localLikeCount}</span>
                </motion.button>

                {/* Comment Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComment}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                        <IoChatbubbleOutline className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium">{commentCounts.get(storyId) || story.comments?.length || 0}</span>
                </motion.button>

                {/* Share Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                        <IoShareSocialOutline className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium">Share</span>
                </motion.button>
            </div>

            {/* Scrollable Container - Like Reels */}
            <div
                ref={containerRef}
                className="h-screen overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {story.panels.map((panel, index) => (
                    <div
                        key={panel.panel_number}
                        className="h-screen w-full snap-start snap-always relative flex items-center justify-center"
                    >
                        {/* Background Image - Full Cover */}
                        {panel.imageUrl ? (
                            <div className="absolute inset-0 z-0 w-full h-full">
                                <img
                                    src={getImageSource(panel.imageUrl, 'stories').src}
                                    alt={`Scene ${panel.panel_number}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Image failed to load:', panel.imageUrl);
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=2000&auto=format&fit=crop';
                                    }}
                                />
                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
                        )}

                        {/* Scene Badge - Positioned relative to full screen */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="absolute top-28 left-2/5 -translate-x-1/2 z-20"
                        >
                            <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium">
                                Scene {panel.panel_number} / {story.panels.length}
                            </span>
                        </motion.div>

                        {/* Content Overlay */}
                        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center h-full flex flex-col justify-end pb-32">
                            {/* Scene Text - Bottom Positioned */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="text-lg md:text-xl lg:text-2xl  leading-tight drop-shadow-2xl">
                                    {panel.text}
                                </p>
                            </motion.div>
                        </div>

                        {/* Scroll Hint (only on first panel) */}
                        {index === 0 && story.panels.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 1,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 1.5
                                }}
                                className="absolute bottom-12 left-2/5 -translate-x-1/2 z-20"
                            >
                                <div className="flex flex-col items-center gap-1 text-white/50">
                                    <span className="text-xs font-medium">Scroll for more</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                            </motion.div>
                        )}

                        {/* End Card (on last panel) */}
                        {index === story.panels.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
                            >
                                <button
                                    onClick={() => router.push('/anya?view=grid')}
                                    className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-all"
                                >
                                    Explore More Rituals
                                </button>
                            </motion.div>
                        )}
                    </div>
                ))}

                {/* End Page - Final Screen */}
                <div className="h-screen w-full snap-start snap-always relative flex items-center justify-center">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/40 via-black to-pink-900/40">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
                        </div>
                    </div>

                    {/* End Content */}
                    <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
                        <div
                            className="space-y-8"
                        >
                            {/* The End Badge */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
                                    <span className="text-2xl font-bold">The End</span>
                                </div>
                            </motion.div>

                            {/* Story Title */}
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                                {story.title}
                            </h2>

                            {/* Story Stats */}
                            <div className="flex items-center justify-center gap-8 text-gray-300 mb-8">
                                <div className="flex items-center gap-2">
                                    <IoHeart className="w-5 h-5 text-red-500" />
                                    <span className="text-lg">{localLikeCount} Likes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IoChatbubbleOutline className="w-5 h-5" />
                                    <span className="text-lg">{story.comments?.length || 0} Comments</span>
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/anya?view=grid')}
                                    className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm sm:text-base font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                                >
                                    Explore More Rituals
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/')}
                                    className="px-6 py-2 sm:px-8 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm sm:text-base font-semibold hover:bg-white/20 transition-all"
                                >
                                    Go Home
                                </motion.button>
                            </div>

                            {/* Next Ritual Button (Explicit Fallback) */}
                            {/* {nextStory && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    className="mt-6"
                                >
                                    <button
                                        onClick={() => router.push(`/anya/${nextStory._id}`)}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105"
                                    >
                                        Start Next Ritual
                                    </button>
                                </motion.div>
                            )} */}

                            {/* Thank You Message */}
                            <p className="text-gray-400 text-sm mt-6">
                                Thank you for experiencing this ritual ✨
                            </p>

                            {/* Arrow down if next story exists */}
                            {nextStory && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, y: [0, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="mt-12 text-gray-500 text-sm"
                                >
                                    <p>Scroll for Next Ritual</p>
                                    <div className="mx-auto w-6 h-6 mt-2">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" /></svg>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Ritual Preview (Ghost Slide) */}
                {nextStory && nextStory.panels && nextStory.panels[0] && (
                    <div className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black">
                        {/* Overlay to indicate loading/transition */}
                        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white tracking-widest uppercase">Next Ritual</span>
                        </div>

                        {/* Background Image of Next Story First Panel */}
                        {(nextStory.panels[0].imageUrl || nextStory.coverImage) && (
                            <div className="absolute inset-0 z-0 w-full h-full opacity-50">
                                <img
                                    src={getImageSource(nextStory.panels[0].imageUrl || nextStory.coverImage || '', 'stories').src}
                                    alt="Next Story"
                                    className="w-full h-full object-cover blur-sm"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hide Scrollbar */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Comment Modal */}
            <CommentModal
                isOpen={commentModalOpen}
                onClose={() => setCommentModalOpen(false)}
                storyId={storyId}
                storyTitle={story.title}
                userId={userId}
                username={username}
            />
        </div>
    );
}
