'use client';

// The animated mmeko loader — extracted from GlobalLoader.tsx so it can be
// reused anywhere a full-screen loading state is needed (e.g. while
// resolving a username to a creator ID), without pulling in GlobalLoader's
// route-change tracking, offline detection, or 20s timeout popup.
export default function LoaderVisual() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#080b14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 40, overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Background glow pulse */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(108,99,255,.06) 0%, transparent 70%)',
        animation: 'bgBreath 3s ease-in-out infinite',
      }} />

      {/* ── RINGS + LOGO ── */}
      <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1.5px solid rgba(108,99,255,.12)',
          animation: 'ringRotate 3s linear infinite',
        }}>
          <div style={{
            position: 'absolute', inset: -1.5, borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: '#6c63ff',
            borderRightColor: 'rgba(155,89,245,.5)',
            animation: 'ringRotate 1.8s cubic-bezier(.5,0,.5,1) infinite',
            filter: 'drop-shadow(0 0 6px rgba(108,99,255,.6))',
          }} />
        </div>

        {/* Middle ring */}
        <div style={{
          position: 'absolute', inset: 14, borderRadius: '50%',
          border: '1px solid rgba(108,99,255,.07)',
        }}>
          <div style={{
            position: 'absolute', inset: -1, borderRadius: '50%',
            border: '1px solid transparent',
            borderBottomColor: '#9b59f5',
            borderLeftColor: 'rgba(108,99,255,.4)',
            animation: 'ringRotate 2.4s cubic-bezier(.5,0,.5,1) infinite reverse',
            filter: 'drop-shadow(0 0 4px rgba(155,89,245,.5))',
          }} />
        </div>

        {/* Inner ring */}
        <div style={{
          position: 'absolute', inset: 30, borderRadius: '50%',
          border: '1px solid rgba(108,99,255,.05)',
        }}>
          <div style={{
            position: 'absolute', inset: -1, borderRadius: '50%',
            border: '1px solid transparent',
            borderTopColor: 'rgba(212,168,83,.6)',
            animation: 'ringRotate 1.2s cubic-bezier(.5,0,.5,1) infinite',
            filter: 'drop-shadow(0 0 4px rgba(212,168,83,.4))',
          }} />
        </div>

        {/* Orbit dot 1 — purple */}
        <div style={{ position: 'absolute', inset: 0, animation: 'ringRotate 2.5s linear infinite' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 6, height: 6, borderRadius: '50%',
            background: '#6c63ff', boxShadow: '0 0 8px #6c63ff',
            transform: 'translate(-50%, -50%) translateY(-76px)',
          }} />
        </div>

        {/* Orbit dot 2 — accent2, reverse */}
        <div style={{ position: 'absolute', inset: 0, animation: 'ringRotate 3.5s linear infinite reverse' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 4, height: 4, borderRadius: '50%',
            background: '#9b59f5', boxShadow: '0 0 6px #9b59f5',
            transform: 'translate(-50%, -50%) translateY(-68px)',
          }} />
        </div>

        {/* Orbit dot 3 — gold */}
        <div style={{ position: 'absolute', inset: 0, animation: 'ringRotate 4.5s linear infinite' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 5, height: 5, borderRadius: '50%',
            background: 'rgba(212,168,83,.8)', boxShadow: '0 0 8px rgba(212,168,83,.6)',
            transform: 'translate(-50%, -50%) translateY(-60px)',
          }} />
        </div>

        {/* Logo */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'logoPulse 2s ease-in-out infinite',
        }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: '22.6%',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <svg width="72" height="72" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mLogoShared" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#9b59f5" />
                </linearGradient>
                <linearGradient id="mShineShared" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#fff" stopOpacity=".15" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="116" fill="url(#mLogoShared)" />
              <rect width="512" height="256" rx="116" fill="url(#mShineShared)" />
              <text
                x="256" y="345"
                textAnchor="middle"
                fontFamily="Georgia,serif"
                fontSize="300"
                fontWeight="700"
                fill="white"
              >M</text>
            </svg>

            {/* Shine sweep overlay */}
            <div style={{
              position: 'absolute',
              top: '-100%', left: '-100%',
              width: '60%', height: '200%',
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.15) 50%, transparent 60%)',
              animation: 'shineSweep 3s ease-in-out infinite',
              transform: 'skewX(-15deg)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </div>

      {/* ── LOADING TEXT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

        <div style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-.01em',
          color: '#f1f5f9', opacity: 0,
          animation: 'fadeInUp .8s .4s ease forwards',
        }}>
          mmeko
        </div>

        <div style={{
          width: 120, height: 2,
          background: 'rgba(255,255,255,.06)',
          borderRadius: 2, overflow: 'hidden',
          opacity: 0, animation: 'fadeInUp .8s .6s ease forwards',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6c63ff, #9b59f5)',
            borderRadius: 2,
            boxShadow: '0 0 8px rgba(108,99,255,.6)',
            animation: 'progressLoad 3s cubic-bezier(.4,0,.2,1) .8s infinite',
          }} />
        </div>

        <div style={{
          display: 'flex', gap: 6, opacity: 0,
          animation: 'fadeInUp .8s .8s ease forwards',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: '50%',
              background: '#475569',
              animation: `dotBounce 1.4s ${i * .2}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
        @keyframes bgBreath     { 0%,100%{opacity:.5;transform:scale(1)}   50%{opacity:1;transform:scale(1.05)} }
        @keyframes ringRotate   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes logoPulse    { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 12px rgba(108,99,255,.4))} 50%{transform:scale(1.04);filter:drop-shadow(0 0 24px rgba(108,99,255,.7))} }
        @keyframes shineSweep   { 0%{left:-100%;top:-100%} 30%{left:150%;top:-100%} 100%{left:150%;top:-100%} }
        @keyframes fadeInUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressLoad { 0%{width:0%;opacity:1} 70%{width:100%;opacity:1} 90%{width:100%;opacity:0} 100%{width:0%;opacity:0} }
        @keyframes dotBounce    { 0%,80%,100%{transform:scale(1);background:#475569} 40%{transform:scale(1.4);background:#6c63ff} }
      `}</style>
    </div>
  );
}