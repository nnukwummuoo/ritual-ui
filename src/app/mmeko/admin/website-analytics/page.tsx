'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { URL } from '@/api/config';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { toast } from 'material-react-toastify';
import { getImageSource } from '@/lib/imageUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyData {
  day: string;
  dayKey: string;
  date: Date;
  dayNumber: number;
  visitors: {
    total: number;
    unique: number;
  };
  signUps: {
    total: number;
    male: number;
    female: number;
    other: number;
  };
  timeSpent: {
    avgHours: number;
    totalHours: number;
  };
  userActivity: {
    activeUsers: number;
    avgHoursPerUser: number;
    totalHours: number;
    postsCount: number;
  };
}

interface UserRanking {
  rank: number;
  userid: string;
  userDetails: {
    firstname: string;
    lastname: string;
    username: string;
    photolink: string;
    gender: string;
    country: string;
    isVip: boolean;
    creator_verified: boolean;
  };
  stats: {
    totalTimeSpentHours: number;
    totalPosts: number;
    totalActivities: number;
    activityBreakdown: {
      posts: number;
      likes: number;
      comments: number;
      messages: number;
      profileViews: number;
      other: number;
    };
  };
  location: {
    ipAddress: string;
    country: string;
    city: string;
    region: string;
    timezone: string;
  };
}

interface Visitor {
  visitorId: string;
  userid: string | null;
  isAnonymous: boolean;
  userDetails: {
    firstname: string;
    lastname: string;
    username: string;
    photolink: string;
    gender: string;
    country: string;
    isVip: boolean;
    creator_verified: boolean;
  } | null;
  visitDate: Date;
  totalTimeSpentHours: number;
  pageViews: number;
  location: {
    ipAddress: string;
    country: string;
    city: string;
    region: string;
    timezone: string;
  };
}

