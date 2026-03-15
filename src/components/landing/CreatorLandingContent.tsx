"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { createPortal } from "react-dom";


const STATIC_CREATOR_IMAGES = Array.from({ length: 7 }, (_, i) => `/creator (${i + 1}).jpeg`);

const OFFERINGS_GRID = [
  { tag: "📞 Video & Voice", tagColor: "rose", icon: "🎙", title: "Fan Calls", desc: "Book one-on-one video or voice calls. Set your rate, set your duration — mmeko handles scheduling, payment, and protection.", ghost: "02" },
  { tag: "🎬 Content & Messages", tagColor: "teal", icon: "🔐", title: "Pay-Per-View & Locked Messages", desc: "Gate your best content behind a paywall — single posts, collections, or even your replies. Fans pay to unlock. Zero commission.", ghost: "03" },
  { tag: "✦ Premium", tagColor: "amber", icon: "👑", title: "Exclusive Content Sales", desc: "Sell exclusive content directly to fans — no subscription required. Each piece is purchased individually, full control over your catalogue.", ghost: "04" },
];

const STEPS = [
  { n: "01", icon: "✍️", title: "Apply & Get Verified", desc: "Submit your application and get verified in under 10 minutes. Fast-track screening with premium creator status unlocked instantly." },
  { n: "02", icon: "🎨", title: "Build Your Profile", desc: "Set up your creator page. Choose what you offer — meets, calls, PPV, locked messages, exclusive content — and set your own rates." },
  { n: "03", icon: "☕", title: "Meet in Public, Safely", desc: "All fan meets happen in public venues — cafés, restaurants, parks. Every meet is capped at 30 minutes. All chats stay on-platform." },
  { n: "04", icon: "💸", title: "Fan Pays, You're Secured", desc: "When a fan books, payment is held securely by mmeko — locked in before you even show up. Once complete, funds release instantly." },
];

const PAY_STEPS = [
  { n: "1", icon: "📅", title: "Fan Books", desc: "Fan pays upfront. mmeko holds the payment securely — the money is locked in and guaranteed." },
  { n: "2", icon: "☕", title: "Meet Happens", desc: "You show up, connect in a public venue for up to 30 minutes. All chats stay on the mmeko platform." },
  { n: "3", icon: "✅", title: "Fan Confirms", desc: "Fan marks the meet complete — payment releases instantly. 100% of it. No deductions whatsoever." },
  { n: "4", icon: "⚡", title: "You Get Paid", desc: "Funds hit your wallet immediately. Support reviews any issues using your on-platform chat history." },
];

const SAFETY_CARDS = [
  { icon: "⏱", title: "30-Minute Maximum", desc: "All fan meets are strictly capped at 30 minutes. This hard limit protects creators from pressure, overstay, and uncomfortable situations." },
  { icon: "☕", title: "Public Spaces Only", desc: "Every fan meet must take place in a public venue — cafés, restaurants, public parks. Private locations are never permitted." },
  { icon: "💬", title: "All Chats On-Platform", desc: "Every conversation between creators and fans must happen through mmeko's built-in messaging. Full record of all interactions." },
  { icon: "✅", title: "Optional Fan Verification", desc: "Creators can request fan verification before confirming a meet booking — a powerful tool for extra confidence." },
  { icon: "🛡", title: "Chargeback Protection", desc: "Every transaction is fully covered. If a fan attempts a chargeback, mmeko absorbs the risk entirely — your earnings are never clawed back." },
  // { icon: "🌍", title: "Geo-Blocking Controls", desc: "Block any region or country from viewing your profile. Full privacy and location control, always on your terms." },
];

