"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navapp from "@/navs/NavApp";
import MenuProvider from "@/lib/context/MenuContext";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getmsgnitify, getmessagenotication } from "@/store/messageSlice";
import { getNotifications } from "@/store/profile";
import { getSocket } from "@/lib/socket";
import { useNotificationIndicator } from "@/hooks/useNotificationIndicator";
import { useMenuContext } from "@/lib/context/MenuContext";

// ── Profile Avatar Button (replaces OpenMobileMenuBtn) ──────────────────────
function ProfileMenuBtn() {
  const { toggleMenu } = useMenuContext();

const reduxAvatar = useSelector(
  (state: RootState) =>
    (state.register as unknown as Record<string, unknown>)?.avatar as string | undefined
);
const reduxName = useSelector(
  (state: RootState) =>
    (state.register as unknown as Record<string, unknown>)?.username as string | undefined
);

  const [avatar, setAvatar] = useState<string>("");
  const [initials, setInitials] = useState<string>("U");

  useEffect(() => {
    // Prefer Redux data
    if (reduxAvatar) {
      setAvatar(reduxAvatar);
    }
    if (reduxName) {
      setInitials(reduxName.slice(0, 2).toUpperCase());
    }

    // Fallback: localStorage
    if (!reduxAvatar && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          const localAvatar =
            data?.avatar || data?.profileImage || data?.photo || "";
          const localName =
            data?.username || data?.name || data?.fullname || "";
          if (localAvatar) setAvatar(localAvatar);
          if (localName) setInitials(localName.slice(0, 2).toUpperCase());
        }
      } catch {
        // silent
      }
    }
  }, [reduxAvatar, reduxName]);

  return (
  <button
    onClick={toggleMenu}
    className="flex flex-col items-center gap-1 relative px-3 py-1 rounded-xl border-none bg-transparent cursor-pointer hover:bg-white/[0.04] transition-all duration-200"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-[9.5px] font-semibold text-[#64748b] whitespace-nowrap">
      Profile
    </span>
  </button>
);
}

