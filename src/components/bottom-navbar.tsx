"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Navapp from "@/navs/NavApp";
import MenuProvider from "@/lib/context/MenuContext";
import OpenMobileMenuBtn from "./OpenMobileMenuBtn";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getmsgnitify, getmessagenotication } from "@/store/messageSlice";
import { getNotifications } from "@/store/profile";
import { getSocket } from "@/lib/socket";
import { useNotificationIndicator } from "@/hooks/useNotificationIndicator";


const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
      stroke={active ? "#6c63ff" : "#64748b"}
      strokeWidth="2" strokeLinejoin="round"
      fill={active ? "rgba(108,99,255,0.12)" : "none"}
    />
  </svg>
);

const BellIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={active ? "#6c63ff" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke={active ? "#6c63ff" : "#64748b"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const AnyaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="13" width="16" height="3" rx="1.5" fill="white" opacity="0.4"/>
    <rect x="4" y="17" width="16" height="3" rx="1.5" fill="white" opacity="0.65"/>
    <path d="M12 2C12 2 9 5.5 9 8C9 9.657 10.343 11 12 11C13.657 11 15 9.657 15 8C15 5.5 12 2 12 2Z" fill="white"/>
    <path d="M12 6C12 6 10.5 7.5 10.5 8.5C10.5 9.328 11.172 10 12 10C12.828 10 13.5 9.328 13.5 8.5C13.5 7.5 12 6 12 6Z" fill="rgba(108,99,255,0.6)"/>
  </svg>
);

const MsgIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={active ? "#6c63ff" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? "#6c63ff" : "#64748b"} strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? "#6c63ff" : "#64748b"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);


function Badge({ count }: { count: number }) {
  return (
    <div className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] border-2 border-[#111827] flex items-center justify-center px-1 shadow-[0_2px_8px_rgba(108,99,255,0.4)] z-10">
      <span className="text-white font-bold leading-none" style={{ fontSize: 9 }}>
        {count > 9 ? "9+" : count}
      </span>
    </div>
  );
}


