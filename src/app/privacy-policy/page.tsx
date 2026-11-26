"use client";

import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa";

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <div className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      <div className="flex flex-col w-full px-4 pt-10 text-gray-400 md:px-0 md:pt-6">
        <header className="flex items-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity"
            aria-label="Go back"
          >
            <FaAngleLeft size={30} />
          </button>
          <h4 className="text-lg font-bold text-white">🔒 Privacy Policy</h4>
        </header>

        <section>
          <div className="">
            <h2 className="mb-6 text-gray-500">Effective Date: 25th November 2026</h2>
            <p className="mb-3">
              Mmeko respects your privacy. This policy outlines how we collect, use, and protect your personal information.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">1. Information We Collect</h2>
            <p className="mb-3">
              Name, email, profile photo, and preferences during sign-up.
              Government ID, a selfie holding your ID, and your email address for identity verification (creators and fans).
              Messages and booking details (date, time, and venue) sent through the platform.
              Payment, Gold, referral, and transaction history, and payout wallet details (USDT/USDC).
              Device and browser information for security purposes.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">2. How We Use Your Information</h2>
            <p className="mb-3">
              To verify user identities.
              To process payments, bookings, and service requests.
              To review disputes and release or refund payments, including reviewing on-platform chat history and evidence of attendance.
              To personalize user experience.
              To communicate service updates, and promotions you can opt out of.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">3. Sharing of Data</h2>
            <p className="mb-3">
              We do not sell your personal data to third parties.
              Creators can view a fan&apos;s verification ID and selfie before accepting a booking request, so that every meet starts with trust and safety.
              We may share data with payment processors or law enforcement if legally required.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">4. Cookies & Tracking</h2>
            <p className="mb-3">
              We use cookies to enhance functionality and analytics.
              You can disable cookies in your browser settings, but some features may not work properly.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">5. Security</h2>
            <p className="mb-3">
              Your data is stored securely.
              Authorized Mmeko Support and admin staff may review
              on-platform messages, bookings, and verification documents only when needed to resolve disputes, verify identity,
              enforce our Terms, or comply with the law. Access is limited to authorized staff.
              Verification documents are reviewed manually and are not shared with anyone except as described in Section 3.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">6. Your Rights</h2>
            <p className="mb-3">
              You can request access or deletion of your data at any time, subject to records we must keep for payments, disputes, and legal compliance.
              Contact support for any privacy-related concerns.
            </p>

            <h2 className="my-2 text-xl font-semibold text-gray-300">7. Contacting the Website</h2>
            <p className="mb-16">
              If you have any questions about this privacy statement, the practices of this site, or your dealings with this Web site, please contact Mmeko Support through the Help &amp; Support page.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;