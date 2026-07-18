'use client'; 

import React from "react";
import Head from "../../../../components/Head"
import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa";


const Community = () => {
    const router = useRouter();

  return (
    <div className="mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-12/12 mt-14 md:mt-8">
        <div className="flex flex-col w-full px-4 text-gray-400 md:px-0">
            <header className="flex items-center gap-4 mb-4">
                <FaAngleLeft
                color="white"
                size={30}
                onClick={() => router.back()}
                className="cursor-pointer"
                />
                <h4 className="text-lg font-bold text-white">Community Guidelines</h4>
            </header>

            <p className="mb-6 text-gray-500">Updated: 19th July, 2026</p>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-300">
                Welcome to Mmeko
                </h2>
                <p className="mt-2 text-gray-400">
                Mmeko is a professional booking platform where verified fans connect with creators
                for fan meets, fan calls, and fan dates. To keep our space safe, professional, and
                trustworthy for everyone, all users — creators and fans — must follow these community guidelines.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🚫 1. No Explicit Content</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Nudity, pornography, and sexually explicit content are strictly prohibited on the homepage, ritual page and portfolio page.</li>
                <li>Simulated sexual acts, sex toys in sexual context, or visible genitals are not allowed.</li>
                <li>Content must be suggestive at most — never explicit.</li>
                <li>Explicit uploads result in a permanent ban with no second chances.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🤝 2. Meet & Greet Rules</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>All in-person meetups are structured and limited to 30 minutes per booking.</li>
                <li>If both parties wish to continue, the fan may send a new structured booking request at the end of each session. Continuation is always optional and must be agreed upon by both parties.</li>
                <li>All meetups must take place in public venues — cafes, restaurants, malls, or other safe public locations.</li>
                <li>Private residences, hotel rooms, or non-public spaces are strictly prohibited for platform-arranged meetings.</li>
                <li>These rules exist to protect both creators and fans and ensure a professional, safe experience.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">📋 3. Platform Communication Policy</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>All communication between creators and fans must take place on the Mmeko platform.</li>
                <li>Creators are strongly encouraged to notify fans through the platform when leaving home, upon arrival, and when at the meeting spot.</li>
                <li>This on-platform communication serves as your proof of attendance and protects you in any dispute.</li>
                <li>Mmeko uses on-platform chat history as the primary evidence when reviewing support requests or disputes.</li>
                <li>Creators who maintain clear on-platform communication are fully protected regardless of how a fan feels about the experience.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">⚖️ 4. Date Quality & Payment Fairness</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Mmeko does not judge the quality of a date or the personal experience of either party.</li>
                <li>Mmeko only verifies whether the meet or date occurred — nothing more.</li>
                <li>If on-platform chat history confirms a creator arrived and the meeting took place, payment is released to the creator in full — regardless of how the fan felt about the experience.</li>
                <li>Fans cannot withhold or dispute payment based on personal satisfaction or subjective experience.</li>
                <li>Payment decisions are based solely on whether the meeting occurred, as verified through on-platform communication.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🛡️ 5. No Prostitution or Escorting</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Offering or requesting sexual services in exchange for money or gifts is strictly forbidden.</li>
                <li>Fan Dates and Fan Meets must remain non-sexual in both agreement and intent.</li>
                <li>Using euphemisms such as "spoiling," "hookup," or "overnight fun" to imply paid sexual services is a direct violation.</li>
                <li>Violations result in immediate permanent ban and may be reported to law enforcement.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🤝 6. Respect Boundaries</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Do not pressure anyone into meeting, chatting, or sharing private content.</li>
                <li>Harassment, threats, or coercion will result in immediate account suspension.</li>
                <li>All interactions must be consensual and respectful at all times.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">📷 7. Content Guidelines</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Do not post: pornographic material, gore or violence, hate speech or discriminatory content, or child exploitation of any kind — real or implied.</li>
                <li>All uploaded content must be original or you must have full legal rights to share it.</li>
                <li>Stolen, copyrighted, or impersonated content will result in immediate removal and account ban.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🧑‍⚖️ 8. Protect Personal Safety</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Never share personal information such as your full address, phone number, or financial data publicly or in messages.</li>
                <li>Always meet in safe, public places for in-person fan events.</li>
                <li>Your real name and ID details submitted during verification are kept strictly private and are never visible to fans or the public.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🚨 9. Zero Tolerance for Illegal Activity</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>No drugs, underage content, weapons, fraud, or illegal solicitation of any kind.</li>
                <li>Accounts involved in illegal activity will be permanently banned and reported to law enforcement.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🧾 10. Be Truthful</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>Do not misrepresent your identity, age, or intentions.</li>
                <li>Catfishing or using stolen content will result in immediate removal.</li>
                <li>All creators must complete ID verification before creating a portfolio. Verified identity builds trust for everyone on the platform.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">💬 11. Use Messaging Responsibly</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>No spamming or unsolicited promotion in DMs.</li>
                <li>No harassment or sexually aggressive language.</li>
                <li>Keep all booking-related communication on the platform to protect yourself and ensure faster dispute resolution.</li>
                <li>Violations can result in suspension from messaging features or platform-wide bans.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🛠️ Enforcement Policy</h2>
                <p className="mt-2 text-gray-400">
                We review all reported content seriously and act swiftly. Penalties for violations:
                </p>
                <ul className="mt-2 text-gray-400 list-disc list-inside space-y-2">
                <li>1st offense: Warning or temporary suspension</li>
                <li>2nd offense: Account restriction or content removal</li>
                <li>3rd offense: Permanent ban</li>
                </ul>
                <p className="mt-2 text-gray-400">
                Severe violations — including explicit content, underage content, threats, prostitution offers,
                or illegal activity — result in an instant permanent ban with no appeal.
                </p>
            </section>

            <section className="mb-28">
                <p className="mt-2 text-gray-400">
                By using Mmeko, you agree to these guidelines. Our mission is to build a safe,
                professional, and rewarding space where creators and fans connect with dignity,
                trust, and respect on both sides.
                </p>
            </section>
        </div>
    </div>
  );
};

export default Community;