"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

const UnauthenticatedPromoModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Show modal after a short delay for better UX
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
    };

    const handleClaimOffer = () => {
        setIsOpen(false);
        router.push('/auth/login');
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl border border-purple-500/30">
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <div className="pr-8">
                    {/* Headline */}
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 leading-tight">
                        Meet Your Fans  Keep 100%
                    <br />

                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 leading-tight">
                        Stay Safe 
                        </span>
                    </h2>

                    {/* Sub-headline */}
                    <p className="text-white text-lg mb-8 leading-relaxed">
                        <span className="font-medium text-white">Mmeko is the only platform where creators can host Fan Meets, Fan Dates, and Fan Calls with a clear safety framework and keep 100% of their earnings. </span>
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={handleClaimOffer}
                        className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
                    >
                        Start your creator journey today 
                    </button>

                    {/* Optional: Small text at bottom */}
                    <p className="text-gray-400 text-xs mt-4 text-center">
                       no cuts • no fees • just pure connection
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnauthenticatedPromoModal;
