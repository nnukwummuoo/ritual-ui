"use client"
import React, { useEffect, useState } from 'react'
import { FaChevronLeft, FaCoins } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { URL } from '@/api/config'
import { toast } from 'react-toastify'

export default function PPVSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [price, setPrice] = useState<number | "">("");
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const reduxUserId = useSelector((state: RootState) => state.register.userID);
    const [user, setUser] = useState<any>(null);

    const fetchProfile = async (userId: string) => {
        setLoading(true);
        try {
            const res = await axios.post(`${URL}/getprofilebyid`, { userid: userId });
            if (res.data.ok) {
                const userData = res.data.user || res.data.profile;
                setUser(userData);
                setEnabled(userData.ppvEnabled || false);
                setPrice(userData.ppvPrice || "");

                // Update localStorage to keep it fresh
                const raw = localStorage.getItem("login");
                if (raw) {
                    const data = JSON.parse(raw);
                    if (data.user) {
                        data.user.ppvEnabled = userData.ppvEnabled;
                        data.user.ppvPrice = userData.ppvPrice;
                    } else {
                        data.ppvEnabled = userData.ppvEnabled;
                        data.ppvPrice = userData.ppvPrice;
                    }
                    localStorage.setItem("login", JSON.stringify(data));
                }
            }
        } catch (error) {
            console.error("PPV Settings - Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("login");

            let userIdFromStorage = "";
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    const userData = data.user || data;
                    userIdFromStorage = userData?._id || userData?.userID;

                    setUser(userData);
                    setEnabled(userData.ppvEnabled || false);
                    setPrice(userData.ppvPrice || "");
                } catch (e) {
                    console.error("PPV Settings - Failed to parse login data", e);
                }
            }

            const finalUserId = userIdFromStorage || reduxUserId;
            if (finalUserId) {
                fetchProfile(finalUserId);
            }
        }
    }, [reduxUserId]);

    const handleSave = async () => {
        if (price === "" || Number(price) < 1) {
            toast.error("Please enter a valid price (minimum 1 Gold).");
            return;
        }

        const userId = user?._id || user?.userID || reduxUserId;

        if (!userId) {
            toast.error("User session not found. Please log in again.");
            return;
        }

        const payload = {
            userid: userId,
            enabled,
            price: Number(price)
        };

        setIsSaving(true);
        try {
            const res = await axios.put(`${URL}/api/ppv/settings`, payload);

            if (res.data.ok) {
                await fetchProfile(userId);
                toast.success("Settings saved successfully!");
                setIsEditing(false);
            } else {
                toast.error(res.data.message || "Failed to save settings.");
            }
        } catch (error: any) {
            console.error("PPV Settings - Error during save:", error);
            toast.error(error.response?.data?.message || "Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    }

    const handleCancel = () => {
        setIsEditing(false);
        const raw = localStorage.getItem("login");
        if (raw) {
            try {
                const data = JSON.parse(raw);
                const userData = data.user || data;
                setEnabled(userData.ppvEnabled || false);
                setPrice(userData.ppvPrice || "");
            } catch (e) {
                console.error("PPV Settings - Failed to parse login data on cancel", e);
            }
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button onClick={() => router.back()} className="mr-4 p-2 bg-gray-800 rounded-full">
                        <FaChevronLeft size={16} />
                    </button>
                    <h1 className="text-xl font-bold">Pay-Per-View Settings</h1>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
                    >
                        Edit Settings
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Toggle Enable */}
                <div className="bg-[#080b14] p-6 rounded-xl flex items-center justify-between border border-gray-800">
                    <div>
                        <h3 className="font-bold text-lg">PPV Status</h3>
                        <p className={`text-sm ${enabled ? 'text-green-400' : 'text-gray-400'}`}>
                            {enabled ? 'Currently Enabled' : 'Currently Disabled'}
                        </p>
                    </div>
                    {isEditing ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    ) : (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${enabled ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-gray-800 text-gray-400'}`}>
                            {enabled ? 'Active' : 'Inactive'}
                        </div>
                    )}
                </div>

                {/* Set Price */}
                <div className="bg-[#080b14] p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <FaCoins className="text-yellow-400" />
                        <h3 className="font-bold text-lg">Price per Message</h3>
                    </div>

                    {isEditing ? (
                        <>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    placeholder="Enter price in Gold"
                                    className="bg-gray-800 text-white p-4 rounded-lg w-full text-center text-xl font-bold border border-gray-700 focus:border-blue-500 outline-none placeholder-gray-600"
                                    min="1"
                                />
                            </div>
                            <p className="text-gray-400 text-xs mt-3 text-center">
                                Fans pay this amount (Gold) to unlock each of your PPV messages.
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-2">
                            {price ? (
                                <>
                                    <span className="text-4xl font-black text-yellow-400">{price}</span>
                                    <span className="ml-2 text-gray-400 font-bold">Gold</span>
                                </>
                            ) : (
                                <span className="text-gray-500 text-lg">No price set</span>
                            )}
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}