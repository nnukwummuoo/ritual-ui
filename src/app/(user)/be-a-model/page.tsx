"use client";
import React from "react";
import {
  FaHandHoldingUsd,
  FaVideo,
  FaUsers,
  FaCreditCard,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import HeaderBackNav from "../../navs/HeaderBackNav";
import { useRouter } from "next/navigation";
// import { useNavigate } from "react-router-dom";

export default function VerificationPage(){
  const router = useRouter();
  // const [] = use

  const features = [
    {
      icon: FaHandHoldingUsd,
      title: "Keep 100% of Your Earnings",
      subtitle: "For 3 Months",
      description:
        "Unlike other platforms, we take 0%. Every cent you make from Fan Meets, Fan Dates, and Fan calls is yours.",
    },
    {
      icon: FaCreditCard,
      title: "Fan Date = Real Cash, Real Life",
      subtitle: "Guaranteed Payment",
      description:
        "Going on a date or meeting a fan? They'll pay your transport fare upfront through the platform—we handle the logistics so you stay safe and respected.",
    },
    {
      icon: FaVideo,
      title: "Fan Call = Real-Time Earnings",
      subtitle: "Live Tracking",
      description:
        "Private video calls aren't just random chats. They're built to make you money. Fans pay per minute and both of you can track the balance live during the show.",
    },
    {
      icon: FaUsers,
      title: "Built for Connection, Not Just Content",
      subtitle: "Authentic Engagement",
      description:
        "Our system isn't about spam posts or endless DMs. It's face-to-face, voice-to-voice—a real connection fans are willing to pay for.",
    },
  ];

  return (
    <div className="w-full  text-white min-h-screen">
      <HeaderBackNav title="Verification" />

      <div className="w-full md:w-2/4 mx-auto flex flex-col mb-12 px-3">
        {/* Header Section */}
        <div className="py-6 ">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Become A Model
          </h1>
          <p className="text-gray-400 text-lg">
            Join our premium platform and start earning today.
          </p>
        </div>

        {/* Hero Call-to-Action */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 mb-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaShieldAlt className="text-orange-500" size={28} />
              <FaClock className="text-green-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Apply and be a Verified Model within Hours
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Fast-track verification process with premium benefits.
            </p>
            <button
              onClick={() => router.push("/be-a-model/apply")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 shadow-md"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div className="px-2">
          <h2 className="text-3xl font-bold text-center mb-8">
            What Sets Us Apart?
          </h2>
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-800 rounded-xl p-6 border border-gray-700  transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gray-700 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon
                      className="text-blue-400 group-hover:text-blue-300"
                      size={32}
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-blue-300">
                    {feature.title}
                  </h3>
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full mb-1 font-medium">
                    {feature.subtitle}
                  </span>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-xl font-bold mb-2">Ready to Start Earning?</h3>
            <p className="text-gray-400 mb-4">
              Join thousands of successful models on our platform.
            </p>
            <button
              onClick={() => router.push("/be-a-model/apply")}
              className="bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Begin Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
