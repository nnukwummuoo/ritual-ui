'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getImageSource } from '@/lib/imageUtils';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface TopFan {
    userId: string;
    username: string;
    photolink: string | null;
    totalSpent: number;
    totalSpentUSD: string;
}

// Fan Card Component
interface FanCardProps {
    fan: TopFan;
    index: number;
    handleFanClick: (fan: TopFan) => void;
}

const FanCard: React.FC<FanCardProps> = ({ fan, index, handleFanClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            onClick={() => handleFanClick(fan)}
            className="flex flex-col items-center cursor-pointer group"
        >
            {/* Fan avatar container */}
            <div className="relative mb-1.5">
                {/* Rank badge for top 3 */}
                {index < 3 && (
                    <div className="absolute -top-1 -left-1 z-20">
                        <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                                : index === 1
                                    ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                                    : 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
                                }`}
                        >
                            {index + 1}
                        </div>
                    </div>
                )}

                {/* Gold ring around avatar */}
                <div className="relative p-0.5 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-black">
                        {fan.photolink && fan.photolink.trim() && fan.photolink !== 'null' && fan.photolink !== 'undefined' ? (
                            <img
                                src={getImageSource(fan.photolink, 'profilePhotos').src}
                                alt={fan.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // On error, hide image and show fallback
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xl md:text-2xl font-bold';
                                        fallback.textContent = (fan.username.charAt(1) || fan.username.charAt(0)).toUpperCase();
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xl md:text-2xl font-bold">
                                {(fan.username.charAt(1) || fan.username.charAt(0)).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Crown icon for top 3 */}
                {index < 3 && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 z-10">
                        <svg
                            className={`w-4 h-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-amber-600'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Fan username */}
            <p className="text-white font-semibold text-[10px] md:text-xs truncate w-full text-center mb-0.5 group-hover:text-yellow-400 transition-colors">
                {fan.username}
            </p>

            {/* Gold amount */}
            <p className="text-yellow-400 text-[9px] md:text-[10px] font-bold flex items-center justify-center gap-0.5">
                <svg
                    className="w-2 h-2 md:w-2.5 md:h-2.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
                {Math.round(fan.totalSpent)}
            </p>
        </motion.div>
    );
};

export default function TopFans() {
    const router = useRouter();
    const [topFans, setTopFans] = useState<TopFan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopFans = async () => {
            try {
                const response = await axios.get('/api/proxy/top_fans?limit=10');
                if (response.data.ok) {
                    setTopFans((response.data.fans || []).slice(0, 10));
                }
            } catch (error) {
                console.error('Error fetching top fans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopFans();
    }, []);

    if (loading || topFans.length === 0) {
        return null;
    }

    const handleFanClick = (fan: TopFan) => {
        const slug = (fan.username && String(fan.username).trim()) ? String(fan.username).trim() : fan.userId;
        router.push(`/Profile/${slug}`);
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
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-yellow-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
                        TOP FANS
                    </h2>
                    <svg
                        className="w-8 h-8 text-yellow-500 ml-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                </div>

                {/* Layout: 5 fans in first row, 5 in second row */}
                <div className="flex flex-col gap-3 md:gap-4 mb-4">
                    {/* First row - 5 fans */}
                    <div className="grid grid-cols-5 gap-3 md:gap-4">
                        {topFans.slice(0, 5).map((fan, index) => (
                            <FanCard key={fan.userId} fan={fan} index={index} handleFanClick={handleFanClick} />
                        ))}
                    </div>

                    {/* Second row - 5 fans */}
                    <div className="grid grid-cols-5 gap-3 md:gap-4">
                        {topFans.slice(5, 10).map((fan, index) => (
                            <FanCard key={fan.userId} fan={fan} index={index + 5} handleFanClick={handleFanClick} />
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-gray-400 text-[10px] md:text-xs">
                    Based on total spending on fan calls, fan meets, fan dates, content purchase, VIP upgrades & PPV messages ✨
                </p>
            </div>
        </motion.div>
    );
}
