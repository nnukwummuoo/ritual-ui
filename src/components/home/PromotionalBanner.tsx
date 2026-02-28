"use client";
import React from 'react';
import { BadgeCheck } from 'lucide-react';

const PromotionalBanner: React.FC = () => {
    return (
        <div className="mx-auto - max-w-[30rem] w-full">
            <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-blue-300 rounded-2xl w-full p-6 md:p-8 shadow-2xl border border-blue-300/50">
                {/* Headline */}
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                    The Platform Where Creators Keep 100% With Instant Payouts and Structured Safety.
                </h2>

                {/* Sub-headline */}
                <p className="text-white text-sm md:text-base mb-6 leading-relaxed">
                    <span className="font-medium text-white">From PPV messages to fan dates, Mmeko empowers creators with instant wallet releases and crypto cashouts within 24 hour. No holds. No chargebacks. Just safe connections and full earnings.</span>
                </p>

                {/* Verified Badge */}
                <div className="flex items-center gap-2">
                    <BadgeCheck size={24} fill="#22c55e" className="text-white" />
                    <span className="text-white text-base font-medium">Trusted by creators worldwide with instant payouts and structured safety.</span>
                </div>
            </div>
        </div>
    );
};

export default PromotionalBanner;
