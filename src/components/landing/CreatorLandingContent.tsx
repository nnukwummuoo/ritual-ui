"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  FaHandHoldingUsd,
  FaVideo,
  FaLock,
  FaUsers,
  FaCreditCard,
  FaShieldAlt,
  FaClock,
  FaFileImage,
  FaHeadset,
  FaQuestionCircle,
  FaChevronDown,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { getImageSource } from "@/lib/imageUtils";

interface CreatorAvatar {
  userId: string;
  username: string;
  photolink: string | null;
}

const CREATOR_AVATAR_COUNT = 10;

const features = [
  {
    icon: FaHandHoldingUsd,
    title: "Keep 100% of Your Earnings",
    subtitle: "Forever",
    description:
      "Unlike other platforms, we take 0%. Every cent you make from Fan Meets, Fan Dates, Fan Calls, and Exclusive Contents is yours.",
  },
  {
    icon: FaCreditCard,
    title: "Fan Meet = Real Cash, Real Life",
    subtitle: "Guaranteed Payment",
    description:
      "Going on a date or meeting a fan? They'll pay your transport fare upfront through the platform, we handle the logistics so you stay safe and respected.",
  },
  {
    icon: FaVideo,
    title: "Fan Call = Real-Time Earnings",
    subtitle: "Live Tracking",
    description:
      "Private video calls aren't just random chats. They're built to make you money. Fans pay per minute and both of you can track the balance live during the show.",
  },
  {
    icon: FaLock,
    title: "Pay Per View Messages = Every Reply Counts",
    subtitle: "Your Words, Your Worth",
    description:
      "Turn conversations into income with blurred messages fans unlock at the price you set. No subscriptions, no middlemen — just direct value for your attention. Every reply is protected, every unlock is instant, and you keep 100% of what you earn.",
  },
  {
    icon: FaFileImage,
    title: "Content Sales = Instant Value, Total Control",
    subtitle: "Keep Everything You Earn",
    description:
      "Dropping exclusive photos, videos, or bundles? Fans pay upfront through the platform — no subscriptions, no cuts, no chargebacks. Every sale is pure profit, 100% yours, with delivery handled automatically so your content stays protected and respected.",
  },
  {
    icon: FaUsers,
    title: "Built for Connection, Not Just Content",
    subtitle: "Authentic Engagement",
    description:
      "Our system isn't about spam posts or endless DMs. It's face-to-face, voice-to-voice—a real connection fans are willing to pay for.",
  },
];

const platformCaresItems = [
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description: "Need help? DM our team anytime. We're here to resolve issues and answer your questions.",
  },
  {
    icon: FaQuestionCircle,
    title: "Help Center",
    description: "Access guides, articles, and FAQs to get the most out of Mmeko and grow your creator business.",
  },
  {
    icon: FaShieldAlt,
    title: "Safety & Trust",
    description: "Structured safety rules, verified creators, and secure payments so you can focus on creating.",
  },
  {
    icon: FaUsers,
    title: "Community",
    description: "Connect with like-minded creators, share tips, and grow together on a platform that cares.",
  },
];

const faqItems: { question: string; answer: string }[] = [
  {
    question: "What is Mmeko?",
    answer:
      "Mmeko is a creator-first platform where you keep 100% of your earnings. We offer fan meets, fan calls, fan dates, pay-per-view messages, and content sales—all with instant payouts and no platform cuts.",
  },
  {
    question: "Who can create on Mmeko?",
    answer:
      "Anyone 18+ can apply to become a verified creator. We review applications quickly so you can start earning through fan meets, calls, dates, PPV messages, and exclusive content.",
  },
  {
    question: "How do I get paid?",
    answer:
      "You keep 100% of what you earn. Payouts are processed through the platform with instant wallet releases and options for crypto cashouts. No holds, no chargebacks—just your money, on your terms.",
  },
  {
    question: "How long does verification take?",
    answer:
      "Most creator applications are reviewed within hours. Once verified, you can set up your profile and start accepting fan meets, calls, dates, and selling content right away.",
  },
  {
    question: "Is my content and data protected?",
    answer:
      "Yes. We use structured safety rules, secure payments, and respect your control over your content. Exclusive content is delivered through the platform so you stay protected and in charge.",
  },
  {
    question: "How do fan meets and fan calls work?",
    answer:
      "Fans pay upfront for meets and per minute for video calls. Transport for meets is covered through the platform. You and the fan can track balances in real time, and you receive your earnings with no platform fee.",
  },
];

