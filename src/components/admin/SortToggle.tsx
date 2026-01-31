"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "@/api/config";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { IoTimerOutline } from "react-icons/io5";
import { useToast } from "@/components/toast";

interface SortToggleProps {
    className?: string;
    showLabel?: boolean;
}

const SortToggle: React.FC<SortToggleProps> = ({
    className = "",
    showLabel = true
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isNewestFirst, setIsNewestFirst] = useState(false);
    const token = useAuthToken();
    const { successalert } = useToast();

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${URL}/api/maintenance/sort-status`);
            if (res.data.ok) {
                setIsNewestFirst(res.data.isNewestCreatorsFirst);
            }
        } catch (error) {
            console.error("Error fetching sort status:", error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const toggleSort = async () => {
        if (!token) return;

        // Confirm action
        if (!confirm(isNewestFirst
            ? "Turn OFF 'Newest First' sorting? This will revert to sorting by Online status and Views."
            : "Turn ON 'Newest First' sorting? This will sort all creators by join date."
        )) return;

        setIsLoading(true);
        try {
            const res = await axios.post(
                `${URL}/api/maintenance/toggle-sort`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.ok) {
                setIsNewestFirst(res.data.isNewestCreatorsFirst);
                successalert(
                    `Sort by newest turned ${res.data.isNewestCreatorsFirst ? 'ON' : 'OFF'}`,
                    "success"
                );
            }
        } catch (error) {
            console.error("Error toggling sort status:", error);
            successalert("Failed to update sort setting", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleSort}
            disabled={isLoading || !token}
            className={`
        flex items-center gap-2 rounded-lg transition-colors text-sm px-2 py-1
        ${isNewestFirst
                    ? 'bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-400 border border-indigo-500/30'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            title={isNewestFirst ? "Sort: Newest First (ON)" : "Sort: Newest First (OFF)"}
        >
            <IoTimerOutline size={16} />
            {showLabel && (
                <span className="font-medium">
                    {isLoading ? "Loading..." : isNewestFirst ? "Sort: Newest" : "Sort: Default"}
                </span>
            )}
        </button>
    );
}

export default SortToggle;
