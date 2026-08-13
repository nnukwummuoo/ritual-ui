import React, { useState } from "react";
import { Coins, ShieldCheck } from "lucide-react";

export default function Notifybuy({
  price,
  buy,
  cancel,
}: {
  price: number;
  buy: () => void;
  cancel: () => void;
}) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleConfirm = () => {
    setIsPurchasing(true);
    buy();
  };

  return (
    <div className="relative w-full max-w-[320px] bg-[#111624] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top accent glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-[#f5c451]/20 blur-3xl pointer-events-none" />

      <div className="relative px-6 pt-7 pb-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5c451] to-[#e8a93a] flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(245,196,81,0.55)] mb-4">
          <Coins className="w-7 h-7 text-black/80" />
        </div>

        <h3 className="text-white text-[16px] font-bold mb-1.5">Unlock this content?</h3>
        <p className="text-gray-400 text-[13px] leading-relaxed mb-5">
          This amount will be deducted from your Gold balance.
        </p>

        <div className="w-full flex items-center justify-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl py-3 mb-6">
          <span className="text-[#f5c451] text-[18px]">🪙</span>
          <span className="text-white text-[20px] font-bold tracking-tight">
            {parseFloat(String(price)).toFixed(2)}
          </span>
          <span className="text-gray-500 text-[12px] font-medium">Gold</span>
        </div>

        <div className="w-full flex items-center gap-1.5 text-gray-500 text-[11px] mb-6">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Instant unlock — yours to view anytime after purchase</span>
        </div>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={cancel}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 text-[13.5px] font-semibold hover:bg-white/[0.08] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPurchasing}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#e8a93a] text-black text-[13.5px] font-bold hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPurchasing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                Unlocking...
              </>
            ) : (
              "Confirm & Unlock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}