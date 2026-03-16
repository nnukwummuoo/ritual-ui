"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "@/api/config";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { IoConstructOutline, IoWarning } from "react-icons/io5";

export default function MaintenanceControl() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const token = useAuthToken();

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${URL}/api/maintenance`);
            if (res.data.ok) {
                setIsMaintenance(res.data.isMaintenance);
            }
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const toggleMaintenance = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await axios.post(
                `${URL}/api/maintenance/toggle`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.ok) {
                setIsMaintenance(res.data.isMaintenance);
                alert(res.data.message);
            }
        } catch (error) {
            console.error("Error toggling maintenance:", error);
            alert("Failed to update maintenance mode");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#1F2937] p-8 rounded-xl shadow-lg border border-gray-700 max-w-2xl mx-auto mt-10">
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-full ${isMaintenance ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-700 text-gray-400'}`}>
                    <IoConstructOutline size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Maintenance Mode</h2>
                    <p className="text-gray-400">Control system-wide maintenance status</p>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
                <div className="flex items-start gap-3">
                    <IoWarning className="text-amber-500 mt-1 shrink-0" size={24} />
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">About Maintenance Mode</h3>
                        <p className="text-gray-300 leading-relaxed">
                            When enabled, a banner will be displayed at the top of the application for all users, indicating that the system is under maintenance.
                            Use this during scheduled updates or critical fixes. It does <strong>not</strong> lock users out of the app completely, but serves as a warning.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between bg-[#080b14] rounded-lg p-6 border border-gray-700">
                <div>
                    <span className="block text-sm font-medium text-gray-400 mb-1">Current Status</span>
                    <span className={`text-xl font-bold ${isMaintenance ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {isMaintenance ? "MAINTENANCE ACTIVE" : "SYSTEM NORMAL"}
                    </span>
                </div>

                <button
                    onClick={toggleMaintenance}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center gap-2
            ${isMaintenance
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {isLoading ? "Processing..." : isMaintenance ? "Turn OFF Maintenance Mode" : "Turn ON Maintenance Mode"}
                </button>
            </div>
        </div>
    );
}
