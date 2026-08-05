'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { URL as API_URL } from '@/api/config';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import ContentPolicyModal from "@/components/ContentPolicyModal";

// ── Types ────────────────────────────────────────────────────────────────────
interface PanelData {
  file: File | null;
  preview: string | null;
  subtitle: string;
}

const EMPTY_PANEL = (): PanelData => ({ file: null, preview: null, subtitle: '' });

// ── Library songs: Pixabay CDN URLs used for both preview AND stored as song field ──
const SONGS = [
  {
    id: 'hanging-lanterns',
    name: 'Hanging Lanterns',
    artist: 'Kalaido · Chill · Dreamy',
    duration: '3:30',
    emoji: '🌙',
    bg: 'linear-gradient(135deg,#1a0830,#0a0418)',
    url: 'https://archive.org/download/kalaido-hanging-lanterns_202101/Kalaido%20-%20Hanging%20Lanterns.mp3',
  },
  {
    id: 'lofi-rain',
    name: 'Rain Beat',
    artist: 'Lo-Fi · Rainy · Calm',
    duration: '2:58',
    emoji: '✨',
    bg: 'linear-gradient(135deg,#1a1000,#0a0800)',
    url: 'https://archive.org/download/kalaido-hanging-lanterns_202101/%28FREE%29%20Lo-fi%20Type%20Beat%20-%20Rain.mp3',
  },
  {
    id: 'herbal-tea',
    name: 'Herbal Tea',
    artist: 'Artificial.Music · Lo-Fi · Soft',
    duration: '3:22',
    emoji: '💜',
    bg: 'linear-gradient(135deg,#1a0010,#0a0008)',
    url: 'https://archive.org/download/kalaido-hanging-lanterns_202101/%5BNon%20Copyrighted%20Music%5D%20Artificial.Music%20-%20Herbal%20Tea%20%5BLo-fi%5D.mp3',
  },
  {
    id: 'bread-jazz',
    name: 'Bread',
    artist: 'Lukrembo · Jazz · Warm',
    duration: '2:15',
    emoji: '🌿',
    bg: 'linear-gradient(135deg,#001a10,#000a08)',
    url: 'https://archive.org/download/kalaido-hanging-lanterns_202101/%28no%20copyright%20music%29%20jazz%20type%20beat%20bread%20royalty%20free%20youtube%20music%20prod.%20by%20lukrembo.mp3',
  },
  {
    id: 'first-snow',
    name: 'First Snow',
    artist: 'Kerusu · Ambient · Gentle',
    duration: '2:45',
    emoji: '🌊',
    bg: 'linear-gradient(135deg,#001a1a,#000a0a)',
    url: 'https://archive.org/download/kalaido-hanging-lanterns_202101/Kerusu%20-%20First%20Snow.mp3',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function UploadRitualPage() {
  const router = useRouter();
  const reduxUserId = useSelector((s: RootState) => s.register.userID);
  const reduxToken  = useSelector((s: RootState) => s.register.accesstoken);

  const [title, setTitle]   = useState('');
  const [panels, setPanels] = useState<PanelData[]>(Array.from({ length: 15 }, EMPTY_PANEL));
  const [songTab, setSongTab] = useState<'library' | 'upload'>('library');

  const [showBanWarning, setShowBanWarning] = useState(false);
const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  // ── selectedSongUrl: the URL that will be sent to the backend ──
  // For library songs → Pixabay CDN URL
  // For uploaded audio → null (audioFile is sent as a binary field instead)
  const [selectedSongUrl, setSelectedSongUrl] = useState<string | null>(null);

  // ── selectedSongId: only used for UI highlight in library tab ──
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // ── audioFile: the actual File object from the Upload tab ──
  // This is what gets appended to FormData as 'audioFile'
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished]   = useState(false);

  // ── playingId: which library song is currently previewing ──
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [exampleTab, setExampleTab] = useState<'Fan Meet' | 'Reactions'>('Fan Meet');

  const activePanelRef = useRef<number | null>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const audioInputRef  = useRef<HTMLInputElement>(null);

  // ── Single shared Audio element for library previews ──
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filledCount = panels.filter(p => p.file !== null).length;
  const progress    = (filledCount / 15) * 100;

  // canPublish: need all 15 panels + a title. Song is optional.
  const allSubtitlesFilled = panels.every(p => p.subtitle.trim().length > 0);
const canPublish = filledCount === 15 && title.trim().length > 0 && title.length <= 30 && allSubtitlesFilled;
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
  const clean = value.replace(/  +/g, ' ').slice(0, 60);
    setPanels(prev => {
      const next = [...prev];
      next[index] = { ...next[index], subtitle: clean };
      return next;
    });
  };

  // ── Library song preview ────────────────────────────────────────────────
  // Streams real audio from the Pixabay CDN URL

// 2. Replace handlePreview with this:
const handlePreview = (song: typeof SONGS[0]) => {
  // ── Toggle: clicking the already-playing song pauses it ──
  if (playingId === song.id) {
    audioRef.current?.pause();
    setPlayingId(null);
    return;
  }

  // ── Stop & wipe whatever was playing before ──
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.onended = null;   // kill stale listener immediately
    audioRef.current.onerror = null;
    audioRef.current.src = '';
  }

  // ── Create a fresh Audio instance for the new track ──
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';     // needed for archive.org CORS
  audio.volume = 0.8;
  audio.preload = 'auto';
  audio.src = song.url;

  // ── Wire ended/error BEFORE calling play() ──
  audio.onended = () => setPlayingId(null);
  audio.onerror = (e) => {
    console.warn('[RitualSongPreview] Audio error on:', song.name, e);
    setPlayingId(null);
  };

  audioRef.current = audio;

  // ── Update UI immediately so the button flips to ⏸ right away ──
  setPlayingId(song.id);

  audio.play().catch((err) => {
    console.warn('[RitualSongPreview] play() rejected:', err.message);
    audioRef.current = null;
    setPlayingId(null);
  });
};

  // ── Select a library song ───────────────────────────────────────────────
  // Stores the full Pixabay URL so it goes to the backend as the `song` field
  const handleSelectLibrarySong = (song: typeof SONGS[0]) => {
    setSelectedSongId(song.id);
    setSelectedSongUrl(song.url);  // ← full URL sent to backend
    setAudioFile(null);            // clear any previously uploaded file
  };

  // ── Custom audio upload ─────────────────────────────────────────────────
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (20MB matches backend multer limit)
    if (file.size > 20 * 1024 * 1024) {
      alert('Audio file must be under 20MB');
      e.target.value = '';
      return;
    }

    setAudioFile(file);            // ← File object appended to FormData
    setSelectedSongUrl(null);      // uploaded file takes priority; no URL needed
    setSelectedSongId(null);       // deselect any library song
    e.target.value = '';
  };

  const removeAudioFile = () => {
    setAudioFile(null);
  };

  // ── Publish ─────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!canPublish || publishing) return;
    setPublishing(true);

    try {
      // ── Resolve userId + token from every source ───────────────────────
      let userId = reduxUserId;
      let token  = reduxToken;

      if (typeof window !== 'undefined') {
        const loginRaw = localStorage.getItem('login');
        if (loginRaw) {
          try {
            const d = JSON.parse(loginRaw);
            if (!userId) userId = d.userID || d.userId || d.id || d._id || '';
            if (!token)  token  = d.accesstoken || d.refreshtoken || d.token || '';
          } catch {}
        }
        if (!userId) userId = localStorage.getItem('userID') || localStorage.getItem('userId') || '';
        if (!token)  token  = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      }

      if (!userId) {
        alert('You must be logged in to publish a ritual.');
        setPublishing(false);
        return;
      }

      const formData = new FormData();

      // Required fields
      formData.append('userId', userId);
      formData.append('title', title.trim());

      // ── Song field logic ───────────────────────────────────────────────
      // Case 1: user uploaded a custom audio file
      //   → append binary as 'audioFile'; multer picks it up as req.files['audioFile']
      //   → backend uploads it to Storj and stores the Storj URL
      // Case 2: user selected a library song
      //   → append its CDN URL as 'song'; backend stores it directly
      // Case 3: no song → nothing appended; backend stores null
      if (audioFile) {
        formData.append('audioFile', audioFile, audioFile.name);
      } else if (selectedSongUrl) {
        formData.append('song', selectedSongUrl);
      }

      // 15 panel images + subtitles
      panels.forEach((p, i) => {
        if (p.file) formData.append(`panel_${i + 1}_image`, p.file, p.file.name);
        formData.append(`panel_${i + 1}_subtitle`, p.subtitle || '');
      });

      // Let axios + FormData set Content-Type with the correct boundary automatically
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
      setTimeout(() => router.push('/ritual'), 2000);
    } catch (err: any) {
      console.error('Publish error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to publish. Please try again.';
      alert(msg);
    } finally {
      setPublishing(false);
    }
  };

  // ── Derived: display label for publish bar ───────────────────────────────
  const songLabel = audioFile
    ? audioFile.name
    : selectedSongId
      ? SONGS.find(s => s.id === selectedSongId)?.name ?? null
      : null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#080b14', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* TOP NAV */}
