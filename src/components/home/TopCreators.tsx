'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getImageSource } from '@/lib/imageUtils';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface TopCreator {
    userId: string;
    username: string;
    photolink: string | null;
    totalEarned: number;
    totalEarnedUSD: string;
}

// Creator Card Component
interface CreatorCardProps {
    creator: TopCreator;
    index: number;
    handleCreatorClick: (userId: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, index, handleCreatorClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            onClick={() => handleCreatorClick(creator.userId)}
            className="flex flex-col items-center cursor-pointer group"
        >
            {/* Creator avatar container */}
            <div className="relative mb-1.5">
                {/* Rank badge for top 3 */}
                {index < 3 && (
                    <div className="absolute -top-1 -left-1 z-20">
                        <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0
                                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                                : index === 1
                                    ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white'
                                    : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                                }`}
                        >
                            {index + 1}
                        </div>
                    </div>
                )}

                {/* Ring around avatar */}
                <div className="relative p-0.5 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-black">
                        {creator.photolink && creator.photolink.trim() && creator.photolink !== 'null' && creator.photolink !== 'undefined' ? (
                            <img
                                src={getImageSource(creator.photolink, 'profilePhotos').src}
                                alt={creator.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // On error, hide image and show fallback
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-pink-600 text-white text-xl md:text-2xl font-bold';
                                        fallback.textContent = (creator.username.charAt(1) || creator.username.charAt(0)).toUpperCase();
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-pink-600 text-white text-xl md:text-2xl font-bold">
                                {(creator.username.charAt(1) || creator.username.charAt(0)).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Crown icon for top 3 */}
                {index < 3 && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 z-10">
                        <svg
                            className={`w-4 h-4 ${index === 0 ? 'text-blue-400' : index === 1 ? 'text-pink-400' : 'text-purple-400'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Creator username */}
            <p className="text-white font-semibold text-[10px] md:text-xs truncate w-full text-center mb-0.5 group-hover:text-blue-400 transition-colors">
                {creator.username}
            </p>

            {/* Earnings amount */}
            <p className="text-pink-400 text-[9px] md:text-[10px] font-bold flex items-center justify-center gap-0.5">
                <svg
                    className="w-2 h-2 md:w-2.5 md:h-2.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
                {Math.round(creator.totalEarned)}
            </p>
        </motion.div>
    );
};

export default function TopCreators() {
    const router = useRouter();
    const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopCreators = async () => {
            try {
                // Using the specific endpoint for top creators
                const response = await axios.get('/api/proxy/top_creators');
                if (response.data.ok) {
                    setTopCreators(response.data.creators);
                }
            } catch (error) {
                console.error('Error fetching top creators:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopCreators();
    }, []);

    if (loading || topCreators.length === 0) {
        return null;
    }

    const handleCreatorClick = (userId: string) => {
        router.push(`/Profile/${userId}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-4 md:p-6 overflow-hidden relative"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                    </svg>
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        TOP EARNERS
                    </h2>
                    <svg
                        className="w-8 h-8 text-pink-500 ml-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                    </svg>
                </div>

                {/* Layout: 5 fans in first row, 5 in second row, 4 in third row */}
                <div className="flex flex-col gap-3 md:gap-4 mb-4">
                    {/* First row - 5 creators */}
                    <div className="grid grid-cols-5 gap-3 md:gap-4">
                        {topCreators.slice(0, 5).map((creator, index) => (
                            <CreatorCard key={creator.userId} creator={creator} index={index} handleCreatorClick={handleCreatorClick} />
                        ))}
                    </div>

                    {/* Second row - 5 creators */}
                    <div className="grid grid-cols-5 gap-3 md:gap-4">
                        {topCreators.slice(5, 10).map((creator, index) => (
                            <CreatorCard key={creator.userId} creator={creator} index={index + 5} handleCreatorClick={handleCreatorClick} />
                        ))}
                    </div>

                    {/* Third row - 4 creators (centered) */}
                    <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                        {topCreators.slice(10, 14).map((creator, index) => (
                            <CreatorCard key={creator.userId} creator={creator} index={index + 10} handleCreatorClick={handleCreatorClick} />
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-gray-400 text-[10px] md:text-xs">
                    Based on total earnings from content sales, fan calls, fan meets & fan dates ✨
                </p>
            </div>
        </motion.div>
    );
}