const CMP_ROWS = [
  ["Structured Fan Meets & Dates", "✓ Core feature", "✗ Not offered"],
  ["30-Min Meet Cap (Creator Safety)", "✓ Enforced", "✗ Not applicable"],
  ["Public Venue Requirement", "✓ Always", "✗ Not applicable"],
  ["All Chats On-Platform", "✓ Required", "✗ Not enforced"],
  ["Platform Commission", "0%", "20%"],
  ["Instant Payouts", "✓ Immediate", "3–7 days"],
  ["Fan Verification", "✓ Optional", "✗"],
  ["Locked Message Replies (PPV)", "✓ Built in", "✗ Not offered"],
  ["Exclusive Content Sales", "✓", "Subscription only"],
  ["Chargeback Protection", "✓ Fully covered", "Creator's risk"],
  ["Video / Voice Fan Calls", "✓ Built in", "Limited / third-party"],
  // ["Geo-Blocking", "✓ Full control", "Limited"],
  ["Verification Speed", "< 10 minutes", "3–7 days"],
  ["Minimum Payout", "$0", "$20–$100"],
];

const TESTIMONIALS = [
  { initial: "A", grad: "from-[#6c63ff] to-[#9b59f5]", name: "Alicia M.", niche: "Fitness & Lifestyle", quote: "I switched from OnlyFans and made back my full month's earnings in week one — without giving up a single cent. The meet booking system alone changed everything.", monthly: "$12K", fans: "2.4K", offer: "🤝 Fan Meets" },
  { initial: "J", grad: "from-[#2dd4bf] to-[#0891b2]", name: "Jordan K.", niche: "Music & Entertainment", quote: "The instant payout is real — I booked a fan call on a Monday and had the money in my wallet by the time the call ended. I've never experienced that anywhere else.", monthly: "$8.5K", fans: "1.1K", offer: "🎙 Fan Calls" },
  { initial: "S", grad: "from-[#f472b6] to-[#db2777]", name: "Sofia R.", niche: "Art & Content", quote: "The 30-minute rule and public-only venues weren't a limitation — they were the reason I felt safe enough to even try fan meets. It's the structure I didn't know I needed.", monthly: "$19K", fans: "4.7K", offer: "🔐 PPV + Locked DMs" },
];

const FAQ_CREATORS = [
  { q: "How does mmeko make money if there's 0% commission?", a: "mmeko charges fans a small booking or platform fee on transactions — not creators. This means 100% of what a fan pays you goes directly to you." },
  { q: "What counts as a valid public space for meets?", a: "Any open, publicly accessible venue — cafés, restaurants, hotel lobbies, shopping malls, parks, or similar spaces. Private residences, cars, and secluded locations are never permitted." },
  { q: "What if the fan doesn't show up to the meet?", a: "Contact mmeko Support immediately through the platform. Our team has full visibility of your booking history and will review the situation and release your payment accordingly." },
  { q: "What if the fan doesn't mark the meet as complete?", a: "Reach out to mmeko Support directly via the platform. Our team will review your on-platform chat history and release your payment. You will not be left unpaid for a meet you showed up to." },
  { q: "Can I cancel or decline a booking?", a: "Yes — you have full control. You can decline any booking request before confirming it, and cancellations are possible subject to mmeko's cancellation policy." },
  { q: "What's the difference between PPV content and exclusive content sales?", a: "PPV lets you lock individual posts, media, or even your message replies. Exclusive content sales are premium standalone pieces in your catalogue, priced and sold individually." },
  { q: "Can I lock my message replies for fans to pay to unlock?", a: "Yes — this is one of mmeko's unique features. You can lock specific replies in a conversation, requiring the fan to pay to see your response." },
  { q: "Is fan verification mandatory before I accept a meet?", a: "No — fan verification is optional and creator-controlled. We recommend enabling it for in-person meets as an extra layer of confidence." },
];

const FAQ_FANS = [
  { q: "How do I book a meet with a creator?", a: "Browse creator profiles and select the type of experience you want. Choose a time slot, pay securely through mmeko, and your booking is confirmed." },
  { q: "Where do fan meets take place?", a: "All in-person fan meets happen in public venues — cafés, restaurants, hotel lobbies, parks. Private locations are never permitted on mmeko." },
  { q: "How long do fan meets last?", a: "All fan meets on mmeko are capped at 30 minutes. This is a platform-wide rule with no exceptions." },
  { q: "What if the creator doesn't show up?", a: "Contact mmeko Support immediately through the platform. If the creator was a no-show, you will receive a full refund." },
  { q: "How do I mark a meet as complete?", a: "After the meet ends, you'll receive a prompt in the app to mark it as complete. Doing so releases the payment to the creator instantly." },
  { q: "Can I message a creator before booking?", a: "Yes — mmeko has built-in messaging so you can connect with creators directly on the platform before booking." },
];

