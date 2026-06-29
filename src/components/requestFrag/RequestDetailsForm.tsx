"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import PacmanLoader from "react-spinners/PacmanLoader";
import { getImageSource } from '@/lib/imageUtils';

interface RequestDetailsFormProps {
  onDone: (details: { date: string; time: string; venue: string }) => void;
  onCancel: () => void;
  creatorName: string;
  creatorType: string;
  price: number;
  creatorPhoto?: string;
  creatorActive?: boolean;
  userBalance?: number;
  isFanVerified?: boolean;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AM_TIMES = ['12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM','5:00 AM','6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM'];
const PM_TIMES = ['12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'];

export const RequestDetailsForm: React.FC<RequestDetailsFormProps> = ({
  onDone,
  onCancel,
  creatorName,
  creatorType,
  price,
  creatorPhoto,
  creatorActive = false,
  userBalance = 0,
  isFanVerified = false,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [curTimeTab, setCurTimeTab] = useState<'AM' | 'PM'>('AM');
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  const isFanCall = creatorType.toLowerCase() === "fan call";

  const bookingWord =
    creatorType === "Fan call" ? "call" :
    creatorType === "Fan date" ? "date" :
    "meet & greet";

  // ── All existing logic unchanged ──────────────────────────────────────────

  const getAvailableDates = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date();
    if (isFanCall) {
      endDate.setDate(today.getDate() + 7);
    } else {
      endDate.setDate(today.getDate() + 14);
    }
    return { startDate, endDate };
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const isTomorrow = (d: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
  };

  const isDateAvailable = (d: Date) => {
    const { startDate, endDate } = getAvailableDates();
    if (isToday(d) || isTomorrow(d)) return false;
    return d >= startDate && d <= endDate;
  };

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (isDateAvailable(selectedDate)) {
      setDate(formatDateForInput(selectedDate));
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!date || !time || (!isFanCall && !venue)) {
      toast.error("Please fill in all fields", { autoClose: 2000 });
      return;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    const { endDate } = getAvailableDates();
    if (isToday(selectedDate) || isTomorrow(selectedDate)) {
      toast.error("Today and tomorrow are not available for Request", { autoClose: 2000 });
      return;
    }
    if (selectedDate < today) {
      toast.error("Please select a future date", { autoClose: 2000 });
      return;
    }
    if (selectedDate > endDate) {
      const daysAllowed = isFanCall ? "7" : "14";
      toast.error(`Please select a date within the next ${daysAllowed} available days`, { autoClose: 2000 });
      return;
    }
    setLoading(true);
    try {
      await onDone({ date, time, venue: isFanCall ? "" : venue });
    } catch (error) {
      console.error('Error submitting request details:', error);
      toast.error("Failed to submit request. Please try again.", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  // ── Calendar cells ────────────────────────────────────────────────────────
  const today = new Date();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  const calCells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) calCells.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(viewYear, viewMonth, d);
    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isTodayDate = isToday(cellDate);
    const isTomorrowDate = isTomorrow(cellDate);
    const isAvail = isDateAvailable(cellDate);
    const isDisabled = isPast || isTodayDate || isTomorrowDate || !isAvail;
    const isSel = date === formatDateForInput(cellDate);

    calCells.push(
      <div
        key={d}
        className={`date-cell${isDisabled ? ' disabled' : ''}${isSel ? ' sel' : ''}`}
        onClick={() => { if (!isDisabled) handleDateSelect(cellDate); }}
      >
        <div className="dc-day">{dayNames[cellDate.getDay()]}</div>
        <div className="dc-num">{d}</div>
      </div>
    );
  }

  // ── Time chips ────────────────────────────────────────────────────────────
  // Convert time string like "1:00 PM" to "13:00" for comparison with input type=time
  const timeChips = curTimeTab === 'AM' ? AM_TIMES : PM_TIMES;

  const convertTo24 = (t: string) => {
    const [timePart, period] = t.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isFormValid = date && time && (isFanCall || venue.trim());

  const creatorInitial = creatorName?.charAt(0)?.toUpperCase() || "C";

  const typeTag = isFanCall ? "📞 Fan Call" :
    creatorType.toLowerCase() === "fan date" ? "❤️ Fan Date" : "🤝 Fan Meet";

  return (
     <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ background: "#080b14" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        .rdf-root{background:#080b14;min-height:100vh;font-family:'Plus Jakarta Sans',sans-serif;color:#f1f5f9;overflow-x:hidden;}
        .rdf-nav{position:sticky;top:0;z-index:200;background:rgba(8,11,20,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 20px;height:56px;display:flex;align-items:center;justify-content:space-between;}
        .rdf-nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;}
        .rdf-nav-logo-icon{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#6c63ff,#9b59f5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;}
        .rdf-nav-logo-name{font-size:15px;font-weight:700;color:#f1f5f9;}
        .rdf-nav-back{background:none;border:none;color:#94a3b8;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:color .2s;}
        .rdf-nav-back:hover{color:#f1f5f9;}
        .rdf-page{max-width:480px;margin:0 auto;padding:28px 20px 80px;}
        .rdf-strip{display:flex;align-items:center;gap:14px;background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px 16px;margin-bottom:28px;}
        .rdf-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#6c63ff,#9b59f5);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:white;flex-shrink:0;position:relative;}
        .rdf-online{position:absolute;bottom:2px;right:2px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #111624;}
        .rdf-cs-label{font-size:10px;font-weight:600;color:#475569;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}
        .rdf-cs-name{font-size:15px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:6px;color:#f1f5f9;}
        .rdf-cs-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.2);border-radius:5px;padding:1px 7px;font-size:9px;font-weight:700;color:#2dd4bf;}
        .rdf-cs-handle{font-size:12px;color:#475569;margin-top:2px;}
        .rdf-cs-type{margin-left:auto;flex-shrink:0;}
        .rdf-type-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(244,114,182,.08);border:1px solid rgba(244,114,182,.2);border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;color:#f472b6;}
        .rdf-gold{background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(245,158,11,.06));border:1px solid rgba(245,158,11,.2);border-radius:14px;padding:16px 18px;margin-bottom:28px;position:relative;overflow:hidden;}
        .rdf-gold::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b);}
        .rdf-gn-top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
        .rdf-gn-title{font-size:13px;font-weight:700;color:#fbbf24;}
        .rdf-gn-amount{font-size:26px;font-weight:800;letter-spacing:-.02em;color:#f59e0b;margin-bottom:4px;}
        .rdf-gn-amount span{font-size:14px;font-weight:600;color:rgba(245,158,11,.7);}
        .rdf-gn-sub{font-size:12px;color:rgba(245,158,11,.6);line-height:1.55;}
        .rdf-gn-row{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid rgba(245,158,11,.1);}
        .rdf-gn-bal{font-size:12px;color:#475569;}
        .rdf-gn-bal strong{color:#94a3b8;font-weight:600;}
        .rdf-sec-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#475569;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
        .rdf-sec-label::before{content:'';display:block;width:16px;height:2px;background:#6c63ff;border-radius:2px;}
        .rdf-fg{display:flex;flex-direction:column;gap:7px;margin-bottom:18px;}
        .rdf-fl{font-size:12.5px;font-weight:600;color:#94a3b8;display:flex;align-items:center;gap:6px;}
        .rdf-fi{background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:13px 14px;font-size:13.5px;color:#f1f5f9;font-family:inherit;outline:none;transition:border-color .2s;width:100%;}
        .rdf-fi:focus{border-color:rgba(108,99,255,.4);}
        .rdf-fi::placeholder{color:#475569;}
        .rdf-date-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px;}
        .date-cell{aspect-ratio:1;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#111624;border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:all .2s;user-select:none;}
        .date-cell:hover:not(.disabled){border-color:rgba(108,99,255,.35);background:rgba(108,99,255,.06);}
        .date-cell.sel{background:rgba(108,99,255,.15);border-color:rgba(108,99,255,.4);color:#a89cff;}
        .date-cell.disabled{opacity:.3;cursor:not-allowed;}
        .dc-day{font-size:8px;font-weight:600;color:#475569;letter-spacing:.04em;margin-bottom:2px;}
        .dc-num{font-size:13px;font-weight:800;color:#f1f5f9;}
        .date-cell.sel .dc-day{color:#a89cff;}
        .date-cell.sel .dc-num{color:#a89cff;}
        .rdf-date-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .rdf-date-nav-btn{background:#111624;border:1px solid rgba(255,255,255,0.07);color:#94a3b8;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
        .rdf-date-nav-btn:hover{border-color:rgba(108,99,255,.3);color:#a89cff;}
        .rdf-date-month{font-size:13px;font-weight:700;color:#f1f5f9;}
        .rdf-time-section{background:#111624;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;margin-bottom:18px;}
        .rdf-time-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,0.07);}
        .rdf-t-tab{flex:1;padding:11px;font-size:13px;font-weight:700;font-family:inherit;background:transparent;border:none;color:#475569;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
        .rdf-t-tab.active{background:rgba(108,99,255,.1);color:#a89cff;}
        .rdf-time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px;}
        .rdf-t-chip{padding:9px 8px;border-radius:8px;font-size:12px;font-weight:600;background:#0e1220;border:1px solid rgba(255,255,255,0.04);color:#94a3b8;cursor:pointer;transition:all .2s;text-align:center;user-select:none;}
        .rdf-t-chip:hover{border-color:rgba(108,99,255,.3);color:#a89cff;}
        .rdf-t-chip.sel{background:rgba(108,99,255,.14);border-color:rgba(108,99,255,.35);color:#a89cff;}
        .rdf-t-chip.unavail{opacity:.3;cursor:not-allowed;}
        .rdf-venue-note{font-size:11.5px;color:#475569;margin-top:6px;line-height:1.55;display:flex;align-items:flex-start;gap:7px;}
        .rdf-safety{background:#161b2e;border:1px solid rgba(245,158,11,.12);border-radius:12px;padding:14px 16px;margin-bottom:28px;}
        .rdf-sm-title{font-size:12px;font-weight:700;color:#f59e0b;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
        .rdf-sm-rule{display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8;margin-bottom:7px;line-height:1.4;}
        .rdf-sm-rule:last-child{margin-bottom:0;}
        .rdf-sm-dot{width:16px;height:16px;border-radius:50%;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);display:flex;align-items:center;justify-content:center;font-size:7px;color:#f59e0b;flex-shrink:0;}
        .rdf-btn-request{width:100%;padding:16px;border-radius:14px;background:linear-gradient(135deg,#6c63ff,#9b59f5);border:none;color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 28px rgba(108,99,255,.4);transition:all .25s;margin-bottom:12px;}
        .rdf-btn-request:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(108,99,255,.55);}
        .rdf-btn-request:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
        .rdf-btn-cancel{width:100%;padding:14px;border-radius:12px;background:transparent;border:1px solid rgba(255,255,255,0.07);color:#94a3b8;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;}
        .rdf-btn-cancel:hover{background:rgba(255,255,255,.04);color:#f1f5f9;}
        .rdf-fan-call-info{background:linear-gradient(135deg,rgba(108,99,255,.08),rgba(155,89,245,.05));border:1px solid rgba(108,99,255,.15);border-radius:12px;padding:14px 16px;margin-bottom:28px;font-size:12.5px;color:#94a3b8;line-height:1.65;}
        .rdf-fan-call-info strong{color:#a89cff;}
        .rdf-gn-row{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid rgba(245,158,11,.1);}
        .rdf-gn-bal{font-size:12px;color:#475569;}
        .rdf-gn-bal strong{color:#94a3b8;font-weight:600;}
      `}</style>

      <div className="rdf-root">
        {/* NAV */}
        <nav className="rdf-nav">
          <button className="rdf-nav-back" onClick={onCancel}>← Back</button>
          <a href="/" className="rdf-nav-logo">
            <div className="rdf-nav-logo-icon">M</div>
            <span className="rdf-nav-logo-name">mmeko</span>
          </a>
          <div style={{ width: 60 }} />
        </nav>

        <div className="rdf-page">

          {/* CREATOR STRIP */}
          <div className="rdf-strip">
       <div style={{ position: "relative", flexShrink: 0 }}>
  <div className="rdf-av" style={{ padding: 0, overflow: "hidden" }}>
   {creatorPhoto ? (
  <img
    src={getImageSource(creatorPhoto, 'profile').src}
    alt={creatorName}
    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
    onError={(e) => {
      (e.currentTarget as HTMLImageElement).style.display = "none";
      (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
    }}
  />
) : null}
    <span style={{ display: creatorPhoto ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>{creatorInitial}</span>
  </div>
  {creatorActive && <div className="rdf-online" />}
</div>
            <div>
             <div className="rdf-cs-label">Requesting a {isFanCall ? "call" : creatorType.toLowerCase() === "fan date" ? "date" : "meet"} with</div>
             <div className="rdf-cs-name">{creatorName?.split(" ")[0]} <span className="rdf-cs-badge">✓ Verified</span></div>
            </div>
            <div className="rdf-cs-type">
              <div className="rdf-type-tag">{typeTag}</div>
            </div>
          </div>

          {/* GOLD NOTICE */}
          {!isFanCall ? (
            <div className="rdf-gold">
              <div className="rdf-gn-top">
                <div style={{ fontSize: 20 }}>💰</div>
                <div className="rdf-gn-title">Payment held securely</div>
              </div>
              <div className="rdf-gn-amount">{price.toLocaleString()} <span>GOLD</span></div>
            <div className="rdf-gn-sub">
  Will be deducted from your balance and held in escrow until the <strong style={{ color: "rgba(245,158,11,.9)" }}>{creatorType.toLowerCase() === "fan date" ? "date" : "meet & greet"}</strong> is confirmed complete. You keep full protection.
  <br /><br />
  Once a booking request is sent, the creator has up to 24 hours to accept it. After the creator accepts, the <strong style={{ color: "rgba(245,158,11,.9)" }}>{creatorType.toLowerCase() === "fan date" ? "date" : "meet"}</strong> can take place at anytime based on mutual availability within that booking.
</div>
<div className="rdf-gn-row">
  <div className="rdf-gn-bal">Your balance: <strong>{userBalance.toLocaleString()} GOLD</strong></div>
  <div style={{ fontSize:11, color:"rgba(245,158,11,.5)" }}>After: {Math.max(0, userBalance - price).toLocaleString()} GOLD</div>
</div>
            </div>
          ) : (
            <div className="rdf-fan-call-info">
              Fan Calls can be booked up to 7 days in advance 🙂 Once a booking request is sent, the creator has up to 24 hours to accept it. After the creator accepts, the <strong>call</strong> can be started anytime based on mutual availability within that booking.
            </div>
          )}

          {/* SELECT DATE */}
          <div className="rdf-sec-label">Select Date</div>
          <div style={{ marginBottom: 18 }}>
            <div className="rdf-date-nav">
              <button className="rdf-date-nav-btn" onClick={prevMonth}>‹</button>
              <div className="rdf-date-month">{MONTHS[viewMonth]} {viewYear}</div>
              <button className="rdf-date-nav-btn" onClick={nextMonth}>›</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                <div key={d} style={{ fontSize:9, fontWeight:700, color:"#475569", textAlign:"center", padding:"4px 0" }}>{d}</div>
              ))}
            </div>
            <div className="rdf-date-grid">{calCells}</div>
            {date && (
              <div style={{ fontSize:12, color:"#a89cff", marginTop:8, textAlign:"center" }}>
                Selected: {new Date(date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </div>
            )}
          </div>

          {/* SELECT TIME */}
          <div className="rdf-sec-label">Select Time</div>
          <div className="rdf-time-section">
            <div className="rdf-time-tabs">
              <button className={`rdf-t-tab${curTimeTab === 'AM' ? ' active' : ''}`} onClick={() => setCurTimeTab('AM')}>🌞 AM</button>
              <button className={`rdf-t-tab${curTimeTab === 'PM' ? ' active' : ''}`} onClick={() => setCurTimeTab('PM')}>🌙 PM</button>
            </div>
            <div className="rdf-time-grid">
              {timeChips.map(t => {
                const val24 = convertTo24(t);
                const isSel = time === val24;
                return (
                  <div
                    key={t}
                    className={`rdf-t-chip${isSel ? ' sel' : ''}`}
                    onClick={() => setTime(val24)}
                  >{t}</div>
                );
              })}
            </div>
          </div>

          {/* VENUE */}
          {!isFanCall && (
            <div className="rdf-fg">
              <label className="rdf-fl">Venue <span style={{ color:"#ef4444", fontSize:11 }}>*</span></label>
              <input
                type="text"
                className="rdf-fi"
                placeholder="e.g. Starbucks, Times Square, NYC..."
                value={venue}
                onChange={e => setVenue(e.target.value)}
              />
              <div className="rdf-venue-note">
                <div style={{ fontSize:13, flexShrink:0, marginTop:1 }}>📍</div>
                Must be a public place — café, restaurant, hotel lobby, park, or similar. Private venues are not permitted.
              </div>
            </div>
          )}

          {/* SAFETY */}
          <div className="rdf-safety">
            <div className="rdf-sm-title">⚠️ Before you send</div>
            {!isFanCall && (
              <>
                <div className="rdf-sm-rule"><div className="rdf-sm-dot">1</div>All meets are limited to <strong style={{ color:"#f1f5f9" }}>30 minutes</strong> — no exceptions</div>
                <div className="rdf-sm-rule"><div className="rdf-sm-dot">2</div>Must take place in a <strong style={{ color:"#f1f5f9" }}>public venue only</strong></div>
                <div className="rdf-sm-rule"><div className="rdf-sm-dot">3</div>Your gold is held securely — <strong style={{ color:"#f1f5f9" }}>released only after the meet</strong></div>
              </>
            )}
            {isFanCall && (
              <>
                <div className="rdf-sm-rule"><div className="rdf-sm-dot">1</div>Calls are <strong style={{ color:"#f1f5f9" }}>billed per minute</strong></div>
                <div className="rdf-sm-rule"><div className="rdf-sm-dot">2</div>Ensure a <strong style={{ color:"#f1f5f9" }}>stable internet connection</strong> before starting</div>
                <div className="rdf-sm-rule"><div className="rdf-sm-dot">3</div>Be respectful and follow <strong style={{ color:"#f1f5f9" }}>platform guidelines</strong></div>
              </>
            )}
          </div>

          {/* BUTTONS */}
         <button
  className="rdf-btn-request"
  disabled={!isFormValid || loading}
  onClick={() => {
    if (!isFanVerified) {
      setShowVerifyPopup(true);
    } else {
      handleSubmit();
    }
  }}
>
            {loading ? (
              <PacmanLoader color="#ffffff" loading={true} size={10} />
            ) : (
              <>
                {isFanCall ? "📞" : creatorType.toLowerCase() === "fan date" ? "💕" : "🎯"}
                {loading ? "Processing..." : `Request ${creatorType}`}
              </>
            )}
          </button>
          <button className="rdf-btn-cancel" onClick={onCancel}>Cancel</button>

          {showVerifyPopup && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4" onClick={() => setShowVerifyPopup(false)}>
    <div className="bg-[#111624] rounded-2xl p-6 max-w-sm w-full border border-white/10" onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 32, textAlign: "center", marginBottom: 16 }}>🛡️</div>
      <h3 className="text-white font-bold text-base mb-3 text-center">Verification recommended</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 text-center">
        Most creators only accept booking requests from verified fans. Verify your account to increase your chances of being accepted.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
  setShowVerifyPopup(false);
  try {
    const raw = localStorage.getItem("login");
    if (raw) {
      const data = JSON.parse(raw);
      const username = data?.username || "";
      const cleanUsername = String(username).replace(/^@/, "");
      window.location.href = `/@${cleanUsername}/fan-verification`;
      return;
    }
  } catch {}
  window.location.href = "/fan-verification";
}}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6c63ff,#9b59f5)" }}
        >
          🛡️ Verify My Account
        </button>
        <button
          onClick={() => { setShowVerifyPopup(false); handleSubmit(); }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#94a3b8] border border-white/10 hover:text-white transition-colors"
        >
          Continue without verification
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
};