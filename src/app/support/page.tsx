"use client";

import React, { useState, useMemo } from "react";
import {
  FaAngleLeft,
  FaQuestionCircle,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaClock,
  FaSearch,
  FaChevronDown,
  FaCrown,
  FaHeart,
  FaGlobeAmericas,
  FaHeadset,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { SupportForm } from "../../components/support/SupportForm";

import type { RootState } from "@/store/store";

// ── Types ─────────────────────────────────────────────────────────────────

type FAQItem = { question: string; answer: string };
type FAQSection = { icon: string; title: string; items: FAQItem[] };
type CategoryKey = "general" | "fans" | "creators";

// ── FAQ data ──────────────────────────────────────────────────────────────

const FAQ_DATA: Record<CategoryKey, FAQSection[]> = {
  general: [
    {
      icon: "🔑",
      title: "Getting Started",
      items: [
        {
          question: "How do I create an account?",
          answer:
            "Sign up with a username and password. You will also be given a unique 12-secret-phrase for recovery.",
        },
        {
          question: "What is the 12-secret-phrase?",
          answer:
            "It's your backup key. If you forget your password or lose access, you can use the 12-secret-phrase to recover your account.",
        },
        {
          question: "What if I lose my 12-secret-phrase?",
          answer:
            "If you forget your password and lose your 12-secret-phrase, your account cannot be recovered. Keep it safe.",
        },
      ],
    },
    {
      icon: "💰",
      title: "Gold & Payments",
      items: [
        {
          question: "What is Gold?",
          answer:
            "⭐ Gold is the in-app currency used for all paid features such as PPVs, Exclusive Contents, Fan Call, Fan Meet, and Fan Experience.\n1 Gold = $0.04 USD.",
        },
        {
          question: "How do I buy Gold?",
          answer:
            "🪙 You can buy Gold using USDT (BEP20 - Binance Smart Chain).\nYour Gold balance will appear instantly after payment is confirmed.",
        },
        {
          question: "Is Gold refundable?",
          answer:
            "🚫 No. All Gold purchases are non-refundable, as they are converted digital credits used within the platform.",
        },
        {
          question: "Can I transfer Gold to another user?",
          answer:
            "🔒 No. For security reasons, Gold is non-transferable and linked only to your account.",
        },
        {
          question: "What happens if I don't use my Gold?",
          answer: "💎 Your Gold never expires. You can use it anytime for calls, meets, or dates.",
        },
        {
          question: "Why is there a small gas fee during payment?",
          answer:
            "⚙ Gas fees are blockchain network fees, not platform charges.\nWe only collect the exact amount your wallet sends.",
        },
        {
          question: "What if my payment fails but funds are deducted?",
          answer:
            "📨 Contact Support immediately with your transaction hash (TXID).\nWe'll verify and credit your account manually.",
        },
      ],
    },
    {
      icon: "🚫",
      title: "Safety & Rules",
      items: [
        {
          question: "Can I post explicit content?",
          answer: "No ❌. One offense = permanent ban. No warnings, no second chances.",
        },
        {
          question: "What if a fan/creator breaks the rules?",
          answer: "Use the Report button. Our team will review immediately and take action.",
        },
      ],
    },
    {
      icon: "🛠",
      title: "Account & Access",
      items: [
        {
          question: "How do I log in?",
          answer: "Use your username and password.",
        },
        {
          question: "How do I recover my account?",
          answer:
            "Enter your 12-secret-phrase. It will reset your access and let you set a new password.",
        },
        {
          question: "Can I change my 12-secret-phrase?",
          answer: "No. It is fixed. Protect it carefully.",
        },
      ],
    },
    {
      icon: "⚠",
      title: "Reminder",
      items: [
        {
          question: "Username + Password = Daily Access.",
          answer: "12-Secret-Phrase = Your only backup key.",
        },
      ],
    },
    {
      icon: "💬",
      title: "Contact Support",
      items: [
        {
          question: "For disputes, bugs, or urgent help:",
          answer: "📩 Open a Support Ticket inside the app.\n🕒 Response Time: within 24 hours.",
        },
      ],
    },
  ],

  fans: [
    {
      icon: "🤝",
      title: "Fan Meet & Fan Date",
      items: [
        {
          question: "What are Fan Meet and Fan Date for?",
          answer:
            "🤝 Fan Meet – A short, casual meeting where you can greet your favorite creator, chat, and even take a selfie. It's about making a quick personal connection - limited to 30 minutes maximum for safety and fairness.\n\n🍽 Fan Date – A slightly more relaxed session where you spend time together in a safe public place — like grabbing coffee, eating, or walking — but still limited to 30 minutes maximum for safety and fairness.",
        },
      ],
    },
    {
      icon: "🚌",
      title: "Rate",
      items: [
        {
          question: "Why do I have to pay?",
          answer:
            "💡 Creators give their time to meet fans. To keep it fair and safe, fans cover their travel costs so creators don't lose money when showing up.",
        },
        {
          question: "How is the meet-up rate decided?",
          answer:
            "🚌 Meet-up prices are set by each creator individually. Creators have full control over their rates, and fans simply send a paid request based on the price listed. There are no negotiations through the platform — the price shown is the price for the booking.",
        },
        {
          question: "Do I still pay if the creator cancels?",
          answer: "❌ No. If the creator cancels, you'll get your payment refunded.",
        },
        {
          question: "Do I get a refund if I cancel?",
          answer:
            "✅ Yes, if you cancel before the creator accepts your request → full refund.\n⚠ No, you can't cancel after the creator accepts your request → payment is non-refundable.",
        },
        {
          question: "Can a fan cancel a request I already accepted?",
          answer:
            "❌ No. Once a creator accepts a request, it is final. If a fan does not show up, fails to respond to messages within 24 hours, or asks to cancel, contact Support immediately and we will review and release your payment immediately. If Support is not contacted within 18 days from the booking request date, the payment will be automatically refunded to the fan.",
        },
        {
          question: "Is this safe?",
          answer:
            "🛡 Yes. All Fan Meet and Fan Date sessions are limited to 30 minutes maximum, and must take place in a public location.",
        },
      ],
    },
    {
      icon: "❓",
      title: "Fan Meet / Fan Date Expiration",
      items: [
        {
          question: "What happens if the meet or date doesn't happen within 20 days?",
          answer:
            "🕒 If 20 days pass and the fan didn't mark it as complete, the system automatically refunds the fan's payment.",
        },
        {
          question: "What if the creator didn't show up?",
          answer:
            "🚫 If a creator does not attend the scheduled appointment, the fan will automatically receive a full refund. Refunds are released to the fan automatically on the 20th day from the booking request date.",
        },
        {
          question: "What if the fan didn't show up?",
          answer:
            "❌ Just contact mmeko Support directly through the platform. Our team reviews the situation using your on-platform chat history and releases your payment immediately. If Support is not contacted within 18 days from the booking request date, the payment will be automatically refunded to the fan.",
        },
      ],
    },
    {
      icon: "📞",
      title: "Fan Call",
      items: [
        {
          question: "What is Fan Call?",
          answer: "📞 Fan Call is a live call where fans pay per minute, and both sides track it in real time.",
        },
      ],
    },
    {
      icon: "❓",
      title: "Fan Call Expiration",
      items: [
        {
          question: "What happens if my Fan Call request isn't answered or started?",
          answer:
            "🕒 If your Fan Call doesn't start within 10 days after acceptance, it expires automatically.\nNo money is deducted, and you can always send a new request later.",
        },
        {
          question: "Will I lose any gold or balance if it expires?",
          answer: "💰 No. Fan Call payments are only deducted during the live call, not before.",
        },
        {
          question: "Why is there a 10-day limit?",
          answer: "⏳ This helps fans and creators stay active and ensures requests don't pile up or get forgotten.",
        },
      ],
    },
    {
      icon: "❓",
      title: "Attendance & No-Show Policy",
      items: [
        {
          question:
            "What if a fan refuses to mark a meet/date as complete, fails to respond within 24 hours, doesn't show up, or requests cancellation after the meet/date has already been accepted?",
          answer: "🚫 Simply contact mmeko support and we will release your payment immediately.",
        },
        {
          question: "What if a creator doesn't show up for a Fan Meet or Fan Date?",
          answer:
            "⚠ If a creator fails to appear or cancels last-minute, the fan will receive a full refund of the payment.\nRepeated no-shows by creators may result in account suspension or removal from the Fan Meet/Fan Date program.",
        },
        {
          question: "How do both sides stay protected?",
          answer:
            "🛡 The platform tracks confirmations, time logs, booking history and chat history.\nWe recommend both sides keep all communication and arrangements within the Mmeko platform. This ensures a clear paper trail, protects creators and fans, and makes dispute resolution simple and transparent.",
        },
      ],
    },
  ],

  creators: [
    {
      icon: "✨",
      title: "How to Become a Creator",
      items: [
        {
          question: "Step 1: Apply",
          answer:
            "🪪 Fill out the Creator Application Form with your details:\n\n• Full name, date of birth, email, and location\n• A photo of you holding a handwritten note\n• A clear photo of your valid ID\n\nOnce submitted, your application will be reviewed by our team.",
        },
        {
          question: "Step 2: Get Approved",
          answer:
            "✅ Our team checks every application to make sure all creators are real and verified.\nOnce approved, you'll receive a success notification and your \"Become a Creator\" button will automatically change to \"Create Portfolio.\"",
        },
        {
          question: "Step 3: Create Your Portfolio",
          answer:
            "🎨 Your portfolio is what fans will see on your public profile.\nAfter creating it, your button changes to \"My Portfolio.\"\nIf you delete it, it switches back to \"Create Portfolio.\"",
        },
        {
          question: "Step 4: Start Earning",
          answer:
            "💡 Once your portfolio is live, you can start receiving Fan Meets, Fan Dates, and Fan Calls — and earn Gold that you can withdraw in USDT or USDC (BEP20).",
        },
        {
          question: "Important Note",
          answer:
            "🔒 Verification is done to keep the platform safe, fair, and authentic for both creators and fans.\nIncomplete or unclear applications may be rejected, so double-check your details before submitting.",
        },
      ],
    },
    {
      icon: "🛡",
      title: "Your Protection",
      items: [
        {
          question: "What happens if a fan claims they had a bad experience or that you left early?",
          answer:
            "Mmeko does not judge the quality or content of the date; we only verify that the meet occurred. Here's exactly how you're protected:\n\n• The Paper Trail: Keep your communication on the Mmeko platform. Let the fan know when you're leaving home, when you arrive, and when you're at the meeting point.\n• No \"He Said, She Said\": If a fan attempts a dispute, Mmeko reviews the platform chat history — not the fan's version of events. Their word means nothing when the chat logs prove you arrived and were present.\n• Guaranteed Payouts: A fan cannot reduce or withhold your payment based on what happened during the date. Either the meet occurred, or it didn't.",
        },
        {
          question: "What if I get sick or have an emergency and can't make a booking?",
          answer:
            "You have up to 20 days to reschedule. The fan's payment stays secured during this time, so you don't lose the booking or feel pressured to rush back before you're ready.",
        },
         {
          question: "What If a fan refuses to mark a meet/date as complete, fails to respond to messages within 24 hours, doesn't show up or requests cancellation after the meet/date has already been accepted?",
          answer: "Simply contact mmeko support and we will release your payment immediately. We always have your back.",
        },
        {
          question: "How many days do I have to contact Mmeko Support if a fan refuses to mark a meet/date as complete, fails to respond to messages within 24 hours, doesn’t show up, or requests cancellation after the booking has already been accepted?",
          answer:
            "You have 18 days from the booking request date to contact Mmeko Support. If Support is not contacted within 18 days, the fan will automatically receive a refund on day 20.",
        },
        {
          question: "Does Mmeko truly automatically send you a fan\'s government ID and selfie confirmation?",
          answer:
            'Yes. You don\'t have to manually request IDs from fans. Fans verify their Mmeko account first, and the moment they click "Request" on your booking page, Mmeko automatically deducts full payment and sends you their verified ID and selfie confirmation — all before you accept or confirm anything. This ensures a smoother, more professional experience for both sides right from the start.',
        },
         {
          question: "How do both sides stay protected?",
          answer: "🛡 The platform tracks confirmations, time logs, booking history and chat history.\nWe recommend both sides keep all communication and arrangements within the Mmeko platform. This ensures a clear paper trail, protects creators and fans, and makes dispute resolution simple and transparent.",
        },
         {
          question: "Why do fans trust Mmeko?",
          answer: "Hesitant fans prefer Mmeko because their payment is protected until the booking is complete. Instead of handing money to a stranger, Mmeko holds it securely, giving them confidence to pay upfront.",
        },
      ],
    },
    {
      icon: "📺",
      title: "How PPV Works",
      items: [
        {
          question: "How PPV Works",
          answer:
            "PPV (Pay‑Per‑View) is available only to verified creators. To enable it:\n\n1. Verify your account — once verified, go to Settings.\n2. Navigate to the Pay‑Per‑View page and submit a Request.\n3. After approval, return to Settings to set your PPV price and save it.\n4. From then on, when replying to a fan, you can lock any reply by clicking the padlock icon in the typing container.\n\nThis allows you to send blurred or locked replies that fans can unlock by paying your set PPV price.",
        },
      ],
    },
    {
      icon: "💳",
      title: "Payments & Earnings",
      items: [
        {
          question: "How do Fan Meet / Fan Date payments work?",
          answer:
            "Fans pay upfront. The money is held in a pending account until the fan taps \"Mark as Complete.\" Once confirmed, the payment is instantly released to the Creator.",
        },
        {
          question: "How does Fan Call payment work?",
          answer:
            "Fans are charged per minute, and the money is transferred live to the Creator's account during the call.",
        },
         {
          question: "Do Creators keep 100% of their money?",
          answer: "Yes 💯. Creators always keep 100% of their earnings.",
        },
        {
          question: "Do I really get instant crypto payouts with Mmeko?",
          answer: "Yes. Once a booking is marked complete, you can request a payout and your full earnings are released instantly via crypto. There are no commissions, no subscription fees, and no delays — you receive 100% of your payment right away.",
        },
        {
          question: "How does mmeko make money if creators keep 100%?",
          answer:
            "Mmeko earns revenue through a processing fee when fans purchase Gold, the in-app currency used to request meetups, unlock messages, and buy content. Creators keep 100% of what they earn, with no subscriptions or hidden commissions. This model keeps things simple, transparent, and creator-first.",
        },
        {
          question: "How do creators earn from Gold?",
          answer:
            "👑 When fans spend Gold on Fan Calls, Fan Meets, Fan Dates, PPVs, or Exclusive Contents the full value goes directly to the creator's earnings dashboard.\nCreators can withdraw anytime in USDT or USDC (BEP20) to their connected wallet.",
        },
      ],
    },
    {
      icon: "💬",
      title: "Withdrawal Fees",
      items: [
        {
          question: "Why is there a $1 deduction on my withdrawal?",
          answer:
            "🪙 This is a fixed network transaction fee that covers blockchain gas costs and keeps payouts fast.\nSince gas fees change depending on Binance Smart Chain activity, we apply a standard $1 processing fee for stability.",
        },
        {
          question: "Does the platform profit from this fee?",
          answer: "⚙ No. The fee only covers blockchain and processing expenses — not a platform charge.",
        },
      ],
    },
  ],
};

const CATEGORY_META: Record<CategoryKey, { label: string; icon: React.ReactNode; blurb: string }> = {
  general: { label: "General", icon: <FaGlobeAmericas />, blurb: "Account basics, Gold, safety & rules" },
  fans: { label: "For Fans", icon: <FaHeart />, blurb: "Booking, rates, Fan Meet, Fan Date & Fan Call" },
  creators: { label: "For Creators", icon: <FaCrown />, blurb: "Applying, protection, PPV, payouts" },
};

// ── Accordion item ───────────────────────────────────────────────────────

const FAQRow: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({
  item,
  isOpen,
  onToggle,
}) => (
  <div className="border border-white/[0.06] rounded-xl bg-[#0d1120] overflow-hidden transition-colors hover:border-white/[0.12]">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
    >
      <span className="font-medium text-[15px] text-white">{item.question}</span>
      <FaChevronDown
        className={`shrink-0 w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${
          isOpen ? "rotate-180 text-[#9b59f5]" : ""
        }`}
      />
    </button>
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <p className="px-5 pb-5 text-sm leading-relaxed text-gray-400 whitespace-pre-line">
          {item.answer}
        </p>
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────

const SupportPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CategoryKey>("general");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  const profileUsername = useSelector((state: RootState) => state.profile?.username);

  const getCurrentUserId = () => {
    let currentUserId = reduxUserid;
    if (!currentUserId) {
      try {
        const stored = localStorage.getItem("login");
        if (stored) {
          const data = JSON.parse(stored);
          currentUserId = data?.userID || data?.userid || data?.id || "";
        }
      } catch (error) {
        console.error("Error getting userid from localStorage:", error);
      }
    }
    return currentUserId;
  };

  const handleFormSubmit = async (data: { category: string; email: string; message: string }) => {
    setIsSubmitting(true);

    const fullMessage = `📧 Support Request Details:
Category: ${data.category}
Email: ${data.email}
Message: ${data.message}
Timestamp: ${new Date().toLocaleString()}`;

    localStorage.setItem("supportMessage", fullMessage);
    window.location.href = "/message/supportchat";

    setIsSubmitting(false);
  };

  // Flattened search across every category, tagged with its origin tab
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;

    const results: { category: CategoryKey; sectionTitle: string; icon: string; item: FAQItem }[] = [];
    (Object.keys(FAQ_DATA) as CategoryKey[]).forEach((cat) => {
      FAQ_DATA[cat].forEach((section) => {
        section.items.forEach((item) => {
          if (
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
          ) {
            results.push({ category: cat, sectionTitle: section.title, icon: section.icon, item });
          }
        });
      });
    });
    return results;
  }, [search]);

  const activeSections = FAQ_DATA[activeTab];

  return (
    <div className="min-h-screen mb-24 bg-[#080b14] text-white">
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#111624] rounded-full transition-colors"
          >
            <FaAngleLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Support Center
            </h1>
            <p className="text-gray-500 text-sm">Answers, protection details, and help — organized for you</p>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#161226] via-[#12162a] to-[#0d1120] px-6 py-8 mb-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#6c63ff]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#9b59f5]/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a89cff] mb-3">
              <FaHeadset className="w-3.5 h-3.5" />
              We&apos;re here 24/7
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              How can we help you today?
            </h2>
            <div className="relative max-w-xl">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs — e.g. withdrawal, refund, PPV..."
                className="w-full bg-[#0a0d18] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-[#111624] border border-white/[0.06] rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaEnvelope className="w-4 h-4 text-[#9b59f5]" />
                Contact Us
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <FaInstagram className="w-4 h-4 text-gray-500" />
                  mmeko_platform
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <FaFacebook className="w-4 h-4 text-gray-500" />
                  mmeko_platform
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <FaClock className="w-4 h-4 text-gray-500" />
                  24/7 Support · replies within 24h
                </div>
              </div>
            </div>

            <div className="bg-[#111624] border border-white/[0.06] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaQuestionCircle className="w-4 h-4 text-[#2dd4bf]" />
                Quick Actions
              </h2>
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    const currentUserId = getCurrentUserId();
                    if (currentUserId || profileUsername) {
                      router.push(profileUsername ? `/${profileUsername}` : `/${currentUserId}`);
                    } else {
                      router.push("/");
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-[#0d1120] border border-white/[0.06] rounded-lg hover:border-[#6c63ff]/40 hover:bg-[#0f1424] transition-colors text-sm"
                >
                  View My Profile
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full text-left px-4 py-3 bg-[#0d1120] border border-white/[0.06] rounded-lg hover:border-[#6c63ff]/40 hover:bg-[#0f1424] transition-colors text-sm"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => router.push("/message/supportchat")}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Chat with Mmeko Support
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Search results view */}
            {searchResults ? (
              <div className="bg-[#111624] border border-white/[0.06] rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-1">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &quot;{search}&quot;
                </h2>
                <p className="text-gray-500 text-sm mb-5">Clear the search to browse by category instead.</p>
                {searchResults.length === 0 ? (
                  <p className="text-gray-500 text-sm py-6 text-center">
                    No matches. Try a different word, or open a support ticket below.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((r, i) => {
                      const key = `search-${i}`;
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
                            <span>{CATEGORY_META[r.category].icon}</span>
                            {CATEGORY_META[r.category].label} · {r.sectionTitle}
                          </div>
                          <FAQRow
                            item={r.item}
                            isOpen={openKey === key}
                            onToggle={() => setOpenKey(openKey === key ? null : key)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Category tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                  {(Object.keys(FAQ_DATA) as CategoryKey[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveTab(cat);
                        setOpenKey(null);
                      }}
                      className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        activeTab === cat
                          ? "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] border-transparent text-white shadow-lg shadow-[#6c63ff]/20"
                          : "bg-[#111624] border-white/[0.06] text-gray-400 hover:text-gray-200 hover:border-white/[0.12]"
                      }`}
                    >
                      {CATEGORY_META[cat].icon}
                      {CATEGORY_META[cat].label}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mb-6 px-1">{CATEGORY_META[activeTab].blurb}</p>

                {/* FAQ sections */}
                <div className="space-y-8">
                  {activeSections.map((section, sIdx) => (
                    <div key={sIdx}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{section.icon}</span>
                        <h3 className="text-base font-semibold text-[#a89cff]">{section.title}</h3>
                      </div>
                      <div className="space-y-2.5">
                        {section.items.map((item, iIdx) => {
                          const key = `${activeTab}-${sIdx}-${iIdx}`;
                          return (
                            <FAQRow
                              key={key}
                              item={item}
                              isOpen={openKey === key}
                              onToggle={() => setOpenKey(openKey === key ? null : key)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Support Form */}
            <div className="mt-8">
              <SupportForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;