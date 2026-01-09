"use client";
import React from 'react';
import { CheckCircle } from 'lucide-react';

const SafetyRulesBanner: React.FC = () => {
    return (
        <div className="mx-auto max-w-[30rem] w-full">
            {/* Heading */}
            <h3 className="text-white text-lg font-bold mb-3 px-3">
                Safety Rules (Important)
            </h3>

            {/* Banner Card */}
            <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-blue-300 rounded-lg p-6 shadow-lg">
                <div className="space-y-4 text-white">
                    {/* Main Rule */}
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <CheckCircle size={24} fill="#22c55e" className="text-white" />
                        </div>
                        <p className="text-lg font-semibold leading-tight">
                            All Fan Meets and Fan Dates are limited to 30 minutes and must happen in public places.
                        </p>
                    </div>

                    {/* Additional Info */}
                    <p className="text-sm leading-relaxed pl-9">
                        Fans cover transport fare upfront and creators may include any reasonable expenses in their transport fare price.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SafetyRulesBanner;
