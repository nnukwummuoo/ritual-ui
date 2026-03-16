'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { URL } from '@/api/config';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { IoTrendingUpOutline, IoGiftOutline, IoPeopleOutline, IoTrophyOutline } from 'react-icons/io5';
import Image from 'next/image';

interface TopReferrer {
    rank: number;
    userId: string;
    username: string;
    firstname: string;
    lastname: string;
    photolink?: string;
    referralCount: number;
    rewardBalance: number;
    totalEarned: number;
}

interface ReferralOverview {
    totalUsers: number;
    usersWithReferral: number;
    usersWithoutReferral: number;
    totalGoldSpent: number;
    percentageReferred: string;
}

interface ReferralAnalyticsData {
    overview: ReferralOverview;
    topReferrers: TopReferrer[];
}

export default function ReferralAnalysisPage() {
    const token = useAuthToken();
    const [activeTab, setActiveTab] = useState<'overview' | 'top-referrers'>('overview');
    const [data, setData] = useState<ReferralAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchReferralAnalytics = async () => {
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${URL}/api/referral/admin/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.ok) {
                    setData(response.data.data);
                    setError('');
                } else {
                    setError(response.data.message || 'Failed to fetch data');
                }
            } catch (err: any) {
                console.error('Error fetching referral analytics:', err);
                setError(err.response?.data?.message || 'Error loading referral analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchReferralAnalytics();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-gray-400 text-center py-8">
                No data available
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-[#111624] p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${activeTab === 'overview'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('top-referrers')}
                    className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all ${activeTab === 'top-referrers'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                >
                    Top Referrers
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Users */}
                        <div className="bg-[#111624] p-6 rounded-xl border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm font-medium">Total Users</span>
                                <IoPeopleOutline className="text-blue-400" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {data.overview.totalUsers.toLocaleString()}
                            </div>
                        </div>

                        {/* Users With Referral */}
                        <div className="bg-[#111624] p-6 rounded-xl border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm font-medium">With Referral</span>
                                <IoTrendingUpOutline className="text-green-400" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {data.overview.usersWithReferral.toLocaleString()}
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                {data.overview.percentageReferred}% of total
                            </div>
                        </div>

                        {/* Users Without Referral */}
                        <div className="bg-[#111624] p-6 rounded-xl border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm font-medium">Without Referral</span>
                                <IoTrendingUpOutline className="text-purple-400" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {data.overview.usersWithoutReferral.toLocaleString()}
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                {(100 - parseFloat(data.overview.percentageReferred)).toFixed(2)}% of total
                            </div>
                        </div>

                        {/* Total Gold Spent */}
                        <div className="bg-[#111624] p-6 rounded-xl border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm font-medium">Gold Spent</span>
                                <IoGiftOutline className="text-yellow-400" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-white">
                                💰{data.overview.totalGoldSpent.toFixed(1)}
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                Referral rewards
                            </div>
                        </div>
                    </div>

                    {/* Visual Breakdown */}
                    <div className="bg-[#111624] p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">User Acquisition Breakdown</h3>
                        <div className="space-y-4">
                            {/* Referred Users Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">Referred Users</span>
                                    <span className="text-green-400 font-semibold">
                                        {data.overview.usersWithReferral.toLocaleString()} ({data.overview.percentageReferred}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${data.overview.percentageReferred}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Organic Users Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">Organic Signups</span>
                                    <span className="text-purple-400 font-semibold">
                                        {data.overview.usersWithoutReferral.toLocaleString()} ({(100 - parseFloat(data.overview.percentageReferred)).toFixed(2)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${100 - parseFloat(data.overview.percentageReferred)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Top Referrers List */}
                    <div className="bg-[#111624] p-6 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-2 mb-6">
                            <IoTrophyOutline className="text-yellow-400" size={24} />
                            <h3 className="text-lg font-semibold text-white">
                                Top Referrers ({data.topReferrers.length})
                            </h3>
                        </div>

                        {data.topReferrers.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">
                                No referrers yet
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Rank</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">User</th>
                                            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Referrals</th>
                                            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Total Earned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.topReferrers.map((referrer) => (
                                            <tr
                                                key={referrer.userId}
                                                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {referrer.rank <= 3 && (
                                                            <span className="text-lg">
                                                                {referrer.rank === 1 ? '🥇' : referrer.rank === 2 ? '🥈' : '🥉'}
                                                            </span>
                                                        )}
                                                        <span className={`font-semibold ${referrer.rank <= 3 ? 'text-yellow-400' : 'text-gray-400'
                                                            }`}>
                                                            #{referrer.rank}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {referrer.photolink ? (
                                                            <Image
                                                                src={referrer.photolink}
                                                                alt={referrer.username}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                                                                {referrer.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-white font-medium">
                                                                {referrer.username}
                                                            </div>
                                                            <div className="text-gray-400 text-sm">
                                                                {referrer.firstname} {referrer.lastname}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                                                        <IoPeopleOutline size={16} />
                                                        {referrer.referralCount}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-yellow-400 font-bold text-lg">
                                                        💰{referrer.totalEarned.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
