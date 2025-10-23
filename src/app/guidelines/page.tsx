'use client'; 

import React from "react";
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

            <p className="mb-6 text-gray-500">Updated: 23th October, 2025</p>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-300">
                Welcome to Mmeko
                </h2>
                <p className="mt-2 text-gray-400">
                Welcome to Mmeko — a safe, creative platform where creators and fans
                connect authentically. To keep our space respectful, safe, and
                lawful, all users (creators and fans) must follow these community
                guidelines:
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🚫 1. No Explicit Adult Content</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>Nudity, pornography, and sexually explicit content are strictly prohibited.</li>
                <li>Simulated sexual acts, sex toys in sexual context, or visible genitals are not allowed.</li>
                <li>Content must be suggestive at most, not explicit.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🤝 2. Respect Boundaries</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>Do not pressure anyone into meeting, chatting, or sharing private content.</li>
                <li>Harassment, threats, or coercion will result in immediate account suspension.</li>
                <li>All interactions must be consensual and respectful.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🛡️ 3. No Prostitution or Escorting</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>Offering or requesting sexual services in exchange for money, gifts, or “transport fare” is strictly forbidden.</li>
                <li>"Fan Dates" and "Fan Meets" must remain non-sexual in both agreement and intent.</li>
                <li>Using euphemisms (e.g., “spoiling,” “hookup,” “overnight fun”) to imply paid sex is a violation.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">📷 4. Content Guidelines</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>Do not post: Pornographic material, Gore or violence, Hate speech or discriminatory content, Child exploitation (real or implied)</li>
                <li>All uploaded content must be original or you must have legal rights to share it.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🧑‍⚖️ 5. Protect Personal Safety</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>Never share personal info like full address, phone number, or financial data in public.</li>
                <li>Always meet in safe, public places for in-person fan events.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🚨 6. Zero Tolerance for Illegal Activity</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>No drugs, underage content, weapons, or fraud.</li>
                <li>Accounts involved in illegal activity will be banned permanently and may be reported to law enforcement.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🧾 7. Be Truthful</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>Do not misrepresent your identity, age, or intentions.</li>
                <li>Catfishing or using stolen content will result in immediate removal.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">💬 8. Use Messaging Responsibly</h2>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>No spamming or unsolicited promotion in DMs.</li>
                <li>No harassment or sexually aggressive language.</li>
                <li>Violations can result in suspension from messaging features or platform-wide bans.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-300">🛠️ Enforcement Policy</h2>
                <p className="mt-2 text-gray-400">
                We review reported content seriously. Penalties for violations:
                </p>
                <ul className="mt-2 text-gray-400 list-disc list-inside">
                <li>1st offense: Warning or temporary suspension</li>
                <li>2nd offense: Account restriction or content removal</li>
                <li>3rd offense: Permanent ban</li>
                </ul>
                <p className="mt-2 text-gray-400">
                Severe violations (e.g., underage content, threats, or prostitution offers) result in instant ban.
                </p>
            </section>

            <section className="mb-28">
                <p className="mt-2 text-gray-400">
                By using Mmeko, you agree to these rules. Our mission is to build a
                safe, rewarding space where creativity, connection, and respect
                thrive.
                </p>
            </section>
        </div>
    </div>
  );
};

export default Community;