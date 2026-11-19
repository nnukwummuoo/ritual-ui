"use client"
import React, { useEffect, useState } from 'react'
import { FaLock, FaMoneyBillWave, FaBolt, FaHeart, FaChevronLeft, FaCoins } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function PPVInfoPage() {
    const router = useRouter();
    const [isCreatorVerified, setIsCreatorVerified] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("login");
            if (raw) {
                const data = JSON.parse(raw);
                const userData = data.user || data;
                setIsCreatorVerified(userData.creator_verified === true);
                return;
            }
        } catch (e) {
            console.error("PPV - Failed to read login data", e);
        }
        setIsCreatorVerified(false);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black text-white p-6 pb-20">
            {/* Header */}
            <div className="flex items-center mb-8">
                <button onClick={() => router.back()} className="mr-4">
                    <FaChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <FaLock size={20} className="text-white" />
                    <h1 className="text-2xl font-bold">Pay-Per-View Messages</h1>
                </div>
            </div>

            {/* Intro */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">What is a Pay-Per-View Message?</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    A Pay Per View (PPV) message is a private, blurred message that fans must pay to view.
                    Every message you share becomes an opportunity to earn — fans invest to access your words, updates, or replies.
                </p>
            </div>

            {/* Gold rate */}
            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-4 mb-8">
                <FaCoins className="text-yellow-400" size={20} />
                <p className="text-sm text-gray-200">
                    <span className="font-bold text-yellow-400">1 Gold = $0.04</span>
                    <span className="text-gray-400"> — PPV prices are set in Gold.</span>
                </p>
            </div>

            {/* Benefits */}
            <div className="space-y-6 mb-10">
                <h3 className="text-lg font-bold mb-4">Benefits</h3>

                <div className="flex gap-4">
                    <div className="mt-1"><div className="bg-white/10 p-2 rounded-full"><FaLock size={14} /></div></div>
                    <div>
                        <h4 className="font-bold">Fans pay to view your messages</h4>
                        <p className="text-gray-400 text-xs">Every message generates income.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="mt-1"><div className="bg-white/10 p-2 rounded-full"><FaMoneyBillWave size={14} /></div></div>
                    <div>
                        <h4 className="font-bold">100% Earnings</h4>
                        <p className="text-gray-400 text-xs">You keep all of the payment - no cuts, no fees.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="mt-1"><div className="bg-white/10 p-2 rounded-full"><FaBolt size={14} /></div></div>
                    <div>
                        <h4 className="font-bold">Instant Payouts</h4>
                        <p className="text-gray-400 text-xs">Fans pay immediately when they view.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="mt-1"><div className="bg-white/10 p-2 rounded-full"><FaHeart size={14} /></div></div>
                    <div>
                        <h4 className="font-bold">Strong Fan Connection</h4>
                        <p className="text-gray-400 text-xs">Fans value your replies more when they invest to see them.</p>
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="mt-10 mb-6">
                {isCreatorVerified === null ? null : isCreatorVerified ? (
                    <button
                        onClick={() => router.push("/settings/ppv/settings")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
                    >
                        Go to PPV Settings
                    </button>
                ) : (
                    <div className="w-full bg-white/10 text-gray-300 text-sm text-center py-4 px-4 rounded-xl">
                        Pay-Per-View is available to verified creators only.
                    </div>
                )}
            </div>
        </div>
    )
}