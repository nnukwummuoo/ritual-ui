"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PrefetchedCreator {
  userId: string;
  username: string;
  photolink: string | null;
}

interface Props {
  prefetchedCreators?: PrefetchedCreator[];
}

// ── CSS: copied verbatim from mmeko-v4.html, prefixed lp- to avoid leaking ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }

.lp {
  --bg:       #080b14;
  --bg2:      #0b0f1c;
  --bg3:      #0e1220;
  --card:     #111624;
  --card2:    #161b2e;
  --border:   rgba(255,255,255,0.07);
  --border2:  rgba(255,255,255,0.04);
  --accent:   #6c63ff;
  --accent2:  #9b59f5;
  --accent-g: linear-gradient(135deg, #6c63ff, #9b59f5);
  --teal:     #2dd4bf;
  --rose:     #f472b6;
  --text:     #f1f5f9;
  --text2:    #94a3b8;
  --text3:    #475569;
  --success:  #22c55e;
  --warning:  #f59e0b;
  --danger:   #ef4444;
  --radius:   12px;
  --radius-lg:20px;
  background: var(--bg);
  color: var(--text);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  overflow-x: hidden;
}

.lp ::-webkit-scrollbar { width: 4px; }
.lp ::-webkit-scrollbar-track { background: var(--bg); }
.lp ::-webkit-scrollbar-thumb { background: var(--card2); border-radius: 4px; }

.lp .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
.lp .reveal.in { opacity: 1; transform: none; }
.lp .d1{transition-delay:.08s}.lp .d2{transition-delay:.16s}.lp .d3{transition-delay:.24s}.lp .d4{transition-delay:.32s}

/* NAV */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 40px; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background .3s, border-color .3s;
  border-bottom: 1px solid transparent;
}
.lp-nav.scrolled {
  background: rgba(8,11,20,.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.07);
}
.lp .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.lp .logo-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #6c63ff, #9b59f5);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: white; letter-spacing: -.5px;
}
.lp .logo-name { font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -.3px; }
.lp-nav .nav-links { display: flex; align-items: center; gap: 8px; }
.lp-nav .nl {
  color: var(--text2); text-decoration: none; font-size: 13.5px; font-weight: 500;
  padding: 6px 12px; border-radius: 8px; transition: color .2s, background .2s;
}
.lp-nav .nl:hover { color: var(--text); background: rgba(255,255,255,.05); }
.lp-nav .nav-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.07); margin: 0 4px; }
.lp-nav .nav-btns { display: flex; align-items: center; gap: 8px; }
.lp .nav-btn {
  padding: 8px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 600;
  text-decoration: none; transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
}
.lp .nav-btn-ghost { color: var(--text2); border: 1px solid rgba(255,255,255,0.07); }
.lp .nav-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,.15); background: rgba(255,255,255,.05); }
.lp .nav-btn-primary {
  background: linear-gradient(135deg, #6c63ff, #9b59f5); color: white;
  box-shadow: 0 0 0 1px rgba(108,99,255,.3), 0 4px 16px rgba(108,99,255,.25);
}
.lp .nav-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 0 1px rgba(108,99,255,.4), 0 8px 24px rgba(108,99,255,.35); }

/* HERO */
.lp .hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 100px 24px 80px; text-align: center;
  position: relative; overflow: hidden;
}
.lp .hero-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 20% 20%, rgba(108,99,255,.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(155,89,245,.1) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 50% 50%, rgba(45,212,191,.05) 0%, transparent 60%);
}
.lp .hero-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .025;
  background-image: linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
}
.lp .hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(108,99,255,.1); border: 1px solid rgba(108,99,255,.25);
  border-radius: 100px; padding: 6px 14px; margin-bottom: 32px;
  font-size: 12px; font-weight: 600; color: #a89cff; letter-spacing: .02em;
  animation: lp-fadeUp .6s ease both;
}
.lp .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #2dd4bf; box-shadow: 0 0 6px #2dd4bf; animation: lp-blink 2s ease-in-out infinite; }
@keyframes lp-blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }
.lp .hero-avs { display: flex; align-items: center; justify-content: center; margin-bottom: 28px; animation: lp-fadeUp .6s .04s ease both; }
.lp .av { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #080b14; margin-left: -8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; }
.lp .av:first-child { margin-left: 0; }
.lp .av-txt { margin-left: 12px; font-size: 13px; color: var(--text2); font-weight: 400; }
.lp .av-txt strong { color: var(--text); font-weight: 600; }
.lp .hero h1 {
  font-size: clamp(38px, 7vw, 80px);
  font-weight: 800; line-height: 1.08; letter-spacing: -.03em;
  max-width: 780px; margin-bottom: 8px;
  animation: lp-fadeUp .7s .08s ease both;
}
.lp .hero h1 .grad {
  background: linear-gradient(135deg, #6c63ff, #9b59f5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.lp .hero-sub {
  font-size: 17px; color: var(--text2); max-width: 480px; margin: 20px auto 44px;
  font-weight: 400; line-height: 1.75;
  animation: lp-fadeUp .7s .14s ease both;
}
.lp .hero-sub strong { color: var(--text); font-weight: 600; }
.lp .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; animation: lp-fadeUp .7s .2s ease both; }
.lp .btn-primary {
  padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;
  background: linear-gradient(135deg, #6c63ff, #9b59f5); color: white; text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; font-family: inherit;
  box-shadow: 0 0 0 1px rgba(108,99,255,.3), 0 4px 20px rgba(108,99,255,.3);
  transition: all .25s;
}
.lp .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(108,99,255,.4), 0 8px 32px rgba(108,99,255,.4); }
.lp .btn-secondary {
  padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;
  background: rgba(255,255,255,.06); color: var(--text); text-decoration: none;
  border: 1px solid rgba(255,255,255,0.07); display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-family: inherit;
  transition: all .25s;
}
.lp .btn-secondary:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.12); transform: translateY(-2px); }
.lp .hero-trust {
  display: flex; align-items: center; gap: 24px; margin-top: 36px; flex-wrap: wrap; justify-content: center;
  animation: lp-fadeUp .7s .28s ease both;
}
.lp .trust-item { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--text3); font-weight: 500; }
.lp .trust-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--text3); }
@keyframes lp-fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:none;} }

