/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useRef, useEffect } from "react";
import "./Navs.css";
import { useRouter } from "next/navigation";
import MenuIconImg from "@/components/MenuIcon-img";
import { useMenuContext } from "@/lib/context/MenuContext";
import Profile from "@/components/Profile";
import { FaCoins, FaAngleRight, FaAngleDown } from "react-icons/fa";
import handleLogout from "@/lib/service/logout";
import { useUserId } from "@/lib/hooks/useUserId";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getprofile } from "@/store/profile";
import { checkVipStatus } from "@/store/vip";
import { createPortal } from "react-dom";

const Sidemenu = () => {
  const [minimize, setMinimize] = useState(false);
  const [mounted, setMounted] = React.useState(false);
React.useEffect(() => { setMounted(true); }, []);

  const userId = useUserId();
  const router = useRouter();
  const { open, toggleMenu: handleMenubar } = useMenuContext();
  const dispatch = useDispatch<AppDispatch>();
  const menuRef = useRef<HTMLDivElement>(null);

  const profile = useSelector((state: RootState) => state.profile);
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const [currentUserId, setCurrentUserId] = React.useState(reduxUserId || "");
  const vipStatus = useSelector((state: RootState) => state.vip.vipStatus);
  const isVip = vipStatus?.isVip || false;
  const vipEndDate = vipStatus?.vipEndDate;
  

  React.useEffect(() => {
    if (!reduxUserId && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.userID) setCurrentUserId(data.userID);
        }
      } catch (error) {
        console.error("Error getting userID from localStorage:", error);
      }
    } else if (reduxUserId) {
      setCurrentUserId(reduxUserId);
    }
  }, [reduxUserId]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleMenubar();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleMenubar]);

  React.useEffect(() => {
    if (currentUserId && (!profile.firstname || profile.status === "idle")) {
      let token: string | undefined;
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          token = data?.refreshtoken || data?.accesstoken;
        }
      } catch (error) {
        console.error("Error getting token for side menu:", error);
      }
      if (token) {
        dispatch(getprofile({ userid: currentUserId, token }));
        dispatch(checkVipStatus(currentUserId));
      }
    }
  }, [currentUserId, profile.firstname, profile.status, dispatch]);

  React.useEffect(() => {
    const isEdge = navigator.userAgent.includes("Edg");
    const isCurrentUserProfile = profile.userId === currentUserId;
    if (isEdge && currentUserId && (!profile.firstname || !isCurrentUserProfile)) {
      let token: string | undefined;
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          token = data?.refreshtoken || data?.accesstoken;
        }
      } catch (error) {
        console.error("Error getting token for Edge fallback:", error);
      }
      if (token) {
        setTimeout(() => {
          dispatch(getprofile({ userid: currentUserId, token }));
        }, 100);
      }
    }
  }, [currentUserId, profile.firstname, profile.userId, dispatch]);

  if (!profile || Object.keys(profile).length === 0 || !profile.firstname) {
    return null;
  }

  const isCurrentUserProfile = profile.userId === currentUserId;
  const isFanVerified = (profile as any).fan_verified === true;

  let firstname = "User";
  let lastname = "";
  let gold_balance = 0;
  let pending_balance = 0;
  let admin = false;
  let verified = false;

  if (isCurrentUserProfile && profile?.firstname) {
    firstname = profile.firstname;
    lastname = profile.lastname || "";
    gold_balance = Number(profile.balance) || 0;
    pending_balance = Number(profile.pending) || 0;
    admin = profile.admin || false;
    verified = profile.creator_verified || false;
  } else {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.firstname && data?.userID === currentUserId) {
            firstname = data.firstname;
            lastname = data.lastname || "";
          }
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage in Sidemenu:", error);
    }
  }

  const isFanVerifiedCheck = (profile as any).fan_verified === true;

 const getCreatorButton = () => {
  if (profile.creator_portfolio_id) {
    return (
      <div className="sb-item" onClick={() => { router.push(`/creators/${profile.creator_portfolio_id}`); handleMenubar(); }}>
        <div className="si-icon ic-p">🎬</div>
        <div><div className="si-label">My Portfolio</div><div className="si-sub">View your creator page</div></div>
        <div className="si-arr">›</div>
      </div>
    );
  }
  if (profile.creator_verified) {
    return (
      <div className="sb-item" onClick={() => { router.push("/creator/create"); handleMenubar(); }}>
        <div className="si-icon ic-p">➕</div>
        <div><div className="si-label">Create Portfolio</div><div className="si-sub">Set up your creator page</div></div>
        <div className="si-arr">›</div>
      </div>
    );
  }
  if (!isFanVerifiedCheck) {
    return (
      <div className="sb-item" onClick={() => { router.push("/be-a-creator/apply"); handleMenubar(); }}>
        <div className="si-icon ic-p">✦</div>
        <div><div className="si-label">Become a Creator</div><div className="si-sub">Start accepting fan requests</div></div>
        <div className="si-arr">›</div>
      </div>
    );
  }
  return null;
};
  const fullName = `${firstname} ${lastname}`.trim();
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase() || "?";
  const username = profile?.username || "";

  if (!mounted) return null; // prevent SSR issues

  return (
    <>
     {createPortal(
       <>
      <style>{`
        .sb-overlay{position:fixed;inset:0;z-index:90;background:transparent;pointer-events:none;transition:background .3s;}
        .sb-overlay.open{background:rgba(0,0,0,.65);pointer-events:all;backdrop-filter:blur(2px);}
        .new-sidebar{position:fixed;top:0;right:0;width:82%;max-width:300px;height:100%;z-index:100;background:#0d1120;border-left:1px solid rgba(255,255,255,0.08);transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow:hidden;}
        .new-sidebar.open{transform:translateX(0);}
        .sb-topline{height:2px;width:100%;flex-shrink:0;background:linear-gradient(90deg,#6c63ff,#9b59f5,#2dd4bf);}
        .sb-body{flex:1;overflow-y:auto;overflow-x:hidden;}
        .sb-body::-webkit-scrollbar{width:3px;}
        .sb-body::-webkit-scrollbar-thumb{background:#161b2e;border-radius:3px;}
        .sb-head{padding:20px 18px 16px;}
        .sb-greeting{font-size:10.5px;font-weight:600;color:#475569;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;}
        .sb-user{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
        .sb-av{width:50px;height:50px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#334155,#1e293b);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#94a3b8;border:2px solid rgba(108,99,255,.3);overflow:hidden;cursor:pointer;}
        .sb-av img{width:100%;height:100%;object-fit:cover;}
        .sb-uname{font-size:15px;font-weight:800;letter-spacing:-.01em;margin-bottom:4px;color:#f1f5f9;}
        .sb-tier{display:inline-flex;align-items:center;gap:4px;background:rgba(108,99,255,.12);border:1px solid rgba(108,99,255,.22);border-radius:5px;padding:2px 8px;font-size:9.5px;font-weight:700;color:#a89cff;letter-spacing:.02em;margin-bottom:3px;}
        .sb-handle{font-size:11px;color:#475569;}
        .gold-card{margin:0 18px 12px;background:#131a2e;border:1px solid rgba(245,158,11,.25);border-radius:12px;padding:14px 16px;}
        .gc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .gc-lbl{font-size:10px;font-weight:700;color:#b45309;letter-spacing:.08em;text-transform:uppercase;}
        .gc-ico{width:28px;height:28px;border-radius:7px;background:rgba(245,158,11,.15);display:flex;align-items:center;justify-content:center;font-size:14px;}
        .gc-val{font-size:24px;font-weight:800;color:#fbbf24;letter-spacing:-.02em;line-height:1;margin-bottom:3px;}
        .gc-val sub{font-size:12px;font-weight:600;color:#92400e;vertical-align:baseline;margin-left:3px;}
        .gc-usd{font-size:11px;color:#475569;}
        .gc-pending{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:rgba(245,158,11,.6);font-weight:500;}
        .gc-pending strong{color:#f59e0b;font-weight:700;}
        .gc-pending-dot{width:6px;height:6px;border-radius:50%;background:#f59e0b;box-shadow:0 0 5px #f59e0b;flex-shrink:0;animation:pendBlink 2s ease-in-out infinite;}
        @keyframes pendBlink{0%,100%{opacity:1;}50%{opacity:.3;}}
        .gc-bar{height:3px;background:rgba(245,158,11,.12);border-radius:2px;margin-top:12px;overflow:hidden;}
        .gc-bar-fill{height:100%;width:65%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:2px;}
        .btn-getgold{display:flex;align-items:center;justify-content:center;gap:8px;width:calc(100% - 36px);margin:0 18px 8px;padding:12px;border-radius:10px;background:linear-gradient(135deg,#d97706,#f59e0b);border:none;color:#fff;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 3px 14px rgba(245,158,11,.25);transition:all .2s;}
        .btn-getgold:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(245,158,11,.4);}
        .btn-upgrade{display:flex;align-items:center;justify-content:center;gap:7px;width:calc(100% - 36px);margin:0 18px 4px;padding:10px;border-radius:10px;background:transparent;border:1px solid rgba(108,99,255,.3);color:#a89cff;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .2s;}
        .btn-upgrade:hover{background:rgba(108,99,255,.1);}
        .sb-div{height:1px;background:rgba(255,255,255,0.08);margin:14px 18px;}
        .sb-sec{font-size:10px;font-weight:700;color:#475569;letter-spacing:.12em;text-transform:uppercase;padding:0 18px;margin-bottom:6px;}
        .sb-menu{padding:0 10px;display:flex;flex-direction:column;gap:1px;}
        .sb-item{display:flex;align-items:center;gap:11px;padding:11px 10px;border-radius:10px;color:#94a3b8;transition:all .2s;border:1px solid transparent;cursor:pointer;text-decoration:none;}
        .sb-item:hover{background:rgba(255,255,255,.05);color:#f1f5f9;border-color:rgba(255,255,255,.05);}
        .si-icon{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;}
        .ic-p{background:rgba(108,99,255,.14);} .ic-r{background:rgba(244,114,182,.1);} .ic-t{background:rgba(45,212,191,.1);} .ic-g{background:rgba(245,158,11,.1);} .ic-gr{background:rgba(34,197,94,.1);} .ic-b{background:rgba(59,130,246,.1);} .ic-s{background:rgba(71,85,105,.15);}
        .si-label{font-size:13px;font-weight:600;flex:1;color:inherit;}
        .si-sub{font-size:10.5px;color:#475569;margin-top:1px;}
        .si-badge{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.2);color:#ef4444;font-size:9px;font-weight:700;padding:2px 7px;border-radius:100px;flex-shrink:0;}
        .si-arr{color:#475569;font-size:13px;opacity:0;transition:opacity .15s;margin-left:auto;}
        .sb-item:hover .si-arr{opacity:1;}
        .sb-logout{display:flex;align-items:center;gap:11px;margin:6px 10px 0;padding:11px 10px;border-radius:10px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.1);color:#ef4444;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;width:calc(100% - 20px);}
        .sb-logout:hover{background:rgba(239,68,68,.12);}
        .lo-icon{width:34px;height:34px;border-radius:9px;background:rgba(239,68,68,.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
        .sb-ver{text-align:center;font-size:10px;color:#475569;padding:18px 0 24px;letter-spacing:.04em;}
      `}</style>

     {/* Backdrop */}
 <div
          className={open ? "sb-overlay open" : "sb-overlay"}
          onClick={() => handleMenubar()}
        />

         {/* Sidebar panel */}
        <nav ref={menuRef} className={open ? "new-sidebar open" : "new-sidebar"}>
      
        <div className="sb-topline" />
        <div className="sb-body">

          {/* Profile */}
          <div className="sb-head">
            <div className="sb-greeting">Welcome back</div>
            <div className="sb-user">
              <div
                className="sb-av"
                onClick={() => { router.push(`/${profile?.username || userId}`); handleMenubar(); }}
              >
                {profile.photolink ? (
                  <img src={profile.photolink} alt={fullName} />
                ) : initials}
              </div>
              <div>
                <div className="sb-uname">{fullName}</div>
                <div className="sb-tier">{isVip ? "⭐ VIP Member" : "⭐ Basic Member"}</div>
                <div className="sb-handle">{username}</div>
              </div>
            </div>
          </div>

          {/* Gold Card */}
          <div className="gold-card">
            <div className="gc-header">
              <div className="gc-lbl">Gold Balance</div>
              <div className="gc-ico">🪙</div>
            </div>
            <div className="gc-val">{gold_balance.toLocaleString()} <sub>GOLD</sub></div>
            <div className="gc-usd">≈ ${(gold_balance * 0.04).toFixed(2)} USD</div>
            {pending_balance > 0 && (
              <div className="gc-pending">
                <div className="gc-pending-dot" />
                <span>Pending: <strong>{pending_balance.toLocaleString()} GOLD</strong></span>
              </div>
            )}
            <div className="gc-bar"><div className="gc-bar-fill" /></div>
          </div>

          <button className="btn-getgold" onClick={() => { router.push("/buy-gold"); handleMenubar(); }}>🪙 Get More Gold</button>
          <button className="btn-upgrade" onClick={() => { router.push("/vip"); handleMenubar(); }}>✦ Upgrade Account</button>

          <div className="sb-div" />

          {/* My Account */}
          <div className="sb-sec">My Account</div>
          <div className="sb-menu">
            <div className="sb-item" onClick={() => { router.push(`/${profile?.username || userId}`); handleMenubar(); }}>
              <div className="si-icon ic-p">👤</div>
              <div><div className="si-label">My Profile</div><div className="si-sub">View and edit your profile</div></div>
              <div className="si-arr">›</div>
            </div>
            <div className="sb-item" onClick={() => { router.push("/following"); handleMenubar(); }}>
              <div className="si-icon ic-r">❤️</div>
              <div><div className="si-label">Following</div><div className="si-sub">Creators you follow</div></div>
              <div className="si-arr">›</div>
            </div>
            <div className="sb-item" onClick={() => { router.push("/collections"); handleMenubar(); }}>
              <div className="si-icon ic-t">🖼️</div>
              <div><div className="si-label">Collections</div><div className="si-sub">Your saved content</div></div>
              <div className="si-arr">›</div>
            </div>
            <div className="sb-item" onClick={() => { router.push("/goldstat/history"); handleMenubar(); }}>
              <div className="si-icon ic-g">💸</div>
              <div><div className="si-label">My Earnings</div><div className="si-sub">Payouts and transactions</div></div>
              <div className="si-arr">›</div>
            </div>
          </div>

          <div className="sb-div" />

        {/* Creator */}
<div className="sb-sec">Creator</div>
<div className="sb-menu">
  {getCreatorButton()}
  <div className="sb-item" onClick={() => { router.push("/ritual/upload"); handleMenubar(); }}>
    <div className="si-icon ic-gr">🔥</div>
    <div><div className="si-label">Upload Ritual</div><div className="si-sub">Post your daily 15-panel story</div></div>
    <div className="si-arr">›</div>
  </div>
</div>

          <div className="sb-div" />

          {/* More */}
          <div className="sb-sec">More</div>
          <div className="sb-menu">
         <div className="sb-item" onClick={() => { router.push("/change-log"); handleMenubar(); }}>
  <div className="si-icon ic-b">✨</div>
  <div><div className="si-label">What&apos;s New</div><div className="si-sub">Latest features and updates</div></div>
  <span className="si-badge">NEW</span>
</div>
<div className="sb-item" onClick={() => { router.push("/settings"); handleMenubar(); }}>
  <div className="si-icon ic-s">⚙️</div>
  <div><div className="si-label">Settings</div><div className="si-sub">Account and preferences</div></div>
  <div className="si-arr">›</div>
</div>
<div className="sb-item" onClick={() => { router.push("/support"); handleMenubar(); }}>
  <div className="si-icon ic-s">🛡️</div>
  <div><div className="si-label">Safety &amp; Support</div><div className="si-sub">Help centre and guidelines</div></div>
  <div className="si-arr">›</div>
</div>
            {admin && (
              <div className="sb-item" onClick={() => { router.push("/mmeko/admin"); handleMenubar(); }}>
                <div className="si-icon ic-s">🔧</div>
                <div><div className="si-label">Admin</div><div className="si-sub">Platform management</div></div>
                <div className="si-arr">›</div>
              </div>
            )}
          </div>

          <div className="sb-div" />

          <button
            className="sb-logout"
            onClick={async () => {
              try {
                localStorage.clear();
                await handleLogout();
              } catch (error) {
                console.error(error);
              } finally {
                if (typeof window !== "undefined") window.location.reload();
              }
            }}
          >
            <div className="lo-icon">🚪</div>
            Log Out
          </button>

          <div className="sb-ver">mmeko · All rights reserved</div>

        </div>
      </nav>
  </>,
  document.body
  )}
 </>
  );
};

export default Sidemenu;