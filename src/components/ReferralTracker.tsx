"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

const REFERRAL_COOKIE_KEY = 'referral_code';
const COOKIE_EXPIRY_DAYS = 7;

/**
 * ReferralTracker Component
 * 
 * This component captures the referral code from the URL and stores it in a cookie.
 * It should be included in the app layout to track referrals across all pages.
 */
export default function ReferralTracker() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const referralCode = searchParams?.get('ref');

        // Check if a referral code exists in the URL
        if (referralCode) {
            // Store the code in a cookie that lasts for specified days
            Cookies.set(REFERRAL_COOKIE_KEY, referralCode, {
                expires: COOKIE_EXPIRY_DAYS,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            console.log(`🎁 Referral code stored: ${referralCode}`);

            // Optional: Clean the URL without reloading the page
            // This removes the ?ref=XXX from the URL
            const pathname = window.location.pathname;
            const queryParams = new URLSearchParams(window.location.search);
            queryParams.delete('ref');

            const newUrl = queryParams.toString()
                ? `${pathname}?${queryParams.toString()}`
                : pathname;

            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, router]);

    // This component doesn't render anything visible
    return null;
}