/* STATS */
.lp .stats { display: grid; grid-template-columns: repeat(4,1fr); background: var(--bg2); border-bottom: 1px solid var(--border); }
.lp .stat { padding: 32px 24px; text-align: center; border-right: 1px solid var(--border); }
.lp .stat:last-child { border-right: none; }
.lp .stat-n { font-size: 36px; font-weight: 800; letter-spacing: -.03em; margin-bottom: 6px; background: linear-gradient(135deg, #6c63ff, #9b59f5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp .stat-l { font-size: 12px; color: var(--text2); font-weight: 500; letter-spacing: .02em; }

/* SECTION */
.lp .section { padding: 96px 40px; max-width: 1140px; margin: 0 auto; }
.lp .section-alt { background: var(--bg2); }
.lp .sec-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #a89cff; }
.lp .sec-eyebrow::before { content: ''; display: block; width: 20px; height: 2px; background: var(--accent); border-radius: 2px; }
.lp .sec-title { font-size: clamp(28px, 4vw, 46px); font-weight: 800; letter-spacing: -.03em; line-height: 1.1; margin-bottom: 60px; }
.lp .sec-title em { font-style: normal; background: linear-gradient(135deg, #6c63ff, #9b59f5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp .sec-subtitle { font-size: 16px; color: var(--text2); max-width: 480px; line-height: 1.75; margin-bottom: 56px; margin-top: -40px; }

/* OFFERINGS */
.lp .off-hero-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 0; overflow: hidden; margin-bottom: 16px;
  display: grid; grid-template-columns: 1fr 1fr; transition: border-color .25s;
}
.lp .off-hero-card:hover { border-color: rgba(108,99,255,.3); }
.lp .off-hero-left { padding: 48px; }
.lp .off-hero-right { background: var(--card2); border-left: 1px solid var(--border); padding: 36px; display: flex; flex-direction: column; gap: 12px; justify-content: center; }
.lp .off-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 20px; width: fit-content; }
.lp .tag-purple { background: rgba(108,99,255,.12); color: #a89cff; }
.lp .tag-teal   { background: rgba(45,212,191,.1);  color: #2dd4bf; }
.lp .tag-rose   { background: rgba(244,114,182,.1); color: #f472b6; }
.lp .tag-amber  { background: rgba(245,158,11,.1);  color: #fbbf24; }
.lp .off-icon { font-size: 32px; margin-bottom: 20px; display: block; }
.lp .off-title { font-size: 22px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 12px; line-height: 1.25; }
.lp .off-desc { font-size: 14px; color: var(--text2); line-height: 1.75; }
.lp .off-feat-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px; background: var(--bg3); border: 1px solid var(--border2); border-radius: 10px; transition: border-color .2s, background .2s; }
.lp .off-feat-row:hover { border-color: var(--border); background: rgba(255,255,255,.03); }
.lp .off-feat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.lp .fi-purple { background: rgba(108,99,255,.12); }
.lp .fi-teal   { background: rgba(45,212,191,.1); }
.lp .fi-rose   { background: rgba(244,114,182,.1); }
.lp .off-feat-title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
.lp .off-feat-desc  { font-size: 12px; color: var(--text2); line-height: 1.5; }
.lp .off-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp .off-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px 28px; position: relative; overflow: hidden; transition: border-color .25s, transform .25s, box-shadow .25s; }
.lp .off-card:hover { border-color: rgba(108,99,255,.25); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.4); }
.lp .off-card-ghost { position: absolute; bottom: -10px; right: 12px; font-size: 72px; font-weight: 800; color: rgba(255,255,255,.025); line-height: 1; user-select: none; letter-spacing: -.04em; }

/* HOW IT WORKS */
.lp .steps-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(255,255,255,0.07); border-radius: var(--radius-lg); overflow: hidden; }
.lp .step { background: var(--card); padding: 40px 32px; transition: background .25s; }
.lp .step:hover { background: var(--card2); }
.lp .step-num { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #a89cff; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.lp .step-num::before { content: ''; display: block; width: 24px; height: 2px; background: var(--accent); border-radius: 2px; }
.lp .step-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; border: 1px solid var(--border); background: var(--bg3); }
.lp .step-title { font-size: 16px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 10px; }
.lp .step-desc { font-size: 13px; color: var(--text2); line-height: 1.7; }

/* PAYMENT */
.lp .pay-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
.lp .pay-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px 24px; text-align: center; position: relative; transition: border-color .25s; }
.lp .pay-card:hover { border-color: rgba(108,99,255,.25); }
.lp .pay-card::after { content: '→'; position: absolute; top: 50%; right: -10px; transform: translateY(-50%); font-size: 14px; color: var(--text3); z-index: 1; }
.lp .pay-card:last-child::after { display: none; }
.lp .pay-num { width: 32px; height: 32px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: linear-gradient(135deg, #6c63ff, #9b59f5); color: white; }
.lp .pay-icon-wrap { font-size: 28px; margin-bottom: 14px; }
.lp .pay-title { font-size: 14px; font-weight: 700; letter-spacing: -.01em; margin-bottom: 8px; }
.lp .pay-desc { font-size: 12px; color: var(--text2); line-height: 1.65; }
.lp .pay-callout { background: var(--card); border: 1px solid rgba(108,99,255,.2); border-radius: var(--radius-lg); padding: 24px 28px; display: flex; align-items: flex-start; gap: 16px; }
.lp .pay-callout-icon { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; background: rgba(108,99,255,.12); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.lp .pay-callout-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
.lp .pay-callout-desc { font-size: 13px; color: var(--text2); line-height: 1.7; }

/* SAFETY */
.lp .safety-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp .safety-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px 28px; transition: border-color .25s, transform .25s; }
.lp .safety-card:hover { border-color: rgba(108,99,255,.25); transform: translateY(-3px); }
.lp .safety-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; background: var(--bg3); border: 1px solid var(--border); }
.lp .safety-title { font-size: 16px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 10px; }
.lp .safety-desc { font-size: 13px; color: var(--text2); line-height: 1.75; }
.lp .safety-highlight { grid-column: span 3; background: linear-gradient(135deg, rgba(108,99,255,.08), rgba(155,89,245,.05)); border: 1px solid rgba(108,99,255,.2); border-radius: var(--radius-lg); padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.lp .safety-highlight-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; letter-spacing: -.02em; }
.lp .safety-highlight-desc { font-size: 14px; color: var(--text2); line-height: 1.7; max-width: 520px; }
.lp .safety-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.lp .safety-pill { display: flex; align-items: center; gap: 7px; padding: 7px 14px; background: var(--bg3); border: 1px solid var(--border); border-radius: 100px; font-size: 12px; font-weight: 500; color: var(--text2); }
.lp .pill-check { width: 16px; height: 16px; border-radius: 50%; background: rgba(34,197,94,.12); color: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }

/* COMPARISON */
.lp .cmp-wrap { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.lp .cmp-table { width: 100%; border-collapse: collapse; }
.lp .cmp-table th { padding: 20px 24px; font-size: 13px; font-weight: 600; text-align: left; background: var(--card); border-bottom: 1px solid var(--border); }
.lp .th-feature { color: var(--text2); width: 40%; }
.lp .th-mmeko { text-align: center; color: #a89cff; width: 30%; }
.lp .th-other  { text-align: center; color: var(--text3); width: 30%; }
.lp .th-mmeko-inner { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.lp .th-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(108,99,255,.12); border: 1px solid rgba(108,99,255,.2); border-radius: 100px; padding: 3px 10px; font-size: 10px; font-weight: 600; color: #a89cff; }
.lp .cmp-table td { padding: 16px 24px; font-size: 13.5px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.lp .cmp-table tr:last-child td { border-bottom: none; }
.lp .td-feature { color: var(--text); font-weight: 500; }
.lp .td-mmeko { text-align: center; background: rgba(108,99,255,.03); border-left: 1px solid rgba(108,99,255,.08); border-right: 1px solid rgba(108,99,255,.08); }
.lp .td-other  { text-align: center; color: var(--text2); }
.lp .cmp-table tr:hover .td-feature { color: #a89cff; }
.lp .ck { color: #22c55e; font-weight: 600; font-size: 13px; }
.lp .cx { color: #ef4444; font-size: 13px; }
.lp .cm { color: var(--text3); font-size: 12px; }

/* TESTIMONIALS */
.lp .test-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp .test-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; display: flex; flex-direction: column; gap: 20px; transition: border-color .25s, transform .25s; }
.lp .test-card:hover { border-color: rgba(108,99,255,.25); transform: translateY(-3px); }
.lp .test-top { display: flex; align-items: center; gap: 14px; }
.lp .test-av { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 700; color: white; position: relative; }
.lp .test-verified { position: absolute; bottom: -1px; right: -1px; width: 16px; height: 16px; border-radius: 50%; background: #2dd4bf; border: 2px solid var(--card); display: flex; align-items: center; justify-content: center; font-size: 8px; color: #080b14; }
.lp .test-name { font-size: 15px; font-weight: 700; letter-spacing: -.01em; margin-bottom: 2px; }
.lp .test-niche { font-size: 12px; color: var(--text2); font-weight: 400; }
.lp .test-quote { font-size: 14px; color: var(--text2); line-height: 1.75; flex: 1; }
.lp .test-quote::before { content: '"'; color: #a89cff; font-size: 18px; font-weight: 700; line-height: 0; vertical-align: -4px; margin-right: 3px; }
.lp .test-footer { padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: space-between; }
.lp .test-stats { display: flex; gap: 20px; }
.lp .test-stat-n { font-size: 18px; font-weight: 800; letter-spacing: -.02em; background: linear-gradient(135deg, #6c63ff, #9b59f5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp .test-stat-l { font-size: 11px; color: var(--text3); font-weight: 500; margin-top: 1px; }
.lp .test-offer { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: rgba(108,99,255,.1); border: 1px solid rgba(108,99,255,.15); border-radius: 6px; font-size: 11px; font-weight: 600; color: #a89cff; }

/* FINAL CTA */
.lp .final-cta { margin: 0 40px 96px; background: linear-gradient(135deg, rgba(108,99,255,.12), rgba(155,89,245,.08)); border: 1px solid rgba(108,99,255,.2); border-radius: 24px; padding: 80px 60px; text-align: center; position: relative; overflow: hidden; }
.lp .final-cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 0%, rgba(108,99,255,.12), transparent 70%); pointer-events: none; }
.lp .final-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #a89cff; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.lp .final-eyebrow::before, .lp .final-eyebrow::after { content: ''; display: block; width: 24px; height: 2px; background: #6c63ff; border-radius: 2px; }
.lp .final-h { font-size: clamp(32px, 5vw, 60px); font-weight: 800; letter-spacing: -.03em; line-height: 1.08; margin-bottom: 18px; }
.lp .final-h em { font-style: normal; background: linear-gradient(135deg, #6c63ff, #9b59f5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp .final-sub { font-size: 16px; color: var(--text2); max-width: 440px; margin: 0 auto 44px; line-height: 1.75; }
.lp .final-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.lp .final-trust { margin-top: 40px; display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap; }
.lp .ft-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--text2); font-weight: 500; }
.lp .ft-icon { width: 20px; height: 20px; border-radius: 50%; background: rgba(34,197,94,.1); display: flex; align-items: center; justify-content: center; font-size: 10px; color: #22c55e; flex-shrink: 0; }

/* FAQ */
.lp .faq-section { padding: 96px 40px; max-width: 1140px; margin: 0 auto; }
.lp .faq-tabs { display: flex; gap: 8px; margin-bottom: 48px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 6px; width: fit-content; }
.lp .faq-tab { padding: 10px 24px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .2s; border: none; background: transparent; color: var(--text2); font-family: 'Plus Jakarta Sans', sans-serif; }
.lp .faq-tab.active { background: linear-gradient(135deg, #6c63ff, #9b59f5); color: white; box-shadow: 0 2px 12px rgba(108,99,255,.3); }
.lp .faq-tab:not(.active):hover { color: var(--text); background: rgba(255,255,255,.05); }
.lp .faq-panel { display: none; }
.lp .faq-panel.active { display: block; }
.lp .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lp .faq-item { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: border-color .2s; }
.lp .faq-item:hover { border-color: rgba(108,99,255,.25); }
.lp .faq-item.open { border-color: rgba(108,99,255,.2); }
.lp .faq-q { width: 100%; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: none; border: none; cursor: pointer; text-align: left; font-size: 14px; font-weight: 600; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
.lp .faq-q:hover { color: #a89cff; }
.lp .faq-arrow { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: var(--bg3); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--text2); transition: all .25s; }
.lp .faq-item.open .faq-arrow { background: rgba(108,99,255,.12); border-color: rgba(108,99,255,.2); color: #a89cff; transform: rotate(45deg); }
.lp .faq-a { max-height: 0; overflow: hidden; transition: max-height .35s cubic-bezier(.16,1,.3,1), padding .35s; font-size: 13.5px; color: var(--text2); line-height: 1.75; padding: 0 24px; }
.lp .faq-item.open .faq-a { max-height: 300px; padding: 0 24px 20px; }
.lp .faq-still { margin-top: 32px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.lp .faq-still-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.lp .faq-still-desc { font-size: 13px; color: var(--text2); }

/* FOOTER */
.lp footer { border-top: 1px solid var(--border); padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; }
.lp .footer-left { display: flex; align-items: center; gap: 24px; }
.lp .footer-copy { font-size: 13px; color: var(--text3); }
.lp .footer-links { display: flex; gap: 24px; }
.lp .footer-links a { font-size: 13px; color: var(--text3); text-decoration: none; transition: color .2s; }
.lp .footer-links a:hover { color: var(--text2); }

/* RESPONSIVE */
@media(max-width: 900px) {
  .lp-nav-links-inner { display: none !important; }
  .lp-nav-mobile-pad { padding: 0 20px !important; }
  .lp-nav .nav-links { display: none !important; }
  .lp-nav .nl { display: none; }
  .lp-nav .nav-divider { display: none; }
  .lp .hero h1 { font-size: 36px; }
  .lp .stats { grid-template-columns: repeat(2,1fr); }
  .lp .section { padding: 64px 20px; }
  .lp .off-hero-card { grid-template-columns: 1fr; }
  .lp .off-hero-right { border-left: none; border-top: 1px solid rgba(255,255,255,0.07); }
  .lp .off-grid { grid-template-columns: 1fr; }
  .lp .steps-grid { grid-template-columns: 1fr 1fr; }
  .lp .pay-grid { grid-template-columns: 1fr 1fr; }
  .lp .pay-card::after { display: none; }
  .lp .safety-grid { grid-template-columns: 1fr; }
  .lp .safety-highlight { grid-column: span 1; flex-direction: column; }
  .lp .cmp-table th, .lp .cmp-table td { padding: 12px 14px; font-size: 12px; }
  .lp .test-grid { grid-template-columns: 1fr; }
  .lp .final-cta { margin: 0 16px 64px; padding: 52px 24px; }
  .lp footer { flex-direction: column; gap: 20px; text-align: center; }
  .lp .footer-left { flex-direction: column; gap: 12px; }
  .lp .faq-grid { grid-template-columns: 1fr; }
  .lp .faq-still { flex-direction: column; gap: 16px; }
  .lp .cmp-table thead { display: none; }
  .lp .cmp-table, .lp .cmp-table tbody, .lp .cmp-table tr, .lp .cmp-table td { display: block; width: 100%; }
  .lp .cmp-wrap { border: none; background: transparent; }
  .lp .cmp-table tr { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .lp .td-feature { padding: 0; border: none; font-size: 13px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .lp .td-mmeko, .lp .td-other { padding: 0; border: none; background: transparent; display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; }
  .lp .td-mmeko::before { content: 'mmeko'; font-size: 11px; font-weight: 600; color: #a89cff; }
  .lp .td-other::before  { content: 'Others'; font-size: 11px; font-weight: 600; color: var(--text3); }
}
`;

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ_CREATORS = [
  { q: "What are Fan Meet and Fan Date for?", a: "🤝 Fan Meet – A short, casual meeting where you can greet your favorite creator, chat, and even take a selfie. It's about making a quick personal connection - limited to 30 minutes maximum for safety and fairness. 🍽 Fan Date – A slightly more relaxed session where you spend time together in a safe public place — like grabbing coffee, eating, or walking — but still limited to 30 minutes maximum for safety and fairness." },
  { q: "What counts as a valid public space for meets?", a: "Any open, publicly accessible venue — cafés, restaurants, hotel lobbies, shopping malls, parks, or similar spaces. Private residences, cars, and secluded locations are never permitted. If you're unsure about a specific venue, contact mmeko Support before confirming the booking." },
  { q: "What if the fan doesn't show up to the meet?", a: "Contact mmeko Support immediately through the platform. Since all communication is required to stay on-platform, our team has full visibility of your booking history and can review the situation and release your payment accordingly. Keep all your conversations on mmeko — this is your protection." },
  { q: "What if the fan doesn't mark the meet as complete?", a: "Reach out to mmeko Support directly via the platform. Our team will review your on-platform chat history and meeting details, and release your payment accordingly. We always have your back — you will not be left unpaid for a meet you showed up to." },
  { q: "Can I cancel or decline a booking?", a: "Yes — you have full control over your bookings. You can decline any booking request before confirming it, and cancellations are possible subject to mmeko's cancellation policy. You're never obligated to accept a booking you're not comfortable with." },
  { q: "What's the difference between PPV content and exclusive content sales?", a: "PPV (Pay-Per-View) lets you lock individual posts, media, or even your message replies — fans pay a set price to unlock that specific piece of content. Exclusive content sales work similarly but are positioned as premium standalone pieces in your catalogue, priced and sold individually rather than as part of a feed." },
  { q: "Can I lock my message replies for fans to pay to unlock?", a: "Yes — this is one of mmeko's unique features. You can lock specific replies in a conversation, requiring the fan to pay to see your response. It's a powerful way to monetize your engagement without leaving the chat." },
  { q: "Is fan verification mandatory before I accept a meet?", a: "No — fan verification is optional and creator-controlled. You can choose to require it for your bookings or leave it open. We recommend enabling it for in-person meets as an extra layer of confidence, but the choice is entirely yours." },
];

const FAQ_FANS = [
  { q: "How do I book a meet with a creator?", a: "Browse creator profiles and select the type of experience you want — fan meet, call, or content. Choose a time slot the creator has made available, pay securely through mmeko, and your booking is confirmed. The creator will see your request and can confirm or decline." },
  { q: "Where do fan meets take place?", a: "All in-person fan meets happen in public venues — cafés, restaurants, hotel lobbies, parks, and similar spaces. Private locations are never permitted on mmeko. This rule protects both you and the creator." },
  { q: "How long do fan meets last?", a: "All fan meets on mmeko are capped at 30 minutes. This is a platform-wide rule with no exceptions — it ensures a clear, comfortable experience for everyone involved." },
  { q: "What if the creator doesn't show up?", a: "Contact mmeko Support immediately through the platform. Since all bookings and communications are on-platform, our team has full visibility and will review the situation. If the creator was a no-show, you will receive a full refund." },
  { q: "How do I mark a meet as complete?", a: "After the meet ends, you'll receive a prompt in the app to mark it as complete. Doing so releases the payment to the creator instantly. If you experienced any issues during the meet, contact Support before marking it complete so we can assist you." },
  { q: "Can I message a creator before booking?", a: "Yes — mmeko has built-in messaging so you can connect with creators directly on the platform. All conversations must stay on mmeko; sharing external contact details is against platform rules and exists to protect both parties." },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        {q}
        <div className="faq-arrow">+</div>
      </button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

function FAQSection() {
  const [tab, setTab] = useState<"creators" | "fans">("creators");
  return (
    <div id="faq">
      <div className="faq-section">
        <div className="sec-eyebrow reveal">FAQ</div>
        <div className="sec-title reveal d1">Got questions?<br /><em>We&apos;ve got answers.</em></div>
        <div className="faq-tabs reveal d2">
          <button className={`faq-tab${tab === "creators" ? " active" : ""}`} onClick={() => setTab("creators")}>For Creators</button>
          <button className={`faq-tab${tab === "fans" ? " active" : ""}`} onClick={() => setTab("fans")}>For Fans</button>
        </div>
        <div className={`faq-panel${tab === "creators" ? " active" : ""}`}>
          <div className="faq-grid">
            {FAQ_CREATORS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
        <div className={`faq-panel${tab === "fans" ? " active" : ""}`}>
          <div className="faq-grid">
            {FAQ_FANS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
        <div className="faq-still reveal">
          <div className="faq-still-left">
            <div className="faq-still-title">Still have questions?</div>
            <div className="faq-still-desc">Our support team is available around the clock — reach us anytime through the platform.</div>
          </div>
          <Link href="/support" className="btn-secondary">Contact Support →</Link>
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function CreatorLandingContent({ prefetchedCreators }: Props) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Nav scroll
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    // Reveal on scroll
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    // Overflow
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav style={{
        position:"fixed", top:0, left:0, width:"100vw", zIndex:100,
        padding:"0 20px", height:64,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"rgba(8,11,20,.98)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        fontFamily:"'Plus Jakarta Sans', sans-serif",
        boxSizing:"border-box",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
          <div style={{
            width:34, height:34, borderRadius:9, flexShrink:0,
            background:"linear-gradient(135deg,#6c63ff,#9b59f5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, fontWeight:800, color:"white", letterSpacing:"-.5px",
          }}>M</div>
          <span style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", letterSpacing:"-.3px", whiteSpace:"nowrap" }}>mmeko</span>
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="lp-nav-links-inner" style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", minWidth:0 }}>
          {[["Offerings","#offerings"],["How It Works","#how"],["Payments","#payments"],["Safety","#safety"],["Compare","#compare"],["FAQ","#faq"]].map(([l,h]) => (
            <a key={l} href={h} style={{ color:"#94a3b8", textDecoration:"none", fontSize:13.5, fontWeight:500, padding:"6px 12px", borderRadius:8, whiteSpace:"nowrap" }}>{l}</a>
          ))}
          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.07)", margin:"0 4px", flexShrink:0 }} />
        </div>

        {/* Sign In + Apply — always visible */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <Link href="/auth/login" style={{
            color:"#94a3b8", border:"1px solid rgba(255,255,255,0.07)",
            padding:"8px 16px", borderRadius:8, fontSize:13.5, fontWeight:600,
            textDecoration:"none", display:"inline-flex", alignItems:"center",
            whiteSpace:"nowrap",
          }}>Sign In</Link>
          <Link href="/auth/register" style={{
            background:"linear-gradient(135deg,#6c63ff,#9b59f5)", color:"white",
            padding:"8px 16px", borderRadius:8, fontSize:13.5, fontWeight:600,
            textDecoration:"none", display:"inline-flex", alignItems:"center",
            boxShadow:"0 0 0 1px rgba(108,99,255,.3),0 4px 16px rgba(108,99,255,.25)",
            whiteSpace:"nowrap",
          }}>Apply Now →</Link>
        </div>
      </nav>

      <div className="lp">

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-badge"><div className="badge-dot" />Now accepting creator applications</div>
          <div className="hero-avs">
            {[["A","linear-gradient(135deg,#6c63ff,#9b59f5)"],["J","linear-gradient(135deg,#2dd4bf,#0891b2)"],["S","linear-gradient(135deg,#f472b6,#db2777)"],["R","linear-gradient(135deg,#fb923c,#ea580c)"],["+","linear-gradient(135deg,#a78bfa,#7c3aed)"]].map(([i,g]) => (
              <div key={i} className="av" style={{ background: g }}>{i}</div>
            ))}
            <span className="av-txt">Trusted by <strong>1,000+</strong> verified creators</span>
          </div>
          <h1>Where Fans Meet Creators<br /><span className="grad">Safely. Instantly. Fully.</span></h1>
          <p className="hero-sub">The premium platform for <strong>structured fan meets, calls &amp; dates</strong> — plus PPV content, locked messages, and exclusive content sales. You keep 100%. Always.</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => router.push("/auth/register")}>Become a Creator <span>→</span></button>
            <button className="btn-secondary" onClick={() => router.push("/")}>Explore as Fan</button>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><span>✓</span> 0% commission</div>
            <div className="trust-dot" />
            <div className="trust-item"><span>✓</span> Instant payouts</div>
            <div className="trust-dot" />
            <div className="trust-item"><span>✓</span> Verified in minutes</div>
            <div className="trust-dot" />
            <div className="trust-item"><span>✓</span> Fully protected</div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats">
          <div className="stat reveal"><div className="stat-n">100%</div><div className="stat-l">Earnings you keep</div></div>
          <div className="stat reveal d1"><div className="stat-n">0s</div><div className="stat-l">Payout delay</div></div>
          <div className="stat reveal d2"><div className="stat-n">1K+</div><div className="stat-l">Verified creators</div></div>
          <div className="stat reveal d3"><div className="stat-n">0</div><div className="stat-l">Chargebacks lost</div></div>
        </div>

        {/* OFFERINGS */}
        <div id="offerings">
          <div className="section">
            <div className="sec-eyebrow reveal">What You Can Offer</div>
            <div className="sec-title reveal d1">Your creativity,<br /><em>your offerings.</em></div>
            <div className="off-hero-card reveal d2">
              <div className="off-hero-left">
                <div className="off-tag tag-purple">⭐ Core Offering</div>
                <span className="off-icon">🤝</span>
                <div className="off-title">Structured Fan Meets &amp; Dates</div>
                <div className="off-desc">mmeko&apos;s flagship experience. Offer real-world meet-ups, virtual dates, and exclusive one-on-one time with your fans — structured, safe, and fully on your terms. Every booking is protected, every payment is instant.</div>
              </div>
              <div className="off-hero-right">
                <div className="off-feat-row"><div className="off-feat-icon fi-purple">📅</div><div><div className="off-feat-title">You set the schedule</div><div className="off-feat-desc">When, where, and how — total control over your availability</div></div></div>
                <div className="off-feat-row"><div className="off-feat-icon fi-teal">🛡</div><div><div className="off-feat-title">Structured safety</div><div className="off-feat-desc">Every interaction governed by mmeko&apos;s protection framework</div></div></div>
                <div className="off-feat-row"><div className="off-feat-icon fi-rose">💸</div><div><div className="off-feat-title">Instant payment on booking</div><div className="off-feat-desc">Funds secured the moment a fan books</div></div></div>
              </div>
            </div>
            <div className="off-grid">
              <div className="off-card reveal"><div className="off-tag tag-rose">📞 Video &amp; Voice</div><span className="off-icon">🎙</span><div className="off-title">Fan Calls</div><div className="off-desc">Book one-on-one video or voice calls with your fans. Set your rate, set your duration — mmeko handles scheduling, payment, and protection.</div><div className="off-card-ghost">02</div></div>
              <div className="off-card reveal d1"><div className="off-tag tag-teal">🎬 Content &amp; Messages</div><span className="off-icon">🔐</span><div className="off-title">Pay-Per-View &amp; Locked Messages</div><div className="off-desc">Gate your best content behind a paywall — single posts, collections, or even your replies. Fans pay to unlock individual pieces of content or locked messages. You earn instantly, zero commission.</div><div className="off-card-ghost">03</div></div>
              <div className="off-card reveal d2"><div className="off-tag tag-amber">✦ Premium</div><span className="off-icon">👑</span><div className="off-title">Exclusive Content Sales</div><div className="off-desc">Sell exclusive content directly to your fans — no subscription required. Each piece is purchased individually, giving fans flexibility and you full control over your premium catalogue.</div><div className="off-card-ghost">04</div></div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="section-alt" id="how">
          <div className="section">
            <div className="sec-eyebrow reveal">The Process</div>
            <div className="sec-title reveal d1">From sign-up to<br /><em>first booking.</em></div>
            <div className="steps-grid reveal d2">
              <div className="step"><div className="step-num">Step 01</div><div className="step-icon">✍️</div><div className="step-title">Apply &amp; Get Verified</div><div className="step-desc">Submit your application and get verified in under 10 minutes. Fast-track screening with premium creator status unlocked instantly.</div></div>
              <div className="step"><div className="step-num">Step 02</div><div className="step-icon">🎨</div><div className="step-title">Build Your Profile</div><div className="step-desc">Set up your creator page. Choose what you offer — meets, calls, PPV, locked messages, exclusive content — and set your own rates for each.</div></div>
              <div className="step"><div className="step-num">Step 03</div><div className="step-icon">☕</div><div className="step-title">Meet in Public, Safely</div><div className="step-desc">All fan meets happen in public venues — cafés, restaurants, parks. Every meet is capped at 30 minutes. All conversations stay on the mmeko platform.</div></div>
              <div className="step"><div className="step-num">Step 04</div><div className="step-icon">💸</div><div className="step-title">Fan Pays, You&apos;re Secured</div><div className="step-desc">When a fan books, payment is held securely by mmeko — locked in before you even show up. Once complete, funds release instantly. Guaranteed.</div></div>
            </div>
          </div>
        </div>

        {/* PAYMENT FLOW */}
        <div id="payments">
          <div className="section">
            <div className="sec-eyebrow reveal">How Payments Work</div>
            <div className="sec-title reveal d1">Your money is secured<br /><em>before you show up.</em></div>
            <div className="sec-subtitle reveal d2">We know payment transparency matters. Here&apos;s exactly how every booking works — no surprises, no fine print.</div>
            <div className="pay-grid reveal d2">
              <div className="pay-card"><div className="pay-num">1</div><div className="pay-icon-wrap">📅</div><div className="pay-title">Fan Books</div><div className="pay-desc">Fan pays upfront. mmeko holds the payment securely — the money is locked in and guaranteed.</div></div>
              <div className="pay-card"><div className="pay-num">2</div><div className="pay-icon-wrap">☕</div><div className="pay-title">Meet Happens</div><div className="pay-desc">You show up, connect in a public venue for up to 30 minutes. All chats stay on the mmeko platform.</div></div>
              <div className="pay-card"><div className="pay-num">3</div><div className="pay-icon-wrap">✅</div><div className="pay-title">Fan Confirms</div><div className="pay-desc">Fan marks the meet complete — payment releases instantly. 100% of it. No deductions whatsoever.</div></div>
              <div className="pay-card"><div className="pay-num">4</div><div className="pay-icon-wrap">⚡</div><div className="pay-title">You Get Paid</div><div className="pay-desc">Funds hit your wallet immediately. Support reviews any issues using your on-platform chat history.</div></div>
            </div>
            <div className="pay-callout reveal d3">
              <div className="pay-callout-icon">💡</div>
              <div><div className="pay-callout-title">What if the fan doesn&apos;t mark complete?</div><div className="pay-callout-desc">Don&apos;t worry — just contact mmeko Support directly through the platform. Our team reviews the situation using your on-platform chat history and releases your payment accordingly. We always have your back.</div></div>
            </div>
          </div>
        </div>

        {/* SAFETY */}
        <div className="section-alt" id="safety">
          <div className="section">
            <div className="sec-eyebrow reveal">Your Protection</div>
            <div className="sec-title reveal d1">Safety isn&apos;t a feature.<br /><em>It&apos;s the foundation.</em></div>
            <div className="safety-grid">
              <div className="safety-highlight reveal">
                <div><div className="safety-highlight-title">mmeko&apos;s Core Safety Rules</div><div className="safety-highlight-desc">Every fan meet on mmeko is governed by two non-negotiable rules designed to protect creators at all times. These aren&apos;t suggestions — they&apos;re enforced by the platform.</div>
                  <div className="safety-pills">
                    <div className="safety-pill"><div className="pill-check">✓</div> Max 30 minutes per meet</div>
                    <div className="safety-pill"><div className="pill-check">✓</div> Public venues only</div>
                    <div className="safety-pill"><div className="pill-check">✓</div> All chats on-platform</div>
                    <div className="safety-pill"><div className="pill-check">✓</div> Optional fan verification</div>
                  </div>
                </div>
              </div>
              <div className="safety-card reveal d1"><div className="safety-icon-wrap">⏱</div><div className="safety-title">30-Minute Maximum</div><div className="safety-desc">All fan meets are strictly capped at 30 minutes. This hard limit protects creators from pressure, overstay, and uncomfortable situations — boundaries are built into the platform itself.</div></div>
              <div className="safety-card reveal d2"><div className="safety-icon-wrap">☕</div><div className="safety-title">Public Spaces Only</div><div className="safety-desc">Every fan meet must take place in a public venue — cafés, restaurants, public parks. Private locations are never permitted. Your safety is non-negotiable.</div></div>
              <div className="safety-card reveal"><div className="safety-icon-wrap">💬</div><div className="safety-title">All Chats On-Platform</div><div className="safety-desc">Every conversation between creators and fans must happen through mmeko&apos;s built-in messaging. This keeps a full record of all interactions — protecting you if Support ever needs to review.</div></div>
              <div className="safety-card reveal d1"><div className="safety-icon-wrap">✅</div><div className="safety-title">Optional Fan Verification</div><div className="safety-desc">Creators can request fan verification before confirming a meet booking. While not mandatory, it&apos;s a powerful tool — verified fans give you extra confidence about who you&apos;re meeting in person.</div></div>
              <div className="safety-card reveal d2"><div className="safety-icon-wrap">🛡</div><div className="safety-title">Chargeback Protection</div><div className="safety-desc">Every transaction is fully covered. If a fan attempts a chargeback, mmeko absorbs the risk entirely — your earnings are never clawed back.</div></div>
              <div className="safety-card reveal"><div className="safety-icon-wrap">🌍</div><div className="safety-title">Geo-Blocking Controls</div><div className="safety-desc">Block any region or country from viewing your profile. Full privacy and location control, always on your terms.</div></div>
            </div>
          </div>
        </div>

        {/* COMPARISON */}
        <div id="compare">
          <div className="section">
            <div className="sec-eyebrow reveal">The Honest Truth</div>
            <div className="sec-title reveal d1">mmeko vs.<br /><em>everyone else.</em></div>
            <div className="cmp-wrap reveal d2">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th className="th-feature">Feature</th>
                    <th className="th-mmeko"><div className="th-mmeko-inner"><div className="th-badge">🏆 Best for Creators</div>mmeko</div></th>
                    <th className="th-other">OnlyFans / Others</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="td-feature">Structured Fan Meets &amp; Dates</td><td className="td-mmeko"><span className="ck">✓ Core feature</span></td><td className="td-other"><span className="cx">✗ Not offered</span></td></tr>
                  <tr><td className="td-feature">30-Min Meet Cap (Creator Safety)</td><td className="td-mmeko"><span className="ck">✓ Enforced</span></td><td className="td-other"><span className="cx">✗ Not applicable</span></td></tr>
                  <tr><td className="td-feature">Public Venue Requirement</td><td className="td-mmeko"><span className="ck">✓ Always</span></td><td className="td-other"><span className="cx">✗ Not applicable</span></td></tr>
                  <tr><td className="td-feature">All Chats On-Platform</td><td className="td-mmeko"><span className="ck">✓ Required</span></td><td className="td-other"><span className="cx">✗ Not enforced</span></td></tr>
                  <tr><td className="td-feature">Platform Commission</td><td className="td-mmeko"><span className="ck">0%</span></td><td className="td-other"><span className="cx">20%</span></td></tr>
                  <tr><td className="td-feature">Instant Payouts</td><td className="td-mmeko"><span className="ck">✓ Immediate</span></td><td className="td-other"><span className="cx">3–7 days</span></td></tr>
                  <tr><td className="td-feature">Fan Verification</td><td className="td-mmeko"><span className="ck">✓ Optional</span></td><td className="td-other"><span className="cx">✗</span></td></tr>
                  <tr><td className="td-feature">Locked Message Replies (PPV)</td><td className="td-mmeko"><span className="ck">✓ Built in</span></td><td className="td-other"><span className="cx">✗ Not offered</span></td></tr>
                  <tr><td className="td-feature">Exclusive Content Sales (Individual)</td><td className="td-mmeko"><span className="ck">✓</span></td><td className="td-other"><span className="cm">Subscription only</span></td></tr>
                  <tr><td className="td-feature">Chargeback Protection</td><td className="td-mmeko"><span className="ck">✓ Fully covered</span></td><td className="td-other"><span className="cx">Creator&apos;s risk</span></td></tr>
                  <tr><td className="td-feature">Video / Voice Fan Calls</td><td className="td-mmeko"><span className="ck">✓ Built in</span></td><td className="td-other"><span className="cm">Limited / third-party</span></td></tr>
                  <tr><td className="td-feature">Geo-Blocking</td><td className="td-mmeko"><span className="ck">✓ Full control</span></td><td className="td-other"><span className="cm">Limited</span></td></tr>
                  <tr><td className="td-feature">Verification Speed</td><td className="td-mmeko"><span className="ck">&lt; 10 minutes</span></td><td className="td-other"><span className="cm">3–7 days</span></td></tr>
                  <tr><td className="td-feature">Minimum Payout</td><td className="td-mmeko"><span className="ck">$0</span></td><td className="td-other"><span className="cm">$20–$100</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
      {/* <div className="section-alt">
          <div className="section">
            <div className="sec-eyebrow reveal">Creator Stories</div>
            <div className="sec-title reveal d1">What creators<br /><em>are saying.</em></div>
            <div className="test-grid">
              <div className="test-card reveal">
                <div className="test-top"><div className="test-av" style={{ background:"linear-gradient(135deg,#6c63ff,#9b59f5)" }}>A<span className="test-verified">✓</span></div><div><div className="test-name">Alicia M.</div><div className="test-niche">Fitness &amp; Lifestyle</div></div></div>
                <div className="test-quote">I switched from OnlyFans and made back my full month&apos;s earnings in week one — without giving up a single cent. The meet booking system alone changed everything.</div>
                <div className="test-footer"><div className="test-stats"><div><div className="test-stat-n">$12K</div><div className="test-stat-l">Monthly</div></div><div><div className="test-stat-n">2.4K</div><div className="test-stat-l">Fans</div></div></div><div className="test-offer">🤝 Fan Meets</div></div>
              </div>
              <div className="test-card reveal d1">
                <div className="test-top"><div className="test-av" style={{ background:"linear-gradient(135deg,#2dd4bf,#0891b2)" }}>J<span className="test-verified">✓</span></div><div><div className="test-name">Jordan K.</div><div className="test-niche">Music &amp; Entertainment</div></div></div>
                <div className="test-quote">The instant payout is real — I booked a fan call on a Monday and had the money in my wallet by the time the call ended. I&apos;ve never experienced that anywhere else.</div>
                <div className="test-footer"><div className="test-stats"><div><div className="test-stat-n">$8.5K</div><div className="test-stat-l">Monthly</div></div><div><div className="test-stat-n">1.1K</div><div className="test-stat-l">Fans</div></div></div><div className="test-offer">🎙 Fan Calls</div></div>
              </div>
              <div className="test-card reveal d2">
                <div className="test-top"><div className="test-av" style={{ background:"linear-gradient(135deg,#f472b6,#db2777)" }}>S<span className="test-verified">✓</span></div><div><div className="test-name">Sofia R.</div><div className="test-niche">Art &amp; Content</div></div></div>
                <div className="test-quote">The 30-minute rule and public-only venues weren&apos;t a limitation — they were the reason I felt safe enough to even try fan meets. It&apos;s the structure I didn&apos;t know I needed.</div>
                <div className="test-footer"><div className="test-stats"><div><div className="test-stat-n">$19K</div><div className="test-stat-l">Monthly</div></div><div><div className="test-stat-n">4.7K</div><div className="test-stat-l">Fans</div></div></div><div className="test-offer">🔐 PPV + Locked DMs</div></div>
              </div>
            </div>
          </div>
        </div>*/}

        {/* FAQ */}
        <FAQSection />

        {/* FINAL CTA */}
        <div className="final-cta reveal">
          <div className="final-eyebrow">Ready when you are</div>
          <h2 className="final-h">Your connections.<br /><em>Your rules.</em></h2>
          <p className="final-sub">Join creators who are building real, meaningful fan relationships — safely, instantly, and on their own terms.</p>
          <div className="final-ctas">
            <button className="btn-primary" onClick={() => router.push("/auth/register")}>Apply as Creator →</button>
            <button className="btn-secondary" onClick={() => router.push("/")}>Explore as Fan</button>
          </div>
          <div className="final-trust">
            <div className="ft-item"><div className="ft-icon">✓</div> Fully protected</div>
            <div className="ft-item"><div className="ft-icon">✓</div> Verified in minutes</div>
            <div className="ft-item"><div className="ft-icon">✓</div> 0% commission</div>
            <div className="ft-item"><div className="ft-icon">✓</div> Global payouts</div>
            <div className="ft-item"><div className="ft-icon">✓</div> Safe connections</div>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-left">
            <Link href="/" className="logo" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
              <div className="logo-icon" style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#6c63ff,#9b59f5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white" }}>M</div>
              <span className="logo-name" style={{ fontSize:16, fontWeight:700, color:"#f1f5f9" }}>mmeko</span>
            </Link>
            <span className="footer-copy">© {new Date().getFullYear()} mmeko.com — All rights reserved</span>
          </div>
          <div className="footer-links">
            <Link href="/safety">Safety</Link>
            <Link href="/auth/privacy-policy">Privacy</Link>
            <Link href="/T_&_C">Terms</Link>
            <Link href="/support">Support</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </footer>

      </div>
    </>
  );
}