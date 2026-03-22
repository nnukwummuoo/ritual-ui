'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function LoaderInner() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [offline, setOffline]     = useState(false);

  // Track whether this is the first render
  const isFirstRender = useRef(true);

  // Show briefly on route changes — skip the very first load
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisible(true);
    setShowPopup(false);
    const hide = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(hide);
  }, [pathname, searchParams]);

  // After 20s still loading → show popup
  useEffect(() => {
    if (!visible) { setShowPopup(false); return; }
    const t = setTimeout(() => setShowPopup(true), 20000);
    return () => clearTimeout(t);
  }, [visible]);

  // Offline / online
  useEffect(() => {
    const goOffline = () => { setOffline(true); setVisible(true); };
    const goOnline  = () => { setOffline(false); setVisible(false); setShowPopup(false); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    if (typeof navigator !== 'undefined' && !navigator.onLine) goOffline();
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!visible && !offline) return null;

  return (
    <>
      {/* ── FULL SCREEN LOADER ── */}
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

          {/* Logo — exact SVG from client HTML */}
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
                  <linearGradient id="mLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#9b59f5" />
                  </linearGradient>
                  <linearGradient id="mShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#fff" stopOpacity=".15" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="512" height="512" rx="116" fill="url(#mLogo)" />
                <rect width="512" height="256" rx="116" fill="url(#mShine)" />
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

          {/* mmeko name */}
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-.01em',
            color: '#f1f5f9', opacity: 0,
            animation: 'fadeInUp .8s .4s ease forwards',
          }}>
            mmeko
          </div>

          {/* Progress bar */}
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

          {/* Three bouncing dots */}
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
      </div>

      {/* ── 20s / OFFLINE POPUP ── */}
      {(showPopup || offline) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)',
          fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20,
        }}>
          <div style={{
            background: '#0e1220',
            border: '1px solid rgba(108,99,255,.25)',
            borderRadius: 20, padding: '36px 32px',
            maxWidth: 360, width: '100%', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
            animation: 'popupIn .3s cubic-bezier(.34,1.56,.64,1)',
          }}>
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)',
            }} />

            <div style={{ fontSize: 36, marginBottom: 16 }}>
              {offline ? '📡' : '⏳'}
            </div>

            <h3 style={{
              fontSize: 17, fontWeight: 700, color: '#f1f5f9',
              marginBottom: 10, letterSpacing: '-.02em',
            }}>
              {offline ? 'No Internet Connection' : 'Taking too long…'}
            </h3>

            <p style={{
              fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28,
            }}>
              Please check your Internet connection and try again.
            </p>

            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%', padding: '13px 0',
                borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#6c63ff,#9b59f5)',
                color: 'white', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(108,99,255,.35)',
              }}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
        @keyframes bgBreath     { 0%,100%{opacity:.5;transform:scale(1)}   50%{opacity:1;transform:scale(1.05)} }
        @keyframes ringRotate   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes logoPulse    { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 12px rgba(108,99,255,.4))} 50%{transform:scale(1.04);filter:drop-shadow(0 0 24px rgba(108,99,255,.7))} }
        @keyframes shineSweep   { 0%{left:-100%;top:-100%} 30%{left:150%;top:-100%} 100%{left:150%;top:-100%} }
        @keyframes fadeInUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressLoad { 0%{width:0%;opacity:1} 70%{width:100%;opacity:1} 90%{width:100%;opacity:0} 100%{width:0%;opacity:0} }
        @keyframes dotBounce    { 0%,80%,100%{transform:scale(1);background:#475569} 40%{transform:scale(1.4);background:#6c63ff} }
        @keyframes popupIn      { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </>
  );
}

export default function GlobalLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderInner />
    </Suspense>
  );
}