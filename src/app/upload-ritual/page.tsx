'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { URL as API_URL } from '@/api/config';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

// ── Types ────────────────────────────────────────────────────────────────────
interface PanelData {
  file: File | null;
  preview: string | null;
  subtitle: string;
}

const EMPTY_PANEL = (): PanelData => ({ file: null, preview: null, subtitle: '' });

const SONGS = [
  { id: 'after-hours',   name: 'After Hours',   artist: 'Ambient · Chill',     duration: '3:24', emoji: '🌙', bg: 'linear-gradient(135deg,#1a0830,#0a0418)' },
  { id: 'golden-hour',   name: 'Golden Hour',   artist: 'Soft R&B · Warm',     duration: '2:58', emoji: '✨', bg: 'linear-gradient(135deg,#1a1000,#0a0800)' },
  { id: 'midnight-city', name: 'Midnight City', artist: 'Electronic · Dreamy', duration: '4:01', emoji: '🌊', bg: 'linear-gradient(135deg,#001a1a,#000a0a)' },
  { id: 'tender',        name: 'Tender',        artist: 'Soul · Emotional',    duration: '3:47', emoji: '💜', bg: 'linear-gradient(135deg,#1a0010,#0a0008)' },
  { id: 'vibes',         name: 'Just Vibes',    artist: 'Afrobeat · Upbeat',   duration: '3:12', emoji: '🌿', bg: 'linear-gradient(135deg,#001a10,#000a08)' },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function UploadRitualPage() {
  const router = useRouter();
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken  = useSelector((s: RootState) => s.register.refreshtoken);

  const [title, setTitle]   = useState('');
  const [panels, setPanels] = useState<PanelData[]>(Array.from({ length: 15 }, EMPTY_PANEL));
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [songTab, setSongTab] = useState<'library' | 'upload'>('library');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished]   = useState(false);

  const activePanelRef = useRef<number | null>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const audioInputRef  = useRef<HTMLInputElement>(null);

  const filledCount  = panels.filter(p => p.file !== null).length;
  const progress     = (filledCount / 15) * 100;
  const canPublish   = filledCount === 15 && title.trim().length > 0;

  // ── Panel handlers ──────────────────────────────────────────────────────
  const openFilePicker = (index: number) => {
    activePanelRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx  = activePanelRef.current;
    const file = e.target.files?.[0];
    if (idx === null || !file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPanels(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], file, preview: reader.result as string };
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePanel = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPanels(prev => {
      const next = [...prev];
      next[index] = EMPTY_PANEL();
      return next;
    });
  };

  const updateSubtitle = (index: number, value: string) => {
    setPanels(prev => {
      const next = [...prev];
      next[index] = { ...next[index], subtitle: value };
      return next;
    });
  };

  // ── Audio handlers ──────────────────────────────────────────────────────
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAudioFile(file); setSelectedSong(file.name); }
  };

  // ── Publish ─────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!canPublish || publishing) return;
    setPublishing(true);

    try {
      // ── Resolve userId + token from every possible source ─────────────────
      let userId = reduxUserId;
      let token  = reduxToken;

      if (typeof window !== 'undefined') {
        // Try 'login' key first (primary)
        const loginRaw = localStorage.getItem('login');
        if (loginRaw) {
          try {
            const d = JSON.parse(loginRaw);
            if (!userId) userId = d.userID || d.userId || d.id || d._id || '';
            if (!token)  token  = d.refreshtoken || d.accesstoken || d.token || '';
          } catch {}
        }

        // Fallback: try individual keys some apps store separately
        if (!userId) userId = localStorage.getItem('userID') || localStorage.getItem('userId') || '';
        if (!token)  token  = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      }

      console.log('[UploadRitual] userId resolved:', userId);

      if (!userId) {
        alert('You must be logged in to publish a ritual.');
        setPublishing(false);
        return;
      }

      const formData = new FormData();

      // Required fields
      formData.append('userId', userId);
      formData.append('title', title.trim());

      // Optional song
      if (selectedSong) formData.append('song', selectedSong);
      if (audioFile)    formData.append('audioFile', audioFile);

      // 15 panels — image file + subtitle for each
      panels.forEach((p, i) => {
        if (p.file) formData.append(`panel_${i + 1}_image`, p.file, p.file.name);
        formData.append(`panel_${i + 1}_subtitle`, p.subtitle || '');
      });

      // Let the browser set Content-Type with boundary automatically
      const uploadRes = await axios.post(
        `${API_URL}/api/creator-rituals/upload`,
        formData,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (e) => {
            if (e.total) {
              console.log(`Upload progress: ${Math.round((e.loaded / e.total) * 100)}%`);
            }
          },
        }
      );

      if (!uploadRes.data?.ok) {
        throw new Error(uploadRes.data?.message || 'Upload failed');
      }

      setPublished(true);
      setTimeout(() => router.push('/anya'), 2000);
    } catch (err: any) {
      console.error('Publish error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to publish. Please try again.';
      alert(msg);
    } finally {
      setPublishing(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#080b14', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* TOP NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,11,20,.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg,#6c63ff,#9b59f5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: 'white',
          }}>M</div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>mmeko</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg,#6c63ff,#9b59f5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
          }}>🔥</div>
          Create a Ritual
        </div>

        <button
          onClick={() => router.back()}
          style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            color: '#94a3b8', background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.07)', cursor: 'pointer',
          }}
        >← Back</button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* HERO */}
        <div style={{
          background: '#161b2e', border: '1px solid rgba(108,99,255,.2)',
          borderRadius: 20, padding: 40, marginBottom: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf)' }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(108,99,255,.1)', border: '1px solid rgba(108,99,255,.2)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 20,
            fontSize: 11, fontWeight: 600, color: '#a89cff', letterSpacing: '.08em', textTransform: 'uppercase',
          }}>🔥 New Feature</div>

          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 14 }}>
            What is a{' '}
            <span style={{ background: 'linear-gradient(135deg,#6c63ff,#9b59f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ritual?
            </span>
          </h1>

          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.75, maxWidth: 620, marginBottom: 28 }}>
            A <strong style={{ color: '#f1f5f9' }}>Ritual</strong> is your daily story — told in{' '}
            <strong style={{ color: '#f1f5f9' }}>15 panels</strong> with subtitles.
            Share how a fan meet or date went, post reaction photos, go behind the scenes — anything
            real, anything yours. Rituals live for <strong style={{ color: '#f1f5f9' }}>24 hours</strong>, archives to your profile forever and keep your fans coming back every day.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[['🖼', 'Exactly 15 panels'], ['📝', 'Each panel has a subtitle'], ['⏰', 'Lives for 24 hours'], ['🎵', 'Add a song']].map(([icon, label]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#0e1220', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#94a3b8',
              }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(108,99,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '32px 0' }} />

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              Ritual Title
              <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>Required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={60}
              placeholder="e.g. My first fan meet in Lagos 🔥"
              style={{
                background: '#111624', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 10, padding: '13px 16px',
                fontSize: 14, color: '#f1f5f9', fontFamily: 'inherit', outline: 'none', width: '100%',
              }}
            />
          </div>

          {/* Panels */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                Upload Your 15 Panels
                <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>Each panel needs a subtitle</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: filledCount === 15 ? 'rgba(34,197,94,.1)' : 'rgba(108,99,255,.1)',
                  border: `1px solid ${filledCount === 15 ? 'rgba(34,197,94,.2)' : 'rgba(108,99,255,.2)'}`,
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 12, fontWeight: 600,
                  color: filledCount === 15 ? '#22c55e' : '#a89cff',
                }}>
                  {filledCount} / 15 panels
                </span>
                <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6c63ff,#9b59f5)', width: `${progress}%`, transition: 'width .3s' }} />
                </div>
              </div>
            </div>

            {/* 5-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {panels.map((panel, i) => (
                <div
                  key={i}
                  onClick={() => !panel.file && openFilePicker(i)}
                  style={{
                    position: 'relative', aspectRatio: '9/14',
                    borderRadius: 10, overflow: 'hidden', cursor: panel.file ? 'default' : 'pointer',
                    border: panel.file ? '1px solid rgba(108,99,255,.3)' : '1px dashed rgba(108,99,255,.2)',
                    background: '#111624', display: 'flex', flexDirection: 'column',
                    transition: 'border-color .2s',
                  }}
                >
                  {/* Panel number badge */}
                  <div style={{
                    position: 'absolute', top: 6, left: 6, zIndex: 2,
                    width: 18, height: 18, borderRadius: '50%', fontSize: 8, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: panel.file ? 'rgba(108,99,255,.6)' : 'rgba(0,0,0,.5)',
                    border: panel.file ? '1px solid rgba(108,99,255,.4)' : '1px solid rgba(255,255,255,.1)',
                    color: panel.file ? 'white' : 'rgba(255,255,255,.5)',
                  }}>{i + 1}</div>

                  {panel.preview ? (
                    <>
                      {/* Preview image */}
                      <img
                        src={panel.preview}
                        alt={`Panel ${i + 1}`}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Remove button */}
                      <button
                        onClick={e => removePanel(i, e)}
                        style={{
                          position: 'absolute', top: 4, right: 4, zIndex: 3,
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'rgba(239,68,68,.8)', border: 'none', cursor: 'pointer',
                          fontSize: 8, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 8, color: '#475569', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>Photo only</span>
                    </div>
                  )}

                  {/* Subtitle textarea */}
                  <textarea
                    value={panel.subtitle}
                    onChange={e => updateSubtitle(i, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="Add subtitle..."
                    rows={2}
                    style={{
                      background: 'transparent', border: 'none',
                      borderTop: '1px solid rgba(255,255,255,.04)',
                      padding: '5px 6px', fontSize: 9, color: '#94a3b8',
                      fontFamily: 'inherit', outline: 'none', width: '100%',
                      resize: 'none', lineHeight: 1.4, minHeight: 30,
                      position: 'relative', zIndex: 2,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>

          {/* Song Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              Add a Song
              <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>Optional</span>
            </label>

            <div style={{ background: '#111624', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🎵 Add a soundtrack to your Ritual</span>
                <span style={{ fontSize: 11, color: '#475569' }}>Optional</span>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 2, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                {(['library', 'upload'] as const).map(tab => (
                  <button key={tab} onClick={() => setSongTab(tab)} style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                    background: songTab === tab ? 'rgba(108,99,255,.12)' : 'transparent',
                    color: songTab === tab ? '#a89cff' : '#475569',
                  }}>
                    {tab === 'library' ? 'mmeko Library' : 'Upload Audio'}
                  </button>
                ))}
              </div>

              {/* Library */}
              {songTab === 'library' && (
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {SONGS.map(song => (
                    <div
                      key={song.id}
                      onClick={() => setSelectedSong(song.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: 10, cursor: 'pointer',
                        background: selectedSong === song.id ? 'rgba(108,99,255,.08)' : 'transparent',
                        border: selectedSong === song.id ? '1px solid rgba(108,99,255,.2)' : '1px solid transparent',
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: song.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {song.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{song.name}</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{song.artist}</div>
                      </div>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{song.duration}</span>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(108,99,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: selectedSong === song.id ? '#22c55e' : '#a89cff' }}>
                        {selectedSong === song.id ? '✓' : '▶'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload audio */}
              {songTab === 'upload' && (
                <div style={{ margin: '12px 20px' }}>
                  {audioFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(108,99,255,.08)', border: '1px solid rgba(108,99,255,.2)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg,#1a0830,#0a0418)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{audioFile.name}</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</div>
                      </div>
                      <button onClick={() => { setAudioFile(null); setSelectedSong(null); }}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(239,68,68,.12)', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => audioInputRef.current?.click()}
                      style={{
                        padding: 24, border: '1px dashed rgba(108,99,255,.2)', borderRadius: 10,
                        textAlign: 'center', cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8, opacity: .5 }}>🎵</div>
                      <div style={{ fontSize: 13, color: '#475569' }}>
                        <strong style={{ color: '#a89cff' }}>Click to upload</strong> your audio file<br/>
                        MP3, AAC or WAV · Max 20MB
                      </div>
                      <input ref={audioInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioChange} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '32px 0' }} />

        <div style={{
          background: '#161b2e', border: '1px solid rgba(108,99,255,.15)',
          borderRadius: 16, padding: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          position: 'sticky', bottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {published ? '✓ Published!' : canPublish ? "You're ready to publish! 🔥" : filledCount === 15 ? 'Almost there — add a title' : 'Complete your Ritual to publish'}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {published ? 'Your Ritual is now live for 24 hours' : canPublish ? 'Your Ritual will go live for 24 hours' : `${filledCount}/15 panels uploaded${title.trim() ? ' · Title ✓' : ' · No title yet'}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,.06)', color: '#94a3b8',
                border: '1px solid rgba(255,255,255,.07)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Cancel</button>

            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing || published}
              style={{
                padding: '12px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: published ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#6c63ff,#9b59f5)',
                color: 'white', border: 'none', cursor: canPublish && !publishing ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                opacity: (!canPublish || publishing) && !published ? 0.4 : 1,
                boxShadow: '0 4px 16px rgba(108,99,255,.3)',
              }}
            >
              {publishing ? '⏳ Publishing…' : published ? '✓ Published!' : '🔥 Publish Ritual'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}