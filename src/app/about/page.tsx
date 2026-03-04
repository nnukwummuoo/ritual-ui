import React from "react";
import type { Metadata } from "next";
import AboutBackHeader from "./_components/AboutBackHeader";

export const metadata: Metadata = {
  title: "About Mmeko",
  description:
    "A platform built for creator sovereignty. Mmeko gives creators full control over their work, earnings, and audience — 100% of what you earn, no platform cut, no middlemen.",
};

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen text-white bg-black px-4 py-8 md:py-12 md:px-6">
      <div className="max-w-2xl mx-auto">
        <AboutBackHeader />
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          About Mmeko
        </h1>
        <p className="text-xl md:text-2xl text-center font-semibold text-gray-200 mb-8">
          A Platform Built for Creator Sovereignty
        </p>

        <p className="text-gray-300 leading-relaxed mb-8">
          Mmeko is more than a platform — it&apos;s a movement to give creators
          full control over their work, their earnings, and their audience. We
          believe every interaction has value, and creators deserve to keep 100%
          of what they earn without waiting periods, hidden cuts, or middlemen.
        </p>

        <h2 className="text-xl font-bold text-white mb-4">What We Offer</h2>
        <ul className="space-y-4 mb-10 text-gray-300 leading-relaxed">
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-gray-200">Pay Per View Messages</strong> —
              Blur replies until fans unlock them at the price you set. Every
              word counts, every unlock is instant.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-gray-200">Instant Payouts</strong> — Your
              earnings are released the moment you make them. No platform cut, no
              delays, no waiting periods.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-gray-200">Discovery Feed</strong> — Fans
              can find you easily, with AI‑powered discovery coming soon to
              amplify your reach.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-bold shrink-0">•</span>
            <span>
              <strong className="text-gray-200">Fan Interactions</strong> — Go
              beyond content with Fan Meets, Fan Calls, and Fan Dates — all
              designed with safety and transparency at the core.
            </span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mb-4">Why Mmeko</h2>
        <p className="text-gray-300 leading-relaxed mb-10">
          Mmeko is a creator‑first platform designed for sovereignty and safety. Creators keep 100% of earnings,
           receive instant payouts, and connect directly with fans through built‑in calls, dates, and meetups — all with 
           structured protection and effortless setup.
        </p>

        <h2 className="text-xl font-bold text-white mb-4">Our Vision</h2>
        <p className="text-gray-300 leading-relaxed">
          Mmeko is designed for dignity, legitimacy, and generational legacy.
          Every feature is choreographed to protect creators&apos; energy,
          ensure transparency, and build trust with fans.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
