"use client";
import React, { useState, useEffect } from "react";
import { IoEyeOutline } from "react-icons/io5";

const NewRitualCard: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
    }>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(now);

            // Set target to today at 12:00 AM (Midnight) UTC
            // This aligns with the cron job: cron.schedule('0 0 * * *', ..., { timezone: "UTC" })
            target.setUTCHours(24, 0, 0, 0);

            // Note: setUTCHours(24) automatically rolls over to the next day 00:00:00 UTC
            // So 'target' is now always the UPCOMING midnight UTC relative to the date of 'now'
            // If 'now' is Jan 12, target becomes Jan 13 00:00 UTC.
            // If 'now' is exactly Jan 12 00:00 UTC, target is Jan 13 00:00 UTC (24h timer).

            const diff = target.getTime() - now.getTime();

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
        };

        calculateTimeLeft(); // Initial calculation
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (val: number) => val.toString().padStart(2, "0");

    return (
        <div className="w-full bg-[#0a0a1a] rounded-xl overflow-hidden relative border border-purple-500/20 shadow-lg shadow-purple-900/20">
            {/* Glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-600/20 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="relative z-10 p-4 md:p-6 flex items-center justify-between gap-2 md:gap-4">
                {/* Left Text */}
                <div className="flex flex-col leading-none">
                    <span className="text-[#F5E6CC] font-bold text-lg md:text-3xl tracking-tighter">NEW</span>
                    <span className="text-[#F5E6CC] font-bold text-lg md:text-3xl tracking-tighter">RITUAL</span>
                </div>

                {/* Center Icon */}
                <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-purple-400 bg-transparent flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        {/* Inner diamond shape implies an eye pupil or similar */}
                        <IoEyeOutline className="text-[#F5E6CC] w-6 h-6 md:w-8 md:h-8 drop-shadow-[0_0_8px_rgba(245,230,204,0.8)]" />
                    </div>
                    {/* Ring Glow */}
                    <div className="absolute inset-0 rounded-full border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse"></div>
                </div>

                {/* Right Timer */}
                <div className="flex flex-col items-end">
                    <span className="text-purple-300 text-[10px] md:text-xs font-semibold tracking-wider mb-1">DROP IN:</span>
                    <div className="text-[#F5E6CC] font-mono text-lg md:text-3xl font-bold tracking-widest leading-none">
                        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewRitualCard;
