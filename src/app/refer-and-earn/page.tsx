"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import axios from 'axios';
import { URL as API_URL } from '@/api/config';
import { toast } from 'material-react-toastify';
import { FaCopy, FaGift, FaShareAlt, FaUsers, FaRocket, FaChevronDown, FaChevronUp, FaSync } from 'react-icons/fa';
import Link from 'next/link';

interface Referral {
    id: string;
    username: string;
    joinedAt: string;
    status: string;
    rewardAmount: number;
    rewardType: string;
    milestoneCompleted?: boolean;
    milestoneFailed?: boolean;
    milestoneReward?: number;
    progress?: any; // Detailed progress object from backend
}

interface ReferralData {
    referralCode: string;
    referralCount: number;
    rewardBalance?: number;
    referrals: Referral[];
}

export default function ReferAndEarnPage() {
    // Try to get from Redux first
    const reduxUserId = useSelector((state: RootState) => state.register.userID);
    const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
    const reduxToken = useSelector((state: RootState) => state.register.refreshtoken);

    // Local state
    const [userId, setUserId] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [token, setToken] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);

    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [activeTab, setActiveTab] = useState<'steps' | 'rewards'>('steps');
    const [error, setError] = useState<string>('');

    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize user data from Redux or localStorage
    useEffect(() => {
        const initializeAuth = () => {
            let finalUserId = reduxUserId;
            let finalToken = reduxToken;
            let finalLoggedIn = reduxIsLoggedIn;

            // Fallback to localStorage if Redux is empty
            if (!finalUserId || !finalToken) {
                try {
                    const storedData = localStorage.getItem('login');
                    if (storedData) {
                        const parsedData = JSON.parse(storedData);
                        // Handle different casing/naming in localStorage
                        finalUserId = finalUserId || parsedData.userID || parsedData.userId || parsedData._id;
                        finalToken = finalToken || parsedData.refreshtoken || parsedData.accesstoken || parsedData.token;
                        finalLoggedIn = true; // If we have data in logi, assume logged in
                        console.log('📦 Using localStorage fallback for user data');
                    }
                } catch (err) {
                    console.error('Error reading from localStorage:', err);
                }
            }

            setUserId(finalUserId || '');
            setToken(finalToken || '');
            setIsLoggedIn(!!finalUserId && (!!finalToken || finalLoggedIn)); // Ensure we have ID and (token or logged in flag)
            setIsInitialized(true);
        };

        initializeAuth();
    }, [reduxUserId, reduxToken, reduxIsLoggedIn]);

    // Check if Web Share API is available
    useEffect(() => {
        setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
    }, []);

    const fetchReferralInfo = async () => {
        if (!userId || !token) {
            console.log('⚠️ Cannot fetch referral info - Missing auth data');
            setLoading(false);
            return;
        }

        try {
            setIsRefreshing(true);
            console.log('🚀 Fetching referral info for user:', userId.substring(0, 8) + '...');
            const response = await axios.get(`${API_URL}/api/referral`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('✅ Referral info response:', response.data);

            if (response.data.ok) {
                setReferralData(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to load referral data');
            }
        } catch (error: any) {
            console.error('❌ Error fetching referral info:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load referral information';
            setError(errorMsg);

            if (error.response?.status !== 404) {
                toast.error(errorMsg, {
                    style: { backgroundColor: '#111' },
                });
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch referral info on init
    useEffect(() => {
        if (isInitialized && isLoggedIn) {
            fetchReferralInfo();
        } else if (isInitialized && !isLoggedIn) {
            setLoading(false);
        }
    }, [isInitialized, isLoggedIn, userId, token]);

    const referralLink = referralData?.referralCode
        ? `${window.location.origin}/auth/register?ref=${referralData.referralCode}`
        : '';

    const copyToClipboard = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success('Referral link copied!', {
                style: { backgroundColor: '#111' },
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareReferral = async () => {
        if (canShare && referralLink) {
            try {
                await navigator.share({
                    title: 'Join Mmeko!',
                    text: `Join me on Mmeko! Use my referral code and we both get rewards! 🎁`,
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
            const response = await axios.post(`${API_URL}/api/referral/transfer`, {
                userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.ok) {
                toast.success('Successfully transferred to earning!', {
                    style: { backgroundColor: '#111' },
                });
                setShowTransferModal(false);
                // Update local state to reflect zero balance
                setReferralData(prev => prev ? ({ ...prev, rewardBalance: 0 }) : null);
            } else {
                toast.error(response.data.message || 'Transfer failed', {
                    style: { backgroundColor: '#111' },
                });
            }
        } catch (error: any) {
            console.error('Transfer error:', error);
            toast.error(error.response?.data?.message || 'Transfer failed', {
                style: { backgroundColor: '#111' },
            });
        } finally {
            setTransferring(false);
        }
    };

    // Show loading state while initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black p-4">
                <div className="bg-[#111624] p-8 rounded-2xl shadow-2xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                    <p className="text-gray-300 mb-6">
                        Please login to access the Refer & Earn program.
                    </p>
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    // Helper function to check if a referral is within the last 7 days
    const isWithinSevenDays = (joinedAt: string): boolean => {
        const joinedDate = new Date(joinedAt);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return joinedDate >= sevenDaysAgo;
    };

    // Filter referrals to only include those from the last 7 days
    const validReferrals = referralData?.referrals.filter(ref => isWithinSevenDays(ref.joinedAt)) || [];
    const validReferralCount = validReferrals.length;

    const currentBalance = referralData ? (referralData.rewardBalance !== undefined ? referralData.rewardBalance : (referralData.referralCount * 1.7)) : 0;

    return (
        <div className="min-h-screen bg-[#080b14] text-white flex flex-col items-center pt-12 px-4 relative">
            <div className="w-full max-w-md flex flex-col items-center">

                {/* Rocket Icon */}
                <div className="mb-6">
                    <FaRocket className="text-5xl text-blue-800" />
                </div>

                {/* Headline */}
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
                    Get up to $2 for every invite
                </h1>

                {/* Sub-headline */}
                <p className="text-gray-400 text-center mb-8">
                    Share your link: they earn, you earn.
                </p>

                {/* Share Button */}
                {/* Share & Copy Buttons */}
                <div className="w-full flex gap-4 mb-6">
                    <button
                        onClick={shareReferral}
                        className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        Share link
                        <FaShareAlt />
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className="flex-1 bg-[#111624] border border-gray-700 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                    >
                        Copy link
                        <FaCopy />
                    </button>
                </div>

                {/* Referral Code Display */}
                <div
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 mb-12 cursor-pointer hover:text-purple-400 transition-colors"
                >
                    <span className="text-blue-400 font-mono text-xl tracking-wider font-bold">
                        {referralData?.referralCode || 'LOADING...'}
                    </span>

                    <FaCopy className="text-blue-400" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {/* Total Earned */}
                    <div className="bg-[#080b14] rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-800 relative">
                        <p className="text-gray-400 text-sm mb-1">Total earned</p>
                        <p className="text-2xl font-bold text-white mb-2">💰{currentBalance.toFixed(1)}</p>

                        {currentBalance >= 1 && (
                            <button
                                onClick={() => setShowTransferModal(true)}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
                            >
                                Transfer to Earning
                            </button>
                        )}
                    </div>

                    {/* Your Referrals */}
                    <div className="bg-[#080b14] rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-800">
                        <p className="text-gray-400 text-sm mb-1">Your referrals</p>
                        <p className="text-2xl font-bold text-white">
                            {validReferralCount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                    </div>
                </div>

                {/* Steps & Rewards Tabs */}
                <div className="w-full mt-8 mb-8">
                    <div className="flex w-full bg-[#080b14] rounded-full p-1 mb-6">
                        <button
                            onClick={() => setActiveTab('steps')}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'steps' ? 'bg-[#111624] text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Steps
                        </button>
                        <button
                            onClick={() => setActiveTab('rewards')}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'rewards' ? 'bg-[#111624] text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Rewards
                        </button>
                    </div>

                    {activeTab === 'steps' ? (
                        <div className="space-y-6 px-2">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">1</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Share your link</h4>
                                    <p className="text-sm text-gray-400">Share your referral link with friends.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">2</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Friend signs up</h4>
                                    <p className="text-sm text-gray-400">Your friend creates a mmeko account.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">3</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">You earn rewards</h4>
                                    <p className="text-sm text-gray-400">Get rewards for every invite!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Rewards Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    To receive your reward, invite a friend who isn't on mmeko yet
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Invite rewards are available within the next <span className="text-blue-400 font-semibold">7 days</span>.
                                </p>
                            </div>

                            {/* Reward Tiers */}
                            <div className="space-y-3">
                                {/* Tier 1 */}
                                <div className="bg-[#080b14] p-4 rounded-xl border border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">💰</div>
                                        <div className="flex-1">
                                            {/* <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-blue-400 font-bold text-xl">$0.068</span>
                                            </div> */}
                                            <p className="text-gray-300 text-sm">
                                                when your friend uses your invite code
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tier 2 */}
                                <div className="bg-[#080b14] p-4 rounded-xl border border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">💰</div>
                                        <div className="flex-1">
                                            {/* <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-blue-400 font-bold text-xl">$0.40</span>
                                            </div> */}
                                            <p className="text-gray-300 text-sm">
                                                when your friend explores mmeko for 7 days
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bonus Tier: 7-Day Challenge */}
                                {/* <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-xl border-2 border-yellow-600/50">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">🎁</div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-yellow-400 font-bold text-xl">💰25 GOLD</span>
                                                <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded-full font-bold">BONUS</span>
                                            </div>
                                            <p className="text-gray-200 text-sm font-medium">
                                                when your friend spends <span className="text-yellow-300 font-bold">120 minutes daily</span> for <span className="text-yellow-300 font-bold">7 consecutive days</span>
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                ⏱️ 2 hours/day × 7 days = 25 gold reward!
                                            </p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional: Referral List */}
                {validReferrals.length > 0 && (
                    <div className="w-full mt-12">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-400">Recent Referrals (Last 7 Days)</h3>
                            <button
                                onClick={fetchReferralInfo}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <FaSync className={isRefreshing ? "animate-spin" : ""} />
                                Refresh Status
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(showAll ? validReferrals : validReferrals.slice(0, 3)).map((referral) => {
                                const progress = referral.progress;
                                const isCompleted = referral.milestoneCompleted || progress?.milestoneCompleted;
                                const isFailed = referral.milestoneFailed || progress?.milestoneFailed;

                                return (
                                    <div key={referral.id} className="bg-[#080b14] p-4 rounded-xl border border-gray-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-white font-medium block">{referral.username}</span>
                                                <span className="text-xs text-gray-500">Joined {new Date(referral.joinedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isCompleted ? (
                                                    <span className="text-green-400 text-xs font-bold bg-green-900/30 px-2 py-1 rounded-full">
                                                        Challenge Completed
                                                    </span>
                                                ) : isFailed ? (
                                                    <span className="text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded-full">
                                                        Challenge Ended
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-400 text-xs font-bold bg-blue-900/30 px-2 py-1 rounded-full">
                                                        In Progress
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        {!isCompleted && !isFailed && progress && (
                                            <div className="mt-3 bg-[#111624] rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs text-gray-400">Challenge Progress</span>
                                                    <span className="text-xs text-yellow-400 font-bold">
                                                        Day {progress.currentDayNumber || 1}/7
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mb-3">
                                                    <div className="bg-gray-700/50 p-2 rounded">
                                                        <p className="text-[10px] text-gray-400">Days Completed</p>
                                                        <p className="text-sm font-bold text-white">{progress.consecutiveDays}/7</p>
                                                    </div>
                                                    <div className="bg-gray-700/50 p-2 rounded">
                                                        <p className="text-[10px] text-gray-400">Total Time</p>
                                                        <p className="text-sm font-bold text-white">{progress.totalMinutesSpent || 0} mins</p>
                                                    </div>
                                                </div>

                                                {progress.todayProgress ? (
                                                    <div className="mt-2 border-t border-gray-700 pt-2">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-gray-400">Today's Activity</span>
                                                            <span className={progress.todayProgress.completed ? "text-green-400" : "text-blue-400"}>
                                                                {progress.todayProgress.minutes}/120 mins
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all duration-500 ${progress.todayProgress.completed ? "bg-green-500" : "bg-blue-500"}`}
                                                                style={{ width: `${Math.min(100, (progress.todayProgress.minutes / 120) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        No activity recorded today yet.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {validReferrals.length > 3 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="w-full flex items-center justify-center mt-4 text-gray-500 hover:text-white transition-colors py-2"
                            >
                                {showAll ? <span className="flex items-center gap-2">Show Less <FaChevronUp /></span> : <span className="flex items-center gap-2">Show More <FaChevronDown /></span>}
                            </button>
                        )}
                    </div>
                )}

            </div>

            {/* Transfer Confirmation Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-[#080b14] bg-opacity-80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#080b14] border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Transfer</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to transfer your entire reward balance of <span className="text-blue-400 font-bold">${currentBalance.toFixed(1)}</span> to your main earning wallet?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="flex-1 py-3 rounded-xl bg-[#111624] text-white font-semibold hover:bg-gray-700 transition"
                                disabled={transferring}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center"
                                disabled={transferring}
                            >
                                {transferring ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
