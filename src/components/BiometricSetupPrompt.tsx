"use client";

import React, { useState, useEffect } from 'react';
import { X, Fingerprint, ShieldCheck, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { isBiometricAvailable, registerBiometric, listPasskeys } from '@/lib/service/webauthn';

const dismissedKey = (userId: string) => `biometricPromptSeen_${userId}`;

const BiometricSetupPrompt: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.accesstoken);

  useEffect(() => {
    if (hasChecked) return;

    const check = async () => {
      let effectiveUserId = userid;
      let effectiveToken = token;
      if ((!effectiveUserId || !effectiveToken) && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const saved = JSON.parse(raw);
            effectiveUserId = effectiveUserId || saved.userID;
            effectiveToken = effectiveToken || saved.accesstoken || saved.refreshtoken;
          }
        } catch {
          // ignore
        }
      }

      if (!effectiveUserId || !effectiveToken) {
        setHasChecked(true);
        return;
      }

      try {
        // Already asked (and dismissed, or set up) this account before — don't nag.
        if (localStorage.getItem(dismissedKey(effectiveUserId))) {
          setHasChecked(true);
          return;
        }

        const available = await isBiometricAvailable();
        if (!available) {
          setHasChecked(true);
          return;
        }

        const existing = await listPasskeys(effectiveToken);
        if (existing.length > 0) {
          // Already set up (e.g. from another device/session) — mark seen, skip.
          localStorage.setItem(dismissedKey(effectiveUserId), "1");
          setHasChecked(true);
          return;
        }

        setIsOpen(true);
      } catch {
        // Fail silently — this is a nice-to-have prompt, never block the app on it
      } finally {
        setHasChecked(true);
      }
    };

    // Give the rest of the page a moment to settle before popping this up
    const t = setTimeout(check, 1200);
    return () => clearTimeout(t);
  }, [userid, token, hasChecked]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const close = () => {
    const effectiveUserId = userid || JSON.parse(localStorage.getItem("login") || "{}")?.userID;
    if (effectiveUserId) localStorage.setItem(dismissedKey(effectiveUserId), "1");
    setVisible(false);
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleSetUp = async () => {
    const effectiveToken = token || JSON.parse(localStorage.getItem("login") || "{}")?.accesstoken;
    if (!effectiveToken) return;

    setError(null);
    setRegistering(true);
    try {
      await registerBiometric(effectiveToken);
      setSuccess(true);
      setTimeout(close, 1600);
    } catch (err: any) {
      setError(err?.message || "Couldn't set up biometric login. You can try again anytime in Settings.");
    } finally {
      setRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center
                  bg-black/70 backdrop-blur-md
                  transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={close}
    >
      <div
        className={`relative w-full sm:max-w-md bg-[#0d1220] border border-white/10
                    rounded-t-[28px] sm:rounded-2xl
                    shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.6)] sm:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.75)]
                    overflow-hidden transform transition-all duration-300 ease-out
                    ${visible
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#a89cff] via-[#c9bfff] to-[#a89cff]" />

        {/* Ambient brand glow */}
        <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#a89cff]/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[#6c5ce7]/5 blur-[90px]" />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <button
          onClick={close}
          className="absolute top-5 right-4 sm:top-4 w-8 h-8 rounded-full flex items-center justify-center
                     text-slate-400 hover:text-white hover:bg-white/5 transition-colors z-10"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative px-6 sm:px-7 pt-5 sm:pt-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:pb-6">
          {success ? (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-white text-lg font-bold mb-1">You're all set</h3>
              <p className="text-slate-400 text-sm">Biometric login is ready to use.</p>
            </div>
          ) : (
            <>
              {/* Icon + badge */}
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-11 h-11 shrink-0">
                  <span className="absolute inset-0 rounded-xl bg-[#a89cff]/20 animate-ping [animation-duration:2.5s]" />
                  <div className="relative w-11 h-11 rounded-xl bg-[#a89cff]/10 border border-[#a89cff]/20 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-[#a89cff]" />
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold
                                 uppercase tracking-wider text-[#a89cff] bg-[#a89cff]/10 border border-[#a89cff]/20">
                  <ShieldCheck className="w-3 h-3" />
                  Security
                </span>
              </div>

              <h3 className="text-white text-xl font-bold leading-snug mb-2 pr-6">
                Sign in faster, more securely
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                Set up Face ID, Touch ID, or your device's biometrics so you can log in
                with a glance or a touch — no password to remember or type.
              </p>

              {error && (
                <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSetUp}
                  disabled={registering}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl
                             text-sm font-semibold text-[#080b14] bg-[#a89cff] hover:bg-[#9384ff]
                             active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {registering ? "Waiting for device…" : "Set Up Now"}
                </button>
                <button
                  onClick={close}
                  disabled={registering}
                  className="inline-flex items-center justify-center px-4 py-3 sm:py-2.5 rounded-xl
                             text-sm font-medium text-slate-300 border border-white/10
                             hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  Maybe Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricSetupPrompt;