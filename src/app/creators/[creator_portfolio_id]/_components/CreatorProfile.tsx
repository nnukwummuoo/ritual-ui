"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreatorProfileProps {
  creator?: {
    id: string;
    name: string;
    handle: string;
    tagline: string;
    location: string;
    duration: number; // minutes
    price: number;
    currency?: string;
    isVerified?: boolean;
    isExclusive?: boolean;
    isOnline?: boolean;
    isAvailableToday?: boolean;
    views: number;
    rating: number;
    reviewCount: number;
    availableDays: string[];
    availableHours: string[];
    about: string;
    photos?: string[]; // image URLs; empty = placeholders
    meetType?: string; // e.g. "Fan Meet & Greet"
  };
  onBack?: () => void;
  onShare?: () => void;
  onMessage?: () => void;
  onRequest?: () => void;
  onReviews?: () => void;
}

// ─── Default / demo data ──────────────────────────────────────────────────────
const DEFAULT_CREATOR: CreatorProfileProps["creator"] = {
  id: "haileyrae613",
  name: "Hailey",
  handle: "@haileyrae613",
  tagline: "Exclusive Date with Hailey",
  location: "United States",
  duration: 30,
  price: 150,
  currency: "$",
  isVerified: true,
  isExclusive: true,
  isOnline: true,
  isAvailableToday: true,
  views: 3,
  rating: 5,
  reviewCount: 0,
  availableDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  availableHours: [
    "1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM",
    "7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM","12:00 AM",
  ],
  about:
    "Laid back, fun loving and easy to talk to. I love good conversations, good food and genuine connections. If you're looking for a real, relaxed meet & greet — you've found the right person 🙂",
  photos: [], // empty → show placeholders
  meetType: "Fan Meet & Greet",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorProfile({
  creator: creatorProp = DEFAULT_CREATOR,
  onBack,
  onShare,
  onMessage,
  onRequest,
  onReviews,
}: CreatorProfileProps) {
  const creator: NonNullable<CreatorProfileProps["creator"]> = (
    creatorProp ?? DEFAULT_CREATOR
  ) as NonNullable<CreatorProfileProps["creator"]>;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCrushing, setIsCrushing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedHours, setSelectedHours] = useState<Set<string>>(new Set());
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const totalSlides = creator.photos && creator.photos.length > 0 ? creator.photos.length : 4;

  const goTo = (n: number) => {
    setCurrentSlide(((n % totalSlides) + totalSlides) % totalSlides);
  };

  const toggleHour = (hour: string) => {
    setSelectedHours((prev) => {
      const next = new Set(prev);
      if (next.has(hour)) {
        next.delete(hour);
      } else {
        next.add(hour);
      }
      return next;
    });
  };

  // Sync slide transform
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  const slideBgs = [
    "linear-gradient(160deg,#0e1525,#1a1035)",
    "linear-gradient(160deg,#0e1525,#0d2030)",
    "linear-gradient(160deg,#160e25,#1a0d30)",
    "linear-gradient(160deg,#0e1a25,#0d1e30)",
  ];

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ fontSize: 12, color: "#f59e0b" }}>★</span>
  ));

  return (
    <>
      {/* ── Global styles (scoped via a wrapper class) ── */}
      <style>{`
        .mcp-root *, .mcp-root *::before, .mcp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .mcp-root {
          --bg:#080b14; --bg2:#0b0f1c; --bg3:#0e1220;
          --card:#111624; --card2:#161b2e;
          --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.04);
          --accent:#6c63ff; --accent2:#9b59f5;
          --teal:#2dd4bf; --rose:#f472b6;
          --success:#22c55e; --gold:#f59e0b;
          --text:#f1f5f9; --text2:#94a3b8; --text3:#475569;
          background: var(--bg);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* scrollbar */
        .mcp-root ::-webkit-scrollbar { width: 4px; }
        .mcp-root ::-webkit-scrollbar-thumb { background: var(--card2); border-radius: 4px; }

        /* nav */
        .mcp-nav {
          position: sticky; top: 0; z-index: 200;
          background: rgba(8,11,20,.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 0 20px; height: 54px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mcp-nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .mcp-nav-logo-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: linear-gradient(135deg,#6c63ff,#9b59f5);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: white;
        }
        .mcp-nav-logo-name { font-size: 15px; font-weight: 700; color: var(--text); }
        .mcp-nav-back {
          background: none; border: none; color: var(--text2); font-size: 22px;
          cursor: pointer; padding: 4px 8px; border-radius: 8px;
          transition: color .2s; line-height: 1;
        }
        .mcp-nav-back:hover { color: var(--text); }
        .mcp-nav-share {
          background: rgba(255,255,255,.06); border: 1px solid var(--border);
          color: var(--text2); font-size: 13px; font-weight: 600;
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          font-family: inherit; transition: all .2s;
        }
        .mcp-nav-share:hover { color: var(--text); }

        /* carousel */
        .mcp-carousel-wrap {
          position: relative; width: 100%; height: 340px;
          background: var(--bg3); overflow: hidden;
        }
        .mcp-carousel-track {
          display: flex; height: 100%;
          transition: transform .4s cubic-bezier(.25,.8,.25,1);
        }
        .mcp-carousel-slide {
          min-width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative; overflow: hidden;
        }
        .mcp-slide-ph { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text3); }
        .mcp-slide-ph .si { font-size: 42px; opacity: .25; }
        .mcp-slide-ph .sl { font-size: 12px; opacity: .35; font-weight: 500; }
        .mcp-carousel-wrap::before {
          content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: linear-gradient(to bottom,rgba(8,11,20,.35) 0%,transparent 25%,transparent 55%,rgba(8,11,20,.97) 100%);
        }
        .mcp-c-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(0,0,0,.55); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.12); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; cursor: pointer; transition: all .2s; user-select: none; line-height: 1;
        }
        .mcp-c-arrow:hover { background: rgba(108,99,255,.5); border-color: rgba(108,99,255,.6); }
        .mcp-c-prev { left: 12px; } .mcp-c-next { right: 12px; }
        .mcp-c-dots {
          position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
          z-index: 10; display: flex; gap: 5px; align-items: center;
        }
        .mcp-c-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.3); transition: all .3s; cursor: pointer;
        }
        .mcp-c-dot.active { background: white; width: 18px; border-radius: 3px; }
        .mcp-c-counter {
          position: absolute; top: 12px; right: 12px; z-index: 10;
          background: rgba(0,0,0,.5); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.1); border-radius: 20px;
          padding: 4px 10px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,.8);
        }

        /* profile header */
        .mcp-profile-header { padding: 0 18px 20px; margin-top: -36px; position: relative; z-index: 10; }
        .mcp-profile-top { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px; }
        .mcp-profile-av {
          width: 76px; height: 76px; border-radius: 50%;
          background: linear-gradient(135deg,#6c63ff,#9b59f5);
          border: 3px solid var(--bg);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 800; color: white;
          position: relative; flex-shrink: 0;
        }
        .mcp-av-online {
          position: absolute; bottom: 4px; right: 4px;
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--success); border: 2px solid var(--bg);
        }
        .mcp-profile-stats { display: flex; gap: 18px; align-items: center; padding-bottom: 6px; }
        .mcp-pstat { text-align: center; }
        .mcp-pstat-n { font-size: 17px; font-weight: 800; letter-spacing: -.02em; }
        .mcp-pstat-l { font-size: 10px; color: var(--text3); font-weight: 500; margin-top: 1px; }
        .mcp-stars { display: flex; gap: 2px; }
        .mcp-profile-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
        .mcp-profile-name { font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
        .mcp-badge-v {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(45,212,191,.1); border: 1px solid rgba(45,212,191,.25);
          border-radius: 6px; padding: 2px 8px; font-size: 10px; font-weight: 700; color: var(--teal);
        }
        .mcp-badge-e {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(244,114,182,.1); border: 1px solid rgba(244,114,182,.25);
          border-radius: 6px; padding: 2px 8px; font-size: 10px; font-weight: 700; color: var(--rose);
        }
        .mcp-profile-handle { font-size: 13px; color: var(--text3); margin-bottom: 7px; font-weight: 500; }
        .mcp-profile-tagline { font-size: 13.5px; color: var(--text2); font-weight: 600; }

        /* action buttons */
        .mcp-action-btns { display: flex; gap: 10px; padding: 0 18px 14px; }
        .mcp-btn-msg {
          flex: 1; padding: 12px; border-radius: 11px;
          background: var(--card); border: 1px solid var(--border);
          color: var(--text); font-size: 13px; font-weight: 700; font-family: inherit;
          cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .mcp-btn-msg:hover { border-color: rgba(108,99,255,.3); background: var(--card2); }
        .mcp-btn-crush {
          flex: 1; padding: 12px; border-radius: 11px;
          background: rgba(244,114,182,.08); border: 1px solid rgba(244,114,182,.2);
          color: var(--rose); font-size: 13px; font-weight: 700; font-family: inherit;
          cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .mcp-btn-crush:hover { background: rgba(244,114,182,.15); }
        .mcp-btn-crush.active { background: rgba(244,114,182,.2); border-color: rgba(244,114,182,.4); }

        /* price card */
        .mcp-price-card {
          margin: 0 18px 16px;
          background: linear-gradient(135deg,rgba(108,99,255,.1),rgba(155,89,245,.07));
          border: 1px solid rgba(108,99,255,.2); border-radius: 16px;
          padding: 20px; position: relative; overflow: hidden;
        }
        .mcp-price-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf);
        }
        .mcp-price-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .mcp-price-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #a89cff; }
        .mcp-price-badge {
          display: flex; align-items: center; gap: 5px;
          background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.2);
          border-radius: 6px; padding: 3px 9px; font-size: 10px; font-weight: 700; color: var(--success);
        }
        .mcp-price-amount { font-size: 32px; font-weight: 800; letter-spacing: -.03em; color: var(--text); margin-bottom: 4px; }
        .mcp-price-amount span { font-size: 15px; font-weight: 600; color: var(--text2); }
        .mcp-price-sub { font-size: 12px; color: var(--text3); margin-bottom: 18px; }
        .mcp-price-perks { display: flex; flex-direction: column; gap: 8px; }
        .mcp-perk { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: var(--text2); }
        .mcp-perk-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(108,99,255,.12); border: 1px solid rgba(108,99,255,.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: #a89cff; flex-shrink: 0;
        }

        /* request button */
        .mcp-btn-rq-wrap { padding: 0 18px 20px; }
        .mcp-btn-rq {
          width: 100%; padding: 16px; border-radius: 14px;
          background: linear-gradient(135deg,#6c63ff,#9b59f5);
          border: none; color: white; font-size: 15px; font-weight: 800;
          font-family: inherit; cursor: pointer; letter-spacing: -.01em;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 6px 28px rgba(108,99,255,.4); transition: all .25s;
        }
        .mcp-btn-rq:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(108,99,255,.55); }

        /* follow strip */
        .mcp-follow-strip {
          margin: 0 18px 24px;
          background: linear-gradient(135deg,rgba(108,99,255,.07),rgba(155,89,245,.04));
          border: 1px solid rgba(108,99,255,.14); border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .mcp-follow-text { font-size: 12.5px; color: var(--text2); line-height: 1.5; }
        .mcp-follow-text strong { color: var(--text); font-weight: 700; }
        .mcp-btn-follow {
          padding: 8px 18px; border-radius: 9px; font-size: 12.5px; font-weight: 700;
          font-family: inherit; cursor: pointer; transition: all .2s; border: none;
          background: linear-gradient(135deg,#6c63ff,#9b59f5);
          color: white; white-space: nowrap; flex-shrink: 0;
        }
        .mcp-btn-follow.following {
          background: rgba(108,99,255,.12);
          border: 1px solid rgba(108,99,255,.25); color: #a89cff;
        }

        /* section */
        .mcp-section { padding: 0 18px; margin-bottom: 24px; }
        .mcp-sec-title {
          font-size: 11px; font-weight: 700; color: var(--text); margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
          letter-spacing: .08em; text-transform: uppercase;
        }
        .mcp-sec-title::before { content: ''; display: block; width: 14px; height: 2px; background: var(--accent); border-radius: 2px; }

        /* details grid */
        .mcp-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mcp-di {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 15px; transition: border-color .2s;
        }
        .mcp-di:hover { border-color: rgba(108,99,255,.2); }
        .mcp-di.full { grid-column: span 2; }
        .mcp-dk { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 5px; }
        .mcp-dv { font-size: 13.5px; font-weight: 700; color: var(--text); line-height: 1.4; }

        /* days */
        .mcp-days-wrap { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .mcp-day {
          height: 38px; padding: 0 12px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; letter-spacing: .03em;
          background: rgba(34,197,94,.07); border: 1px solid rgba(34,197,94,.2); color: var(--success);
        }

        /* hours */
        .mcp-hours-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .mcp-hour {
          padding: 7px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 600;
          background: var(--bg3); border: 1px solid var(--border2); color: var(--text2);
          transition: all .2s; cursor: pointer; font-family: inherit;
        }
        .mcp-hour:hover { border-color: rgba(108,99,255,.3); color: #a89cff; background: rgba(108,99,255,.06); }
        .mcp-hour.sel { background: rgba(108,99,255,.14); border-color: rgba(108,99,255,.35); color: #a89cff; }

        /* about */
        .mcp-about-text { font-size: 13.5px; color: var(--text2); line-height: 1.8; }

        /* safety */
        .mcp-safety-card {
          margin: 0 18px 24px; background: var(--card2);
          border: 1px solid rgba(245,158,11,.15); border-radius: 14px; overflow: hidden;
        }
        .mcp-safety-top {
          padding: 14px 18px; border-bottom: 1px solid rgba(245,158,11,.1);
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: #f59e0b;
        }
        .mcp-safety-body { padding: 16px 18px; }
        .mcp-srule {
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 11px;
          font-size: 12.5px; color: var(--text2); line-height: 1.6;
        }
        .mcp-srule:last-of-type { margin-bottom: 0; }
        .mcp-sbullet {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 1px;
          background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: #f59e0b; font-weight: 700;
        }
        .mcp-sagree {
          margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border2);
          font-size: 11.5px; color: var(--text3); line-height: 1.6;
        }

        /* reviews */
        .mcp-reviews-card {
          margin: 0 18px 32px; background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: border-color .2s;
        }
        .mcp-reviews-card:hover { border-color: rgba(108,99,255,.25); }
        .mcp-rev-left { display: flex; align-items: center; gap: 14px; }
        .mcp-rev-star { font-size: 30px; }
        .mcp-rev-n { font-size: 20px; font-weight: 800; letter-spacing: -.02em; }
        .mcp-rev-l { font-size: 12px; color: var(--text3); font-weight: 500; margin-top: 2px; }
        .mcp-rev-arr { font-size: 18px; color: var(--text3); }

        .mcp-spacer { height: 48px; }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="mcp-root">
        {/* ── NAV ── */}
        <nav className="mcp-nav">
          <button className="mcp-nav-back" onClick={onBack}>←</button>
          <a href="#" className="mcp-nav-logo">
            <div className="mcp-nav-logo-icon">M</div>
            <span className="mcp-nav-logo-name">mmeko</span>
          </a>
          <button className="mcp-nav-share" onClick={onShare}>Share</button>
        </nav>

        {/* ── CAROUSEL ── */}
        <div
          className="mcp-carousel-wrap"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 40) goTo(currentSlide + (dx < 0 ? 1 : -1));
          }}
        >
          <div className="mcp-carousel-track" ref={trackRef}>
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                className="mcp-carousel-slide"
                style={{ background: slideBgs[i % slideBgs.length] }}
              >
                {creator.photos && creator.photos[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.photos[i]}
                    alt={`Photo ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="mcp-slide-ph">
                    <div className="si">📸</div>
                    <div className="sl">Photo {i + 1} of {totalSlides}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="mcp-c-arrow mcp-c-prev" onClick={() => goTo(currentSlide - 1)}>‹</button>
          <button className="mcp-c-arrow mcp-c-next" onClick={() => goTo(currentSlide + 1)}>›</button>
          <div className="mcp-c-counter">{currentSlide + 1} / {totalSlides}</div>

          <div className="mcp-c-dots">
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                className={`mcp-c-dot${i === currentSlide ? " active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {/* ── PROFILE HEADER ── */}
        <div className="mcp-profile-header">
          <div className="mcp-profile-top">
            <div className="mcp-profile-av">
              {creator.name[0]}
              {creator.isOnline && <div className="mcp-av-online" />}
            </div>
            <div className="mcp-profile-stats">
              <div className="mcp-pstat">
                <div className="mcp-pstat-n">{creator.views}</div>
                <div className="mcp-pstat-l">Views</div>
              </div>
              <div className="mcp-pstat">
                <div className="mcp-stars">{stars}</div>
                <div className="mcp-pstat-l">Rating</div>
              </div>
              <div className="mcp-pstat">
                <div className="mcp-pstat-n">{creator.reviewCount}</div>
                <div className="mcp-pstat-l">Reviews</div>
              </div>
            </div>
          </div>

          <div className="mcp-profile-name-row">
            <div className="mcp-profile-name">{creator.name}</div>
            {creator.isVerified && <div className="mcp-badge-v">✓ Verified</div>}
            {creator.isExclusive && <div className="mcp-badge-e">✦ Exclusive</div>}
          </div>
          <div className="mcp-profile-handle">{creator.handle}</div>
          <div className="mcp-profile-tagline">{creator.tagline}</div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="mcp-action-btns">
          <button className="mcp-btn-msg" onClick={onMessage}>💬 Message</button>
          <button
            className={`mcp-btn-crush${isCrushing ? " active" : ""}`}
            onClick={() => setIsCrushing((v) => !v)}
          >
            {isCrushing ? "💖 Crushing" : "🎯 Add to Crush"}
          </button>
        </div>

        {/* ── PRICE CARD ── */}
        <div className="mcp-price-card">
          <div className="mcp-price-top">
            <div className="mcp-price-label">{creator.meetType ?? "Fan Meet & Greet"}</div>
            {creator.isAvailableToday && (
              <div className="mcp-price-badge">✓ Available Today</div>
            )}
          </div>
          <div className="mcp-price-amount">
            {creator.currency ?? "$"}{creator.price} <span>/ meet</span>
          </div>
          <div className="mcp-price-sub">Fan pays upfront — you keep 100%</div>
          <div className="mcp-price-perks">
            <div className="mcp-perk"><div className="mcp-perk-dot">✓</div>{creator.duration} minutes, Session extension available</div>
            <div className="mcp-perk"><div className="mcp-perk-dot">✓</div>Payment secured before the meet</div>
            <div className="mcp-perk"><div className="mcp-perk-dot">✓</div>All communication on-platform</div>
          </div>
        </div>

        {/* ── REQUEST BUTTON ── */}
        <div className="mcp-btn-rq-wrap">
          <button className="mcp-btn-rq" onClick={onRequest}>
            🎯 Request {creator.meetType ?? "Fan Meet & Greet"}
          </button>
        </div>

        {/* ── FOLLOW STRIP ── */}
        <div className="mcp-follow-strip">
          <div className="mcp-follow-text">
            <strong>Like what you see?</strong> Follow {creator.name} to get notified when she&apos;s available.
          </div>
          <button
            className={`mcp-btn-follow${isFollowing ? " following" : ""}`}
            onClick={() => setIsFollowing((v) => !v)}
          >
            {isFollowing ? "Following ✓" : "Follow"}
          </button>
        </div>

        {/* ── MEET DETAILS ── */}
        <div className="mcp-section">
          <div className="mcp-sec-title">Meet Details</div>
          <div className="mcp-details-grid">
            <div className="mcp-di"><div className="mcp-dk">👤 Creator</div><div className="mcp-dv">{creator.name}</div></div>
            <div className="mcp-di"><div className="mcp-dk">📍 Location</div><div className="mcp-dv">{creator.location}</div></div>
            <div className="mcp-di"><div className="mcp-dk">⏱️ Duration</div><div className="mcp-dv">{creator.duration} minutes</div></div>
            <div className="mcp-di">
              <div className="mcp-dk">✅ Status</div>
              <div className="mcp-dv" style={{ color: "var(--teal)" }}>
                {creator.isVerified ? "✓ Verified Creator" : "Creator"}
              </div>
            </div>

            <div className="mcp-di full">
              <div className="mcp-dk">📅 Available Days</div>
              <div className="mcp-days-wrap">
                {creator.availableDays.map((day) => (
                  <div key={day} className="mcp-day">{day}</div>
                ))}
              </div>
            </div>

            <div className="mcp-di full">
              <div className="mcp-dk">🕐 Available Hours — tap to select</div>
              <div className="mcp-hours-wrap">
                {creator.availableHours.map((hour) => (
                  <button
                    key={hour}
                    className={`mcp-hour${selectedHours.has(hour) ? " sel" : ""}`}
                    onClick={() => toggleHour(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="mcp-section">
          <div className="mcp-sec-title">About {creator.name}</div>
          <div className="mcp-about-text">{creator.about}</div>
        </div>

        {/* ── SAFETY ── */}
        <div className="mcp-safety-card">
          <div className="mcp-safety-top">⚠️ Safety Rules — Important</div>
          <div className="mcp-safety-body">
            <div className="mcp-srule">
              <div className="mcp-sbullet">1</div>
              All fan meet &amp; greets are limited to <strong style={{ color: "var(--text)" }}>{creator.duration} minutes.</strong>
            </div>
            <div className="mcp-srule">
              <div className="mcp-sbullet">2</div>
              Meets must happen in a <strong style={{ color: "var(--text)" }}>public place only</strong> — cafés, restaurants, or similar venues.
            </div>
            <div className="mcp-srule">
              <div className="mcp-sbullet">3</div>
              What happens after {creator.duration} minutes is <strong style={{ color: "var(--text)" }}>outside the platform&apos;s responsibility.</strong>
            </div>
            <div className="mcp-sagree">By sending a request, you agree to follow these rules.</div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div className="mcp-reviews-card" onClick={onReviews}>
          <div className="mcp-rev-left">
            <div className="mcp-rev-star">⭐</div>
            <div>
              <div className="mcp-rev-n">{creator.reviewCount} Reviews</div>
              <div className="mcp-rev-l">
                {creator.reviewCount === 0 ? "No reviews yet — be the first" : `See all ${creator.reviewCount} reviews`}
              </div>
            </div>
          </div>
          <div className="mcp-rev-arr">›</div>
        </div>

        <div className="mcp-spacer" />
      </div>
    </>
  );
}