// Modern, fast, elegant motion tokens
const easeOut = [0.22, 1, 0.36, 1] as const;
const tFast = { duration: 0.35, ease: easeOut };
const tMedium = { duration: 0.4, ease: easeOut };
const cardHover = { scale: 1.01 };
const cardTap = { scale: 0.99 };
const buttonHover = { scale: 1.02 };
const buttonTap = { scale: 0.98 };

function getInitials(username: string): string {
  if (!username) return "?";
  const clean = username.replace("@", "").trim();
  if (clean.length >= 2) return clean.substring(0, 2).toUpperCase();
  return clean.charAt(0).toUpperCase();
}

function LovedByCreators({
  prefetchedCreators,
}: {
  prefetchedCreators?: CreatorAvatar[] | null;
}) {
  const [creators, setCreators] = useState<CreatorAvatar[]>(prefetchedCreators ?? []);
  const [loading, setLoading] = useState(
    () => !prefetchedCreators || prefetchedCreators.length === 0
  );

  // Use prefetched data when provided (e.g. from home page); sync when it arrives async
  useEffect(() => {
    if (prefetchedCreators !== undefined && prefetchedCreators !== null) {
      setCreators(prefetchedCreators);
      setLoading(prefetchedCreators.length === 0);
      return;
    }
    setLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/proxy/top_creators");
        const data = await res.json();
        if (!cancelled && data?.ok && Array.isArray(data.creators)) {
          setCreators(
            data.creators
              .slice(0, CREATOR_AVATAR_COUNT)
              .map((c: { userId: string; username: string; photolink?: string | null }) => ({
                userId: c.userId,
                username: c.username || "",
                photolink: c.photolink ?? null,
              }))
          );
        }
      } catch {
        if (!cancelled) {
          setCreators(
            Array.from({ length: CREATOR_AVATAR_COUNT }, (_, i) => ({
              userId: `placeholder-${i}`,
              username: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][i],
              photolink: null,
            }))
          );
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [prefetchedCreators]);

  useEffect(() => {
    if (creators.length > 0) setLoading(false);
  }, [creators.length]);

  const showSkeleton = loading && creators.length === 0;

  return (
    <motion.div
      className="flex flex-col items-center mt-8 justify-center mb-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tMedium}
    >
      <div className="flex items-center justify-center -space-x-3">
        {showSkeleton
          ? Array.from({ length: CREATOR_AVATAR_COUNT }, (_, index) => (
              <div
                key={`skeleton-${index}`}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-900 flex-shrink-0 bg-gray-700 animate-pulse"
                style={{ zIndex: CREATOR_AVATAR_COUNT - index }}
              />
            ))
          : creators.map((creator, index) => (
          <motion.div
            key={creator.userId}
            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-900 bg-gray-700 flex-shrink-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, ...tFast }}
            whileHover={{ scale: 1.06, zIndex: 10 }}
            style={{ zIndex: creators.length - index }}
          >
            {creator.photolink &&
            creator.photolink.trim() &&
            creator.photolink !== "null" &&
            creator.photolink !== "undefined" ? (
              // eslint-disable-next-line @next/next/no-img-element -- dynamic user profile URLs
              <img
                src={getImageSource(creator.photolink, "profilePhotos").src}
                alt={creator.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold"
              style={{
                display:
                  creator.photolink &&
                  creator.photolink.trim() &&
                  creator.photolink !== "null" &&
                  creator.photolink !== "undefined"
                    ? "none"
                    : "flex",
              }}
            >
              {getInitials(creator.username)}
            </div>
          </motion.div>
        ))}
      </div>
     
      <p className="text-gray-400 mt-2 text-sm text-center">
        Loved by 1,000+ Creators
      </p>
      <h2 className="text-sm md:text-xl text-white mt-2 mb-1 text-center leading-tight">
        The Platform Where Creators Keep 100% With Instant Payouts and Structured Safety.
      </h2>
      <p className="text-gray-400 text-xs md:text-sm text-center mt-1">
        No holds. No chargebacks. Just safe connections and full earnings.
      </p>
    </motion.div>
  );
}

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: tMedium,
        },
      }}
      whileHover={cardHover}
      whileTap={cardTap}
      transition={tFast}
      className="group cursor-default bg-gray-800 rounded-xl p-6 border border-gray-700 transition-colors duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="bg-gray-700 p-4 rounded-full mb-4"
          whileHover={{ scale: 1.06 }}
          transition={tFast}
        >
          <Icon
            className="text-blue-400 group-hover:text-blue-300"
            size={32}
          />
        </motion.div>
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
    </motion.div>
  );
}

function PlatformCaresSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section
      ref={ref}
      className="mt-16 px-2"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={tMedium}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
        Join a platform that cares
      </h2>
      <p className="text-gray-400 text-center text-sm md:text-base mb-8 max-w-lg mx-auto">
        Support, resources, and a community built for creators.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {platformCaresItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center text-center transition-colors duration-200 hover:border-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.04, ...tFast }}
              whileHover={cardHover}
            >
              <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center mb-4">
                <Icon className="text-blue-400" size={28} />
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section
      ref={ref}
      className="mt-16 px-2 pb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={tMedium}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
        Frequently asked questions
      </h2>
      <div className="space-y-2 max-w-2xl">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.02, ...tFast }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 py-4 px-5 text-left"
              >
                <span className="font-semibold text-white pr-2">{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={tFast}
                  className="flex-shrink-0 text-gray-400"
                >
                  <FaChevronDown size={18} />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: easeOut }}
                className="overflow-hidden"
              >
                <p className="text-gray-400 text-sm leading-relaxed pb-4 px-5 pt-0">
                  {item.answer}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export default function CreatorLandingContent({
  prefetchedCreators,
}: {
  prefetchedCreators?: CreatorAvatar[] | null;
}) {
  const router = useRouter();
  const sectionRef = useRef(null);
  const ctaRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-60px" });

  return (
    <div className="w-full text-white min-h-screen overflow-hidden">
      <div className="w-full md:w-2/4 mx-auto flex flex-col mb-12 px-3">
        {/* Loved by creators - overlapping profile pics */}
        <LovedByCreators prefetchedCreators={prefetchedCreators} />

        {/* Hero Call-to-Action */}
        <motion.div
          className="bg-gray-900 rounded-2xl shadow-lg p-8 mb-10 border border-gray-700/80 relative overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, ...tMedium }}
          whileHover={{ borderColor: "rgba(59, 130, 246, 0.25)", scale: 1.005 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 pointer-events-none" />
          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaShieldAlt className="text-orange-500" size={28} />
              <FaClock className="text-green-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Apply and be a Verified Creator within Hours
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Fast-track verification process with premium benefits.
            </p>
            <motion.button
              onClick={() => router.push("/auth/register")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/25"
              whileHover={buttonHover}
              whileTap={buttonTap}
              transition={tFast}
            >
              Apply Now
            </motion.button>
          </div>
        </motion.div>

        {/* What Sets Us Apart */}
        <div ref={sectionRef} className="px-2">
          <motion.h2
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={tMedium}
          >
            What Sets Us Apart?
          </motion.h2>
          <div className="space-y-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            ref={ctaRef}
            className="mt-12 text-center bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20"
            initial={{ opacity: 0, y: 12 }}
            animate={
              ctaInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={tMedium}
            whileHover={{ borderColor: "rgba(59, 130, 246, 0.35)", scale: 1.005 }}
          >
            <h3 className="text-xl font-bold mb-2">Ready to Start Earning?</h3>
            <p className="text-gray-400 mb-4">
              Join hundreds of successful creators on our platform.
            </p>
            <motion.button
              onClick={() => router.push("/auth/register")}
              className="bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-100"
              whileHover={buttonHover}
              whileTap={buttonTap}
              transition={tFast}
            >
              Begin Application
            </motion.button>
          </motion.div>
        </div>

        {/* Join a platform that cares */}
        <PlatformCaresSection />

        {/* Frequently asked questions */}
        <FAQSection />

        {/* Footer: Help, About, Terms, Privacy, Blog + copyright */}
        <footer className="mt-4 px-2 pb-4 pt-8 border-t border-gray-700/50">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/support"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Help
            </Link>
            <Link
              href="/about"
              className="text-gray-400 hover:text-white transition-colors"
            >
              About us
            </Link>
            <Link
              href="/T_&_C"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/auth/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/blog"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Blog
            </Link>
          </div>
          <p className="text-gray-500 text-center text-xs mt-6">
            © {new Date().getFullYear()} Mmeko. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
