"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';

const PromotionalBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if banner was dismissed within the last 24 hours
        const dismissedAt = localStorage.getItem('bannerDismissed');

        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10);
            const currentTime = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

            // If less than 24 hours have passed since dismissal, keep banner hidden
            if (currentTime - dismissedTime < twentyFourHours) {
                setIsVisible(false);
                return;
            }
        }

        // Show banner if it hasn't been dismissed or 24 hours have passed
        setIsVisible(true);
    }, []);

    const handleDismiss = () => {
        // Store current timestamp when banner is dismissed
        localStorage.setItem('bannerDismissed', Date.now().toString());
        setIsVisible(false);
    };

    // Don't render if banner is not visible
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-blue-300 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl border border-blue-300/50">
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
                    aria-label="Close banner"
                >
                    <X size={24} />
                </button>

                <div className="pr-8">
                    {/* Headline */}
                    <h2 className="text-xl font-bold text-white mb-4 leading-tight">
                        Meet Your Fans. Keep 100%. Stay Safe.
                    </h2>

                    {/* Sub-headline */}
                    <p className="text-white text-base mb-6 leading-relaxed">
                        <span className="font-medium text-white">Mmeko is the only platform where creators can host Fan Meets, Fan Dates, and Fan Calls with a clear safety framework – and keep 100% of their earnings. no cuts • no fees • just pure connection.</span>
                    </p>

                    {/* Verified Badge */}
                    <div className="flex items-center gap-2 mb-6">
                        <BadgeCheck size={24} fill="#22c55e" className="text-white" />
                        <span className="text-white text-base font-medium">Verified creator</span>
                    </div>

                    {/* Optional: Small text at bottom */}
                    <p className="text-white/80 text-xs text-center">
                      
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PromotionalBanner;
