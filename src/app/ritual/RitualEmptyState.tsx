'use client';

import { useRouter } from 'next/navigation';

/**
 * Empty state shown on /ritual when there are no active rituals.
 * Matches the client's mmeko-rituals-empty-1.html design exactly.
 */
export default function RitualEmptyState() {
  const router = useRouter();

  return (
    <div style={{
      background: '#07080f', color: '#f0f0f8', minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,8,15,.92)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '0 24px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 520, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 27, height: 27, borderRadius: 7, background: 'linear-gradient(135deg,#6c63ff,#9b59f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>M</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f8', fontFamily: 'Syne, sans-serif' }}>mmeko</span>
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Syne, sans-serif', letterSpacing: '.04em' }}>
          <svg width="14" height="14" viewBox="0 0 512 512" fill="none">
            <rect x="60" y="310" width="392" height="60" rx="30" fill="#a89cff" opacity=".7"/>
            <rect x="60" y="390" width="392" height="60" rx="30" fill="#a89cff"/>
            <path d="M256 50C256 50 196 130 196 200C196 234 224 262 256 262C288 262 316 234 316 200C316 130 256 50 256 50Z" fill="#a89cff"/>
          </svg>
          Rituals
        </div>
        <div style={{ width: 60 }} />
      </nav>

      <div style={{ minHeight: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column' }}>

        {/* TOP HALF */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px 40px', position: 'relative',
          overflow: 'hidden', textAlign: 'center',
        }}>
          {/* Big bg text */}
          <div style={{
            position: 'absolute', fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(80px,22vw,200px)', fontWeight: 800,
            letterSpacing: '-.04em', color: 'rgba(255,255,255,.02)',
            userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0,
          }}>RITUALS</div>

          {/* Orb */}
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(108,99,255,.08) 0%,transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none', zIndex: 0,
            animation: 'orbPulse 6s ease-in-out infinite',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
            {/* Floating panel strips */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 40 }}>
              {[
                { h: 72, delay: '0s', dur: '4s', borderAlpha: '.06' },
                { h: 88, delay: '.3s', dur: '4.5s', borderAlpha: '.15' },
                { h: 96, delay: '.6s', dur: '5s', borderAlpha: '.2', lock: true },
                { h: 88, delay: '.9s', dur: '4.5s', borderAlpha: '.15' },
                { h: 72, delay: '1.2s', dur: '4s', borderAlpha: '.06' },
              ].map((p, i) => (
                <div key={i} style={{
                  width: 52, height: p.h, borderRadius: 10,
                  background: '#131520',
                  border: `1px solid rgba(255,255,255,${p.borderAlpha})`,
                  position: 'relative', overflow: 'hidden',
                  animation: `epFloat ${p.dur} ${p.delay} ease-in-out infinite`,
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(108,99,255,.2),transparent)' }} />
                  {p.lock && (
                    <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 20, height: 20, opacity: .3, zIndex: 2 }} viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
                      <path d="M8 11V7a4 4 0 018 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,6vw,52px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.08, marginBottom: 16 }}>
              Nothing here<br/>
              <span style={{ background: 'linear-gradient(135deg,#6c63ff,#9b59f5,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                just yet.
              </span>
            </h1>
            <p style={{ fontSize: 15, color: '#8888a8', lineHeight: 1.75, maxWidth: 360, margin: '0 auto' }}>
              Today's Rituals haven't dropped yet. Creators share 15-panel stories of their fan meets daily — check back soon.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)', margin: '0 24px' }} />

        {/* BOTTOM HALF */}
        <div style={{ padding: '28px 20px 60px', maxWidth: 480, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Creator upload card */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg,rgba(108,99,255,.09),rgba(155,89,245,.06))',
            border: '1px solid rgba(108,99,255,.22)', borderRadius: 18, padding: 22,
            position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0, background: 'linear-gradient(135deg,#6c63ff,#9b59f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(108,99,255,.4)', animation: 'ip 3s ease-in-out infinite' }}>
                <svg width="24" height="24" viewBox="0 0 512 512" fill="none">
                  <rect x="60" y="310" width="392" height="60" rx="30" fill="white" opacity=".5"/>
                  <rect x="60" y="390" width="392" height="60" rx="30" fill="white" opacity=".7"/>
                  <path d="M256 50C256 50 196 130 196 200C196 234 224 262 256 262C288 262 316 234 316 200C316 130 256 50 256 50Z" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>Are you a creator?</div>
                <div style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.5 }}>Be the first to post today — early Rituals get the most views from fans waiting right now.</div>
              </div>
            </div>
            <button
              onClick={() => router.push('/upload-ritual')}
              style={{
                width: '100%', padding: 15, background: 'linear-gradient(135deg,#6c63ff,#9b59f5)',
                border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(108,99,255,.35)',
                position: 'relative', zIndex: 1,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Post Today's Ritual
            </button>
          </div>

          {/* Tips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#44445a', marginBottom: 14 }}>
              <div style={{ width: 16, height: 2, background: '#6c63ff', borderRadius: 2 }} />
              Why creators post daily
            </div>
            {[
              { icon: '📅', bg: 'rgba(108,99,255,.12)', title: 'Daily Rituals = more fan meet requests', desc: 'Creators who post a Ritual every day receive significantly more fan meet requests.', badge: '↑ More fan meet requests', badgeBg: 'rgba(108,99,255,.1)', badgeColor: '#a89cff' },
              { icon: '🔥', bg: 'rgba(212,168,83,.1)',   title: 'Streaks boost your profile visibility',  desc: 'A 7-day streak puts you at the top of your fans\' feed every morning.', badge: '7-day streak = top of discovery', badgeBg: 'rgba(212,168,83,.1)', badgeColor: '#d4a853' },
              { icon: '💬', bg: 'rgba(45,212,191,.1)',   title: 'Ritual watchers are 3× more likely to book', desc: 'A fan who sees how your meet went is far more likely to want to experience it themselves.', badge: '3× higher request rate', badgeBg: 'rgba(45,212,191,.1)', badgeColor: '#2dd4bf' },
              { icon: '⏰', bg: 'rgba(244,114,182,.1)',  title: 'The 24-hour window keeps fans coming back', desc: 'Because Rituals disappear after 24 hours, that FOMO keeps fans opening mmeko every day.', badge: 'Fans return daily', badgeBg: 'rgba(34,197,94,.1)', badgeColor: '#22c55e' },
            ].map((tip, i) => (
              <div key={i} style={{ background: '#0e1018', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, background: tip.bg }}>{tip.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: '#8888a8', lineHeight: 1.55 }}>{tip.desc}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: tip.badgeBg, color: tip.badgeColor }}>{tip.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          html, body {
            overflow: auto !important;
            height: auto !important;
          }
        }
        @keyframes orbPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.6} 50%{transform:translate(-50%,-50%) scale(1.1);opacity:1} }
        @keyframes epFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ip { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
      `}</style>
    </div>
  );
}