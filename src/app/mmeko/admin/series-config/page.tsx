'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.NEXT_PUBLIC_API || '';

export default function SeriesConfigPage() {
    const [config, setConfig] = useState<string>('');
    const [isDefault, setIsDefault] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API}/api/ai-story/series-config`);
            const data = res.data?.config ?? res.data;
            setIsDefault(!!res.data?.isDefault);
            setConfig(JSON.stringify(data, null, 2));
        } catch (err: unknown) {
            console.error('Error fetching series config:', err);
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                || (err as Error)?.message
                || 'Failed to load series config';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleSave = async () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(config);
        } catch {
            toast.error('Invalid JSON. Fix syntax before saving.');
            return;
        }
        try {
            setSaving(true);
            setError(null);
            await axios.put(`${API}/api/ai-story/series-config`, parsed);
            toast.success('Series config saved.');
            setIsDefault(false);
            await fetchConfig();
        } catch (err: unknown) {
            console.error('Error saving series config:', err);
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                || (err as Error)?.message
                || 'Failed to save';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-gray-400">Loading series config...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">30-day Ritual series config</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Configure the series premise, characters, relationship state, timeline, and daily slots. Save to apply. The next episode is generated automatically every day (cron at 12:00 AM UTC).
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                    {saving ? 'Saving…' : 'Save config'}
                </button>
            </div>

            {isDefault && (
                <div className="p-3 bg-amber-900/40 border border-amber-600/50 rounded-lg text-amber-200 text-sm">
                    No config saved yet. This is the default config. Click “Save config” to create it in the database and start the 30-day series.
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-900/40 border border-red-600/50 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

            <textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                className="w-full h-[60vh] min-h-[320px] p-4 font-mono text-sm bg-[#080b14] text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                spellCheck={false}
            />
        </div>
    );
}