// ─── ANIMATION HELPERS ────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: d } }) };

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={fadeUp} custom={delay} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}


// function NavBar() {
//   const [scrolled, setScrolled] = useState(false);
//   useEffect(() => {
//     const h = () => setScrolled(window.scrollY > 40);
//     window.addEventListener("scroll", h, { passive: true });
//     return () => window.removeEventListener("scroll", h);
//   }, []);
//   return (
//     <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 ${scrolled ? "bg-[rgba(8,11,20,0.95)] backdrop-blur-xl border-b border-white/[0.07]" : "border-b border-transparent"}`}>
//       <Link href="/" className="flex items-center gap-2.5 no-underline">
//         <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] flex items-center justify-center text-white font-extrabold text-sm">M</div>
//         <span className="text-white font-bold text-[17px] tracking-tight">mmeko</span>
//       </Link>
//       <div className="flex items-center gap-2">
//         <div className="hidden md:flex items-center gap-1">
//           {["Offerings", "How It Works", "Payments", "Safety", "FAQ"].map((l, i) => (
//             <Link key={l} href={`#${["offerings","how","payments","safety","faq"][i]}`} className="text-[#94a3b8] hover:text-white text-[13.5px] font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all no-underline">{l}</Link>
//           ))}
//         </div>
//         <div className="hidden md:block w-px h-5 bg-white/[0.07] mx-1" />
//         <Link href="/auth/login" className="text-[#94a3b8] border border-white/[0.07] hover:text-white hover:border-white/15 hover:bg-white/5 text-[13.5px] font-semibold px-4 py-2 rounded-lg transition-all no-underline">Sign In</Link>
//         <Link href="/auth/register" className="bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white text-[13.5px] font-semibold px-4 py-2 rounded-lg shadow-[0_0_0_1px_rgba(108,99,255,0.3),0_4px_16px_rgba(108,99,255,0.25)] hover:shadow-[0_0_0_1px_rgba(108,99,255,0.4),0_8px_24px_rgba(108,99,255,0.35)] hover:-translate-y-px transition-all no-underline">Apply Now →</Link>
//       </div>
//     </nav>
//   );
// }


function Hero() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
      {/* BG effects */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 20% 20%,rgba(108,99,255,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(155,89,245,.1) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 50% 50%,rgba(45,212,191,.05) 0%,transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)" }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="flex items-center gap-2 bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.25)] rounded-full px-3.5 py-1.5 mb-8 text-xs font-semibold text-[#a89cff] tracking-wide uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] shadow-[0_0_6px_#2dd4bf] animate-pulse" />
        Now accepting creator applications
      </motion.div>

      {/* Avatars */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05, ease }} className="flex items-center justify-center mb-7">
        <div className="flex items-center -space-x-2">
          {STATIC_CREATOR_IMAGES.map((src, i) => (
            <div key={i} className="w-9 h-9 rounded-full border-2 border-[#080b14] overflow-hidden bg-gray-700 flex-shrink-0" style={{ zIndex: 10 - i }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          ))}
        </div>
        <span className="ml-3 text-[13px] text-[#94a3b8]">Trusted by <strong className="text-white font-semibold">1,000+</strong> verified creators</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease }} className="text-[clamp(38px,7vw,80px)] font-extrabold tracking-[-0.03em] leading-[1.08] max-w-[780px] mb-2">
        Where Fans Meet Creators<br />
        <span className="bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent">Safely. Instantly. Fully.</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.14, ease }} className="text-[17px] text-[#94a3b8] max-w-[480px] mt-5 mb-11 leading-[1.75]">
        The premium platform for <strong className="text-white font-semibold">structured fan meets, calls &amp; dates</strong> — plus PPV content, locked messages, and exclusive content sales. You keep 100%. Always.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease }} className="flex gap-3 flex-wrap justify-center">
        <button onClick={() => router.push("/auth/register")} className="px-7 py-3.5 rounded-[10px] text-sm font-semibold bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white shadow-[0_0_0_1px_rgba(108,99,255,0.3),0_4px_20px_rgba(108,99,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(108,99,255,0.4),0_8px_32px_rgba(108,99,255,0.4)] transition-all">Become a Creator →</button>
        <button onClick={() => router.push("/")} className="px-7 py-3.5 rounded-[10px] text-sm font-semibold bg-white/[0.06] text-white border border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all">Explore as Fan</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28, ease }} className="flex items-center gap-6 mt-9 flex-wrap justify-center text-[12.5px] text-[#475569] font-medium">
        {["0% commission", "Instant payouts", "Verified in minutes", "Fully protected"].map((t, i) => (
          <React.Fragment key={t}>
            {i > 0 && <span className="w-1 h-1 rounded-full bg-[#475569]" />}
            <span>✓ {t}</span>
          </React.Fragment>
        ))}
      </motion.div>
    </section>
  );
}