// ── Inner nav (uses context so must be inside MenuProvider) ──────────────────
function BottomNavBarInner() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { toggleMenu } = useMenuContext();

  // ── Auth data ──────────────────────────────────────────────────────────────
  const userid = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const msgnotifystatus = useSelector(
    (state: RootState) => state.message.msgnotifystatus
  );
  const notifications_stats = useSelector(
    (state: RootState) => state.profile.notifications_stats
  );
  const recentmsg = useSelector((state: RootState) => state.message.recentmsg);
  const msgnitocations = useSelector(
    (state: RootState) => state.message.msgnitocations
  );
  const mymessagenotifystatus = useSelector(
    (state: RootState) => state.message.mymessagenotifystatus
  );

  const [localUserData, setLocalUserData] = useState<{
    userid: string;
    token: string;
  }>({ userid: "", token: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          const localUserid =
            data?.userID || data?.userid || data?.id || "";
          const localToken =
            data?.refreshtoken || data?.accesstoken || "";
          if (localUserid && localToken)
            setLocalUserData({ userid: localUserid, token: localToken });
        }
      } catch {
        // silent
      }
    }
  }, []);

  const finalUserid = userid || localUserData.userid;
  const finalToken = token || localUserData.token;

  const { hasUnread: hasUnreadNotifications, unreadCount: unreadNotificationCount } =
    useNotificationIndicator();

  // ── Fetch notifications & messages ────────────────────────────────────────
  useEffect(() => {
    if (finalUserid && finalToken && msgnotifystatus === "idle")
      dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
  }, [finalUserid, finalToken, msgnotifystatus, dispatch]);

  useEffect(() => {
    if (finalUserid && finalToken && mymessagenotifystatus === "idle")
      dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
  }, [finalUserid, finalToken, mymessagenotifystatus, dispatch]);

  useEffect(() => {
    if (finalUserid && finalToken) {
      dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
      dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
    }
  }, [finalUserid, finalToken, dispatch]);

  useEffect(() => {
    if (finalUserid && finalToken && notifications_stats === "idle")
      dispatch(getNotifications({ userid: finalUserid, token: finalToken }));
  }, [finalUserid, finalToken, notifications_stats, dispatch]);

  useEffect(() => {
    if (finalUserid && finalToken)
      dispatch(getNotifications({ userid: finalUserid, token: finalToken }));
  }, [finalUserid, finalToken, dispatch]);

  useEffect(() => {
    if (!finalUserid || !finalToken) return;
    const timer = setTimeout(() => {
      dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
      dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [finalUserid, finalToken, dispatch]);

  // ── Socket ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!finalUserid) return;
    const socket = getSocket();
    if (!socket) {
      const id = setInterval(() => {
        if (finalUserid && finalToken) {
          dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
          dispatch(
            getmessagenotication({ userid: finalUserid, token: finalToken })
          );
        }
      }, 10000);
      return () => clearInterval(id);
    }
    const refresh = () => {
      if (finalUserid && finalToken) {
        dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
        dispatch(
          getmessagenotication({ userid: finalUserid, token: finalToken })
        );
      }
    };
    socket.on("new_message", refresh);
    socket.on("message_read", refresh);
    socket.on("message_status_update", refresh);
    return () => {
      socket.off("new_message", refresh);
      socket.off("message_read", refresh);
      socket.off("message_status_update", refresh);
    };
  }, [finalUserid, finalToken, dispatch]);

  // ── Unread count ───────────────────────────────────────────────────────────
  const totalUnreadCount = React.useMemo(() => {
    let total = 0;
    if (Array.isArray(recentmsg))
      total += recentmsg.reduce(
        (s, m) => s + (m.unreadCount > 0 ? m.unreadCount : 0),
        0
      );
    if (Array.isArray(msgnitocations))
      total += msgnitocations.reduce(
        (s, m) => s + (m.messagecount > 0 ? m.messagecount : 0),
        0
      );
    return total;
  }, [recentmsg, msgnitocations]);

  // ── Nav items ──────────────────────────────────────────────────────────────
 type NavItem = {
  route: string;
  name: string;
  icon: (active: boolean) => ReactNode;
  badge?: number;
  isCenter?: boolean;
};

  const isActive = (route: string) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route);

  const accentColor = "#6c63ff";
  const inactiveColor = "#64748b";

  const navItems: NavItem[] = [
    {
      name: "Home",
      route: "/",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
            stroke={active ? accentColor : inactiveColor}
            strokeWidth="2"
            strokeLinejoin="round"
            fill={active ? "rgba(108,99,255,0.12)" : "none"}
          />
        </svg>
      ),
    },
    {
      name: "Notifications",
      route: "/notifications",
      badge: hasUnreadNotifications ? unreadNotificationCount : 0,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
            stroke={active ? accentColor : inactiveColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Rituals",
      route: "/anya",
      isCenter: true,
      icon: (_active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="13" width="16" height="3" rx="1.5" fill="white" opacity="0.4" />
          <rect x="4" y="17" width="16" height="3" rx="1.5" fill="white" opacity="0.65" />
          <path
            d="M12 2C12 2 9 5.5 9 8C9 9.657 10.343 11 12 11C13.657 11 15 9.657 15 8C15 5.5 12 2 12 2Z"
            fill="white"
          />
          <path
            d="M12 6C12 6 10.5 7.5 10.5 8.5C10.5 9.328 11.172 10 12 10C12.828 10 13.5 9.328 13.5 8.5C13.5 7.5 12 6 12 6Z"
            fill="rgba(108,99,255,0.6)"
          />
        </svg>
      ),
    },
    {
      name: "Messages",
      route: "/message",
      badge: totalUnreadCount,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke={active ? accentColor : inactiveColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-fit mr-6 mt-4 max-[600px]:m-0 fixed right-0 max-[600px]:bottom-1 max-[600px]:w-full max-[600px]:right-0 max-[600px]:left-0 z-50">
<div className="w-[25rem] mx-auto max-[600px]:w-[96%] max-[380px]:w-full max-[380px]:rounded-none rounded-2xl px-2 max-[600px]:px-1 pt-3 pb-5 bottom-4 lg:w-[28rem]"style={{
          background: "rgba(8,11,20,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-around">
<style>{`@media(min-width:1024px){.bnav-icon svg{width:30px!important;height:30px!important;}}`}</style>
          {navItems.map((item) => {
            const active = isActive(item.route);

            if (item.isCenter) {
              return (
                <Link
                  key={item.name}
                  href={item.route}
                  className="flex flex-col items-center gap-1 relative px-3 py-1"
                >
                  {/* Elevated gradient circle */}
                  <div
                     className="flex items-center justify-center rounded-[14px] -mt-[22px] bnav-icon"
                    style={{
                      width: 44,
                      height: 44,
                      background: "linear-gradient(135deg, #6c63ff, #9b59f5)",
                      boxShadow: "0 4px 16px rgba(108,99,255,0.4)",
                    }}
                  >
                    {item.icon(active)}
                  </div>
                  <span className="text-[9.5px] font-semibold text-[#94a3b8] whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.route}
                className="flex flex-col items-center gap-1 relative px-3 py-1 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
              >
                {/* Icon + badge wrapper */}
                <div className="relative bnav-icon">
  {item.icon(active)}

                  {/* Badge */}
                  {item.badge && item.badge > 0 ? (
                    <div
                      className="absolute -top-[3px] -right-[3px] min-w-[16px] h-[16px] rounded-lg flex items-center justify-center px-1"
                      style={{
                        background:
                          "linear-gradient(135deg, #6c63ff, #9b59f5)",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "white",
                        border: "2px solid #080b14",
                        boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
                      }}
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </div>
                  ) : null}
                </div>

                {/* Label */}
                <span
                  className="text-[9.5px] font-semibold whitespace-nowrap transition-colors duration-200"
                  style={{ color: active ? accentColor : inactiveColor }}
                >
                  {item.name}
                </span>

                {/* Active dot */}
                <div
                  className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-opacity duration-200"
                  style={{
                    background: accentColor,
                    opacity: active ? 1 : 0,
                  }}
                />
              </Link>
            );
          })}

          {/* Profile button — opens side menu */}
          <ProfileMenuBtn />
        </div>
      </div>

      {/* Side menu rendered by Navapp */}
      <div className="max-[600px]:-top-0 max-[600px]:fixed">
        <Navapp />
      </div>
    </div>
  );
}

// ── Default export — wraps everything in MenuProvider ────────────────────────
export default function BottomNavBar() {
  return (
    <MenuProvider>
      <BottomNavBarInner />
    </MenuProvider>
  );
}