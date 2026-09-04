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
    {visible && <LoaderVisual />}
    {false && (
      <div
        style={{
          position: 'relative',
          width: 160,
          height: 160,
          display: 'none',
        }}
      ></div>
    )}
  </>
)};