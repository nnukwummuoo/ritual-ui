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
  const limit = isVideo ? "500 MB" : "10 MB";

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
            <div className="why-title">Why we have this limit</div>
            <div className="why-text">
              We don’t take a single penny of your earnings —{" "}
              <strong>100% goes directly to you.</strong>  Because of that, we don't spend millions on expensive media processing servers. 
              To keep the platform free and sustainable, we simply ask that you keep your files under {limit}.
            </div>
          </div>

          <div className="compress-card">
            <div className="compress-title">✂️ How to compress your file</div>

            <div className="compress-items">
              <div className="compress-item">
                <div className="ci-dot">1</div>
                <div>
                  Use <strong>HandBrake</strong> (Mac/PC) for compression
                </div>
              </div>

              <div className="compress-item">
                <div className="ci-dot">2</div>
                <div>
                  iPhone: <strong>Video Compress</strong> app
                </div>
              </div>

              <div className="compress-item">
                <div className="ci-dot">3</div>
                <div>
                  Android: <strong>VidCompact</strong>
                </div>
              </div>

              <div className="compress-item">
                <div className="ci-dot">4</div>
                <div>
                  Online:{" "}
                  <strong>clideo.com/compress-video</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="rules-card">
            <div className="rules-header">📋 Upload Rules</div>

            <div className="rule-item">
              <div className="rule-emoji">💾</div>
              <div>
                <div className="rule-name">Max File Size</div>
                <div className="rule-val">{limit}</div>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-emoji">⚙️</div>
              <div>
                <div className="rule-name">Best Format</div>
                <div className="rule-val">
                  {isVideo ? "MP4, 1080p recommended" : "JPG/PNG optimized"}
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

            <button className="btn-reupload" onClick={onChooseDifferent}>
              Choose a Different File
            </button>

            <button className="btn-reupload" onClick={onClose}>
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
          background: rgba(0,0,0,.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .popup {
          width: 100%;
          position: relative;
          z-index: 999999;
          max-width: 480px;
          background: #0d1120;
          border-radius: 24px 24px 0 0;
          border-top: 1px solid rgba(255,255,255,.07);
          animation: slideUp .3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .popup-accent {
          height: 2px;
          background: linear-gradient(90deg,#ef4444,#f59e0b,#6c63ff);
        }

        .popup-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,.1);
          margin: 12px auto;
        }

        .popup-body {
          padding: 20px;
          color: white;
        }

        .popup-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(239,68,68,.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .popup-title {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .popup-title span {
          color: #ef4444;
        }

        .popup-sub {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .why-card {
          background: rgba(108,99,255,.07);
          border: 1px solid rgba(108,99,255,.15);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
        }

        .why-title {
          font-size: 12px;
          font-weight: 700;
          color: #a89cff;
          margin-bottom: 6px;
        }

        .why-text {
          font-size: 13px;
          color: #94a3b8;
        }

        .compress-card {
          background: rgba(34,197,94,.06);
          border: 1px solid rgba(34,197,94,.15);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
        }

        .compress-title {
          font-size: 12px;
          font-weight: 700;
          color: #22c55e;
          margin-bottom: 8px;
        }

        .compress-item {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .rules-card {
          background: #161b2e;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .rules-header {
          font-size: 11px;
          color: #475569;
          margin-bottom: 10px;
        }

        .rule-item {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }

        .rule-name {
          font-weight: 700;
          font-size: 13px;
        }

        .rule-val {
          font-size: 12px;
          color: #94a3b8;
        }

        .popup-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-compress {
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg,#6c63ff,#9b59f5);
          color: white;
          font-weight: 700;
        }

        .btn-reupload {
          padding: 12px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,.1);
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}