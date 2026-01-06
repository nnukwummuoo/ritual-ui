'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
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

interface UserSessionData {
    userId: string | null;
    visitorId: string;
    firstname: string | null;
    lastname: string | null;
    username: string | null;
    totalDuration: number;
    sessionCount: number;
    avgDuration: number;
    formattedTotalDuration: string;
    formattedAvgDuration: string;
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

interface SessionAnalyticsData {
    summary: {
        totalSessions: number;
        totalDuration: number;
        avgDuration: number;
        formattedTotalDuration: string;
        formattedAvgDuration: string;
        uniqueUsers: number;
    };
    userSessions: UserSessionData[];
}



export default function AnyaAnalyticsPage() {
    const router = useRouter();

    const [data, setData] = useState<AnalyticsData | null>(null);
    const [sessionData, setSessionData] = useState<SessionAnalyticsData | null>(null);

    const [selectedPeriod, setSelectedPeriod] = useState<string>('7days');
    const [loading, setLoading] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState<boolean>(false);

    const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
    const [storyToDelete, setStoryToDelete] = useState<{ id: string, title: string } | null>(null);

    const fetchAnalytics = useCallback(async (period: string) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch both visit and session analytics
            const [visitResponse, sessionResponse] = await Promise.all([
                axios.get(
                    `${process.env.NEXT_PUBLIC_API}/api/ai-story/visit-analytics?period=${period}`
                ),
                axios.get(
                    `${process.env.NEXT_PUBLIC_API}/api/ai-story/session/analytics?period=${period}`
                )
            ]);

            if (visitResponse.data.ok) {
                setData(visitResponse.data.data);
            } else {
                throw new Error(visitResponse.data.message || 'Failed to fetch visit data');
            }

            if (sessionResponse.data.ok) {
                setSessionData(sessionResponse.data.data);
            } else {
                console.warn('Failed to fetch session data:', sessionResponse.data.message);
            }
        } catch (err: unknown) {
            console.error('Error fetching Anya analytics:', err);
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

    const handleGenerateStory = async () => {
        try {
            setGenerating(true);
            toast.info('Starting story generation... This will take 2-3 minutes to generate all images.', { autoClose: 5000 });

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/api/ai-story/generate`
            );

            if (response.data.success) {
                toast.success('Story and all images generated successfully!', {
                    autoClose: 5000
                });
                // Refresh analytics immediately - story is already saved since generation is synchronous
                fetchAnalytics(selectedPeriod);
            } else {
                toast.error(response.data.message || 'Failed to generate story');
            }
        } catch (err: unknown) {
            console.error('Error generating story:', err);
            const errorMessage = (err as { response?: { data?: { message?: string; details?: string } } })?.response?.data?.message
                || (err as { response?: { data?: { message?: string; details?: string } } })?.response?.data?.details
                || (err as Error)?.message
                || 'An error occurred while generating the story';

            // Check if story already exists
            if (errorMessage.includes('already exists') || errorMessage.includes('already generated')) {
                toast.info('Today\'s story has already been generated.', { autoClose: 4000 });
            } else {
                toast.error(errorMessage, { autoClose: 5000 });
            }
        } finally {
            setGenerating(false);
        }
    };



    const handleDeleteStory = async (storyId: string) => {
        try {
            setDeletingStoryId(storyId);

            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API}/api/ai-story/stories/${storyId}`
            );

            if (response.data.ok) {
                toast.success('Story deleted successfully');
                // Refresh analytics
                fetchAnalytics(selectedPeriod);
                setStoryToDelete(null);
            } else {
                toast.error(response.data.error || 'Failed to delete story');
            }
        } catch (err: unknown) {
            console.error('Error deleting story:', err);
            const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                || (err as Error)?.message
                || 'An error occurred while deleting the story';
            toast.error(errorMessage);
        } finally {
            setDeletingStoryId(null);
        }
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
            {/* Header with Tab Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                        Anya Rituals Management
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {periodOptions.find(p => p.value === selectedPeriod)?.label || 'Last 7 Days'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateStory}
                        disabled={generating}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <span>✨</span>
                                Generate Story
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => router.push('/mmeko/admin')}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                        Back to Admin
                    </button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex justify-end">
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
            </div>

            {/* Analytics Content */}
            <>
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
                        <h2 className="text-xl font-bold text-white mb-4">All Stories (Sorted by Visits)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Rank</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Story Title</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Total Visits</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
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
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => setStoryToDelete({ id: story.storyId, title: story.title })}
                                                    disabled={deletingStoryId === story.storyId}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {deletingStoryId === story.storyId ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* User Session Duration Analytics */}
                {sessionData && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">User Session Duration</h2>

                        {/* Session Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-5 border border-indigo-700">
                                <div className="text-sm text-indigo-200 mb-1">Total Time Spent</div>
                                <div className="text-2xl font-bold text-white">
                                    {sessionData.summary.formattedTotalDuration}
                                </div>
                                <div className="text-xs text-indigo-200 mt-2">
                                    Across {sessionData.summary.totalSessions} sessions
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-lg p-5 border border-teal-700">
                                <div className="text-sm text-teal-200 mb-1">Average Session</div>
                                <div className="text-2xl font-bold text-white">
                                    {sessionData.summary.formattedAvgDuration}
                                </div>
                                <div className="text-xs text-teal-200 mt-2">
                                    Per session average
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg p-5 border border-amber-700">
                                <div className="text-sm text-amber-200 mb-1">Active Users</div>
                                <div className="text-2xl font-bold text-white">
                                    {sessionData.summary.uniqueUsers}
                                </div>
                                <div className="text-xs text-amber-200 mt-2">
                                    Unique visitors/users
                                </div>
                            </div>
                        </div>

                        {/* Top Users by Time Spent */}
                        {sessionData.userSessions && sessionData.userSessions.length > 0 && (
                            <div className="overflow-x-auto">
                                <h3 className="text-lg font-semibold text-white mb-3">Most Engaged Users</h3>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Rank</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">User</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Total Time</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Sessions</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Avg Time/Session</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessionData.userSessions.slice(0, 20).map((user, index) => (
                                            <tr key={user.visitorId} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center">
                                                        {index < 3 && (
                                                            <span className="text-yellow-400 mr-2">
                                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                            </span>
                                                        )}
                                                        <span className="text-gray-300 font-medium">#{index + 1}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {user.userId ? (
                                                        <div>
                                                            <div className="text-white font-medium text-base">
                                                                {user.firstname} {user.lastname}
                                                            </div>
                                                            <div className="text-gray-400 text-sm">
                                                                {user.username}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-gray-400 text-sm">
                                                                {user.visitorId.substring(0, 20)}...
                                                            </div>
                                                            <span className="text-xs text-gray-500">Anonymous</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-indigo-400 font-bold text-base">
                                                        {user.formattedTotalDuration}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-teal-400 font-medium">
                                                        {user.sessionCount}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-amber-400 font-medium">
                                                        {user.formattedAvgDuration}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                {storyToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
                            <p className="text-gray-300 mb-2">
                                Are you sure you want to delete this story?
                            </p>
                            <p className="text-gray-400 text-sm mb-6 italic line-clamp-2">
                                "{storyToDelete.title}"
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setStoryToDelete(null)}
                                    disabled={deletingStoryId === storyToDelete.id}
                                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteStory(storyToDelete.id)}
                                    disabled={deletingStoryId === storyToDelete.id}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {deletingStoryId === storyToDelete.id && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {deletingStoryId === storyToDelete.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>

        </div>
    );
}
