'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoaderVisual from "@/components/LoaderVisual";

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
      {visible && <LoaderVisual />}

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
        @keyframes popupIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
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