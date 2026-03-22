'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface UploadChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * UploadChoiceModal
 * 
 * Shows when user taps "Upload" in the sidebar.
 * Two options: Upload Content → /upload
 *              Upload Ritual  → /upload-ritual
 * 
 * HOW TO USE in MobileSidebar.tsx:
 * 
 *   1. Add state:
 *      const [showUploadModal, setShowUploadModal] = useState(false);
 * 
 *   2. Replace the Upload <Link> with a button:
 *      <button onClick={() => setShowUploadModal(true)} ...>
 *        <FaUpload size={25} />
 *        <p className="text-lg">Upload</p>
 *      </button>
 * 
 *   3. Render modal (outside <section>, at bottom of component):
 *      <UploadChoiceModal
 *        isOpen={showUploadModal}
 *        onClose={() => setShowUploadModal(false)}
 *      />
 */
export default function UploadChoiceModal({ isOpen, onClose }: UploadChoiceModalProps) {
  const router = useRouter();

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 10001,
              background: 'linear-gradient(180deg,#0e1220 0%,#080b14 100%)',
              borderRadius: '24px 24px 0 0',
              padding: '0 20px 40px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              overflow: 'hidden',
            }}
          >
            {/* Top accent bar */}
            <div style={{
              height: 3,
              background: 'linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)',
              margin: '0 -20px 24px',
            }} />

            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,.12)',
              margin: '0 auto 24px',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 24,
            }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.02em', margin: 0 }}>
                  What are you uploading?
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  Choose the type of content to share
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#94a3b8',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Upload Content */}
              <OptionCard
                emoji="📸"
                title="Upload Content"
                desc="Share photos, videos, or text posts with your fans"
                gradient="linear-gradient(135deg,rgba(108,99,255,.12),rgba(155,89,245,.06))"
                border="rgba(108,99,255,.25)"
                accentColor="#a89cff"
                onClick={() => go('/upload')}
              />

              {/* Upload Ritual */}
              <OptionCard
                emoji="🔥"
                title="Upload Ritual"
                desc="Fan meet stories & reactions — 15 panels, lives 24 hours"
                gradient="linear-gradient(135deg,rgba(212,168,83,.10),rgba(244,114,182,.06))"
                border="rgba(212,168,83,.25)"
                accentColor="#d4a853"
                onClick={() => go('/upload-ritual')}
                badge="NEW"
              />

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface OptionCardProps {
  emoji: string;
  title: string;
  desc: string;
  gradient: string;
  border: string;
  accentColor: string;
  onClick: () => void;
  badge?: string;
}

function OptionCard({ emoji, title, desc, gradient, border, accentColor, onClick, badge }: OptionCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: gradient,
        border: `1px solid ${border}`,
        borderRadius: 16, padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'relative', overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Emoji icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: `${border.replace('.25)', '.15)')}`,
        border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#f1f5f9',
          letterSpacing: '-.01em', marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {title}
          {badge && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', padding: '2px 7px',
              borderRadius: 6, background: `${border.replace('.25)', '.15)')}`,
              color: accentColor, border: `1px solid ${border}`,
            }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
          {desc}
        </p>
      </div>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: accentColor, flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}