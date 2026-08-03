"use client";
import React from "react";
import { ShieldAlert, Heart } from "lucide-react";

interface ContentPolicyModalProps {
  open: boolean;
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  onCancel: () => void;
  onContinue: () => void;
}

const ContentPolicyModal: React.FC<ContentPolicyModalProps> = ({
  open,
  agreed,
  onAgreedChange,
  onCancel,
  onContinue,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      style={{ zIndex: 1001 }}
    >
      <div className="w-full max-w-md bg-[#111624] border border-white/10 rounded-2xl shadow-[0_30px_70px_-25px_rgba(0,0,0,0.7)] overflow-hidden">

        {/* Header */}
        <div className="relative px-6 pt-7 pb-5 text-center border-b border-white/[0.06]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-500/[0.06] to-transparent" />
          <div className="relative w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/25 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="relative text-white font-bold text-lg">Before You Publish</h2>
          <p className="relative text-gray-500 text-xs mt-1">A quick, important standard we hold every upload to</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            mmeko is a space built on genuine connection, not explicit content. To protect that — for you, and for everyone here — nudity or sexual content is never allowed. This includes, but isn&apos;t limited to, visible nipples or genitals.
          </p>

          <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-300 text-xs font-semibold mb-1">This is a one-strike policy</p>
            <p className="text-red-200/70 text-xs leading-relaxed">
              A single violation results in immediate, permanent removal from mmeko — no warnings, no exceptions.
            </p>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Heart className="w-3.5 h-3.5 text-[#9b59f5] shrink-0 mt-0.5" />
            <span>Holding this line is how we keep mmeko a place people trust — including you.</span>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreedChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-[#0d1120] text-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300">I understand and agree to follow this standard.</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-black/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            disabled={!agreed}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] shadow-[0_8px_20px_-8px_rgba(108,99,255,0.6)] hover:shadow-[0_10px_24px_-6px_rgba(108,99,255,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_-8px_rgba(108,99,255,0.6)] disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPolicyModal;