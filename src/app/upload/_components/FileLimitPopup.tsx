"use client";

import React from "react";

type Props = {
  open: boolean;
  type: "image" | "video";
  onClose: () => void;
  onChooseDifferent: () => void;
};

export default function FileLimitPopup({
  open,
  type,
  onClose,
  onChooseDifferent,
}: Props) {
  if (!open) return null;

  const isVideo = type === "video";
  const limit = isVideo ? "50 MB" : "10 MB";

  const compressUrl = "https://www.clideo.com/compress-video";

  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-accent" />
        <div className="popup-handle" />

        <div className="popup-body">
          <div className="popup-icon-wrap">🚫</div>

          <h1 className="popup-title">
            File too <span>large</span>
          </h1>

          <p className="popup-sub">
            Your {type} exceeds the {limit} limit and could not be uploaded.
            Please compress it and try again.
          </p>

          <div className="why-card">
            <div className="why-icon">💜</div>

            <div className="why-title">
              Why we have this limit
            </div>

            <div className="why-text">
              We don’t take a single penny of your earnings —
              <strong> 100% goes directly to you.</strong>
              {" "}Because of that, we don't spend millions on expensive
              media processing servers.

              To keep the platform free and sustainable,
              we simply ask that you keep your files <strong>under {limit}.</strong>
            </div>
          </div>

          <div className="compress-card">
            <div className="compress-title">
              ✂️ How to compress your file
            </div>

            <div className="compress-items">

              <div className="compress-item">
                <div className="ci-dot">1</div>

                <div>
                  Use <strong>HandBrake</strong> (Mac & PC)
                  for compression
                </div>
              </div>

              <div className="compress-item">
                <div className="ci-dot">2</div>

                <div>
                  iPhone:
                  <strong> Video Compress</strong> app
                </div>
              </div>

              <div className="compress-item">
                <div className="ci-dot">3</div>

                <div>
                  Android:
                  <strong> VidCompact</strong>
                </div>
              </div>

              <div className="compress-item">
                <div className="ci-dot">4</div>

                <div>
                  Online:
                  <strong> clideo.com/compress-video</strong>
                </div>
              </div>

            </div>
          </div>

          <div className="rules-card">
            <div className="rules-header">
              📋 Upload Rules
            </div>

            <div className="rule-item">
              <div className="rule-emoji">💾</div>

              <div>
                <div className="rule-name">
                  Max File Size
                </div>

                <div className="rule-val">
                  {limit}
                </div>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-emoji">⚙️</div>

              <div>
                <div className="rule-name">
                  Best Format
                </div>

                <div className="rule-val">
                  {isVideo
                    ? "MP4, 1080p recommended"
                    : "JPG/PNG optimized"}
                </div>
              </div>
            </div>
          </div>

          <div className="popup-actions">

            <button
              className="btn-compress"
              onClick={() => window.open(compressUrl, "_blank")}
            >
              📲 How to Compress My File
            </button>

            <button
              className="btn-reupload"
              onClick={onChooseDifferent}
            >
              Choose a Different File
            </button>

            <button
              className="btn-close"
              onClick={onClose}
            >
              Close
            </button>

          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          pointer-events: all;

          background: rgba(0,0,0,.72);
          backdrop-filter: blur(8px);

          display: flex;
          justify-content: center;

          overflow-y: auto;

          padding-top: 20px;
        }

        .popup {
          width: 100%;
          max-width: 480px;

          background: #0d1120;

          border-radius: 24px 24px 0 0;
          border-top: 1px solid rgba(255,255,255,.07);

          position: relative;
          z-index: 999999;

          margin-top: auto;

          animation: slideUp .38s cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }

          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .popup-accent {
          height: 2px;
          background: linear-gradient(
            90deg,
            #ef4444,
            #f59e0b,
            #6c63ff
          );
        }

        .popup-handle {
          width: 38px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);

          margin: 14px auto 0;
        }

        .popup-body {
          padding: 22px 22px 40px;
          color: white;
        }

        .popup-icon-wrap {
          width: 64px;
          height: 64px;

          border-radius: 50%;

          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.2);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 28px;

          margin-bottom: 18px;
        }

        .popup-title {
          font-size: 22px;
          font-weight: 800;

          margin-bottom: 8px;

          letter-spacing: -.02em;
        }

        .popup-title span {
          color: #ef4444;
        }

        .popup-sub {
          font-size: 13px;
          color: #94a3b8;

          line-height: 1.7;

          margin-bottom: 22px;
        }

        .why-card {
          background: rgba(108,99,255,.07);

          border: 1px solid rgba(108,99,255,.15);

          border-radius: 16px;

          padding: 16px 18px;

          margin-bottom: 18px;

          position: relative;

          overflow: hidden;
        }

        .why-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: 0;
          right: 0;

          height: 2px;

          background: linear-gradient(
            90deg,
            #6c63ff,
            #9b59f5
          );
        }

        .why-icon {
          font-size: 22px;
          margin-bottom: 10px;
        }

        .why-title {
          font-size: 12px;
          font-weight: 700;

          color: #a89cff;

          letter-spacing: .08em;
          text-transform: uppercase;

          margin-bottom: 8px;
        }

        .why-text {
          font-size: 13px;
          color: #94a3b8;

          line-height: 1.75;
        }

        .why-text strong {
          color: #f8fafc;
        }

        .compress-card {
          background: rgba(34,197,94,.06);

          border: 1px solid rgba(34,197,94,.15);

          border-radius: 16px;

          padding: 16px 18px;

          margin-bottom: 18px;
        }

        .compress-title {
          font-size: 12px;
          font-weight: 700;

          color: #22c55e;

          letter-spacing: .08em;
          text-transform: uppercase;

          margin-bottom: 12px;
        }

        .compress-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .compress-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;

          font-size: 12.5px;
          color: #94a3b8;

          line-height: 1.6;
        }

        .ci-dot {
          width: 22px;
          height: 22px;

          border-radius: 50%;

          background: rgba(34,197,94,.12);
          border: 1px solid rgba(34,197,94,.2);

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: #22c55e;

          font-size: 10px;
          font-weight: 700;
        }

        .rules-card {
          background: #161b2e;

          border: 1px solid rgba(255,255,255,.06);

          border-radius: 16px;

          overflow: hidden;

          margin-bottom: 22px;
        }

        .rules-header {
          padding: 12px 16px;

          border-bottom: 1px solid rgba(255,255,255,.05);

          font-size: 11px;
          font-weight: 700;

          color: #64748b;

          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .rule-item {
          display: flex;
          align-items: center;
          gap: 12px;

          padding: 14px 16px;

          border-bottom: 1px solid rgba(255,255,255,.04);
        }

        .rule-item:last-child {
          border-bottom: none;
        }

        .rule-emoji {
          width: 30px;

          font-size: 18px;

          flex-shrink: 0;

          text-align: center;
        }

        .rule-name {
          font-size: 13px;
          font-weight: 700;

          margin-bottom: 2px;
        }

        .rule-val {
          font-size: 12px;
          color: #94a3b8;
        }

        .popup-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-compress {
          width: 100%;

          padding: 14px;

          border-radius: 14px;
          border: none;

          background: linear-gradient(
            135deg,
            #6c63ff,
            #9b59f5
          );

          color: white;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;
        }

        .btn-reupload,
        .btn-close {
          width: 100%;

          padding: 13px;

          border-radius: 14px;

          background: transparent;

          border: 1px solid rgba(255,255,255,.08);

          color: #94a3b8;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;
        }
      `}</style>
    </div>
  );
}