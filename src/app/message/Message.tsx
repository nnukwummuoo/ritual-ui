/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import Image from "next/image";
// import { RecentList } from "./List/RecentList";
// import { Gennavigation } from "../../navs/Gennav";
// import { Unreadmsg } from "./_components/Unreadmsg";
// import { useSelector, useDispatch } from "react-redux";
// import { Recentmessage } from "./Recentmessage";
// import { Favmsg } from "./Favmsg";
// import { getmsgnitify } from "../../app/features/message/messageSlice";

import { useDispatch, useSelector } from "react-redux";
import { getmessagenotication, getmsgnitify, updatemessage } from "@/store/messageSlice";
import type { RootState } from "@/store/store";
import { MessageList } from "./_components/MessageList";
import { useState } from "react";
import { URL as API_URL } from "@/api/config";
import { getSocket } from "@/lib/socket";

export const MessageView = () => {
  const dispatch = useDispatch();
  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
  const msgnotifystatus = useSelector((state: RootState) => state.message.msgnotifystatus);
  const lastmessage = useSelector((state: RootState) => state.message.lastmessage);

  // Support chat unread count
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);

  // Get userid from localStorage if not in Redux
  const [localUserid, setLocalUserid] = useState("");
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);

  // Use Redux data if available, otherwise use localStorage
  const userid = reduxUserid || localUserid;
  const isLoggedIn = reduxIsLoggedIn || localIsLoggedIn;

  // Load userid from localStorage if not in Redux
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (!reduxUserid && data?.userID) {
            setLocalUserid(data.userID);
            setLocalIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("[MessageView] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserid]);

  // Fetch support chat unread count
  const fetchSupportUnreadCount = async () => {
    if (!userid) return;

    try {
      const response = await fetch(`${API_URL}/support-chat/user/${userid}`);

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.supportChat) {
          // Count admin messages (since we don't have read status, count all admin messages as unread)
          const adminMessages = data.supportChat.messages.filter((msg: any) =>
            msg.isAdmin
          );
          setSupportUnreadCount(adminMessages.length);
        } else {
          setSupportUnreadCount(0);
        }
      } else {
        setSupportUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching support unread count:', error);
      setSupportUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !userid) return;
    // New merged notification endpoint
    dispatch(getmessagenotication({ userid }) as any);
    // Legacy recent/unread endpoint if still used in UI
    dispatch(getmsgnitify({ userid }) as any);
    // Fetch support chat unread count
    fetchSupportUnreadCount();
  }, [isLoggedIn, userid, dispatch]);

  // Socket integration for real-time support chat updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userid) return;

    // Listen for new support messages
    const handleSupportMessage = (data: any) => {
      if (data.userid === userid) {
        // Refresh support unread count when new message is received
        fetchSupportUnreadCount();
      }
    };

    socket.on('support_message_received', handleSupportMessage);

    return () => {
      socket.off('support_message_received', handleSupportMessage);
    };
  }, [userid]);

  // Periodic refresh of support unread count
  useEffect(() => {
    if (!userid) return;

    const interval = setInterval(() => {
      fetchSupportUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userid]);

  // const shownote = () => {
  //   if (loading === false) {
  //     console.log("notification length " + recentmsg.length);
  //     if (recentmsg.length > 0) {
  //       return recentmsg.map((value) => {
  //         if (value.value === "notify") {
  //           return (
  //             <Unreadmsg
  //               photolink={value.photolink}
  //               username={value.username}
  //               content={value.content}
  //               fromid={value.fromid}
  //               toid={value.toid}
  //               dates={value.date}
  //               count={value.messagecount}
  //             />
  //           );
  //         } else if (value.value === "recent") {
  //           console.log("inside recent");
  //           return (
  //             <RecentList
  //               fromid={value.fromid}
  //               toid={value.toid}
  //               contents={value.content}
  //               name={value.name}
  //               image={value.photolink}

  //             />
  //           );
  //         }
  //       });
  //     } else {
  //       return (
  //         <div className="flex flex-col items-center justify-center overflow-hidden">
  //           <p className="mt-16 text-slate-400">No! Messages</p>
  //         </div>
  //       );
  //     }
  //   }
  // };

  // const checknotification = () => {
  //   if (recentmsg.length > 0) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // Mark the latest message as read once notifications provide a lastmessage date
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!lastmessage) return;
    dispatch(updatemessage({ date: lastmessage }) as any);
  }, [lastmessage, isLoggedIn, dispatch]);


  return (
    <div className="w-full h-full flex flex-col bg-[#080b14]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 pt-4 pb-3 bg-[#080b14]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FaAngleLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>
          <button
            onClick={() => window.location.href = '/message/supportchat'}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Image
              src="/support.png"
              alt="Support"
              width={24}
              height={24}
              className="w-9 h-9"
            />
            {/* Unread indicator dot */}
            {supportUnreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Privacy assurance banner */}
        <div className="mt-3 flex items-center gap-2 bg-[#6c63ff]/[0.08] border border-[#6c63ff]/20 rounded-xl px-3.5 py-2.5">
          <svg className="w-4 h-4 text-[#9b59f5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 4.556-3.032 8.395-7.183 9.632-.55.164-1.084-.279-1.084-.854V3.222c0-.575.534-1.018 1.084-.854C17.968 3.605 21 7.444 21 12z" />
          </svg>
          <p className="text-xs text-[#c9c4ff] leading-relaxed">
            Chat and media auto-delete after 60 days for privacy
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <MessageList />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 right-6 z-50">
        <button
          onClick={() => window.location.href = '/message/following'}
          className="w-14 h-14 bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] text-white rounded-full shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(108,99,255,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};