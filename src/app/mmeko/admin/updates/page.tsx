'use client';

import { useState, useEffect } from 'react';

export default function AdminUpdates() {
    const [currentVersion, setCurrentVersion] = useState('1.0.0');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCurrentVersion();
    }, []);

    const fetchCurrentVersion = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3100';
            const response = await fetch(`${apiUrl}/api/version`);

            if (!response.ok) {
                throw new Error('Failed to fetch version');
            }

            const { version } = await response.json();
            setCurrentVersion(version);
        } catch (error) {
            console.error('Error fetching version:', error);
            setMessage('❌ Failed to fetch current version');
        }
    };

    const incrementVersion = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const parts = currentVersion.split('.');
            parts[2] = String(parseInt(parts[2]) + 1);
            const newVersion = parts.join('.');

            const apiUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3100';
            const response = await fetch(`${apiUrl}/api/version`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ version: newVersion })
            });

            if (response.ok) {
                setCurrentVersion(newVersion);
                setMessage('✅ Version updated! Users will be notified on their next activity.');
            } else {
                const error = await response.json();
                setMessage(`❌ Failed to update version: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating version:', error);
            setMessage('❌ Error updating version.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080b14] p-8">
            <div className="max-w-2xl mx-auto bg-[#111624] rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-white">Version Control</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                            Current Version
                        </label>
                        <div className="text-3xl font-bold text-blue-500">
                            {currentVersion}
                        </div>
                    </div>

                    <button
                        onClick={incrementVersion}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Updating...' : 'Push New Update'}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-md ${message.includes('✅')
                                ? 'bg-green-900/50 text-green-300 border border-green-700'
                                : 'bg-red-900/50 text-red-300 border border-red-700'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-gray-700/50 rounded-md border border-gray-600">
                        <h3 className="font-medium text-white mb-2">How it works:</h3>
                        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                            <li>Clicking "Push New Update" increments the patch version</li>
                            <li>All active users will see an update notification</li>
                            <li>Users can click "Update Now" to refresh with cleared cache</li>
                            <li>Authentication tokens are preserved during updates</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
