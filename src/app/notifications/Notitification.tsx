"use client"
import React, { useEffect, useRef } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useNotificationIndicator } from "@/hooks/useNotificationIndicator";
import { useActivityNotificationIndicator } from "@/hooks/useActivityNotificationIndicator";

export const Creatornotify = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const divFocusRef = useRef<HTMLDivElement>(null);
  
  // Get notification indicator data
  const { hasUnread, unreadCount, allUnreadCount } = useNotificationIndicator();
  const { hasUnread: hasActivityUnread, unreadCount: activityUnreadCount } = useActivityNotificationIndicator();

  useEffect(() => {
    divFocusRef.current && divFocusRef.current.focus();
  }, []);

  return (
    <div className="w-full px-4 pt-0 h-screen flex flex-col contain-content">
      <div className="md:w-4/5 md:mx-auto">
        <header className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Back"
              onClick={() => {
                router.push("/");
              }}
              className="w-10 h-10 shrink-0 rounded-full bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-colors flex items-center justify-center"
            >
              <FaAngleLeft size={18} />
            </button>
            <div>
              <h4 className="text-lg font-bold text-white leading-tight">Notifications</h4>
              <p className="text-[12px] text-slate-500">
                {allUnreadCount > 0
                  ? `${allUnreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="flex gap-1 p-1 mb-5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <HeadBtn label="All" route="/notifications?id=randomid" showIndicator={allUnreadCount > 0} count={allUnreadCount} />
            <HeadBtn label="Activity" route="/notifications/activity" showIndicator={hasActivityUnread} count={activityUnreadCount} />
          </div>
        </header>
        <div
          ref={divFocusRef}
          className="cstm-height focus:outline-none pb-12 flex-col items-center w-full overflow-y-auto scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

function HeadBtn({ label, route, showIndicator = false, count = 0 }: { 
  label: string; 
  route: string; 
  showIndicator?: boolean; 
  count?: number; 
}) {
  const pathname = usePathname();
  const endpoint: boolean = route.split("?").includes(pathname);
  return (
    <Link
      href={route}
      className={`relative flex-1 py-2.5 rounded-xl text-center text-sm font-bold transition-all duration-300 ${
        endpoint
          ? "bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white shadow-lg shadow-[#6c63ff]/25"
          : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
      }`}
    >
      {label}
      {showIndicator && (
        <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[10px] px-1.5 rounded-full font-bold min-w-[18px] h-[18px] flex items-center justify-center border-2 border-[#080b14]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}