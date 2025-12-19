"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "@/api/config";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { IoConstructOutline } from "react-icons/io5";

interface MaintenanceToggleProps {
    className?: string;
    showLabel?: boolean;
}

const MaintenanceToggle: React.FC<MaintenanceToggleProps> = ({
    className = "",
    showLabel = true
}) => {
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

        // Simple optimistic UI is risky for system-wide state, but let's confirm
        if (!confirm(isMaintenance ? "Turn OFF maintenance mode?" : "Turn ON maintenance mode?")) return;

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
            }
        } catch (error) {
            console.error("Error toggling maintenance:", error);
            alert("Failed to update maintenance mode");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleMaintenance}
            disabled={isLoading || !token}
            className={`
        flex items-center gap-2 rounded-lg transition-colors text-sm px-2 py-1
        ${isMaintenance
                    ? 'bg-amber-900/40 hover:bg-amber-900/60 text-amber-500 border border-amber-500/30'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            title={isMaintenance ? "Turn OFF Maintenance Mode" : "Turn ON Maintenance Mode"}
        >
            <IoConstructOutline size={16} />
            {showLabel && (
                <span className="font-medium">
                    {isLoading ? "Loading..." : isMaintenance ? "Maintenance ON" : "Maintenance OFF"}
                </span>
            )}
        </button>
    );
}

export default MaintenanceToggle;
