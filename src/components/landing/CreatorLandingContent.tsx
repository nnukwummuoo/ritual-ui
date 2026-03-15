"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PrefetchedCreator {
  userId: string;
  username: string;
  photolink: string | null;
}

interface Props {
  prefetchedCreators?: PrefetchedCreator[];
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const OFFERINGS_GRID = [
  {
    tag: "📞 Video & Voice",
    tagColor: "rose",
    icon: "🎙",
    title: "Fan Calls",
    desc: "Request one-on-one video or voice calls with your fans. Set your rate, set your duration — mmeko handles scheduling, payment, and protection.",
    ghost: "02",
  },
  {
    tag: "🎬 Content & Messages",
    tagColor: "teal",
    icon: "🔐",
    title: "Pay-Per-View & Locked Messages",
    desc: "Gate your best content behind a paywall — single posts, collections, or even your replies. Fans pay to unlock individual pieces of content or locked messages. You earn instantly, zero commission.",
    ghost: "03",
  },
  {
    tag: "✦ Premium",
    tagColor: "amber",
    icon: "👑",
    title: "Exclusive Content Sales",
    desc: "Sell exclusive content directly to your fans — no subscription required. Each piece is purchased individually, giving fans flexibility and you full control over your premium catalogue.",
    ghost: "04",
  },
];

const STEPS = [
  { n: "01", icon: "✍️", title: "Apply & Get Verified", desc: "Submit your application and get verified in under 10 minutes. Fast-track screening with premium creator status unlocked instantly." },
  { n: "02", icon: "🎨", title: "Build Your Profile", desc: "Set up your creator page. Choose what you offer — meets, calls, PPV, locked messages, exclusive content — and set your own rates for each." },
  { n: "03", icon: "☕", title: "Meet in Public, Safely", desc: "All fan meets happen in public venues — cafés, restaurants, parks. Every meet is capped at 30 minutes. No pressure, no overstay — just a real connection on your terms." },
  { n: "04", icon: "💸", title: "Fan Pays, You're Secured", desc: "When a fan request is confirmed, payment is held securely by mmeko — locked in before you even show up. Once complete, funds release instantly. Guaranteed." },
];

const PAY_STEPS = [
  { n: "1", icon: "📅", title: "Fan Requests", desc: "Fan sends a request and pays upfront. mmeko holds the payment securely — the money is locked in and guaranteed." },
  { n: "2", icon: "☕", title: "Meet Happens", desc: "You show up, connect in a public venue for up to 30 minutes. No pressure, no overstay. Just show up, connect, and leave on time." },
  { n: "3", icon: "✅", title: "Fan Confirms", desc: "Fan marks the meet complete — payment releases instantly. 100% of it. No deductions whatsoever." },
  { n: "4", icon: "⚡", title: "You Get Paid", desc: "Funds hit your wallet immediately. Support reviews any issues using your meeting history and releases payment accordingly." },
];

const SAFETY_CARDS = [
  { icon: "⏱", title: "30-Minute Maximum", desc: "All fan meets are strictly capped at 30 minutes. This hard limit protects creators from pressure, overstay, and uncomfortable situations — boundaries are built into the platform itself." },
  { icon: "☕", title: "Public Spaces Only", desc: "Every fan meet must take place in a public venue — cafés, restaurants, public parks. Private locations are never permitted. Your safety is non-negotiable." },
  { icon: "💬", title: "All Chats On-Platform", desc: "Every conversation between creators and fans must happen through mmeko's built-in messaging. This keeps a full record of all interactions — protecting you if Support ever needs to review." },
  { icon: "✅", title: "Optional Fan Verification", desc: "Creators can request fan verification before confirming a meet request. While not mandatory, it's a powerful tool — verified fans give you extra confidence about who you're meeting in person." },
  { icon: "🛡", title: "Chargeback Protection", desc: "Every transaction is fully covered. If a fan attempts a chargeback, mmeko absorbs the risk entirely — your earnings are never clawed back." },
  { icon: "🌍", title: "Geo-Blocking Controls", desc: "Block any region or country from viewing your profile. Full privacy and location control, always on your terms." },
];

const CMP_ROWS = [
  ["Structured Fan Meets & Dates", "✓ Core feature", "✗ Not offered", true, false],
  ["30-Min Meet Cap (Creator Safety)", "✓ Enforced", "✗ Not applicable", true, false],
  ["Public Venue Requirement", "✓ Always", "✗ Not applicable", true, false],
  ["All Chats On-Platform", "✓ Required", "✗ Not enforced", true, false],
  ["Platform Commission", "0%", "20%", true, false],
  ["Instant Payouts", "✓ Immediate", "3–7 days", true, false],
  ["Fan Verification", "✓ Optional", "✗", true, false],
  ["Locked Message Replies (PPV)", "✓ Built in", "✗ Not offered", true, false],
  ["Exclusive Content Sales", "✓", "Subscription only", true, true],
  ["Chargeback Protection", "✓ Fully covered", "Creator's risk", true, false],
  ["Video / Voice Fan Calls", "✓ Built in", "Limited / third-party", true, true],
  ["Geo-Blocking", "✓ Full control", "Limited", true, true],
  ["Verification Speed", "< 10 minutes", "3–7 days", true, true],
  ["Minimum Payout", "$0", "$20–$100", true, true],
];

const TESTIMONIALS = [
  { initial: "A", grad: "linear-gradient(135deg,#6c63ff,#9b59f5)", name: "Alicia M.", niche: "Fitness & Lifestyle", quote: "I switched from OnlyFans and made back my full month's earnings in week one — without giving up a single cent. The meet request system alone changed everything.", monthly: "$12K", fans: "2.4K", offer: "🤝 Fan Meets" },
  { initial: "J", grad: "linear-gradient(135deg,#2dd4bf,#0891b2)", name: "Jordan K.", niche: "Music & Entertainment", quote: "The instant payout is real — I sent a fan call request on a Monday and had the money in my wallet by the time the call ended. I've never experienced that anywhere else.", monthly: "$8.5K", fans: "1.1K", offer: "🎙 Fan Calls" },
  { initial: "S", grad: "linear-gradient(135deg,#f472b6,#db2777)", name: "Sofia R.", niche: "Art & Content", quote: "The 30-minute rule and public-only venues weren't a limitation — they were the reason I felt safe enough to even try fan meets. It's the structure I didn't know I needed.", monthly: "$19K", fans: "4.7K", offer: "🔐 PPV + Locked DMs" },
];

const FAQ_CREATORS = [
  { q: "How does mmeko make money if there's 0% commission?", a: "mmeko charges fans a small request or platform fee on transactions — not creators. This means 100% of what a fan pays you goes directly to you. Our business model is built around growing the fan side, not cutting into your earnings." },
  { q: "What counts as a valid public space for meets?", a: "Any open, publicly accessible venue — cafés, restaurants, hotel lobbies, shopping malls, parks, or similar spaces. Private residences, cars, and secluded locations are never permitted. If you're unsure about a specific venue, contact mmeko Support before confirming the request." },
  { q: "What if the fan doesn't show up to the meet?", a: "Contact mmeko Support immediately through the platform. Our team has full visibility of your request history and can review the situation and release your payment accordingly. You will not be left unpaid for a meet you showed up to." },
  { q: "What if the fan doesn't mark the meet as complete?", a: "Reach out to mmeko Support directly via the platform. Our team will review your meeting details and release your payment accordingly. We always have your back — you will not be left unpaid for a meet you showed up to." },
  { q: "Can I cancel or decline a request?", a: "Yes — you have full control over your requests. You can decline any request before confirming it, and cancellations are handled through mmeko Support. You're never obligated to accept a request you're not comfortable with." },
  { q: "What's the difference between PPV content and exclusive content sales?", a: "PPV lets you lock individual posts, media, or even your message replies — fans pay a set price to unlock that specific piece of content. Exclusive content sales are premium standalone pieces in your catalogue, priced and sold individually rather than as part of a feed." },
  { q: "Can I lock my message replies for fans to pay to unlock?", a: "Yes — this is one of mmeko's unique features. You can lock specific replies in a conversation, requiring the fan to pay to see your response. It's a powerful way to monetize your engagement without leaving the chat." },
  { q: "Is fan verification mandatory before I accept a meet?", a: "No — fan verification is optional and creator-controlled. You can choose to require it for your requests or leave it open. We recommend enabling it for in-person meets as an extra layer of confidence, but the choice is entirely yours." },
];

const FAQ_FANS = [
  { q: "How do I send a meet request to a creator?", a: "Browse creator profiles and select the type of experience you want — fan meet, call, or content. Choose a time slot the creator has made available, pay securely through mmeko, and your request is sent. The creator will see your request and can confirm or decline — you are always in control." },
  { q: "Where do fan meets take place?", a: "All in-person fan meets happen in public venues — cafés, restaurants, hotel lobbies, parks. Private locations are never permitted on mmeko. This rule protects both you and the creator." },
  { q: "How long do fan meets last?", a: "All fan meets on mmeko are capped at 30 minutes. This is a platform-wide rule with no exceptions — it ensures a clear, comfortable experience for everyone involved." },
  { q: "What if the creator doesn't show up?", a: "Contact mmeko Support immediately through the platform. Since all requests and communications are on-platform, our team has full visibility and will review the situation. If the creator was a no-show, you will receive a full refund." },
  { q: "How do I mark a meet as complete?", a: "After the meet ends, you'll receive a prompt in the app to mark it as complete. Doing so releases the payment to the creator instantly. If you experienced any issues during the meet, contact Support before marking it complete so we can assist you." },
  { q: "Can I message a creator before sending a request?", a: "Yes — mmeko has built-in messaging so you can connect with creators directly on the platform before sending a request. This keeps everything in one place and ensures both you and the creator are always protected." },
];

// ─── INLINE STYLES (scoped so they don't bleed into the rest of your app) ─────

const S = {
  // Layout
  page: {
    background: "#080b14",
    color: "#f1f5f9",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    minHeight: "100vh",
    overflowX: "hidden" as const,
  } as React.CSSProperties,

  logoWrap: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" } as React.CSSProperties,
  logoIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: "linear-gradient(135deg,#6c63ff,#9b59f5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: 800, color: "white",
  } as React.CSSProperties,
  logoName: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" } as React.CSSProperties,
  // Hero
  hero: {
    minHeight: "100vh",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", justifyContent: "center",
    padding: "100px 24px 80px",
    textAlign: "center" as const,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  heroBg: {
    position: "absolute" as const, inset: 0,
    background: "radial-gradient(ellipse 80% 50% at 20% 20%,rgba(108,99,255,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(155,89,245,.1) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 50% 50%,rgba(45,212,191,.05) 0%,transparent 60%)",
    pointerEvents: "none" as const,
  },
  heroGrid: {
    position: "absolute" as const, inset: 0,
    opacity: 0.025,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)",
    backgroundSize: "60px 60px",
    maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)",
    pointerEvents: "none" as const,
  },

  // Buttons
  btnPrimary: {
    padding: "14px 28px", borderRadius: 10,
    fontSize: 14, fontWeight: 600,
    background: "linear-gradient(135deg,#6c63ff,#9b59f5)",
    color: "white", border: "none", cursor: "pointer",
    boxShadow: "0 0 0 1px rgba(108,99,255,.3),0 4px 20px rgba(108,99,255,.3)",
    transition: "all .25s",
    fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 8,
    textDecoration: "none",
  } as React.CSSProperties,
  btnSecondary: {
    padding: "14px 28px", borderRadius: 10,
    fontSize: 14, fontWeight: 600,
    background: "rgba(255,255,255,.06)",
    color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer",
    transition: "all .25s",
    fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 8,
    textDecoration: "none",
  } as React.CSSProperties,

  // Section
  sectionInner: {
    maxWidth: 1140, margin: "0 auto", padding: "96px 40px",
  } as React.CSSProperties,
  sectionAlt: { background: "#0b0f1c" } as React.CSSProperties,

  // Cards
  card: {
    background: "#111624",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
  } as React.CSSProperties,
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).style.opacity !== "1" && Object.assign((e.target as HTMLElement).style, { opacity: "1", transform: "none" }); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(24px)";
      (el as HTMLElement).style.transition = `opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const avatars = [
    { initial: "A", grad: "linear-gradient(135deg,#6c63ff,#9b59f5)" },
    { initial: "J", grad: "linear-gradient(135deg,#2dd4bf,#0891b2)" },
    { initial: "S", grad: "linear-gradient(135deg,#f472b6,#db2777)" },
    { initial: "R", grad: "linear-gradient(135deg,#fb923c,#ea580c)" },
    { initial: "+", grad: "linear-gradient(135deg,#a78bfa,#7c3aed)" },
  ];

  return (
    <section style={{ ...S.hero, padding: "0 0 80px", justifyContent: "flex-start" }}>
      <div style={S.heroBg} />
      <div style={S.heroGrid} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes lp-fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;} }
        @keyframes lp-blink { 0%,100%{opacity:1;}50%{opacity:.3;} }
        .lp-badge { animation: lp-fadeUp .6s ease both; }
        .lp-avs   { animation: lp-fadeUp .6s .05s ease both; }
        .lp-h1    { animation: lp-fadeUp .7s .09s ease both; }
        .lp-sub   { animation: lp-fadeUp .7s .14s ease both; }
        .lp-ctas  { animation: lp-fadeUp .7s .20s ease both; }
        .lp-trust { animation: lp-fadeUp .7s .28s ease both; }
        .lp-blink { animation: lp-blink 2s ease-in-out infinite; }
        .lp-btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(108,99,255,.4),0 8px 32px rgba(108,99,255,.4) !important; }
        .lp-btn-secondary:hover { background: rgba(255,255,255,.09) !important; border-color: rgba(255,255,255,.12) !important; transform: translateY(-2px); }
        .lp-nav-links-desktop { display: flex !important; }
        .lp-hamburger { display: none !important; }
        @media(max-width:900px){
          .lp-nav-links-desktop { display: none !important; }
          .lp-hamburger { display: flex !important; }
        }
        @media(max-width:600px){
          .lp-section-inner { padding: 64px 20px !important; }
          .lp-steps-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-pay-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-off-hero { grid-template-columns: 1fr !important; }
          .lp-off-grid { grid-template-columns: 1fr !important; }
          .lp-safety-grid { grid-template-columns: 1fr !important; }
          .lp-test-grid { grid-template-columns: 1fr !important; }
          .lp-faq-grid { grid-template-columns: 1fr !important; }
          .lp-cmp-table th:last-child, .lp-cmp-table td:last-child { display: none !important; }
          .lp-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-footer-inner { flex-direction: column !important; gap: 20px !important; text-align: center !important; }
          .lp-final-cta { margin: 0 16px 64px !important; padding: 52px 24px !important; }
          .lp-off-hero-right { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.04) !important; }
        }
        @media(max-width:400px){
          .lp-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Inline nav bar — part of the hero, not fixed ── */}
      <div style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 40px",
        height: 64, position: "relative", zIndex: 2, flexShrink: 0,
      }}>
        <Link href="/" style={S.logoWrap}>
          <div style={S.logoIcon}>M</div>
          <span style={S.logoName}>mmeko</span>
        </Link>

        {/* Desktop links */}
        <div className="lp-nav-links-desktop" style={{ alignItems: "center", gap: 8 }}>
          {[["Offerings","#offerings"],["How It Works","#how"],["Payments","#payments"],["Safety","#safety"],["Compare","#compare"],["FAQ","#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13.5, fontWeight: 500, padding: "6px 12px", borderRadius: 8 }}>{l}</a>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.07)", margin: "0 4px" }} />
          <Link href="/auth/login" style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)", padding: "8px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
          <Link href="/auth/register" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", color: "white", padding: "8px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 0 1px rgba(108,99,255,.3),0 4px 16px rgba(108,99,255,.25)" }}>Apply Now →</Link>
        </div>

        {/* Mobile: Sign In + hamburger */}
        <div className="lp-hamburger" style={{ alignItems: "center", gap: 8 }}>
          <Link href="/auth/login" style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 10px", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div style={{
          width: "100%", background: "rgba(8,11,20,0.98)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 2,
          position: "relative", zIndex: 2,
        }}>
          {[["Offerings","#offerings"],["How It Works","#how"],["Payments","#payments"],["Safety","#safety"],["FAQ","#faq"]].map(([l, h]) => (
            <a key={l} href={h} onClick={() => setMobileMenuOpen(false)} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "12px", borderRadius: 8, display: "block" }}>{l}</a>
          ))}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />
          <Link href="/auth/register" style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", color: "white", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center", display: "block", marginTop: 4 }}>Apply Now →</Link>
        </div>
      )}

      {/* ── Hero content centred below the nav ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px 0", textAlign: "center",
        position: "relative", zIndex: 1, width: "100%",
      }}>
        {/* Badge */}
        <div className="lp-badge" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(108,99,255,.1)", border: "1px solid rgba(108,99,255,.25)",
          borderRadius: 100, padding: "6px 14px", marginBottom: 32,
          fontSize: 12, fontWeight: 600, color: "#a89cff", letterSpacing: ".02em",
        }}>
          <span className="lp-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf", boxShadow: "0 0 6px #2dd4bf", display: "inline-block" }} />
          Now accepting creator applications
        </div>

        {/* Avatars */}
        <div className="lp-avs" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {avatars.map((av, i) => (
              <div key={i} style={{
                width: 38, height: 38, borderRadius: "50%",
                border: "2px solid #080b14", marginLeft: i === 0 ? 0 : -8,
                background: av.grad, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, fontWeight: 700,
                color: "white", zIndex: 10 - i, position: "relative",
              }}>{av.initial}</div>
            ))}
          </div>
          <span style={{ marginLeft: 12, fontSize: 13, color: "#94a3b8" }}>
            Trusted by <strong style={{ color: "#f1f5f9", fontWeight: 600 }}>1,000+</strong> verified creators
          </span>
        </div>

        {/* H1 */}
        <h1 className="lp-h1" style={{
          fontSize: "clamp(38px,7vw,80px)", fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.03em", maxWidth: 780, marginBottom: 8, textAlign: "center",
        }}>
          Where Fans Meet Creators<br />
          <span style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Safely. Instantly. Fully.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="lp-sub" style={{ fontSize: 17, color: "#94a3b8", maxWidth: 480, margin: "20px auto 44px", lineHeight: 1.75 }}>
          The premium platform for <strong style={{ color: "#f1f5f9", fontWeight: 600 }}>structured fan meets, calls &amp; dates</strong> — plus PPV content, locked messages, and exclusive content sales. You keep 100%. Always.
        </p>

        {/* CTAs */}
        <div className="lp-ctas" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/auth/register")} className="lp-btn-primary" style={S.btnPrimary}>
            Become a Creator →
          </button>
          <button onClick={() => router.push("/")} className="lp-btn-secondary" style={S.btnSecondary}>
            Explore as Fan
          </button>
        </div>

        {/* Trust row */}
        <div className="lp-trust" style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}>
          {["0% commission", "Instant payouts", "Verified in minutes", "Fully protected"].map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#475569", display: "inline-block" }} />}
              <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>✓ {t}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [["100%", "Earnings you keep"], ["0s", "Payout delay"], ["1K+", "Verified creators"], ["0", "Chargebacks lost"]];
  return (
    <div className="lp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#0b0f1c", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      {stats.map(([n, l], i) => (
        <div key={l} data-reveal style={{ padding: "32px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6, background: "linear-gradient(135deg,#6c63ff,#9b59f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, letterSpacing: ".02em", textTransform: "uppercase" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

// ─── EYEBROW / SECTION TITLE HELPERS ─────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div data-reveal style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#a89cff" }}>
      <span style={{ display: "block", width: 20, height: 2, background: "#6c63ff", borderRadius: 2 }} />
      {children}
    </div>
  );
}

function SecTitle({ children, delay = "0.08s" }: { children: React.ReactNode; delay?: string }) {
  return (
    <div data-reveal style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 56, transitionDelay: delay } as React.CSSProperties}>
      {children}
    </div>
  );
}

function GradText({ children }: { children: React.ReactNode }) {
  return <em style={{ fontStyle: "normal", background: "linear-gradient(135deg,#6c63ff,#9b59f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{children}</em>;
}

// ─── OFFERINGS ────────────────────────────────────────────────────────────────

const tagStyleMap: Record<string, React.CSSProperties> = {
  purple: { background: "rgba(108,99,255,.12)", color: "#a89cff" },
  teal:   { background: "rgba(45,212,191,.1)",  color: "#2dd4bf" },
  rose:   { background: "rgba(244,114,182,.1)", color: "#f472b6" },
  amber:  { background: "rgba(245,158,11,.1)",  color: "#fbbf24" },
};

function Offerings() {
  return (
    <div id="offerings">
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>What You Can Offer</Eyebrow>
        <SecTitle>Your creativity,<br /><GradText>your offerings.</GradText></SecTitle>

        {/* Hero card */}
        <div data-reveal className="lp-off-hero" style={{ ...S.card, display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 16, overflow: "hidden", transitionDelay: "0.16s" } as React.CSSProperties}>
          <div style={{ padding: "48px" }}>
            <span style={{ ...tagStyleMap.purple, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 20 }}>⭐ Core Offering</span>
            <div style={{ fontSize: 32, marginBottom: 20 }}>🤝</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.25 }}>Structured Fan Meets &amp; Dates</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.75 }}>mmeko's flagship experience. Offer real-world meet-ups, virtual dates, and exclusive one-on-one time with your fans — structured, safe, and fully on your terms. Every booking is protected, every payment is instant.</p>
          </div>
          <div className="lp-off-hero-right" style={{ background: "#161b2e", borderLeft: "1px solid rgba(255,255,255,0.04)", padding: 36, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
            {[
              { icon: "📅", bg: "rgba(108,99,255,.12)", title: "You set the schedule", desc: "When, where, and how — total control over your availability" },
              { icon: "🛡", bg: "rgba(45,212,191,.1)",  title: "Structured safety",    desc: "Every interaction governed by mmeko's protection framework" },
              { icon: "💸", bg: "rgba(244,114,182,.1)", title: "Instant payment on request", desc: "Funds secured the moment a fan requests" },
            ].map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 16, background: "#0e1220", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 cards */}
        <div className="lp-off-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {OFFERINGS_GRID.map((o, i) => (
            <div key={o.title} data-reveal style={{ ...S.card, padding: "32px 28px", position: "relative", overflow: "hidden", transitionDelay: `${i * 0.08}s` } as React.CSSProperties}>
              <span style={{ ...tagStyleMap[o.tagColor], display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 20 }}>{o.tag}</span>
              <div style={{ fontSize: 32, marginBottom: 20 }}>{o.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.25 }}>{o.title}</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.75 }}>{o.desc}</p>
              <div style={{ position: "absolute", bottom: -10, right: 12, fontSize: 72, fontWeight: 800, color: "rgba(255,255,255,.025)", lineHeight: 1, userSelect: "none", letterSpacing: "-0.04em" }}>{o.ghost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <div id="how" style={S.sectionAlt}>
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>The Process</Eyebrow>
        <SecTitle>From sign-up to<br /><GradText>first request.</GradText></SecTitle>
        <div data-reveal className="lp-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ background: "#111624", padding: "40px 32px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#a89cff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "block", width: 24, height: 2, background: "#6c63ff", borderRadius: 2 }} />
                Step {s.n}
              </p>
              <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20, border: "1px solid rgba(255,255,255,0.07)", background: "#0e1220" }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT FLOW ─────────────────────────────────────────────────────────────

function PaymentFlow() {
  return (
    <div id="payments">
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>How Payments Work</Eyebrow>
        <SecTitle>Your money is secured<br /><GradText>before you show up.</GradText></SecTitle>
        <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 480, lineHeight: 1.75, marginTop: -32, marginBottom: 56 }}>
          We know payment transparency matters. Here's exactly how every request works — no surprises, no fine print.
        </p>

        <div data-reveal className="lp-pay-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {PAY_STEPS.map((p, i) => (
            <div key={p.title} style={{ ...S.card, padding: "28px 24px", textAlign: "center", position: "relative" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#9b59f5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", margin: "0 auto 16px" }}>{p.n}</div>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{p.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>{p.desc}</p>
              {i < 3 && <span style={{ position: "absolute", top: "50%", right: -10, transform: "translateY(-50%)", fontSize: 14, color: "#475569", zIndex: 1 }} className="lp-pay-arrow">→</span>}
            </div>
          ))}
        </div>

        <div data-reveal style={{ ...S.card, border: "1px solid rgba(108,99,255,0.2)", padding: "24px 28px", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(108,99,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💡</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>What if the fan doesn't mark complete?</p>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>Don't worry — just contact mmeko Support directly through the platform. Our team reviews the situation using your on-platform chat history and releases your payment accordingly. We always have your back.</p>
          </div>
        </div>

        <style>{`@media(max-width:600px){ .lp-pay-arrow { display: none !important; } }`}</style>
      </div>
    </div>
  );
}

// ─── SAFETY ───────────────────────────────────────────────────────────────────

function Safety() {
  return (
    <div id="safety" style={S.sectionAlt}>
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>Your Protection</Eyebrow>
        <SecTitle>Safety isn't a feature.<br /><GradText>It's the foundation.</GradText></SecTitle>

        <div className="lp-safety-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {/* Highlight */}
          <div data-reveal style={{ gridColumn: "span 3", background: "linear-gradient(135deg,rgba(108,99,255,.08),rgba(155,89,245,.05))", border: "1px solid rgba(108,99,255,.2)", borderRadius: 20, padding: "28px 32px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>mmeko's Core Safety Rules</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, maxWidth: 520 }}>Every fan meet on mmeko is governed by two non-negotiable rules designed to protect creators at all times. These aren't suggestions — they're enforced by the platform.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              {["Max 30 minutes per meet", "Public venues only", "Public meets only", "Optional fan verification"].map((pill) => (
                <span key={pill} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: "#0e1220", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(34,197,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#22c55e", flexShrink: 0 }}>✓</span>
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {SAFETY_CARDS.map((c, i) => (
            <div key={c.title} data-reveal style={{ ...S.card, padding: "32px 28px", transitionDelay: `${(i % 3) * 0.08}s` } as React.CSSProperties}>
              <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20, background: "#0e1220", border: "1px solid rgba(255,255,255,0.07)" }}>{c.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.75 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPARISON ───────────────────────────────────────────────────────────────

function Comparison() {
  return (
    <div id="compare">
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>The Honest Truth</Eyebrow>
        <SecTitle>mmeko vs.<br /><GradText>everyone else.</GradText></SecTitle>
        <div data-reveal style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
          <table className="lp-cmp-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#111624", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th style={{ textAlign: "left", padding: "20px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, width: "40%" }}>Feature</th>
                <th style={{ textAlign: "center", padding: "20px 24px", width: "30%" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ background: "rgba(108,99,255,.12)", border: "1px solid rgba(108,99,255,.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#a89cff" }}>🏆 Best for Creators</span>
                    <span style={{ color: "#a89cff", fontWeight: 600 }}>mmeko</span>
                  </div>
                </th>
                <th style={{ textAlign: "center", padding: "20px 24px", color: "#475569", fontWeight: 600, fontSize: 13, width: "30%" }}>OnlyFans / Others</th>
              </tr>
            </thead>
            <tbody>
              {CMP_ROWS.map(([feat, us, them, usGood, themNeutral]) => (
                <tr key={feat as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "16px 24px", color: "#f1f5f9", fontWeight: 500, fontSize: 13.5 }}>{feat}</td>
                  <td style={{ padding: "16px 24px", textAlign: "center", background: "rgba(108,99,255,.03)", borderLeft: "1px solid rgba(108,99,255,.08)", borderRight: "1px solid rgba(108,99,255,.08)" }}>
                    <span style={{ color: (us as string).startsWith("✗") ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{us}</span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <span style={{ color: (them as string).startsWith("✗") ? "#ef4444" : themNeutral ? "#475569" : "#475569", fontSize: (them as string).startsWith("✗") ? 14 : 12 }}>{them}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <div style={S.sectionAlt}>
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>Creator Stories</Eyebrow>
        <SecTitle>What creators<br /><GradText>are saying.</GradText></SecTitle>
        <div className="lp-test-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} data-reveal style={{ ...S.card, padding: 28, display: "flex", flexDirection: "column", gap: 20, transitionDelay: `${i * 0.1}s` } as React.CSSProperties}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: t.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "white", flexShrink: 0, position: "relative" }}>
                  {t.initial}
                  <span style={{ position: "absolute", bottom: -1, right: -1, width: 16, height: 16, borderRadius: "50%", background: "#2dd4bf", border: "2px solid #111624", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#080b14" }}>✓</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", marginBottom: 2 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{t.niche}</p>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.75, flex: 1 }}>
                <span style={{ color: "#a89cff", fontSize: 18, fontWeight: 700, marginRight: 3 }}>&ldquo;</span>
                {t.quote}
              </p>
              <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 20 }}>
                  {[[t.monthly, "Monthly"], [t.fans, "Fans"]].map(([n, l]) => (
                    <div key={l}>
                      <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#6c63ff,#9b59f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</p>
                      <p style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{l}</p>
                    </div>
                  ))}
                </div>
                <span style={{ background: "rgba(108,99,255,.1)", border: "1px solid rgba(108,99,255,.15)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#a89cff" }}>{t.offer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...S.card, border: `1px solid ${open ? "rgba(108,99,255,.25)" : "rgba(255,255,255,0.07)"}`, overflow: "hidden", transition: "border-color .2s" }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 600, color: "#f1f5f9", fontFamily: "inherit", transition: "color .2s" }}>
        <span>{q}</span>
        <span style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, border: `1px solid ${open ? "rgba(108,99,255,.2)" : "rgba(255,255,255,0.07)"}`, background: open ? "rgba(108,99,255,.12)" : "#0e1220", color: open ? "#a89cff" : "#94a3b8", transform: open ? "rotate(45deg)" : "none", transition: "all .25s" }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height .35s cubic-bezier(.16,1,.3,1), padding .35s", padding: open ? "0 24px 20px" : "0 24px" }}>
        <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.75 }}>{a}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [tab, setTab] = useState<"creators" | "fans">("creators");
  const items = tab === "creators" ? FAQ_CREATORS : FAQ_FANS;

  return (
    <div id="faq">
      <div className="lp-section-inner" style={S.sectionInner}>
        <Eyebrow>FAQ</Eyebrow>
        <SecTitle>Got questions?<br /><GradText>We've got answers.</GradText></SecTitle>

        {/* Tabs */}
        <div data-reveal style={{ display: "flex", gap: 8, marginBottom: 48, background: "#111624", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 6, width: "fit-content" }}>
          {(["creators", "fans"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
              cursor: "pointer", border: "none", fontFamily: "inherit",
              background: tab === t ? "linear-gradient(135deg,#6c63ff,#9b59f5)" : "transparent",
              color: tab === t ? "white" : "#94a3b8",
              boxShadow: tab === t ? "0 2px 12px rgba(108,99,255,.3)" : "none",
              transition: "all .2s",
            }}>
              For {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="lp-faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {items.map((item) => <FAQItem key={item.q} {...item} />)}
        </div>

        {/* Still have questions? */}
        <div data-reveal style={{ ...S.card, marginTop: 32, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Still have questions?</p>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Our support team is available around the clock — reach us anytime through the platform.</p>
          </div>
          <Link href="/support" style={{ ...S.btnSecondary, padding: "10px 20px", fontSize: 14, whiteSpace: "nowrap" }}>Contact Support →</Link>
        </div>
      </div>
    </div>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  const router = useRouter();
  return (
    <div className="lp-final-cta" data-reveal style={{ margin: "0 40px 96px", background: "linear-gradient(135deg,rgba(108,99,255,.12),rgba(155,89,245,.08))", border: "1px solid rgba(108,99,255,.2)", borderRadius: 24, padding: "80px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%,rgba(108,99,255,.12),transparent 70%)", pointerEvents: "none", borderRadius: 24 }} />
      <div style={{ position: "relative" }}>
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#a89cff", marginBottom: 20 }}>
          <span style={{ display: "block", width: 24, height: 2, background: "#6c63ff", borderRadius: 2 }} />
          Ready when you are
          <span style={{ display: "block", width: 24, height: 2, background: "#6c63ff", borderRadius: 2 }} />
        </p>
        <h2 style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 16 }}>
          Your connections.<br />
          <GradText>Your rules.</GradText>
        </h2>
        <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.75 }}>
          Join creators who are building real, meaningful fan relationships — safely, instantly, and on their own terms.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/auth/register")} className="lp-btn-primary" style={S.btnPrimary}>Apply as Creator →</button>
          <button onClick={() => router.push("/")} className="lp-btn-secondary" style={S.btnSecondary}>Explore as Fan</button>
        </div>
        <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          {["Fully protected", "Verified in minutes", "0% commission", "Global payouts", "Safe connections"].map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#22c55e", flexShrink: 0 }}>✓</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="lp-footer-inner" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/" style={S.logoWrap}>
          <div style={{ ...S.logoIcon, width: 28, height: 28, borderRadius: 7, fontSize: 13 }}>M</div>
          <span style={S.logoName}>mmeko</span>
        </Link>
        <span style={{ fontSize: 13, color: "#475569" }}>© {new Date().getFullYear()} mmeko.com — All rights reserved</span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {[["Safety", "/safety"], ["Privacy", "/auth/privacy-policy"], ["Terms", "/T_&_C"], ["Support", "/support"], ["Blog", "/blog"]].map(([l, h]) => (
          <Link key={l} href={h} style={{ fontSize: 13, color: "#475569", textDecoration: "none", transition: "color .2s" }}>{l}</Link>
        ))}
      </div>
    </footer>
  );
}


export default function CreatorLandingContent({ prefetchedCreators }: Props) {
  useReveal();

  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div style={S.page}>
      <Hero />
      <Stats />
      <Offerings />
      <HowItWorks />
      <PaymentFlow />
      <Safety />
      <Comparison />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}