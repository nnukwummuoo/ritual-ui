'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

interface DailyData {
    date: Date;
    dayKey: string;
    day: string;
    totalVisits: number;
    mainPageVisits: number;
    storyPageVisits: number;
    uniqueVisitors: number;
}

interface TopVisitedStory {
    rank: number;
    storyId: string;
    title: string;
    emotional_core: string;
    visits: number;
}

interface AnalyticsData {
    selectedPeriod: string;
    summary: {
        totalVisits: number;
        mainPageVisits: number;
        storyPageVisits: number;
        uniqueVisitors: number;
        avgVisitsPerDay: string;
        mostLikedStory: {
            id: string;
            title: string;
            likes: number;
        } | null;
        mostViewedStory: {
            id: string;
            title: string;
            views: number;
        } | null;
    };
    dailyData: DailyData[];
    topVisitedStories: TopVisitedStory[];
}

export default function AnyaAnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('7days');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async (period: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API}/api/ai-story/visit-analytics?period=${period}`
            );

            if (response.data.ok) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch data');
            }
        } catch (err: unknown) {
            console.error('Error fetching Anya visit analytics:', err);
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error)?.message || 'An error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics(selectedPeriod);
    }, [selectedPeriod, fetchAnalytics]);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
    };

    const periodOptions = [
        { value: 'today', label: 'Today' },
        { value: '7days', label: 'Last 7 Days' },
        { value: 'month', label: 'Last Month' },
        { value: '3months', label: 'Last 3 Months' },
        { value: '6months', label: 'Last 6 Months' },
        { value: 'year', label: 'Last Year' },
        { value: 'all', label: 'All Time' },
    ];

    // Prepare chart data
    const chartData = React.useMemo(() => {
        if (!data?.dailyData || data.dailyData.length === 0) {
            return [];
        }

        return data.dailyData.map((day) => ({
            day: day.day,
            'Total Visits': day.totalVisits || 0,
            'Main Page': day.mainPageVisits || 0,
            'Story Pages': day.storyPageVisits || 0,
            'Visitors': day.uniqueVisitors || 0,
        }));
    }, [data?.dailyData]);

    if (error && !data) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button
                    onClick={() => fetchAnalytics(selectedPeriod)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header with Period selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                        Anya Page Visits Analytics
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {periodOptions.find(p => p.value === selectedPeriod)?.label || 'Last 7 Days'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {periodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => router.push('/mmeko/admin')}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                        Back to Admin
                    </button>
                </div>
            </div>

            {/* Summary Cards - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 border border-purple-700">
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-4 bg-purple-500 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-purple-500 rounded w-16"></div>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-purple-200 mb-1">Total Visits</div>
                            <div className="text-3xl font-bold text-white">
                                {data?.summary.totalVisits.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-purple-200 mt-2">
                                Avg: {data?.summary.avgVisitsPerDay} per day
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 border border-blue-700">
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-4 bg-blue-500 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-blue-500 rounded w-16"></div>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-blue-200 mb-1">Main Page Visits</div>
                            <div className="text-3xl font-bold text-white">
                                {data?.summary.mainPageVisits.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-blue-200 mt-2">
                                /anya page views
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg p-6 border border-pink-700">
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-4 bg-pink-500 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-pink-500 rounded w-16"></div>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-pink-200 mb-1">Story Page Visits</div>
                            <div className="text-3xl font-bold text-white">
                                {data?.summary.storyPageVisits.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-pink-200 mt-2">
                                /anya/[id] page views
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Most Liked & Most Viewed Stories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Most Liked Story</div>
                    <div className="text-lg font-bold text-white line-clamp-2 min-h-[3.5rem]">
                        {data?.summary.mostLikedStory?.title || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-2xl">❤️</span>
                        <span className="text-xl font-bold text-pink-400">
                            {data?.summary.mostLikedStory?.likes.toLocaleString() || 0}
                        </span>
                        <span className="text-sm text-gray-400">likes</span>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Most Viewed Story</div>
                    <div className="text-lg font-bold text-white line-clamp-2 min-h-[3.5rem]">
                        {data?.summary.mostViewedStory?.title || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-2xl">👁️</span>
                        <span className="text-xl font-bold text-blue-400">
                            {data?.summary.mostViewedStory?.views.toLocaleString() || 0}
                        </span>
                        <span className="text-sm text-gray-400">views</span>
                    </div>
                </div>
            </div>

            {/* Daily Visits Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Daily Visits</h2>
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="day"
                                stroke="#9ca3af"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="Total Visits" fill="#a855f7" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Main Page" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Story Pages" fill="#ec4899" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Visitors" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                        No visit data available for this period
                    </div>
                )}
            </div>

            {/* Top Visited Stories */}
            {data?.topVisitedStories && data.topVisitedStories.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Most Visited Stories</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Rank</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Story Title</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Total Visits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topVisitedStories.map((story) => (
                                    <tr key={story.storyId} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                {story.rank <= 3 && (
                                                    <span className="text-yellow-400 mr-2">
                                                        {story.rank === 1 ? '🥇' : story.rank === 2 ? '🥈' : '🥉'}
                                                    </span>
                                                )}
                                                <span className="text-gray-300 font-medium">#{story.rank}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-white font-medium line-clamp-2 max-w-md">
                                                {story.title}
                                            </div>
                                            {/* <span className="inline-block mt-1 px-2 py-0.5 bg-purple-600/50 text-purple-100 text-xs rounded-full">
                                                {story.emotional_core}
                                            </span> */}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-purple-400 font-medium text-lg">{story.visits.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
