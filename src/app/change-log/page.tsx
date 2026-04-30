"use client"
import React, { useState, useEffect } from "react";

const changelog = [
  {
    version: "What's New on Mmeko?",
    date: "July 2025",
    intro: "Welcome to Mmeko, where real fans connect with real creators safely, privately, and globally. We're always improving to make your experience smoother, smarter, and more rewarding. Here's what's new and working right now:",
    updates: [
      { type: "current", text: "🔮 Rituals - Your daily 15-panel story. Share how a fan meet went, post reaction photos, go behind the scenes — in your own words, with your own photos. Lives for 30 days. Archives to your profile forever." },
      { type: "current", text: "Fan Call - Connect 1-on-1 via secure video call. Creators earn per minute, fans get real-time connection." },
      { type: "current", text: "Fan Meet - A short, casual meeting where you can greet your favorite creator, chat, and even take a selfie. It's about making a quick personal connection - limited to 30 minutes maximum for safety and fairness." },
      { type: "current", text: "Fan Date -  Fan Date – A slightly more relaxed session where you spend time together in a safe public place — like grabbing coffee, eating, or walking — but still limited to 30 minutes maximum for safety and fairness." },
      { type: "current", text: "VIP Accounts - Premium fan features like a lion badge, priority support, and extra attention from creators." },
      { type: "current", text: "Messaging - Private in-app chat lets fans and creators talk freely — no charges." },
      { type: "current", text: "Gold Wallet - Use gold coins to pay for anything: calls, dates. Fans buy gold, creators earn it." },
      { type: "current", text: "✨ Exclusive Content - Creators can share rare moments behind a veil. Fans unlock these exclusive drops with gold. Access to the unseen, intimate, and lasting content that honors truest supporters." },
    ],
  },
  {
    version: "Coming Soon",
    date: "Future Updates",
    updates: [
      { type: "coming", text: "Smart Discovery - We're adding AI-powered recommendations to help fans find their ideal creator instantly." },
      { type: "coming", text: "Creator Rankings - Top-performing and most-loved creators will appear on trending pages for even more visibility." },
      { type: "coming", text: "Ad Revenue Sharing - Because Mmeko is built on creators, we believe in sharing value directly. In the future, all ad revenue will be split 50/50 with Creators. This ensures that as Mmeko grows, your earnings grow with it. Without creators, there is no Mmeko — and this model honors that truth.  " },
    ],
  },
];

const typeConfig = {
  current: {
    bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/50",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/25",
    icon: "🟢",
  },
  coming: {
    bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50",
    text: "text-amber-300",
    glow: "shadow-amber-500/25",
    icon: "⏱️",
  },
} as const;

export default function ChangelogPage() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      changelog.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => new Set([...prev, index]));
        }, index * 200);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="md:min-h-screen min-h-[110vh] bg-inherit relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-0 mb-24 px-4 py-10">
        <div className="max-w-3xl mx-auto sm:ml-0">
          {/* Header with animation */}
          <div className="mb-10 text-center transform transition-all duration-1000 translate-y-0 opacity-100">
            <h1 className="mb-4 text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              What&apos;s New on Mmeko?
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full animate-pulse"></div>
          </div>

          {/* Changelog entries */}
          <div className="space-y-8">
            {changelog.map((log, logIndex) => (
              <div
                key={log.version}
                className={`transform transition-all duration-1000 ${visibleItems.has(logIndex)
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                  }`}
                style={{ transitionDelay: `${logIndex * 200}ms` }}
              >
                <div
                  className={`group relative p-6 rounded-2xl backdrop-blur-xl border transition-all duration-500  ${hoveredCard === logIndex
                      ? "bg-white/10 border-white/30 shadow-2xl shadow-purple-500/20"
                      : "bg-white/5 border-white/10 shadow-xl"
                    }`}
                  onMouseEnter={() => setHoveredCard(logIndex)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

                  {/* Version header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-2xl font-bold text-white ">
                        {log.version}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                      {log.date}
                    </span>
                  </div>

                  {/* Intro text for first section */}
                  {log.intro && (
                    <div className="mb-6 text-gray-300 leading-relaxed">
                      {log.intro}
                    </div>
                  )}

                  {/* Updates */}
                  <div className="space-y-4">
                    {log.updates.map((update, updateIndex) => (
                      <div
                        key={updateIndex}
                        className={`group/item flex flex-col items-start gap-4 p-3 md:p-4 rounded-xl border transition-all duration-300 hover:transform hover:translate-x-2 md:flex-row md:items-start ${typeConfig[update.type as keyof typeof typeConfig].bg
                          } border-white/10 hover:${typeConfig[update.type as keyof typeof typeConfig].glow
                          } hover:shadow-lg`}
                        style={{
                          animationDelay: `${logIndex * 200 + updateIndex * 100
                            }ms`,
                        }}
                      >
                        {/* Type badge with icon */}
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${typeConfig[update.type as keyof typeof typeConfig].bg
                            } ${typeConfig[update.type as keyof typeof typeConfig].text
                            } border-current/30 group-hover/item:scale-110 transition-transform duration-300`}
                        >
                          <span>{typeConfig[update.type as keyof typeof typeConfig].icon}</span>
                          <span>{update.type === 'current' ? 'LIVE' : 'SOON'}</span>
                        </div>

                        {/* Update text */}
                        <div className="flex-1 text-gray-200 leading-relaxed group-hover/item:text-white transition-colors duration-300">
                          {update.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-3">⚡ Stay Tuned</h3>
              <p className="text-gray-300 mb-4">
                We&apos;re just getting started.<br />
                More features. More rewards. More freedom for creators.
              </p>
              <p className="text-gray-400 text-sm">
                Thanks for helping us build something different — something real.
              </p>
              {/* <p className="text-purple-400 font-semibold mt-2">– Team Mmeko</p> */}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Building the future of fan connections</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}