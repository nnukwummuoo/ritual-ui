/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { upgradeToVip, checkVipStatus, clearVipError, cancelVip } from "@/store/vip";
import { toast } from "react-toastify";
import { URL as API_URL } from "@/api/config";
import { useRouter } from "next/navigation";

const VIPPage = () => {
  
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Get user data from Redux
  const loggedInUserId = useSelector((state: RootState) => state.register.userID);
  const vipStatus = useSelector((state: RootState) => state.vip.vipStatus);
  const upgradeLoading = useSelector((state: RootState) => state.vip.upgradeLoading);
  const upgradeError = useSelector((state: RootState) => state.vip.upgradeError);
  const profile = useSelector((state: RootState) => state.profile);
  const goldBalance = vipStatus?.goldBalance || Number(profile.balance) || 0;
  
  // Debug gold balance
  console.log("🔍 [VIP PAGE] Gold Balance Debug:", {
    vipStatusGoldBalance: vipStatus?.goldBalance,
    profileBalance: profile.balance,
    convertedBalance: Number(profile.balance),
    finalGoldBalance: goldBalance,
    vipStatus: vipStatus
  });
  
  // Track if we've already shown a toast to prevent duplicates
  const [hasShownToast, setHasShownToast] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [showInsufficientGoldModal, setShowInsufficientGoldModal] = React.useState(false);
  
  // Get user ID from localStorage if not in Redux
  const getUserId = () => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.userID || "";
      }
    } catch (error) {
      console.error("Error getting user ID from localStorage:", error);
    }
    return "";
  };

  const userId = loggedInUserId || getUserId();



  // Continue VIP (re-enable auto-renewal)
  const continueVip = async () => {
    if (!userId) {
      toast.error("Please log in to continue VIP");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/vip/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userId })
      });

      const data = await response.json();
      
      if (data.ok) {
        toast.success("VIP auto-renewal enabled!");
        // Refresh VIP status to get updated auto-renewal state
        dispatch(checkVipStatus(userId) as any);
      } else {
        toast.error(data.message || "Failed to continue VIP");
      }
    } catch (error) {
      console.error("Continue VIP error:", error);
      toast.error("Failed to continue VIP");
    }
  };


  // Check VIP status on component mount
  useEffect(() => {
    if (userId) {
      dispatch(checkVipStatus(userId) as any);
    }
  }, [userId, dispatch]);

  // Reset toast state when component mounts
  useEffect(() => {
    setHasShownToast(false);
    // Clear any existing errors
    dispatch(clearVipError());
  }, [dispatch]);



  // Handle upgrade to VIP
  const handleUpgrade = async () => {
    if (!userId) {
      toast.error("Please log in to upgrade to VIP");
      return;
    }

    // Check if user has sufficient gold balance
    if (goldBalance < 100) {
      setShowInsufficientGoldModal(true);
      return;
    }

    try {
      const result = await dispatch(upgradeToVip({ userid: userId, duration: 30 }) as any);
      
      // Only show success toast if the action was fulfilled (not rejected)
      if (result.type.endsWith('/fulfilled')) {
        if (!hasShownToast) {
          toast.success("Successfully upgraded to VIP!");
          setHasShownToast(true);
          // Reset the toast flag after a delay
          setTimeout(() => {
            setHasShownToast(false);
          }, 2000);
        }
      }
    } catch  {
      // Don't show error toast here - let the error handler below handle it
    }
  };

  // Handle cancel VIP
  const handleCancelVip = async () => {
    if (!userId) {
      toast.error("Please log in to cancel VIP");
      return;
    }

    try {
      const result = await dispatch(cancelVip(userId) as any);
      
      if (result.type.endsWith('/fulfilled')) {
        toast.success("VIP subscription cancelled successfully!");
        setShowCancelConfirm(false);
        // Refresh VIP status
        dispatch(checkVipStatus(userId) as any);
      } else {
        toast.error("Failed to cancel VIP subscription. Please try again.");
      }
    } catch  {
      toast.error("Failed to cancel VIP subscription. Please try again.");
    }
  };

  // Handle upgrade error
  useEffect(() => {
    if (upgradeError && !hasShownToast) {
      toast.error(upgradeError);
      setHasShownToast(true);
      // Clear the error after showing the toast
      setTimeout(() => {
        dispatch(clearVipError());
        setHasShownToast(false);
      }, 100);
    }
  }, [upgradeError, dispatch, hasShownToast]);

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 pb-16 space-y-5">

        {/* ── Hero ───────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#6c63ff]/[0.18] via-[#0d1220] to-[#0d1220] p-6 sm:p-9">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#9b59f5]/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6c63ff]/40 bg-[#6c63ff]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#c4bcff]">
                ✦ VIP
              </span>
              <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">
                For fans
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Upgrade to VIP</h1>
            <p className="mt-2 text-base sm:text-lg text-slate-300">Your experience. Your standards. Your choice.</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
              VIP is made for fans: stand out, get seen first, and have a real person in your corner for every booking.
              Creators are welcome to upgrade too if they&apos;d like dedicated 1-on-1 support.
            </p>
          </div>
        </div>

        {/* ── Who is it for ──────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 rounded-2xl border border-[#6c63ff]/30 bg-[#6c63ff]/[0.07] p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6c63ff]/20 text-lg">👤</span>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                Fans
                <span className="rounded-full bg-[#6c63ff]/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c4bcff]">Best fit</span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                A verified badge, priority chats and concierge support whenever you book.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#0d1220] p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg">🎤</span>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                Creators
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Optional</span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                Upgrade if you want dedicated support from our team.
              </p>
            </div>
          </div>
        </div>

        {/* ── Benefits ───────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">
          <VipSection title="Badge Benefits" icon="🏅">
            <VipBenefit title="Verified Lion Badge" text="Appears on your profile, messages, comments and requests" />
            <VipBenefit title="Priority Messaging" text="Your chats rise to the top" />
          </VipSection>

          <VipSection title="Exclusive Lion Effect" icon="✨">
            <VipBenefit
              title="Golden Lion Animation"
              text="Appears when you enter VIP profiles & chats — your presence roars with status"
            />
          </VipSection>
        </div>

        <VipSection title="Dedicated Support Benefits" icon="🛟">
          <div className="grid sm:grid-cols-3 gap-4">
            <VipBenefit title="1-on-1 Support Concierge" text="Real human support" />
            <VipBenefit title="Dispute Protection" text="We intervene if expectations aren't met" />
            <VipBenefit title="Legacy-Safe Archiving" text="You choose what stays, what fades" />
          </div>
        </VipSection>

        {/* ── VIP Status Display ─────────────────────────────── */}
        {vipStatus?.isVip && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] p-5 text-center">
            <h3 className="text-lg font-bold text-emerald-300 mb-1">🎉 You&apos;re a VIP Member!</h3>
            <p className="text-emerald-200/90 text-sm">
              {vipStatus.daysRemaining > 0
                ? `${vipStatus.daysRemaining} days remaining`
                : "VIP Status Active"
              }
            </p>
            <p className="text-emerald-200/70 text-xs mt-1">
              Auto-renewal: {vipStatus.autoRenewal ? "Enabled" : "Disabled"}
            </p>
          </div>
        )}

        {/* ── Pricing and CTA ────────────────────────────────── */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0d1220] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-center sm:text-left">
            <p className="flex items-baseline justify-center sm:justify-start gap-1.5">
              <span className="text-4xl font-extrabold tabular-nums text-white">100</span>
              <span className="text-sm font-bold text-orange-300">Gold</span>
              <span className="text-sm text-slate-500">/ month</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">Cancel anytime</p>
            <p className="mt-0.5 text-xs text-slate-500">Your balance: {goldBalance} Gold</p>
          </div>

          {vipStatus?.isVip ? (
            // VIP is active - show Continue or Cancel based on auto-renewal
            vipStatus.autoRenewal ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full sm:w-64 py-3.5 px-4 rounded-xl font-bold text-white bg-rose-500/90 hover:bg-rose-500 transition-colors"
              >
                Cancel Auto-Renewal
              </button>
            ) : (
              <button
                onClick={continueVip}
                className="w-full sm:w-64 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-110 transition-all"
              >
                Continue VIP
              </button>
            )
          ) : (
            // VIP is not active - show upgrade button
            <button
              onClick={handleUpgrade}
              disabled={upgradeLoading}
              className={`w-full sm:w-64 py-3.5 px-4 rounded-xl font-bold text-white transition-all ${
                upgradeLoading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] hover:brightness-110 shadow-lg shadow-[#6c63ff]/25"
              }`}
            >
              {upgradeLoading ? "Processing..." : "Upgrade"}
            </button>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-3">Cancel VIP Auto-Renewal</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Are you sure you want to cancel VIP auto-renewal? Your VIP will remain active until it expires, but it won&apos;t automatically renew.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/[0.06] transition-colors"
                >
                  Keep Auto-Renewal
                </button>
                <button
                  onClick={handleCancelVip}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Insufficient Gold Modal */}
        {showInsufficientGoldModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-3">Insufficient Gold Balance</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                You need 100 gold to upgrade to VIP. You currently have {goldBalance} gold.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInsufficientGoldModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInsufficientGoldModal(false);
                    router.push('/buy-gold');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] hover:brightness-110 transition-all"
                >
                  Purchase Gold
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function VipSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1220] p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-base">{icon}</span>
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function VipBenefit({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6c63ff] to-[#9b59f5]">
        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-400">{text}</p>
      </div>
    </div>
  );
}

export default VIPPage;