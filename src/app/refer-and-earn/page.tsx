"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import axios from 'axios';
import { URL as API_URL } from '@/api/config';
import { toast } from 'material-react-toastify';
import { FaCopy, FaShareAlt, FaRocket } from 'react-icons/fa';
import Link from 'next/link';

interface Referral {
    id: string;
    username: string;
    joinedAt: string;
}

interface ReferralData {
    referralCode: string;
    referralCount: number;
    rewardBalance: number; // stored in dollars
    referrals: Referral[];
}

const GOLD_PER_DOLLAR = 25; // 50 gold = $2
const toGold = (dollars: number) => parseFloat((dollars * GOLD_PER_DOLLAR).toFixed(1));

export default function ReferAndEarnPage() {
    const reduxUserId = useSelector((state: RootState) => state.register.userID);
    const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
    const reduxToken = useSelector((state: RootState) => state.register.accesstoken);

    const [userId, setUserId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [canShare, setCanShare] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferring, setTransferring] = useState(false);

    // Auth from Redux, falling back to localStorage
    useEffect(() => {
        let finalUserId = reduxUserId;
        let finalToken = reduxToken;
        let finalLoggedIn = reduxIsLoggedIn;

        if (!finalUserId || !finalToken) {
            try {
                const stored = localStorage.getItem('login');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    finalUserId = finalUserId || parsed.userID || parsed.userId || parsed._id;
                    finalToken = finalToken || parsed.accesstoken || parsed.refreshtoken || parsed.token;
                    finalLoggedIn = true;
                }
            } catch (err) {
                console.error('Error reading from localStorage:', err);
            }
        }

        setUserId(finalUserId || '');
        setToken(finalToken || '');
        setIsLoggedIn(!!finalUserId && (!!finalToken || finalLoggedIn));
        setIsInitialized(true);
    }, [reduxUserId, reduxToken, reduxIsLoggedIn]);

    useEffect(() => {
        setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
    }, []);

    const fetchReferralInfo = async () => {
        if (!userId || !token) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/api/referral`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.ok) {
                setReferralData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to load referral data', { style: { backgroundColor: '#111' } });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load referral information', { style: { backgroundColor: '#111' } });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isInitialized && isLoggedIn) {
            fetchReferralInfo();
        } else if (isInitialized && !isLoggedIn) {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized, isLoggedIn, userId, token]);

    const referralLink = referralData?.referralCode
        ? `${window.location.origin}/auth/register?ref=${referralData.referralCode}`
        : '';

    const copyToClipboard = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied!', { style: { backgroundColor: '#111' } });
    };

    const shareReferral = async () => {
        if (canShare && referralLink) {
            try {
                await navigator.share({
                    title: 'Join Mmeko!',
                    text: 'Join me on Mmeko!',
                    url: referralLink,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            copyToClipboard();
        }
    };

    const handleTransfer = async () => {
        if (!userId || !token) return;
        setTransferring(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/referral/transfer`,
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.ok) {
                toast.success('Successfully transferred to earning!', { style: { backgroundColor: '#111' } });
                setShowTransferModal(false);
                setReferralData((prev) => (prev ? { ...prev, rewardBalance: 0 } : null));
            } else {
                toast.error(response.data.message || 'Transfer failed', { style: { backgroundColor: '#111' } });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Transfer failed', { style: { backgroundColor: '#111' } });
        } finally {
            setTransferring(false);
        }
    };

    const Spinner = () => (
        <div className="min-h-screen flex items-center justify-center bg-[#080b14]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );

    if (!isInitialized || loading) return <Spinner />;

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#080b14] p-4">
                <div className="bg-[#111624] p-8 rounded-2xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                    <p className="text-gray-300 mb-6">Please login to access Refer & Earn.</p>
                    <Link
                        href="/auth/login"
                        className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const balance = referralData?.rewardBalance || 0;

    return (
        <div className="min-h-screen bg-[#080b14] text-white flex flex-col items-center pt-12 pb-16 px-4">
            <div className="w-full max-w-md flex flex-col items-center">
                <FaRocket className="text-5xl text-blue-800 mb-6" />

                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
                    Get 50 Gold ($2) for every friend you invite
                </h1>
                <p className="text-gray-400 text-center mb-8">
                    Share your link. When your friend signs up with it, you earn.
                </p>

                <div className="w-full flex gap-4 mb-6">
                    <button
                        onClick={shareReferral}
                        className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        Share link <FaShareAlt />
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="flex-1 bg-[#111624] border border-gray-700 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                    >
                        Copy link <FaCopy />
                    </button>
                </div>

                <div
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 mb-10 cursor-pointer hover:text-purple-400 transition-colors"
                >
                    <span className="text-blue-400 font-mono text-xl tracking-wider font-bold">
                        {referralData?.referralCode || '...'}
                    </span>
                    <FaCopy className="text-blue-400" />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="rounded-2xl p-6 flex flex-col items-center text-center border border-gray-800">
                        <p className="text-gray-400 text-sm mb-1">Total earned</p>
                        <p className="text-2xl font-bold mb-2">💰{toGold(balance)}</p>
                        {balance >= 1 && (
                            <button
                                onClick={() => setShowTransferModal(true)}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
                            >
                                Transfer to Earning
                            </button>
                        )}
                    </div>
                    <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-800">
                        <p className="text-gray-400 text-sm mb-1">Your referrals</p>
                        <p className="text-2xl font-bold">{referralData?.referralCount || 0}</p>
                    </div>
                </div>

                {referralData && referralData.referrals.length > 0 && (
                    <div className="w-full">
                        <h3 className="text-lg font-bold text-gray-300 mb-3">Friends you invited</h3>
                        <div className="space-y-2">
                            {referralData.referrals.map((ref) => (
                                <div
                                    key={ref.id}
                                    className="flex items-center justify-between bg-[#111624] border border-gray-800 rounded-xl px-4 py-3"
                                >
                                    <div>
                                        <p className="font-semibold">{ref.username}</p>
                                        <p className="text-xs text-gray-500">
                                            Joined {new Date(ref.joinedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-yellow-400 font-bold text-sm">+50 Gold</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showTransferModal && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-[#111624] border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-2">Confirm Transfer</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Move 💰{toGold(balance)} Gold (${balance.toFixed(2)}) to your earnings?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                disabled={transferring}
                                className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={transferring}
                                className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold disabled:opacity-50"
                            >
                                {transferring ? 'Transferring…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}