export default function BottomNavBar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const msgnotifystatus = useSelector((s: RootState) => s.message.msgnotifystatus);
  const notifications_stats = useSelector((s: RootState) => s.profile.notifications_stats);
  const recentmsg = useSelector((s: RootState) => s.message.recentmsg);
  const msgnitocations = useSelector((s: RootState) => s.message.msgnitocations);
  const mymessagenotifystatus = useSelector((s: RootState) => s.message.mymessagenotifystatus);

  const [localUserData, setLocalUserData] = React.useState({ userid: "", token: "" });
  const [showAnyaBadge, setShowAnyaBadge] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const d = JSON.parse(raw);
        setLocalUserData({ userid: d?.userID || d?.userid || d?.id || "", token: d?.refreshtoken || d?.accesstoken || "" });
      }
    } catch {}
  }, []);

  const finalUserid = userid || localUserData.userid;
  const finalToken = token || localUserData.token;
  const { hasUnread: hasUnreadNotifications, unreadCount: unreadNotificationCount } = useNotificationIndicator();

 
  const checkForNewStory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ai-story/stories`);
      if (!res.ok) return false;
      const data = await res.json();
      const latest = data.stories?.[0];
      if (!latest?.createdAt) return false;
      const storyTime = new Date(latest.createdAt).getTime();
      const lastVisit = localStorage.getItem("anya_last_visit_timestamp");
      return !lastVisit || storyTime > parseInt(lastVisit, 10);
    } catch { return false; }
  };

  const handleAnyaClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("anya_previous_path", window.location.pathname);
      localStorage.setItem("anya_last_visit_timestamp", Date.now().toString());
      setShowGlow(false);
      setShowAnyaBadge(false);
    }
  };

  useEffect(() => {
    checkForNewStory().then(setShowAnyaBadge);
    const t = setInterval(() => checkForNewStory().then(setShowAnyaBadge), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!showAnyaBadge) return;
    setShowGlow(true);
    const off = setTimeout(() => setShowGlow(false), 3000);
    const iv = setInterval(() => { setShowGlow(true); setTimeout(() => setShowGlow(false), 3000); }, 12000);
    return () => { clearTimeout(off); clearInterval(iv); };
  }, [showAnyaBadge]);

  useEffect(() => { if (finalUserid && finalToken && msgnotifystatus === "idle") dispatch(getmsgnitify({ userid: finalUserid, token: finalToken })); }, [finalUserid, finalToken, msgnotifystatus, dispatch]);
  useEffect(() => { if (finalUserid && finalToken && mymessagenotifystatus === "idle") dispatch(getmessagenotication({ userid: finalUserid, token: finalToken })); }, [finalUserid, finalToken, mymessagenotifystatus, dispatch]);
  useEffect(() => { if (finalUserid && finalToken) { dispatch(getmsgnitify({ userid: finalUserid, token: finalToken })); dispatch(getmessagenotication({ userid: finalUserid, token: finalToken })); } }, [finalUserid, finalToken, dispatch]);
  useEffect(() => { if (finalUserid && finalToken && notifications_stats === "idle") dispatch(getNotifications({ userid: finalUserid, token: finalToken })); }, [finalUserid, finalToken, notifications_stats, dispatch]);
  useEffect(() => { if (finalUserid && finalToken) dispatch(getNotifications({ userid: finalUserid, token: finalToken })); }, [finalUserid, finalToken, dispatch]);
  useEffect(() => {
    if (!finalUserid || !finalToken) return;
    const t = setTimeout(() => { dispatch(getmsgnitify({ userid: finalUserid, token: finalToken })); dispatch(getmessagenotication({ userid: finalUserid, token: finalToken })); }, 1000);
    return () => clearTimeout(t);
  }, [finalUserid, finalToken, dispatch]);
  useEffect(() => {
    if (!finalUserid) return;
    const socket = getSocket();
    if (!socket) {
      const iv = setInterval(() => { if (finalUserid && finalToken) { dispatch(getmsgnitify({ userid: finalUserid, token: finalToken })); dispatch(getmessagenotication({ userid: finalUserid, token: finalToken })); } }, 10000);
      return () => clearInterval(iv);
    }
    const refresh = () => { if (finalUserid && finalToken) { dispatch(getmsgnitify({ userid: finalUserid, token: finalToken })); dispatch(getmessagenotication({ userid: finalUserid, token: finalToken })); } };
    socket.on("new_message", refresh); socket.on("message_read", refresh); socket.on("message_status_update", refresh);
    return () => { socket.off("new_message", refresh); socket.off("message_read", refresh); socket.off("message_status_update", refresh); };
  }, [finalUserid, finalToken, dispatch]);

  const totalUnreadCount = React.useMemo(() => {
    let t = 0;
    if (Array.isArray(recentmsg)) t += recentmsg.reduce((s, m) => s + (m.unreadCount || 0), 0);
    if (Array.isArray(msgnitocations)) t += msgnitocations.reduce((s, m) => s + (m.messagecount || 0), 0);
    return t;
  }, [recentmsg, msgnitocations]);


  const items = [
    { route: "/",             label: "Home",          icon: (a: boolean) => <HomeIcon active={a} /> },
    { route: "/notifications", label: "Activity",     icon: (a: boolean) => <BellIcon active={a} />, badge: hasUnreadNotifications ? unreadNotificationCount : 0 },
    { route: "/anya",         label: "Anya",          icon: () => <AnyaIcon />, isCenter: true, onClickExtra: handleAnyaClick },
    { route: "/message",      label: "Messages",      icon: (a: boolean) => <MsgIcon active={a} />, badge: totalUnreadCount },
    { route: "/profile",      label: "Profile",       icon: (a: boolean) => <ProfileIcon active={a} /> },
  ];

  return (
    <MenuProvider>
      <div className="h-fit mr-6 mt-4 max-[600px]:m-0 fixed right-0 max-[600px]:bottom-1 max-[600px]:w-full z-50">
        <div
          className="w-[25rem] mx-auto max-[600px]:w-[90%] max-[500px]:w-[93%] rounded-2xl px-3 pt-3 pb-2 flex justify-between items-end"
          style={{ background: "rgba(8,11,20,0.97)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          {items.map((item) => {
            const active = pathname === item.route;
            const isAnya = item.isCenter;

            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={item.onClickExtra}
                className="flex flex-col items-center gap-1 relative group"
                style={{ minWidth: 44, padding: "4px 8px", borderRadius: 12 }}
              >
                {isAnya ? (
                  <div className="relative">
                    {showGlow && showAnyaBadge && (
                      <div className="absolute inset-0 animate-pulse rounded-xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/70 via-pink-500/40 to-transparent rounded-xl blur-xl" />
                      </div>
                    )}
                    <div
                      className="flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_6px_20px_rgba(108,99,255,0.55)] group-hover:-translate-y-0.5"
                      style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: "linear-gradient(135deg,#6c63ff,#9b59f5)",
                        boxShadow: "0 4px 16px rgba(108,99,255,0.4)",
                        marginTop: -10,
                      }}
                    >
                      <AnyaIcon />
                    </div>
                    {showAnyaBadge && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce z-20">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg" style={{ fontSize: 9 }}>✨ NEW</div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-pink-600" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {item.icon(active)}
                    {!!item.badge && item.badge > 0 && <Badge count={item.badge} />}
                  </div>
                )}

                <span
                  className="transition-colors duration-200 leading-none"
                  style={{
                    fontSize: 9.5, fontWeight: 600, letterSpacing: "0.01em",
                    color: active ? "#6c63ff" : isAnya ? "#94a3b8" : "#64748b",
                  }}
                >
                  {item.label}
                </span>

                {active && !isAnya && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6c63ff]" />
                )}
              </Link>
            );
          })}

          <div className="max-[600px]:-top-0 max-[600px]:fixed"><Navapp /></div>
          <div className="max-[600px]:block hidden"><OpenMobileMenuBtn /></div>
        </div>
      </div>
    </MenuProvider>
  );
}