function Stats() {
  const stats = [["100%", "Earnings you keep"], ["0s", "Payout delay"], ["1K+", "Verified creators"], ["0", "Chargebacks lost"]];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.07]" style={{ background: "#0b0f1c" }}>
      {stats.map(([n, l], i) => (
        <Reveal key={l} delay={i * 0.08} className={`px-6 py-8 text-center ${i < 3 ? "border-r border-white/[0.07]" : ""}`}>
          <div className="text-4xl font-extrabold tracking-[-0.03em] mb-1.5 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent">{n}</div>
          <div className="text-xs text-[#94a3b8] font-medium tracking-wide uppercase">{l}</div>
        </Reveal>
      ))}
    </div>
  );
}


function Section({ id, alt, children }: { id?: string; alt?: boolean; children: React.ReactNode }) {
  return (
    <div id={id} className={alt ? "bg-[#0b0f1c]" : ""}>
      <div className="max-w-[1140px] mx-auto px-5 md:px-10 py-20 md:py-24">{children}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Reveal className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-[0.08em] uppercase text-[#a89cff] before:block before:w-5 before:h-0.5 before:bg-[#6c63ff] before:rounded">{children}</Reveal>;
}

function SecTitle({ children }: { children: React.ReactNode }) {
  return <Reveal delay={0.08} className="text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-14 [&_em]:not-italic [&_em]:bg-gradient-to-r [&_em]:from-[#6c63ff] [&_em]:to-[#9b59f5] [&_em]:bg-clip-text [&_em]:text-transparent">{children}</Reveal>;
}


const tagStyles: Record<string, string> = {
  purple: "bg-[rgba(108,99,255,0.12)] text-[#a89cff]",
  teal:   "bg-[rgba(45,212,191,0.1)] text-[#2dd4bf]",
  rose:   "bg-[rgba(244,114,182,0.1)] text-[#f472b6]",
  amber:  "bg-[rgba(245,158,11,0.1)] text-[#fbbf24]",
};

function Offerings() {
  return (
    <Section id="offerings">
      <Eyebrow>What You Can Offer</Eyebrow>
      <SecTitle>Your creativity,<br /><em>your offerings.</em></SecTitle>

      {/* Hero card */}
      <Reveal delay={0.16} className="mb-4">
        <div className="bg-[#111624] border border-white/[0.07] rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 hover:border-[rgba(108,99,255,0.3)] transition-colors">
          <div className="p-10 md:p-12">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase mb-5 ${tagStyles.purple}`}>⭐ Core Offering</span>
            <div className="text-[32px] mb-5">🤝</div>
            <h3 className="text-[22px] font-bold tracking-tight mb-3 leading-snug">Structured Fan Meets &amp; Dates</h3>
            <p className="text-sm text-[#94a3b8] leading-[1.75]">mmeko's flagship experience. Offer real-world meet-ups, virtual dates, and exclusive one-on-one time with your fans — structured, safe, and fully on your terms. Every booking is protected, every payment is instant.</p>
          </div>
          <div className="bg-[#161b2e] border-t md:border-t-0 md:border-l border-white/[0.04] p-9 flex flex-col gap-3 justify-center">
            {[["📅", "fi-purple", "You set the schedule", "When, where, and how — total control over your availability"], ["🛡", "fi-teal", "Structured safety", "Every interaction governed by mmeko's protection framework"], ["💸", "fi-rose", "Instant payment on booking", "Funds secured the moment a fan books"]].map(([icon, color, t, d]) => (
              <div key={t} className="flex items-start gap-3.5 p-4 bg-[#0e1220] border border-white/[0.04] rounded-[10px] hover:border-white/[0.07] hover:bg-white/[0.03] transition-all">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${color === "fi-purple" ? "bg-[rgba(108,99,255,0.12)]" : color === "fi-teal" ? "bg-[rgba(45,212,191,0.1)]" : "bg-[rgba(244,114,182,0.1)]"}`}>{icon}</div>
                <div><p className="text-[13px] font-semibold mb-0.5">{t}</p><p className="text-xs text-[#94a3b8] leading-[1.5]">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OFFERINGS_GRID.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.08} className="relative bg-[#111624] border border-white/[0.07] rounded-xl p-8 overflow-hidden hover:border-[rgba(108,99,255,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase mb-5 ${tagStyles[o.tagColor]}`}>{o.tag}</span>
            <div className="text-[32px] mb-5">{o.icon}</div>
            <h3 className="text-xl font-bold tracking-tight mb-3 leading-snug">{o.title}</h3>
            <p className="text-sm text-[#94a3b8] leading-[1.75]">{o.desc}</p>
            <div className="absolute bottom-[-10px] right-3 text-[72px] font-extrabold text-white/[0.025] leading-none select-none tracking-[-0.04em]">{o.ghost}</div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}


function HowItWorks() {
  return (
    <Section id="how" alt>
      <Eyebrow>The Process</Eyebrow>
      <SecTitle>From sign-up to<br /><em>first booking.</em></SecTitle>
      <Reveal delay={0.16}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.07] rounded-xl overflow-hidden">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[#111624] hover:bg-[#161b2e] p-8 md:p-10 transition-colors">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#a89cff] mb-5 flex items-center gap-2"><span className="block w-6 h-0.5 bg-[#6c63ff] rounded" />Step {s.n}</p>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 border border-white/[0.07] bg-[#0e1220]">{s.icon}</div>
              <h3 className="text-base font-bold tracking-tight mb-2.5">{s.title}</h3>
              <p className="text-[13px] text-[#94a3b8] leading-[1.7]">{s.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}


function PaymentFlow() {
  return (
    <Section id="payments">
      <Eyebrow>How Payments Work</Eyebrow>
      <SecTitle>Your money is secured<br /><em>before you show up.</em></SecTitle>
      <p className="text-base text-[#94a3b8] max-w-[480px] leading-[1.75] -mt-8 mb-14">We know payment transparency matters. Here's exactly how every booking works — no surprises, no fine print.</p>

      <Reveal delay={0.12} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {PAY_STEPS.map((p, i) => (
          <div key={p.title} className="relative bg-[#111624] border border-white/[0.07] rounded-xl p-7 text-center hover:border-[rgba(108,99,255,0.25)] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] flex items-center justify-center text-xs font-bold text-white mx-auto mb-4">{p.n}</div>
            <div className="text-[28px] mb-3.5">{p.icon}</div>
            <h3 className="text-sm font-bold tracking-tight mb-2">{p.title}</h3>
            <p className="text-xs text-[#94a3b8] leading-[1.65]">{p.desc}</p>
            {i < 3 && <span className="hidden md:block absolute top-1/2 -right-2.5 -translate-y-1/2 text-sm text-[#475569] z-10">→</span>}
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.24} className="bg-[#111624] border border-[rgba(108,99,255,0.2)] rounded-xl p-6 md:p-7 flex items-start gap-4">
        <div className="w-10 h-10 rounded-[10px] bg-[rgba(108,99,255,0.12)] flex items-center justify-center text-lg flex-shrink-0">💡</div>
        <div>
          <p className="text-sm font-bold mb-1.5">What if the fan doesn't mark complete?</p>
          <p className="text-[13px] text-[#94a3b8] leading-[1.7]">Don't worry — just contact mmeko Support directly through the platform. Our team reviews the situation using your on-platform chat history and releases your payment accordingly. We always have your back.</p>
        </div>
      </Reveal>
    </Section>
  );
}


function Safety() {
  return (
    <Section id="safety" alt>
      <Eyebrow>Your Protection</Eyebrow>
      <SecTitle>Safety isn't a feature.<br /><em>It's the foundation.</em></SecTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highlight */}
        <Reveal className="md:col-span-3 bg-gradient-to-br from-[rgba(108,99,255,0.08)] to-[rgba(155,89,245,0.05)] border border-[rgba(108,99,255,0.2)] rounded-xl p-7 md:p-8">
          <h3 className="text-[18px] font-bold mb-2 tracking-tight">mmeko's Core Safety Rules</h3>
          <p className="text-sm text-[#94a3b8] leading-[1.7] max-w-[520px]">Every fan meet on mmeko is governed by two non-negotiable rules designed to protect creators at all times. These aren't suggestions — they're enforced by the platform.</p>
          <div className="flex gap-2.5 flex-wrap mt-5">
            {["Max 30 minutes per meet", "Public venues only", "All chats on-platform", "Optional fan verification"].map((p) => (
              <span key={p} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0e1220] border border-white/[0.07] rounded-full text-xs font-medium text-[#94a3b8]">
                <span className="w-4 h-4 rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center text-[9px] text-[#22c55e] flex-shrink-0">✓</span>{p}
              </span>
            ))}
          </div>
        </Reveal>
        {SAFETY_CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i % 3 * 0.08} className="bg-[#111624] border border-white/[0.07] rounded-xl p-7 hover:border-[rgba(108,99,255,0.25)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 bg-[#0e1220] border border-white/[0.07]">{c.icon}</div>
            <h3 className="text-base font-bold tracking-tight mb-2.5">{c.title}</h3>
            <p className="text-[13px] text-[#94a3b8] leading-[1.75]">{c.desc}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}


function Comparison() {
  return (
    <Section>
      <Eyebrow>The Honest Truth</Eyebrow>
      <SecTitle>mmeko vs.<br /><em>everyone else.</em></SecTitle>
      <Reveal delay={0.12} className="border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#111624] border-b border-white/[0.07]">
              <th className="text-left px-6 py-5 text-[#94a3b8] font-semibold text-[13px] w-[40%]">Feature</th>
              <th className="text-center px-6 py-5 w-[30%]">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="flex items-center gap-1.5 bg-[rgba(108,99,255,0.12)] border border-[rgba(108,99,255,0.2)] rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-[#a89cff]">🏆 Best for Creators</span>
                  <span className="text-[#a89cff] font-semibold">mmeko</span>
                </div>
              </th>
              <th className="text-center px-6 py-5 text-[#475569] font-semibold text-[13px] w-[30%]">OnlyFans / Others</th>
            </tr>
          </thead>
          <tbody>
            {CMP_ROWS.map(([feat, us, them], i) => (
              <tr key={feat} className="border-b border-white/[0.04] last:border-0 hover:[&_td:first-child]:text-[#a89cff]">
                <td className="px-6 py-4 text-white font-medium text-[13.5px] transition-colors">{feat}</td>
                <td className="px-6 py-4 text-center bg-[rgba(108,99,255,0.03)] border-l border-r border-[rgba(108,99,255,0.08)]">
                  <span className={us.startsWith("✗") ? "text-[#ef4444]" : us === "0%" || us === "$0" || us.includes("<") ? "text-[#22c55e] font-semibold" : "text-[#22c55e] font-semibold"}>{us}</span>
                </td>
                <td className="px-6 py-4 text-center text-[#94a3b8]">
                  <span className={them.startsWith("✗") ? "text-[#ef4444]" : "text-[#475569] text-xs"}>{them}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </Section>
  );
}


// function Testimonials() {
//   return (
//     <Section alt>
//       <Eyebrow>Creator Stories</Eyebrow>
//       <SecTitle>What creators<br /><em>are saying.</em></SecTitle>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {TESTIMONIALS.map((t, i) => (
//           <Reveal key={t.name} delay={i * 0.1} className="bg-[#111624] border border-white/[0.07] rounded-xl p-7 flex flex-col gap-5 hover:border-[rgba(108,99,255,0.25)] hover:-translate-y-1 transition-all">
//             <div className="flex items-center gap-3.5">
//               <div className={`relative w-[46px] h-[46px] rounded-full flex items-center justify-center text-[17px] font-bold text-white bg-gradient-to-br ${t.grad} flex-shrink-0`}>
//                 {t.initial}
//                 <span className="absolute -bottom-px -right-px w-4 h-4 rounded-full bg-[#2dd4bf] border-2 border-[#111624] flex items-center justify-center text-[8px] text-[#080b14]">✓</span>
//               </div>
//               <div><p className="font-bold text-[15px] tracking-tight">{t.name}</p><p className="text-xs text-[#94a3b8]">{t.niche}</p></div>
//             </div>
//             <p className="text-sm text-[#94a3b8] leading-[1.75] flex-1"><span className="text-[#a89cff] text-lg font-bold mr-0.5">&ldquo;</span>{t.quote}</p>
//             <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
//               <div className="flex gap-5">
//                 {[[t.monthly, "Monthly"], [t.fans, "Fans"]].map(([n, l]) => (
//                   <div key={l}><p className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent">{n}</p><p className="text-[11px] text-[#475569] font-medium">{l}</p></div>
//                 ))}
//               </div>
//               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.15)] rounded-md text-[11px] font-semibold text-[#a89cff]">{t.offer}</span>
//             </div>
//           </Reveal>
//         ))}
//       </div>
//     </Section>
//   );
// }

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-[#111624] border rounded-xl overflow-hidden transition-colors ${open ? "border-[rgba(108,99,255,0.25)]" : "border-white/[0.07] hover:border-[rgba(108,99,255,0.2)]"}`}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:text-[#a89cff] transition-colors">
        <span className="text-sm font-semibold">{q}</span>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 border transition-all ${open ? "bg-[rgba(108,99,255,0.12)] border-[rgba(108,99,255,0.2)] text-[#a89cff] rotate-45" : "bg-[#0e1220] border-white/[0.07] text-[#94a3b8]"}`}>+</span>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
        <p className="text-[13.5px] text-[#94a3b8] leading-[1.75] px-6 pb-5">{a}</p>
      </motion.div>
    </div>
  );
}

function FAQSection() {
  const [tab, setTab] = useState<"creators" | "fans">("creators");
  const items = tab === "creators" ? FAQ_CREATORS : FAQ_FANS;
  return (
    <Section id="faq">
      <Eyebrow>FAQ</Eyebrow>
      <SecTitle>Got questions?<br /><em>We've got answers.</em></SecTitle>
      <Reveal delay={0.12} className="flex gap-2 mb-12 bg-[#111624] border border-white/[0.07] rounded-xl p-1.5 w-fit">
        {(["creators", "fans"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-6 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all capitalize ${tab === t ? "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white shadow-[0_2px_12px_rgba(108,99,255,0.3)]" : "text-[#94a3b8] hover:text-white hover:bg-white/5"}`}>For {t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => <FAQItem key={item.q} {...item} />)}
      </div>
      <Reveal delay={0.08} className="mt-8 bg-[#111624] border border-white/[0.07] rounded-xl p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div><p className="font-bold text-[15px] mb-1">Still have questions?</p><p className="text-[13px] text-[#94a3b8]">Our support team is available around the clock — reach us anytime through the platform.</p></div>
        <Link href="/support" className="text-white font-semibold text-sm px-5 py-2.5 bg-white/[0.06] border border-white/[0.07] rounded-lg hover:bg-white/[0.09] hover:border-white/[0.12] transition-all no-underline whitespace-nowrap">Contact Support →</Link>
      </Reveal>
    </Section>
  );
}


function FinalCTA() {
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease }} className="mx-5 md:mx-10 mb-20 md:mb-24 relative bg-gradient-to-br from-[rgba(108,99,255,0.12)] to-[rgba(155,89,245,0.08)] border border-[rgba(108,99,255,0.2)] rounded-2xl px-8 md:px-16 py-16 md:py-20 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%,rgba(108,99,255,.12),transparent 70%)" }} />
      <div className="relative">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase text-[#a89cff] mb-5 before:block before:w-6 before:h-0.5 before:bg-[#6c63ff] before:rounded after:block after:w-6 after:h-0.5 after:bg-[#6c63ff] after:rounded">Ready when you are</p>
        <h2 className="text-[clamp(32px,5vw,60px)] font-extrabold tracking-[-0.03em] leading-[1.08] mb-4">Your connections.<br /><em className="not-italic bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent">Your rules.</em></h2>
        <p className="text-base text-[#94a3b8] max-w-[440px] mx-auto mb-11 leading-[1.75]">Join creators who are building real, meaningful fan relationships — safely, instantly, and on their own terms.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => router.push("/auth/register")} className="px-7 py-3.5 rounded-[10px] text-sm font-semibold bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white shadow-[0_0_0_1px_rgba(108,99,255,0.3),0_4px_20px_rgba(108,99,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(108,99,255,0.4),0_8px_32px_rgba(108,99,255,0.4)] transition-all">Apply as Creator →</button>
          <button onClick={() => router.push("/")} className="px-7 py-3.5 rounded-[10px] text-sm font-semibold bg-white/[0.06] text-white border border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all">Explore as Fan</button>
        </div>
        <div className="flex items-center justify-center gap-7 flex-wrap mt-10">
          {["Fully protected", "Verified in minutes", "0% commission", "Global payouts", "Safe connections"].map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-[13px] text-[#94a3b8] font-medium">
              <span className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center text-[10px] text-[#22c55e] flex-shrink-0">✓</span>{t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] flex items-center justify-center text-white font-extrabold text-sm">M</div>
          <span className="text-white font-bold text-[17px] tracking-tight">mmeko</span>
        </Link>
        <span className="text-xs text-[#475569]">© {new Date().getFullYear()} mmeko.com — All rights reserved</span>
      </div>
      <div className="flex items-center gap-6">
        {[["Safety", "/safety"], ["Privacy", "/auth/privacy-policy"], ["Terms", "/T_&_C"], ["Support", "/support"], ["Blog", "/blog"]].map(([l, h]) => (
          <Link key={l} href={h} className="text-[13px] text-[#475569] hover:text-[#94a3b8] transition-colors no-underline">{l}</Link>
        ))}
      </div>
    </footer>
  );
}


export default function MmekoLanding() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Override globals.css overflow:hidden with !important via setProperty
    const els = [document.documentElement, document.body];
    els.forEach(el => {
      el.style.setProperty("overflow", "auto", "important");
      el.style.setProperty("height", "auto", "important");
    });
    return () => {
      els.forEach(el => {
        el.style.removeProperty("overflow");
        el.style.removeProperty("height");
      });
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#080b14",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflowY: "auto", overflowX: "hidden",
      color: "white",
    }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      {/* <NavBar /> */}
      <Hero />
      <Stats />
      <Offerings />
      <HowItWorks />
      <PaymentFlow />
      <Safety />
      <Comparison />
      {/* <Testimonials /> */}
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>,
    document.body
  );
}