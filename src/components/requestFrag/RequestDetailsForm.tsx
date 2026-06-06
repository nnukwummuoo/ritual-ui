"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AM_TIMES = ['12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM','5:00 AM','6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM'];
const PM_TIMES = ['12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'];
const AVAIL_TIMES = new Set(['1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM']);
const CREATOR_DAYS = [1,2,3,4,5,6,0];

export default function RequestDetailsForm() {
  const router = useRouter();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [curTimeTab, setCurTimeTab] = useState<'AM' | 'PM'>('AM');
  const [venue, setVenue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isFormValid = selectedDate && selectedTime && venue.trim();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleRequest = () => {
    if (!isFormValid) return;
    setSubmitted(true);
  };

  // Build calendar days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calCells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    calCells.push(<div key={`e-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    const isTomorrow = d === today.getDate() + 1 && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    const dayOfWeek = date.getDay();
    const isAvail = CREATOR_DAYS.includes(dayOfWeek);
    const isDisabled = isPast || isToday || isTomorrow || !isAvail;
    const isSel = selectedDate?.getDate() === d && selectedDate?.getMonth() === viewMonth;
    const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

    calCells.push(
      <div
        key={d}
        className={`date-cell${isDisabled ? ' disabled' : ''}${isSel ? ' sel' : ''}`}
        onClick={() => { if (!isDisabled) setSelectedDate(new Date(viewYear, viewMonth, d)); }}
      >
        <div className="dc-day">{dayNames[dayOfWeek]}</div>
        <div className="dc-num">{d}</div>
      </div>
    );
  }

  const times = curTimeTab === 'AM' ? AM_TIMES : PM_TIMES;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#080b14;--bg2:#0b0f1c;--bg3:#0e1220;
          --card:#111624;--card2:#161b2e;
          --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.04);
          --accent:#6c63ff;--accent2:#9b59f5;
          --teal:#2dd4bf;--rose:#f472b6;
          --success:#22c55e;--gold:#f59e0b;
          --text:#f1f5f9;--text2:#94a3b8;--text3:#475569;
        }
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:var(--card2);border-radius:4px;}
        .nav{position:sticky;top:0;z-index:200;background:rgba(8,11,20,.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 20px;height:56px;display:flex;align-items:center;justify-content:space-between;}
        .nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .nav-logo-icon{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#6c63ff,#9b59f5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;}
        .nav-logo-name{font-size:15px;font-weight:700;color:var(--text);}
        .nav-back{background:none;border:none;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:color .2s;}
        .nav-back:hover{color:var(--text);}
        .page{max-width:480px;margin:0 auto;padding:28px 20px 80px;}
        .creator-strip{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:28px;}
        .cs-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#6c63ff,#9b59f5);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:white;flex-shrink:0;position:relative;}
        .cs-online{position:absolute;bottom:2px;right:2px;width:11px;height:11px;border-radius:50%;background:var(--success);border:2px solid var(--card);}
        .cs-label{font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}
        .cs-name{font-size:15px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:6px;}
        .cs-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.2);border-radius:5px;padding:1px 7px;font-size:9px;font-weight:700;color:var(--teal);}
        .cs-handle{font-size:12px;color:var(--text3);margin-top:2px;}
        .cs-type{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
        .cs-type-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(244,114,182,.08);border:1px solid rgba(244,114,182,.2);border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;color:var(--rose);}
        .gold-notice{background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(245,158,11,.06));border:1px solid rgba(245,158,11,.2);border-radius:14px;padding:16px 18px;margin-bottom:28px;position:relative;overflow:hidden;}
        .gold-notice::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b);}
        .gn-top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
        .gn-icon{font-size:20px;}
        .gn-title{font-size:13px;font-weight:700;color:#fbbf24;}
        .gn-amount{font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--gold);margin-bottom:4px;}
        .gn-amount span{font-size:14px;font-weight:600;color:rgba(245,158,11,.7);}
        .gn-sub{font-size:12px;color:rgba(245,158,11,.6);line-height:1.55;}
        .gn-row{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid rgba(245,158,11,.1);}
        .gn-bal{font-size:12px;color:var(--text3);}
        .gn-bal strong{color:var(--text2);font-weight:600;}
        .sec-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:12px;display:flex;align-items:center;gap:8px;}
        .sec-label::before{content:'';display:block;width:16px;height:2px;background:var(--accent);border-radius:2px;}
        .fg{display:flex;flex-direction:column;gap:7px;margin-bottom:18px;}
        .fl{font-size:12.5px;font-weight:600;color:var(--text2);display:flex;align-items:center;gap:6px;}
        .req{color:#ef4444;font-size:11px;}
        .fi{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:13px 14px;font-size:13.5px;color:var(--text);font-family:inherit;outline:none;transition:border-color .2s;width:100%;}
        .fi:focus{border-color:rgba(108,99,255,.4);}
        .fi::placeholder{color:var(--text3);}
        .date-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px;}
        .date-cell{aspect-ratio:1;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--card);border:1px solid var(--border);cursor:pointer;transition:all .2s;user-select:none;}
        .date-cell:hover:not(.disabled){border-color:rgba(108,99,255,.35);background:rgba(108,99,255,.06);}
        .date-cell.sel{background:rgba(108,99,255,.15);border-color:rgba(108,99,255,.4);color:#a89cff;}
        .date-cell.disabled{opacity:.3;cursor:not-allowed;}
        .dc-day{font-size:8px;font-weight:600;color:var(--text3);letter-spacing:.04em;margin-bottom:2px;}
        .dc-num{font-size:13px;font-weight:800;}
        .date-cell.sel .dc-day{color:#a89cff;}
        .date-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .date-nav-btn{background:var(--card);border:1px solid var(--border);color:var(--text2);width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
        .date-nav-btn:hover{border-color:rgba(108,99,255,.3);color:#a89cff;}
        .date-month{font-size:13px;font-weight:700;color:var(--text);}
        .time-section{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:18px;}
        .time-tabs{display:flex;border-bottom:1px solid var(--border);}
        .t-tab{flex:1;padding:11px;font-size:13px;font-weight:700;font-family:inherit;background:transparent;border:none;color:var(--text3);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
        .t-tab.active{background:rgba(108,99,255,.1);color:#a89cff;}
        .time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px;}
        .t-chip{padding:9px 8px;border-radius:8px;font-size:12px;font-weight:600;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);cursor:pointer;transition:all .2s;text-align:center;user-select:none;}
        .t-chip:hover{border-color:rgba(108,99,255,.3);color:#a89cff;}
        .t-chip.sel{background:rgba(108,99,255,.14);border-color:rgba(108,99,255,.35);color:#a89cff;}
        .t-chip.unavail{opacity:.3;cursor:not-allowed;}
        .venue-note{font-size:11.5px;color:var(--text3);margin-top:6px;line-height:1.55;display:flex;align-items:flex-start;gap:7px;}
        .venue-note-icon{font-size:13px;flex-shrink:0;margin-top:1px;}
        .safety-mini{background:var(--card2);border:1px solid rgba(245,158,11,.12);border-radius:12px;padding:14px 16px;margin-bottom:28px;}
        .sm-title{font-size:12px;font-weight:700;color:#f59e0b;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
        .sm-rule{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);margin-bottom:7px;line-height:1.4;}
        .sm-rule:last-child{margin-bottom:0;}
        .sm-dot{width:16px;height:16px;border-radius:50%;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);display:flex;align-items:center;justify-content:center;font-size:7px;color:#f59e0b;flex-shrink:0;}
        .btn-request{width:100%;padding:16px;border-radius:14px;background:linear-gradient(135deg,#6c63ff,#9b59f5);border:none;color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 28px rgba(108,99,255,.4);transition:all .25s;margin-bottom:12px;}
        .btn-request:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(108,99,255,.55);}
        .btn-request:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
        .btn-cancel{width:100%;padding:14px;border-radius:12px;background:transparent;border:1px solid var(--border);color:var(--text2);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;}
        .btn-cancel:hover{background:rgba(255,255,255,.04);color:var(--text);}
      `}</style>

      <div style={{ background:"var(--bg)", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"var(--text)" }}>

        {/* NAV */}
        <nav className="nav">
          <button className="nav-back" onClick={() => router.back()}>← Back</button>
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">M</div>
            <span className="nav-logo-name">mmeko</span>
          </a>
          <div style={{ width: 60 }} />
        </nav>

        <div className="page">

          {/* CREATOR STRIP */}
          <div className="creator-strip">
            <div className="cs-av">H<div className="cs-online" /></div>
            <div className="cs-info">
              <div className="cs-label">Requesting a meet with</div>
              <div className="cs-name">Hailey Rae <span className="cs-badge">✓ Verified</span></div>
              <div className="cs-handle">@haileyrae613</div>
            </div>
            <div className="cs-type">
              <div className="cs-type-tag">❤️ Fan Date</div>
            </div>
          </div>

          {/* GOLD NOTICE */}
          <div className="gold-notice">
            <div className="gn-top">
              <div className="gn-icon">💰</div>
              <div className="gn-title">Payment held securely</div>
            </div>
            <div className="gn-amount">15,000 <span>GOLD</span></div>
            <div className="gn-sub">Will be deducted from your balance and held in escrow until the meet is confirmed complete. You keep full protection.</div>
            <div className="gn-row">
              <div className="gn-bal">Your balance: <strong>20,000 GOLD</strong></div>
              <div style={{ fontSize:11, color:"rgba(245,158,11,.5)" }}>After: 5,000 GOLD</div>
            </div>
          </div>

          {/* SELECT DATE */}
          <div className="sec-label">Select Date</div>
          <div style={{ marginBottom: 18 }}>
            <div className="date-nav">
              <button className="date-nav-btn" onClick={prevMonth}>‹</button>
              <div className="date-month">{MONTHS[viewMonth]} {viewYear}</div>
              <button className="date-nav-btn" onClick={nextMonth}>›</button>
            </div>
            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                <div key={d} style={{ fontSize:9, fontWeight:700, color:"var(--text3)", textAlign:"center", padding:"4px 0" }}>{d}</div>
              ))}
            </div>
            <div className="date-grid">{calCells}</div>
          </div>

          {/* SELECT TIME */}
          <div className="sec-label">Select Time</div>
          <div className="time-section">
            <div className="time-tabs">
              <button className={`t-tab${curTimeTab === 'AM' ? ' active' : ''}`} onClick={() => setCurTimeTab('AM')}>🌞 AM</button>
              <button className={`t-tab${curTimeTab === 'PM' ? ' active' : ''}`} onClick={() => setCurTimeTab('PM')}>🌙 PM</button>
            </div>
            <div className="time-grid">
              {times.map(t => {
                const avail = AVAIL_TIMES.has(t);
                const isSel = selectedTime === t;
                return (
                  <div
                    key={t}
                    className={`t-chip${!avail ? ' unavail' : ''}${isSel ? ' sel' : ''}`}
                    onClick={() => { if (avail) setSelectedTime(t); }}
                  >{t}</div>
                );
              })}
            </div>
          </div>

          {/* VENUE */}
          <div className="fg">
            <label className="fl">Venue <span className="req">*</span></label>
            <input
              type="text"
              className="fi"
              placeholder="e.g. Starbucks, Times Square, NYC..."
              value={venue}
              onChange={e => setVenue(e.target.value)}
            />
            <div className="venue-note">
              <div className="venue-note-icon">📍</div>
              Must be a public place — café, restaurant, hotel lobby, park, or similar. Private venues are not permitted.
            </div>
          </div>

          {/* SAFETY */}
          <div className="safety-mini">
            <div className="sm-title">⚠️ Before you send</div>
            <div className="sm-rule"><div className="sm-dot">1</div>All meets are limited to <strong style={{ color:"var(--text)" }}>30 minutes</strong> — no exceptions</div>
            <div className="sm-rule"><div className="sm-dot">2</div>Must take place in a <strong style={{ color:"var(--text)" }}>public venue only</strong></div>
            <div className="sm-rule"><div className="sm-dot">3</div>Your gold is held securely — <strong style={{ color:"var(--text)" }}>released only after the meet</strong></div>
          </div>

          {/* BUTTONS */}
          <button
            className="btn-request"
            disabled={!isFormValid || submitted}
            onClick={handleRequest}
            style={submitted ? { background:"linear-gradient(135deg,#22c55e,#16a34a)" } : {}}
          >
            {submitted ? '✓ Request Sent!' : '🎯 Send Request'}
          </button>
          <button className="btn-cancel" onClick={() => router.back()}>Cancel</button>

        </div>
      </div>
    </>
  );
}