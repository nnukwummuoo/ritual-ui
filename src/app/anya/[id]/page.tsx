'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { IoArrowBack, IoHeartOutline, IoHeart, IoShareSocialOutline } from 'react-icons/io5';
import { getImageSource } from '@/lib/imageUtils';
import { useStory } from '@/contexts/StoryContext';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
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

export default function StoryViewPage() {
    const params = useParams();
    const router = useRouter();
    const storyId = params.id as string;

    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Story Context for likes
    const { likedStories, toggleLike, refreshStoryData } = useStory();

    // Initialize background music (different random track than main page)
    useAnyaMusic();

    // Get user ID from Redux
    const reduxUserId = useSelector((state: RootState) => state.register.userID);

    // Fallback to localStorage if Redux doesn't have it
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        if (reduxUserId) {
            setUserId(reduxUserId);
        } else if (typeof window !== 'undefined') {
            try {
                const loginData = localStorage.getItem('login');
                if (loginData) {
                    const parsed = JSON.parse(loginData);
                    setUserId(parsed.userID || '');
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

    useEffect(() => {
        if (storyId) {
            fetchStory();
            refreshStoryData(storyId);
        }
    }, [storyId]);

    const fetchStory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}`);
            console.log('Story data:', res.data.story);
            setStory(res.data.story);
        } catch (error) {
            console.error('Failed to fetch story:', error);
        } finally {
            setLoading(false);
        }
    };

    // Detect which panel is in view
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const scrollPosition = containerRef.current.scrollTop;
            const windowHeight = window.innerHeight;
            const panelIndex = Math.round(scrollPosition / windowHeight);

            setCurrentPanelIndex(panelIndex);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleLike = async () => {
        if (!userId) {
            console.warn('User not logged in');
            return;
        }
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
        <div className="h-screen bg-black text-white overflow-hidden relative">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push('/anya')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <IoArrowBack />
                            <span className="hidden sm:inline">Back</span>
                        </button>

                        <div className="flex-1 mx-4 text-center">
                            <h1 className="text-lg md:text-xl font-bold line-clamp-1">{story.title}</h1>
                            <p className="text-sm text-gray-400">{story.emotional_core}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                {liked ? <IoHeart className="text-red-500" /> : <IoHeartOutline />}
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <IoShareSocialOutline />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Container - Like Reels */}
            <div
                ref={containerRef}
                className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
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
                                    className="w-full h-full min-w-full min-h-full object-cover"
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
                        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center h-full flex flex-col justify-center">
                            {/* Scene Text - Centered */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-2xl">
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
                                className="absolute bottom-12 left-2.3/5 -translate-x-1/2 z-20"
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
                                    onClick={() => router.push('/anya')}
                                    className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-all"
                                >
                                    Explore More Rituals
                                </button>
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
            `}</style>
        </div>
    );
}
