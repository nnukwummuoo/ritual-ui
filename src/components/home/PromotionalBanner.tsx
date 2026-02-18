"use client";
import React from 'react';
import { BadgeCheck } from 'lucide-react';

const PromotionalBanner: React.FC = () => {
    return (
        <div className="mx-auto - max-w-[30rem] w-full">
            <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-blue-300 rounded-2xl w-full p-6 md:p-8 shadow-2xl border border-blue-300/50">
                {/* Headline */}
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                    Meet Your Fans. Keep 100%. Stay Safe.
                </h2>

                {/* Sub-headline */}
                <p className="text-white text-sm md:text-base mb-6 leading-relaxed">
                    <span className="font-medium text-white">Mmeko is the only platform where creators can host Fan Meets, Fan Dates, Fan Calls, and Exclusive Contents with a clear safety framework and keep 100% of their earnings. no cuts • no fees • just pure connection.</span>
                </p>

                {/* Verified Badge */}
                <div className="flex items-center gap-2">
                    <BadgeCheck size={24} fill="#22c55e" className="text-white" />
                    <span className="text-white text-base font-medium">Verified creator</span>
                </div>
            </div>
        </div>
    );
};

export default PromotionalBanner;