interface WebsiteAnalyticsData {
  selectedPeriod: string;
  dailyData: DailyData[];
  userRanking: {
    data: UserRanking[];
    pagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
  visitors: {
    data: Visitor[];
    pagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
  summary: {
    totalVisitors: number;
    totalSignUps: number;
    signUpsByGender: {
      male: number;
      female: number;
      other: number;
    };
    avgTimeSpentHours: number;
    totalActiveUsers: number;
    avgUserTimeSpentHours: number;
    totalPosts: number;
    dayWithMostVisitors: {
      day: string;
      dayNumber: number;
      visitors: number;
    };
  };
}

const WebsiteAnalyticsPage = () => {
  const [data, setData] = useState<WebsiteAnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7days');
  const [activeTab, setActiveTab] = useState<'ranking' | 'visitors'>('ranking');
  const [userRankingPage, setUserRankingPage] = useState<number>(1);
  const [visitorsPage, setVisitorsPage] = useState<number>(1);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const token = useAuthToken();

  const fetchAnalytics = useCallback(async (period: string, userPage: number, visitorsPageNum: number) => {
    try {
      setLoading(prev => ({ ...prev, all: true }));
      
      const response = await axios.get(
        `${URL}/websiteanalytics?period=${period}&userRankingPage=${userPage}&visitorsPage=${visitorsPageNum}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      
      if (response.data.ok) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err: unknown) {
      console.error('Error fetching website analytics:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error)?.message || 'An error occurred';
      setError(errorMessage);
      toast.error(`Failed to load website analytics: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAnalytics(selectedPeriod, userRankingPage, visitorsPage);
    }
  }, [token, selectedPeriod, userRankingPage, visitorsPage, fetchAnalytics]);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    setUserRankingPage(1);
    setVisitorsPage(1);
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

  // Prepare chart data - sort by date to ensure proper ranking
  const chartData = React.useMemo(() => {
    if (!data?.dailyData || data.dailyData.length === 0) {
      return [];
    }
    
    return data.dailyData
      .sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date) : new Date(a.date);
        const dateB = typeof b.date === 'string' ? new Date(b.date) : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .map((day, index) => ({
        day: day.dayNumber || (index + 1),
        dayLabel: day.day || `Day ${index + 1}`,
        visitors: day.visitors?.total || day.visitors?.unique || 0,
        signUps: day.signUps?.total || 0,
        posts: day.userActivity?.postsCount || 0,
      }));
  }, [data?.dailyData]);

  if (error && !data) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => fetchAnalytics(selectedPeriod, userRankingPage, visitorsPage)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Website Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            {periodOptions.find(p => p.value === selectedPeriod)?.label || 'Last 7 Days'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 border border-blue-700">
          {loading.all ? (
            <div className="animate-pulse">
              <div className="h-4 bg-blue-500 rounded w-24 mb-2"></div>
              <div className="h-8 bg-blue-500 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="text-sm text-blue-200 mb-1">Total Visitors</div>
              <div className="text-3xl font-bold text-white">
                {data?.summary.totalVisitors.toLocaleString() || 0}
              </div>
              
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 border border-green-700">
          {loading.all ? (
            <div className="animate-pulse">
              <div className="h-4 bg-green-500 rounded w-24 mb-2"></div>
              <div className="h-8 bg-green-500 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="text-sm text-green-200 mb-1">Total Sign-ups</div>
              <div className="text-3xl font-bold text-white">
                {data?.summary.totalSignUps.toLocaleString() || 0}
              </div>
              <div className="text-xs text-green-200 mt-2">
                Male: {data?.summary.signUpsByGender.male} | Female: {data?.summary.signUpsByGender.female}
                {(data?.summary.signUpsByGender.other || 0) > 0 && ` | Other: ${data?.summary.signUpsByGender.other}`}
              </div>
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 border border-purple-700">
          {loading.all ? (
            <div className="animate-pulse">
              <div className="h-4 bg-purple-500 rounded w-24 mb-2"></div>
              <div className="h-8 bg-purple-500 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="text-sm text-purple-200 mb-1">Avg. Time Spent</div>
              <div className="text-3xl font-bold text-white">
                {data?.summary.avgTimeSpentHours.toFixed(2) || '0.00'}h
              </div>
              <div className="text-xs text-purple-200 mt-2">Per visitor</div>
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-6 border border-orange-700">
          {loading.all ? (
            <div className="animate-pulse">
              <div className="h-4 bg-orange-500 rounded w-24 mb-2"></div>
              <div className="h-8 bg-orange-500 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="text-sm text-orange-200 mb-1">Active Users</div>
              <div className="text-3xl font-bold text-white">
                {data?.summary.totalActiveUsers.toLocaleString() || 0}
              </div>
              <div className="text-xs text-orange-200 mt-2">
                Avg. {data?.summary.avgUserTimeSpentHours.toFixed(2) || '0.00'}h per user
              </div>
            </>
          )}
        </div>
      </div>

      {/* Daily Visitors Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Daily Visitors</h2>
        {loading.all ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="dayLabel" 
                stroke="#9ca3af"
                label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [value, 'Visitors']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend />
              <Bar dataKey="visitors" fill="#3b82f6" name="Visitors" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">
            No visitor data available for this period
          </div>
        )}
      </div>

      {/* Tabs for User Ranking and Visitors */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('ranking')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'ranking' 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Users Ranking
            </button>
            <button 
              onClick={() => setActiveTab('visitors')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'visitors' 
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Website Visitors
            </button>
          </div>
        </div>

        {/* User Ranking Table */}
        {activeTab === 'ranking' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Top Users Ranking</h2>
              {!loading.all && (
                <div className="text-sm text-gray-400">
                  Total: {data?.userRanking.pagination.totalItems || 0} users
                </div>
              )}
            </div>
          {loading.all ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">User</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Time Spent</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Posts</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Activities</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Location</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.userRanking.data && data.userRanking.data.length > 0 ? (
                      data.userRanking.data.map((user) => (
                        <tr key={user.userid} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {user.rank <= 3 && (
                                <span className="text-yellow-400 mr-2">
                                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                              <span className="text-gray-300 font-medium">#{user.rank}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                                {(() => {
                                  const profileImage = user.userDetails.photolink;
                                  const imageSource = getImageSource(profileImage || "", 'profile');
                                  const initials = `${user.userDetails.firstname?.[0] || ''}${user.userDetails.lastname?.[0] || ''}`.toUpperCase();
                                  
                                  if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                    return (
                                      <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                        <img
                                          src={imageSource.src}
                                          alt={user.userDetails.firstname}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.style.display = 'none';
                                            const nextElement = target.nextElementSibling as HTMLElement;
                                            if (nextElement) nextElement.style.display = 'flex';
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-white text-sm font-bold" style={{ display: 'none' }}>
                                          {initials || '?'}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <span className="text-gray-400 text-sm">
                                      {initials || '?'}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {user.userDetails.firstname} {user.userDetails.lastname}
                                </div>
                                {user.userDetails.username && (
                                  <div className="text-xs text-gray-400">{user.userDetails.username}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-white font-medium">{user.stats.totalTimeSpentHours.toFixed(2)}h</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-white font-medium">{user.stats.totalPosts}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-white font-medium">{user.stats.totalActivities}</div>
                            <div className="text-xs text-gray-400">
                              L:{user.stats.activityBreakdown.likes} C:{user.stats.activityBreakdown.comments} M:{user.stats.activityBreakdown.messages}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-white text-sm font-mono">
                              {user.location?.ipAddress || 'Unknown'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-white text-sm">
                              {user.location?.city && user.location.city !== 'Unknown' ? `${user.location.city}, ` : ''}
                              {user.location?.country || 'Unknown'}
                            </div>
                            {user.location?.region && user.location.region !== 'Unknown' && (
                              <div className="text-xs text-gray-400">{user.location.region}</div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {user.userDetails.isVip && (
                                <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-full">VIP</span>
                              )}
                              {user.userDetails.creator_verified && (
                                <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">Creator</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          No user activity data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination for User Ranking */}
              {data?.userRanking.pagination && data.userRanking.pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-400">
                    Page {data.userRanking.pagination.currentPage} of {data.userRanking.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserRankingPage(p => Math.max(1, p - 1))}
                      disabled={data.userRanking.pagination.currentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setUserRankingPage(p => p + 1)}
                      disabled={data.userRanking.pagination.currentPage === data.userRanking.pagination.totalPages}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        )}

        {/* Visitors Table */}
        {activeTab === 'visitors' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Website Visitors</h2>
              {!loading.all && (
                <div className="text-sm text-gray-400">
                  Total: {data?.visitors.pagination.totalItems || 0} visitors
                </div>
              )}
            </div>
            {loading.all ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Visitor</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Visit Date</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Time Spent</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Page Views</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">IP Address</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Location</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.visitors.data && data.visitors.data.length > 0 ? (
                        data.visitors.data.map((visitor, index) => (
                          <tr key={`${visitor.visitorId}-${index}`} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                            <td className="py-4 px-4">
                              {visitor.isAnonymous ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">?</span>
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">Anonymous Visitor</div>
                                    <div className="text-xs text-gray-400">ID: {visitor.visitorId.substring(0, 8)}...</div>
                                  </div>
                                </div>
                              ) : visitor.userDetails ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                                    {(() => {
                                      const profileImage = visitor.userDetails.photolink;
                                      const imageSource = getImageSource(profileImage || "", 'profile');
                                      const initials = `${visitor.userDetails.firstname?.[0] || ''}${visitor.userDetails.lastname?.[0] || ''}`.toUpperCase();
                                      
                                      if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                        return (
                                          <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                            <img
                                              src={imageSource.src}
                                              alt={visitor.userDetails.firstname}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.style.display = 'none';
                                                const nextElement = target.nextElementSibling as HTMLElement;
                                                if (nextElement) nextElement.style.display = 'flex';
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-white text-xs font-bold" style={{ display: 'none' }}>
                                              {initials || '?'}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      return (
                                        <span className="text-gray-400 text-sm">
                                          {initials || '?'}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">
                                      {visitor.userDetails.firstname} {visitor.userDetails.lastname}
                                    </div>
                                    {visitor.userDetails.username && (
                                      <div className="text-xs text-gray-400">{visitor.userDetails.username}</div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Unknown</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-300">
                                {(() => {
                                  // Parse the visit date - handle both string and Date objects
                                  const visitDate = visitor.visitDate 
                                    ? new Date(visitor.visitDate) 
                                    : new Date();
                                  
                                  // Check if date is valid
                                  if (isNaN(visitDate.getTime())) {
                                    return 'Invalid Date';
                                  }
                                  
                                  // Convert to user's local timezone automatically
                                  // The browser automatically converts UTC/server time to user's local timezone
                                  return visitDate.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit', // Add seconds for more precision
                                    timeZoneName: 'short' // Shows timezone abbreviation (e.g., EST, PST, GMT)
                                  });
                                })()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-white font-medium">{visitor.totalTimeSpentHours.toFixed(2)}h</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-white font-medium">{visitor.pageViews}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-white text-sm font-mono">
                                {visitor.location?.ipAddress || 'Unknown'}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-white text-sm">
                                {visitor.location?.city && visitor.location.city !== 'Unknown' ? `${visitor.location.city}, ` : ''}
                                {visitor.location?.country || 'Unknown'}
                              </div>
                              {visitor.location?.region && visitor.location.region !== 'Unknown' && (
                                <div className="text-xs text-gray-400">{visitor.location.region}</div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {visitor.isAnonymous ? (
                                <span className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded-full">Anonymous</span>
                              ) : visitor.userDetails ? (
                                <div className="flex items-center justify-center gap-2">
                                  {visitor.userDetails.isVip && (
                                    <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-full">VIP</span>
                                  )}
                                  {visitor.userDetails.creator_verified && (
                                    <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">Creator</span>
                                  )}
                                  {!visitor.userDetails.isVip && !visitor.userDetails.creator_verified && (
                                    <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full">User</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            No visitor data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination for Visitors */}
                {data?.visitors.pagination && data.visitors.pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Page {data.visitors.pagination.currentPage} of {data.visitors.pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVisitorsPage(p => Math.max(1, p - 1))}
                        disabled={data.visitors.pagination.currentPage === 1}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setVisitorsPage(p => p + 1)}
                        disabled={data.visitors.pagination.currentPage === data.visitors.pagination.totalPages}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Posts Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Daily Posts</h2>
          {loading.all ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="dayLabel" 
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [value, 'Posts']}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="posts" fill="#10b981" name="Posts" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No post data available for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteAnalyticsPage;
