"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'material-react-toastify';

interface FanRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  fanName: string;
  hostType?: string;
  loading?: boolean;
  preSelectedRating?: number;
}

const RATING_LABELS = ["Tap a star to rate", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function FanRatingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  fanName, 
  hostType = "Fan Meet",
  loading = false,
  preSelectedRating = 0
}: FanRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  React.useEffect(() => {
    if (preSelectedRating > 0) {
      setRating(preSelectedRating);
    }
  }, [preSelectedRating]);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    onSubmit(rating, feedback.trim());
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#6c63ff] via-[#9b59f5] to-[#f5c451]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl text-yellow-400">
              ★
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Rate Your Fan</h2>
              <p className="text-[13px] text-slate-400 mt-0.5">
                Your <span className="font-semibold text-slate-200">{hostType}</span> with <span className="font-semibold text-slate-200">{fanName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Star Rating */}
        <div className="mb-6 rounded-xl border border-white/[0.07] bg-white/[0.02] py-5 px-3">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-4xl leading-none transition-transform hover:scale-110 focus:outline-none"
                disabled={loading}
              >
                <span
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.45)]'
                      : 'text-slate-600'
                  } transition-colors`}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className={`text-center text-sm mt-3 font-medium ${rating === 0 ? "text-slate-500" : "text-yellow-300"}`}>
            {RATING_LABELS[rating]}
          </p>
        </div>

        {/* Feedback Input */}
        <div className="mb-6">
          <label htmlFor="feedback" className="block text-sm font-semibold text-slate-200 mb-2">
            Share your experience <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell others about your experience with this fan..."
            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 resize-none transition-colors"
            rows={3}
            maxLength={100}
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1.5 text-right">
            {feedback.length}/100
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0 || !feedback.trim()}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}