<div style={{
  position: 'sticky', top: 0, zIndex: 100,
  background: 'rgba(8,11,20,.95)', backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,.07)',
  padding: '0 24px', height: 60,
  alignItems: 'center', justifyContent: 'space-between',
  display: 'flex',
zIndex: 50,
}}>
 

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
</div>
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
             Share the before, during and after of a fan meet or date, post reaction photos, go behind the scenes — anything
            real, anything yours. Rituals live for <strong style={{ color: '#f1f5f9' }}>30 days</strong>, and are archived to your profile forever, keeping your fans coming back every day.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[['🖼', 'Exactly 15 panels'], ['📝', 'Each panel has a subtitle'], ['⏰', 'Lives for 30 days'], ['🎵', 'Add a song']].map(([icon, label]) => (
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ── WHAT CAN YOU SHARE ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#475569', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 2, background: '#6c63ff', borderRadius: 2 }} />
              What can you share
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { badge: 'FAN MEETS', badgeColor: '#a89cff', badgeBg: 'rgba(108,99,255,.15)', icon: '🤝', title: 'How your fan meet or date went', desc: 'Take your fans through the experience — where you met, how it felt, what you talked about.' },
                { badge: 'REACTIONS', badgeColor: '#2dd4bf', badgeBg: 'rgba(45,212,191,.12)', icon: '📸', title: 'Reaction photos with subtitles', desc: 'Capture the moments — fan reactions, your reactions, the venue, the vibe. Each photo gets a subtitle.' },
              ].map((card, ci) => (
                <div key={ci} style={{ background: '#111624', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.04em', background: card.badgeBg, color: card.badgeColor }}>{card.badge}</div>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── EXAMPLES ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 2, background: '#6c63ff', borderRadius: 2 }} />
                Examples
              </div>
              {(['Fan Meet', 'Reactions'] as const).map(tab => (
                <button key={tab} onClick={() => setExampleTab(tab)} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', background: exampleTab === tab ? (tab === 'Fan Meet' ? 'rgba(108,99,255,.15)' : 'rgba(244,114,182,.12)') : 'transparent', color: exampleTab === tab ? (tab === 'Fan Meet' ? '#a89cff' : '#f472b6') : '#475569', borderColor: exampleTab === tab ? (tab === 'Fan Meet' ? 'rgba(108,99,255,.2)' : 'rgba(244,114,182,.2)') : 'rgba(255,255,255,.04)' }}>{tab}</button>
              ))}
            </div>
           <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>

  {exampleTab === 'Fan Meet' ? (<>
    {/* Panel 1 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#1a1030,#0a0818)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <rect x="15" y="72" width="40" height="4" rx="2" fill="rgba(255,255,255,.15)"/>
          <rect x="31" y="76" width="8" height="18" rx="2" fill="rgba(255,255,255,.1)"/>
          <rect x="28" y="58" width="14" height="13" rx="3" fill="rgba(255,255,255,.2)"/>
          <rect x="30" y="55" width="10" height="4" rx="2" fill="rgba(255,255,255,.12)"/>
          <circle cx="35" cy="22" r="10" fill="rgba(255,255,255,.25)"/>
          <path d="M18 70 Q18 44 35 44 Q52 44 52 70" fill="rgba(255,255,255,.2)"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>Arrived at the café 10 mins early 😅</div>
    </div>

    {/* Panel 2 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#0a1830,#060e20)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <rect x="42" y="20" width="22" height="60" rx="2" fill="rgba(255,255,255,.06)"/>
          <circle cx="50" cy="35" r="7" fill="rgba(255,255,255,.18)"/>
          <path d="M38 80 Q38 56 50 56 Q62 56 62 80" fill="rgba(255,255,255,.14)"/>
          <circle cx="20" cy="30" r="9" fill="rgba(255,255,255,.28)"/>
          <path d="M7 75 Q7 52 20 52 Q33 52 33 75" fill="rgba(255,255,255,.22)"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>Saw them walking in — recognized me instantly!</div>
    </div>

    {/* Panel 3 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#1a0a20,#100612)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <rect x="20" y="62" width="30" height="3" rx="1.5" fill="rgba(255,255,255,.15)"/>
          <rect x="32" y="65" width="6" height="15" rx="1.5" fill="rgba(255,255,255,.1)"/>
          <rect x="22" y="52" width="9" height="9" rx="2" fill="rgba(255,255,255,.18)"/>
          <rect x="39" y="52" width="9" height="9" rx="2" fill="rgba(255,255,255,.18)"/>
          <circle cx="18" cy="26" r="9" fill="rgba(255,255,255,.28)"/>
          <path d="M5 65 Q5 44 18 44 Q31 44 31 65" fill="rgba(255,255,255,.2)"/>
          <circle cx="52" cy="26" r="9" fill="rgba(255,255,255,.22)"/>
          <path d="M39 65 Q39 44 52 44 Q65 44 65 65" fill="rgba(255,255,255,.16)"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>First 5 mins were a little awkward ngl 😂</div>
    </div>

    {/* Panel 4 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#0a1820,#060e14)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <rect x="18" y="64" width="34" height="3" rx="1.5" fill="rgba(255,255,255,.15)"/>
          <circle cx="17" cy="24" r="9" fill="rgba(255,255,255,.3)"/>
          <path d="M4 67 Q6 44 17 44 Q30 46 32 67" fill="rgba(255,255,255,.22)"/>
          <circle cx="53" cy="24" r="9" fill="rgba(255,255,255,.24)"/>
          <path d="M38 67 Q40 44 53 44 Q66 46 66 67" fill="rgba(255,255,255,.18)"/>
          <rect x="22" y="8" width="26" height="12" rx="6" fill="rgba(108,99,255,.3)"/>
          <path d="M35 20 L33 26 L38 20" fill="rgba(108,99,255,.3)"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>We talked for the full 30 mins — time flew</div>
    </div>

    {/* Panel 5 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#1a1020,#0e0818)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <circle cx="25" cy="26" r="10" fill="rgba(255,255,255,.3)"/>
          <path d="M10 78 Q10 50 25 50 Q40 50 40 78" fill="rgba(255,255,255,.22)"/>
          <line x1="40" y1="42" x2="47" y2="28" stroke="rgba(255,255,255,.22)" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="47" cy="26" r="9" fill="rgba(255,255,255,.24)"/>
          <path d="M34 78 Q34 52 47 52 Q60 52 60 78" fill="rgba(255,255,255,.18)"/>
          <line x1="24" y1="42" x2="17" y2="29" stroke="rgba(255,255,255,.3)" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>Left feeling genuinely happy. 10/10 🙌</div>
    </div>
  </>) : (<>

    {/* Reaction Panel 1 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#1a0a20,#100612)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <circle cx="35" cy="32" r="13" fill="rgba(255,255,255,.28)"/>
          <path d="M16 88 Q16 58 35 58 Q54 58 54 88" fill="rgba(255,255,255,.2)"/>
          <path d="M16 52 Q20 44 27 46" stroke="rgba(255,255,255,.3)" strokeWidth="5" strokeLinecap="round"/>
          <path d="M54 52 Q50 44 43 46" stroke="rgba(255,255,255,.3)" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="35" cy="36" r="3" fill="rgba(0,0,0,.3)"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>When they realized it was actually me 😭</div>
    </div>

    {/* Reaction Panel 2 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#0a1830,#060e20)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <circle cx="35" cy="30" r="13" fill="rgba(255,255,255,.28)"/>
          <path d="M16 86 Q16 56 35 56 Q54 56 54 86" fill="rgba(255,255,255,.2)"/>
          <path d="M22 60 Q25 70 35 72 Q45 70 48 60" stroke="rgba(255,255,255,.25)" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M28 34 Q35 40 42 34" stroke="rgba(255,255,255,.4)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>This reaction was everything to me honestly</div>
    </div>

    {/* Reaction Panel 3 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#1a1020,#0e0818)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <circle cx="18" cy="26" r="9" fill="rgba(255,255,255,.28)"/>
          <path d="M5 72 Q5 48 18 48 Q31 50 33 72" fill="rgba(255,255,255,.2)"/>
          <circle cx="52" cy="26" r="9" fill="rgba(255,255,255,.22)"/>
          <path d="M37 72 Q39 48 52 48 Q65 50 65 72" fill="rgba(255,255,255,.16)"/>
          <rect x="26" y="48" width="18" height="13" rx="2" fill="rgba(255,255,255,.18)"/>
          <line x1="29" y1="52" x2="41" y2="52" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
          <line x1="29" y1="55" x2="38" y2="55" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
          <line x1="29" y1="58" x2="40" y2="58" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>They brought me a handwritten letter. I cried 🥲</div>
    </div>

    {/* Reaction Panel 4 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#1a1030,#0a0818)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <circle cx="22" cy="26" r="9" fill="rgba(255,255,255,.28)"/>
          <path d="M9 74 Q9 50 22 50 Q35 50 35 74" fill="rgba(255,255,255,.2)"/>
          <circle cx="48" cy="26" r="9" fill="rgba(255,255,255,.22)"/>
          <path d="M35 74 Q35 50 48 50 Q61 50 61 74" fill="rgba(255,255,255,.16)"/>
          <rect x="26" y="10" width="18" height="14" rx="2" fill="rgba(255,255,255,.12)"/>
          <circle cx="35" cy="17" r="4" fill="rgba(255,255,255,.2)"/>
          <rect x="26" y="10" width="18" height="3" rx="1" fill="rgba(255,255,255,.15)"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>We had to take a photo together of course 📸</div>
    </div>

    {/* Reaction Panel 5 */}
    <div style={{ flexShrink: 0, width: 110, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ width: '100%', height: 160, background: 'linear-gradient(180deg,#0a1820,#060e14)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
        <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
          <circle cx="35" cy="28" r="13" fill="rgba(255,255,255,.28)"/>
          <path d="M16 84 Q16 54 35 54 Q54 54 54 84" fill="rgba(255,255,255,.2)"/>
          <path d="M24 32 Q35 42 46 32" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M20 50 Q16 42 20 36" stroke="rgba(255,255,255,.25)" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M50 50 Q54 42 50 36" stroke="rgba(255,255,255,.25)" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <circle cx="35" cy="12" r="4" fill="rgba(244,114,182,.5)"/>
          <path d="M33 10 L31 4 M35 9 L35 3 M37 10 L39 4" stroke="rgba(244,114,182,.4)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ background: 'rgba(0,0,0,.7)', padding: '7px 8px', fontSize: 9, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>This is why I do this. Pure love 💜</div>
    </div>
  </>)}

  <div style={{ flexShrink: 0, width: 110, height: 190, borderRadius: 12, border: '1px dashed rgba(108,99,255,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'rgba(108,99,255,.5)', fontWeight: 600, background: 'rgba(108,99,255,.04)' }}>
    <span style={{ fontSize: 20 }}>+10</span>
    <span>more panels</span>
  </div>

</div>
          </div>

          {/* ── TITLE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              Ritual Title
              <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>Required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                let v = e.target.value.replace(/  +/g, ' ');
                if (v.length <= 30) setTitle(v);
              }}
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
              maxLength={30}
              placeholder="e.g. My first fan meet in Lagos 🔥"
              style={{
                background: '#111624', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 10, padding: '13px 16px',
                fontSize: 14, color: '#f1f5f9', fontFamily: 'inherit', outline: 'none', width: '100%',
              }}
            />
            <div style={{ fontSize: 11, color: title.length >= 28 ? '#ef4444' : '#475569', textAlign: 'right', marginTop: 4 }}>
              {title.length} / 30
            </div>
          </div>

          {/* ── PANELS ── */}
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
{filledCount} / 15 panels · {panels.filter(p => p.subtitle.trim()).length} / 15 subtitles
                </span>
                <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6c63ff,#9b59f5)', width: `${progress}%`, transition: 'width .3s' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="panels-grid">
              <style>{`@media(min-width:640px){.panels-grid{grid-template-columns:repeat(5,1fr)!important}}`}</style>
              {panels.map((panel, i) => (
                <div
                  key={i}
                  onClick={() => !panel.file && openFilePicker(i)}
                  style={{
                    position: 'relative',
                    borderRadius: 10, overflow: 'hidden', cursor: panel.file ? 'default' : 'pointer',
                    border: panel.file ? '1px solid rgba(108,99,255,.3)' : '1px dashed rgba(108,99,255,.2)',
                    background: '#111624', display: 'flex', flexDirection: 'column',
                    transition: 'border-color .2s', minHeight: 180,
                  }}
                >
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
                      <img src={panel.preview} alt={`Panel ${i + 1}`} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                      <button
                        onClick={e => removePanel(i, e)}
                        style={{
                          position: 'absolute', top: 4, right: 4, zIndex: 3,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(239,68,68,.85)', border: 'none', cursor: 'pointer',
                          fontSize: 9, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
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

                
<div style={{ position: 'relative', flexShrink: 0, zIndex: 2 }}>
  <textarea
    value={panel.subtitle}
    onChange={e => {
  let v = e.target.value.replace(/  +/g, ' ');
  if (v.length <= 60) updateSubtitle(i, v);
}}
    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
    onClick={e => e.stopPropagation()}
    placeholder="Subtitle... (required)"
   maxLength={60}
    rows={2}
    style={{
      background: panel.subtitle.trim() ? 'rgba(0,0,0,.4)' : 'rgba(239,68,68,.05)',
      border: 'none',
      borderTop: `1px solid ${panel.subtitle.trim() ? 'rgba(255,255,255,.06)' : 'rgba(239,68,68,.2)'}`,
      padding: '6px 6px 14px', fontSize: 9, color: '#94a3b8',
      fontFamily: 'inherit', outline: 'none', width: '100%', lineHeight: 1.4,
      resize: 'none', display: 'block', overflowY: 'hidden',
      boxSizing: 'border-box',
    }}
  />
  <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 7, color:panel.subtitle.length >= 59 ? '#ef4444' : 'rgba(255,255,255,.2)', pointerEvents: 'none' }}>
    {panel.subtitle.length}/60
  </div>
</div>
                </div>
              ))}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>

          {/* ── SONG PICKER ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              Add a Song
              <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>Optional</span>
            </label>

            <div style={{ background: '#111624', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎵 Add a soundtrack to your Ritual
                  {songLabel && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#22c55e', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 6, padding: '2px 8px' }}>
                      ✓ {songLabel.length > 22 ? songLabel.slice(0, 22) + '…' : songLabel}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 11, color: '#475569' }}>Optional</span>
              </div>

              {/* Tab switcher */}
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

              {/* ── Library tab ── */}
              {songTab === 'library' && (
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: 11, color: '#475569', margin: '0 0 8px' }}>
                    Hit ▶ to preview a song · click the row to select it for your Ritual
                  </p>

                  {SONGS.map(song => {
                    const isSelected = selectedSongId === song.id;
                    const isPlaying  = playingId === song.id;

                    return (
                      <div
                        key={song.id}
                        onClick={() => handleSelectLibrarySong(song)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                          background: isSelected ? 'rgba(108,99,255,.08)' : 'transparent',
                          border: isSelected ? '1px solid rgba(108,99,255,.2)' : '1px solid transparent',
                          transition: 'background .15s, border-color .15s',
                        }}
                      >
                        {/* Artwork thumbnail */}
                        <div style={{
                          width: 38, height: 38, borderRadius: 8, background: song.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, flexShrink: 0, position: 'relative',
                        }}>
                          {song.emoji}
                          {isPlaying && (
                            <div style={{
                              position: 'absolute', inset: -2, borderRadius: 10,
                              border: '2px solid #6c63ff',
                              animation: 'pulse-ring 1s ease-in-out infinite',
                            }} />
                          )}
                        </div>

                        {/* Name + artist */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {song.name}
                            {isPlaying && (
                              <span style={{
                                fontSize: 9, fontWeight: 700, color: '#6c63ff',
                                background: 'rgba(108,99,255,.12)', border: '1px solid rgba(108,99,255,.2)',
                                borderRadius: 4, padding: '1px 5px', letterSpacing: '.04em',
                              }}>
                                PLAYING
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#475569' }}>{song.artist} · {song.duration}</div>
                        </div>

                        {/* Selected checkmark */}
                        {isSelected && (
                          <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 800, flexShrink: 0 }}>✓</div>
                        )}

                        {/* Play / Pause button */}
                        <button
                          onClick={e => { e.stopPropagation(); handlePreview(song); }}
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: isPlaying ? 'rgba(108,99,255,.25)' : 'rgba(108,99,255,.12)',
                            border: isPlaying ? '1px solid rgba(108,99,255,.4)' : '1px solid transparent',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: '#a89cff', flexShrink: 0,
                            transition: 'background .15s',
                          }}
                          title={isPlaying ? 'Pause preview' : 'Play 30s preview'}
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>
                      </div>
                    );
                  })}

                  {/* Keyframe for pulsing ring on artwork while playing */}
                  <style>{`
                    @keyframes pulse-ring {
                      0%   { opacity: 1;  transform: scale(1); }
                      50%  { opacity: .5; transform: scale(1.08); }
                      100% { opacity: 1;  transform: scale(1); }
                    }
                  `}</style>
                </div>
              )}

              {/* ── Upload Audio tab ── */}
              {songTab === 'upload' && (
                <div style={{ margin: '16px 20px 20px' }}>
                  {audioFile ? (
                    /* File chosen — preview row with native audio player */
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(108,99,255,.08)', border: '1px solid rgba(108,99,255,.2)',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg,#1a0830,#0a0418)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>🎵</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {audioFile.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB · ready to upload with your Ritual
                        </div>
                      </div>

                      {/*
                        Native <audio> element gives the user a real in-browser preview
                        of their uploaded file via an object URL.
                        The file itself is sent to the backend via FormData on publish.
                      */}
                      <audio
                        controls
                        src={URL.createObjectURL(audioFile)}
                        style={{ height: 28, maxWidth: 160, flexShrink: 0, opacity: .85 }}
                      />

                      {/* Remove the file */}
                      <button
                        onClick={removeAudioFile}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)',
                          cursor: 'pointer', color: '#ef4444', fontSize: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                        title="Remove audio"
                      >✕</button>
                    </div>
                  ) : (
                    /* Drop-zone / click-to-choose */
                    <div
                      onClick={() => audioInputRef.current?.click()}
                      style={{
                        padding: '32px 24px',
                        border: '1px dashed rgba(108,99,255,.25)', borderRadius: 12,
                        textAlign: 'center', cursor: 'pointer',
                        background: 'rgba(108,99,255,.03)',
                        transition: 'border-color .15s, background .15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,.5)';
                        (e.currentTarget as HTMLDivElement).style.background   = 'rgba(108,99,255,.06)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,.25)';
                        (e.currentTarget as HTMLDivElement).style.background   = 'rgba(108,99,255,.03)';
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10, opacity: .55 }}>🎵</div>
                      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6 }}>
                        <strong style={{ color: '#a89cff' }}>Click to choose</strong> your audio file
                      </div>
                      <div style={{ fontSize: 11, color: '#475569' }}>MP3, AAC, WAV or OGG · Max 20MB</div>
                    </div>
                  )}

                  {/*
                    Hidden input — accepts only audio MIME types that match the
                    backend multer fileFilter, preventing browser camera/image pickers.
                  */}
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/aac,audio/wav,audio/ogg,audio/mp4"
                    style={{ display: 'none' }}
                    onChange={handleAudioChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SUBMIT BAR ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '32px 0' }} />

        <div style={{
          background: '#161b2e', border: '1px solid rgba(108,99,255,.15)',
          borderRadius: 16, padding: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          position: 'sticky', bottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {published
                ? '✓ Published!'
                : canPublish
                  ? "You're ready to publish! 🔥"
                 : filledCount === 15 && !allSubtitlesFilled
  ? 'Almost there — add subtitles to all panels'
  : filledCount === 15
    ? 'Almost there — add a title'
    : 'Complete your Ritual to publish'}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {published
                ? 'Your Ritual is now live for 30 days'
                : canPublish
                  ? `Your Ritual will go live for 30 days${songLabel ? ` · 🎵 ${songLabel.length > 18 ? songLabel.slice(0, 18) + '…' : songLabel}` : ' · No song'}`
                  : `${filledCount}/15 panels · ${panels.filter(p=>p.subtitle.trim()).length}/15 subtitles${title.trim() ? ' · Title ✓' : ' · No title yet'}`}
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
              onClick={() => {
                      if (!canPublish || publishing || published) return;
                      setAgreedToPolicy(false);
                      setShowBanWarning(true);
                    }}
              disabled={!canPublish || publishing || published}
              style={{
                padding: '12px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: published
                  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                  : 'linear-gradient(135deg,#6c63ff,#9b59f5)',
                color: 'white', border: 'none',
                cursor: canPublish && !publishing ? 'pointer' : 'not-allowed',
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
     
     <ContentPolicyModal
        open={showBanWarning}
        agreed={agreedToPolicy}
        onAgreedChange={setAgreedToPolicy}
        onCancel={() => setShowBanWarning(false)}
        onContinue={() => {
          if (!agreedToPolicy) return;
          setShowBanWarning(false);
          handlePublish();
        }}
      />

    </div>
  );
}