"use client";

import React, { useState, useEffect } from "react";

interface UserAnalyticsProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UserSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  deviceInfo?: string;
  ipAddress?: string;
  location?: string;
}

interface UserActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface UserStats {
  totalSessions: number;
  totalTimeSpent: number;
  averageSessionDuration: number;
  lastActive: string;
  mostActiveHour: number;
  postsCreated: number;
  likesGiven: number;
  commentsMade: number;
  sharesMade: number;
  messagesSent: number;
  loginCount: number;
  lastLogin: string;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ userId, userName, isOpen, onClose }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'activities' | 'stats'>('stats');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserAnalytics();
    }
  }, [isOpen, userId]);

  const fetchUserAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockSessions: UserSession[] = [
        {
          id: '1',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T10:30:00Z',
          duration: 90,
          deviceInfo: 'Chrome 120.0 / Windows 10',
          ipAddress: '192.168.1.100',
          location: 'New York, US'
        },
        {
          id: '2',
          startTime: '2024-01-15T14:00:00Z',
          endTime: '2024-01-15T15:45:00Z',
          duration: 105,
          deviceInfo: 'Safari 17.0 / iOS 17.1',
          ipAddress: '192.168.1.101',
          location: 'New York, US'
        },
        {
          id: '3',
          startTime: '2024-01-16T08:30:00Z',
          endTime: '2024-01-16T09:15:00Z',
          duration: 45,
          deviceInfo: 'Firefox 121.0 / macOS 14.2',
          ipAddress: '192.168.1.102',
          location: 'New York, US'
        }
      ];

      const mockActivities: UserActivity[] = [
        {
          id: '1',
          type: 'post_created',
          description: 'Created a new post',
          timestamp: '2024-01-15T09:15:00Z',
          metadata: { postId: 'post_123' }
        },
        {
          id: '2',
          type: 'like_given',
          description: 'Liked a post',
          timestamp: '2024-01-15T09:20:00Z',
          metadata: { postId: 'post_456' }
        },
        {
          id: '3',
          type: 'comment_made',
          description: 'Commented on a post',
          timestamp: '2024-01-15T14:30:00Z',
          metadata: { postId: 'post_789', commentId: 'comment_123' }
        },
        {
          id: '4',
          type: 'message_sent',
          description: 'Sent a message',
          timestamp: '2024-01-15T15:00:00Z',
          metadata: { recipientId: 'user_456' }
        },
        {
          id: '5',
          type: 'profile_updated',
          description: 'Updated profile information',
          timestamp: '2024-01-16T08:45:00Z'
        }
      ];

      const mockStats: UserStats = {
        totalSessions: 3,
        totalTimeSpent: 240, // minutes
        averageSessionDuration: 80,
        lastActive: '2024-01-16T09:15:00Z',
        mostActiveHour: 14,
        postsCreated: 5,
        likesGiven: 23,
        commentsMade: 12,
        sharesMade: 3,
        messagesSent: 8,
        loginCount: 15,
        lastLogin: '2024-01-16T08:30:00Z'
      };

      setSessions(mockSessions);
      setActivities(mockActivities);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_created': return '📝';
      case 'like_given': return '❤️';
      case 'comment_made': return '💬';
      case 'share_made': return '📤';
      case 'message_sent': return '💌';
      case 'profile_updated': return '👤';
      default: return '📊';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-500">
              Analytics for {userName}
            </h2>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded ${
                activeTab === 'stats' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded ${
                activeTab === 'sessions' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 rounded ${
                activeTab === 'activities' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Activities
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-yellow-500">Loading analytics...</div>
            </div>
          ) : (
            <>
              {/* Statistics Tab */}
              {activeTab === 'stats' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-500 mb-3">Session Data</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Sessions:</span>
                        <span className="text-white font-bold">{stats.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Time Spent:</span>
                        <span className="text-white font-bold">{formatDuration(stats.totalTimeSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Avg Session Duration:</span>
                        <span className="text-white font-bold">{formatDuration(stats.averageSessionDuration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Active:</span>
                        <span className="text-white font-bold">{formatDate(stats.lastActive)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Most Active Hour:</span>
                        <span className="text-white font-bold">{stats.mostActiveHour}:00</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-500 mb-3">Content Activity</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Posts Created:</span>
                        <span className="text-white font-bold">{stats.postsCreated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Likes Given:</span>
                        <span className="text-white font-bold">{stats.likesGiven}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Comments Made:</span>
                        <span className="text-white font-bold">{stats.commentsMade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Shares Made:</span>
                        <span className="text-white font-bold">{stats.sharesMade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Messages Sent:</span>
                        <span className="text-white font-bold">{stats.messagesSent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-500 mb-3">Login Data</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Logins:</span>
                        <span className="text-white font-bold">{stats.loginCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Login:</span>
                        <span className="text-white font-bold">{formatDate(stats.lastLogin)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-yellow-500">User Sessions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-yellow-500">Start Time</th>
                          <th className="px-4 py-3 text-left text-yellow-500">End Time</th>
                          <th className="px-4 py-3 text-left text-yellow-500">Duration</th>
                          <th className="px-4 py-3 text-left text-yellow-500">Device</th>
                          <th className="px-4 py-3 text-left text-yellow-500">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session.id} className="border-b border-gray-700">
                            <td className="px-4 py-3 text-white text-sm">
                              {formatDate(session.startTime)}
                            </td>
                            <td className="px-4 py-3 text-white text-sm">
                              {session.endTime ? formatDate(session.endTime) : 'Active'}
                            </td>
                            <td className="px-4 py-3 text-white text-sm">
                              {session.duration ? formatDuration(session.duration) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-white text-sm">
                              {session.deviceInfo || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-white text-sm">
                              {session.location || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-yellow-500">Recent Activities</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-4 border-b border-gray-700 flex items-start gap-3">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{activity.description}</div>
                          <div className="text-gray-400 text-sm">{formatDate(activity.timestamp)}</div>
                          {activity.metadata && (
                            <div className="text-gray-500 text-xs mt-1">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
