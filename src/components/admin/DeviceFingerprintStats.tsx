/**
 * Device Fingerprint Statistics Component
 * Shows real-time stats on device matching and fraud detection
 * For admin dashboard use
 */

'use client';

import { useState, useEffect } from 'react';

interface DeviceStats {
    totalDevices: number;
    totalUsers: number;
    devicesWithPersistentId: number;
    devicesWithBrowserFpOnly: number;
    averageDevicesPerUser: number;
    suspiciousDevices: number;
}

interface RecentMatch {
    timestamp: Date;
    matchType: string;
    confidence: number;
    matchedUser: string;
    blockedUser: string;
}

export default function DeviceFingerprintStats() {
    const [stats, setStats] = useState<DeviceStats | null>(null);
    const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch stats from backend
        // TODO: Implement backend endpoint
        // fetch('/api/admin/device-stats').then(...)

        // Mock data for now
        setStats({
            totalDevices: 1523,
            totalUsers: 1489,
            devicesWithPersistentId: 1342,
            devicesWithBrowserFpOnly: 181,
            averageDevicesPerUser: 1.02,
            suspiciousDevices: 34,
        });

        setRecentMatches([
            {
                timestamp: new Date(),
                matchType: 'persistent_exact',
                confidence: 1.0,
                matchedUser: 'user123',
                blockedUser: 'user456',
            },
            // More mock data...
        ]);

        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="p-6">Loading device statistics...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Device Fingerprint System</h2>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Devices"
                    value={stats?.totalDevices || 0}
                    subtitle={`${stats?.totalUsers || 0} users`}
                    icon="📱"
                />
                <StatCard
                    title="Persistent IDs"
                    value={stats?.devicesWithPersistentId || 0}
                    subtitle={`${((stats?.devicesWithPersistentId || 0) / (stats?.totalDevices || 1) * 100).toFixed(1)}% of devices`}
                    icon="🔐"
                    color="green"
                />
                <StatCard
                    title="Suspicious Devices"
                    value={stats?.suspiciousDevices || 0}
                    subtitle="Multiple accounts detected"
                    icon="⚠️"
                    color="red"
                />
            </div>

            {/* Match Type Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Device ID Coverage</h3>
                <div className="space-y-3">
                    <ProgressBar
                        label="Persistent Storage (OPFS)"
                        value={stats?.devicesWithPersistentId || 0}
                        max={stats?.totalDevices || 1}
                        color="green"
                    />
                    <ProgressBar
                        label="Browser Fingerprint Only"
                        value={stats?.devicesWithBrowserFpOnly || 0}
                        max={stats?.totalDevices || 1}
                        color="blue"
                    />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                    💡 Higher File System Access coverage = Better cross-browser fraud detection
                </p>
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Fraud Detections</h3>
                <div className="space-y-3">
                    {recentMatches.length === 0 ? (
                        <p className="text-gray-500">No recent matches</p>
                    ) : (
                        recentMatches.map((match, index) => (
                            <MatchCard key={index} match={match} />
                        ))
                    )}
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">🛡️ How the System Works</h3>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                        <span className="mr-2">1️⃣</span>
                        <span><strong>Advanced Fingerprint:</strong> WebGL + WASM + Canvas + Audio = Unique browser signature</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">2️⃣</span>
                        <span><strong>File Storage:</strong> Saves ID in file on user's computer (persists across browsers)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">3️⃣</span>
                        <span><strong>Verification:</strong> When user tries to claim bonus, checks both IDs against database</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">4️⃣</span>
                        <span><strong>Block:</strong> If match found → bonus blocked, even if different browser or cleared cache</span>
                    </li>
                </ul>
                <p className="mt-3 text-xs text-gray-600">
                    Similar systems are used by TikTok, Binance, PayPal, Skrill, and betting platforms.
                </p>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    color = 'blue'
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: string;
    color?: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
    }[color];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
                </div>
                <div className={`text-4xl ${colorClasses} bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ProgressBar({
    label,
    value,
    max,
    color = 'blue'
}: {
    label: string;
    value: number;
    max: number;
    color?: string;
}) {
    const percentage = (value / max) * 100;

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
    }[color];

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="font-semibold">{value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${colorClasses} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function MatchCard({ match }: { match: RecentMatch }) {
    const confidenceColor = match.confidence >= 0.95 ? 'text-red-600' :
        match.confidence >= 0.85 ? 'text-orange-600' :
            'text-yellow-600';

    const matchTypeLabels: { [key: string]: string } = {
        'persistent_exact': '🔴 Exact Persistent ID',
        'persistent_fuzzy': '🟠 Fuzzy Persistent ID',
        'browser_exact': '🟡 Exact Browser FP',
        'browser_fuzzy': '🟢 Fuzzy Browser FP',
        'cross_component': '🔵 Cross-Component',
    };

    return (
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{matchTypeLabels[match.matchType] || match.matchType}</span>
                        <span className={`font-bold ${confidenceColor}`}>
                            {(match.confidence * 100).toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Blocked: <span className="font-mono">{match.blockedUser}</span> →
                        Matches: <span className="font-mono">{match.matchedUser}</span>
                    </p>
                </div>
                <span className="text-xs text-gray-500">
                    {new Date(match.timestamp).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
}
