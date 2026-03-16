"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { URL } from '@/api/config'
import Image from 'next/image'
import { FaCheck, FaTimes, FaUser } from 'react-icons/fa'
import { getImageSource } from '@/lib/imageUtils'

interface PPVRequest {
    _id: string;
    firstname: string;
    lastname: string;
    username: string;
    photolink: string;
    followersCount: number;
    followingCount: number;
    likesCount: number;
    hasPortfolio: boolean;
}

export default function PPVRequestsPage() {
    const [requests, setRequests] = useState<PPVRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${URL}/api/ppv/admin/requests`);
            if (res.data.ok) {
                setRequests(res.data.requests);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (userid: string, action: "approve" | "decline") => {
        try {
            const res = await axios.post(`${URL}/api/ppv/admin/action`, { userid, action });
            if (res.data.ok) {
                // Remove from list
                setRequests(prev => prev.filter(r => r._id !== userid));
                alert(`Request ${action}d successfully`);
            }
        } catch (error) {
            console.error(error);
            alert("Action failed");
        }
    }

    if (loading) return <div className="p-8 text-white">Loading requests...</div>

    return (
        <div className="min-h-screen bg-[#080b14] text-white p-6">
            <h1 className="text-2xl font-bold mb-6">PPV Access Requests</h1>

            {requests.length === 0 ? (
                <p className="text-gray-400">No pending requests.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {requests.map(req => (
                        <div key={req._id} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 relative rounded-full overflow-hidden bg-gray-700">
                                    {req.photolink ? (
                                        <img src={getImageSource(req.photolink, 'profile').src} alt={req.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><FaUser /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{req.firstname} {req.lastname}</h3>
                                    <p className="text-gray-400 text-sm">{req.username}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm bg-gray-700/50 p-3 rounded-lg">
                                <div className="text-center">
                                    <span className="block font-bold text-lg">{req.followersCount}</span>
                                    <span className="text-gray-400 text-xs">Fans</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-lg">{req.followingCount}</span>
                                    <span className="text-gray-400 text-xs">Following</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-lg">{req.likesCount || 0}</span>
                                    <span className="text-gray-400 text-xs">Likes</span>
                                </div>
                                <div className="col-span-3 text-center border-t border-gray-600 pt-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${req.hasPortfolio ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                        {req.hasPortfolio ? "Portfolio Created" : "No Portfolio"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => handleAction(req._id, "approve")}
                                    className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <FaCheck /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req._id, "decline")}
                                    className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <FaTimes /> Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
