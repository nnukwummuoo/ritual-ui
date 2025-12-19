"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "@/api/config";
import { IoWarningOutline, IoClose } from "react-icons/io5";

export default function MaintenanceBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const checkMaintenanceStatus = async () => {
            try {
                const res = await axios.get(`${URL}/api/maintenance`);
                if (res.data.ok) {
                    setIsVisible(res.data.isMaintenance);
                }
            } catch (error) {
                console.error("Error checking maintenance status:", error);
            }
        };

        checkMaintenanceStatus();

        // Poll every minute
        const interval = setInterval(checkMaintenanceStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!isVisible || isDismissed) return null;

    return (
        <div className="bg-amber-500 text-white px-4 py-2 relative shadow-md z-[9999] print:hidden">
            <div className="container mx-auto flex items-center justify-center gap-2">
                <IoWarningOutline size={20} className="shrink-0" />
                <p className="text-sm font-medium text-center">
                    System Under Maintenance: Some features may be temporarily unavailable.
                </p>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-600 rounded-full transition-colors"
                    aria-label="Dismiss"
                >
                    <IoClose size={18} />
                </button>
            </div>
        </div>
    );
}
