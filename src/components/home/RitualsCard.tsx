/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaMoon } from "react-icons/fa";
import { IoHeart, IoHeartOutline, IoChatbubbleOutline, IoEyeOutline } from "react-icons/io5";
import axios from "axios";
import { getImageSource } from "@/lib/imageUtils";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Story {
    _id: string;
    story_number: number;
    title: string;
    emotional_core: string;
    panels: any[];
    coverImage: string | null;
    views: number;
    likes: number;
    createdAt: string;
}

const RitualsCard: React.FC = () => {
    const router = useRouter();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            setLoading(true);
            // Add cache-busting with timestamp and no-cache headers
            const res = await axios.get('/api/proxy/api/ai-story/stories', {
                params: {
                    _t: Date.now() // Cache-busting timestamp
                },
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const fetchedStories = res.data.stories || [];

            // Get latest 5 stories
            const latestStories = fetchedStories.slice(0, 5);
            setStories(latestStories);
        } catch (error: any) {
            console.error('[RitualsCard] Failed to fetch Rituals stories:', error);
            setStories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStoryClick = (storyId: string) => {
        router.push(`/anya/${storyId}`);
    };

    // Show loading skeleton
    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white font-medium">
                            Rituals
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">Swipe through today's Ritual</p>
                    </div>
                    <button className="text-purple-400 text-sm hover:underline" onClick={() => router.push('/anya')}>
                        See all
                    </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-48">
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

    // Show message if no stories (instead of returning null)
    if (stories.length === 0) {
        return (
            <div className="bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-lg p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Rituals</h3>
                    <button className="text-purple-400 text-sm hover:underline" onClick={() => router.push('/anya')}>
                        See all
                    </button>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-300 text-sm mb-2">🌙 New Rituals coming soon</p>
                    <p className="text-gray-500 text-xs">Check back later for today's story</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-white font-medium">
                        Rituals
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Swipe through today's Ritual</p>
                </div>
                <button
                    className="text-purple-400 text-sm hover:underline"
                    onClick={() => router.push('/anya')}
                >
                    See all
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {stories.map((story, index) => (
                    <div
                        key={story._id}
                        className="relative bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-lg overflow-hidden w-48 flex-shrink-0 cursor-pointer hover:from-purple-900/40 hover:via-gray-800/60 hover:to-blue-900/40 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 group"
                        onClick={() => handleStoryClick(story._id)}
                    >
                        {/* Story Cover Image */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                            {story.coverImage ? (
                                <img
                                    src={getImageSource(story.coverImage, 'stories').src}
                                    alt={story.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1469122312224-c5846569af2c?q=80&w=2000&auto=format&fit=crop';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-pink-900/30"></div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                {/* Story Title */}
                                <h3 className="text-sm font-bold mb-1 line-clamp-2">
                                    {story.title}
                                </h3>

                                {/* Scene Count */}
                                <p className="text-xs text-gray-300 mb-2">
                                    {story.panels?.length || 0} {story.panels?.length === 1 ? 'Scene' : 'Scenes'}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                        <IoHeartOutline className="w-4 h-4" />
                                        <span>{story.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <IoEyeOutline className="w-4 h-4" />
                                        <span>{story.views || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors duration-300"></div>
                        </div>

                        {/* Mystical glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RitualsCard;


export const RitualsPromoCard: React.FC = () => {
    const router = useRouter();

    const handleCardClick = () => {
        router.push("/anya");
    };

    return (
        <div
            className="relative bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-blue-900/30 rounded-xl p-6 cursor-pointer hover:from-purple-900/40 hover:via-gray-800/60 hover:to-blue-900/40 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 group overflow-hidden"
            onClick={handleCardClick}
        >
            {/* Mystical glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header with moon icon */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                        <FaMoon className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg">🔮 Today's Ritual</h3>
                        <p className="text-purple-300 text-xs">A moment designed to be felt</p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Once a day, a single visual story appears — told in quiet panels.
                    Some are unsettling. Some are calm. Each lives for a limited time.
                </p>

                {/* Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ⏱️ Limited Time
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        🌙 Daily Reset
                    </span>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleCardClick}
                    className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                >
                    Step into Today's Ritual →
                </button>

                {/* Subtitle */}
                <p className="text-gray-500 text-xs text-center mt-3">
                    Miss it, and it's gone.
                </p>
            </div>

            {/* Animated background particles (optional decorative element) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
    );
};
