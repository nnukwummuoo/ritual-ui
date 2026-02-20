"use client"
import React, { useEffect, useState } from 'react'
import { FaLock, FaMoneyBillWave, FaBolt, FaHeart, FaChevronLeft } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { URL } from '@/api/config'
import Image from 'next/image'

export default function PPVRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"none" | "pending" | "approved" | "declined">("none");

    // Get user data from Redux or LocalStorage
    // Get register state from Redux
    const register = useSelector((state: RootState) => state.register);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchStatus = async (uid: string) => {
            try {
                const res = await axios.post(`${URL}/getprofile`, { userid: uid });
                if (res.data.ok && res.data.profile) {
                    const latestStatus = res.data.profile.ppvStatus || "none";
                    setStatus(latestStatus);

                    // Sync with localStorage
                    const raw = localStorage.getItem("login");
                    if (raw) {
                        const data = JSON.parse(raw);
                        if (data.user) {
                            data.user.ppvStatus = latestStatus;
                        } else {
                            data.ppvStatus = latestStatus;
                        }
                        localStorage.setItem("login", JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch latest PPV status:", err);
            }
        };

        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("login");
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    const userData = data.user || data;
                    setUser(userData);

                    if (userData.ppvStatus) {
                        setStatus(userData.ppvStatus);
                    }

                    // Fetch latest from server to avoid stale state
                    const uid = userData.userID || userData._id;
                    if (uid) fetchStatus(uid);
                } catch (e) {
                }
            } else if (register.userID) {
                setUser({ userID: register.userID });
                fetchStatus(register.userID);
            }
        }
    }, [register.userID]);

    const handleRequest = async () => {
        // Based on your logs, the ID is in 'userID'
        const userId = user?.userID || user?._id || register.userID;

        if (!userId) {
            alert("Session error. Please log in again.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${URL}/api/ppv/request`, { userid: userId });

            if (res.data.ok) {
                setStatus("pending");
                // Update local storage
                const raw = localStorage.getItem("login");
                if (raw) {
                    const data = JSON.parse(raw);
                    if (data.user) {
                        data.user.ppvStatus = "pending";
                    } else {
                        data.ppvStatus = "pending";
                    }
                    localStorage.setItem("login", JSON.stringify(data));
                }
            }
        } catch (error) {
            alert("Failed to submit request.");
        } finally {
            setLoading(false);
        }
    }


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
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">What is a Pay-Per-View Message?</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    A Pay Per View (PPV) message is a private, blurred message that fans must pay to view.
                    Every message you share becomes an opportunity to earn — fans invest to access your words, updates, or replies.
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

            {/* Action Button */}
            <div className="mt-10 mb-6">
                {status === "pending" ? (
                    <button
                        disabled
                        className="w-full bg-gray-600 text-gray-300 font-bold py-4 rounded-xl cursor-not-allowed opacity-75"
                    >
                        Request Pending...
                    </button>
                ) : status === "approved" ? (
                    <button
                        onClick={() => router.push("/settings/ppv/settings")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
                    >
                        Go to PPV Settings
                    </button>
                ) : status === "declined" ? (
                    <button
                        onClick={handleRequest}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
                    >
                        {loading ? "Requesting..." : "Declined. Request Again?"}
                    </button>
                ) : (
                    <button
                        onClick={handleRequest}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
                    >
                        {loading ? "Requesting..." : "Request Access"}
                    </button>
                )}
            </div>
        </div>
    )
}
