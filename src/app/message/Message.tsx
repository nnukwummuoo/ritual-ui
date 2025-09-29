/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect, useState } from "react";
import PacmanLoader from "react-spinners/DotLoader";
import { FaAngleLeft } from "react-icons/fa";
import { MsgRequestNav } from "./_components/MsgRequestNav";
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

export const MessageView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [color] = useState<string>("#c2d0e1");
  const dispatch = useDispatch();
  const userid = useSelector((state: RootState) => state.register.userID);
  const isLoggedIn = useSelector((state: RootState) => state.register.logedin);
  const msgnotifystatus = useSelector((state: RootState) => state.message.msgnotifystatus);
  const lastmessage = useSelector((state: RootState) => state.message.lastmessage);

  useEffect(() => {
    if (!isLoggedIn || !userid) return;
    setLoading(true);
    // New merged notification endpoint
    dispatch(getmessagenotication({ userid }) as any);
    // Legacy recent/unread endpoint if still used in UI
    dispatch(getmsgnitify({ userid }) as any);
  }, [isLoggedIn, userid, dispatch]);

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

  useEffect(() => {
    if (msgnotifystatus === "succeeded" || msgnotifystatus === "failed") {
      setLoading(false);
    }
  }, [msgnotifystatus]);

  // Mark the latest message as read once notifications provide a lastmessage date
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!lastmessage) return;
    dispatch(updatemessage({ date: lastmessage }) as any);
  }, [lastmessage, isLoggedIn, dispatch]);


  return (
    <div className="min-h-screen ">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className=" border-b  p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-blue-700/50 rounded-full transition-colors"
              >
                <FaAngleLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
            <button className="p-2 hover:bg-blue-700/50 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 ">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Search by name or message..."
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <PacmanLoader
                color={color}
                loading={loading}
                size={35}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <p className="text-sm text-center text-gray-200 mt-4">
                Loading messages...
              </p>
            </div>
          )}
          
          <MsgRequestNav />
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-6 z-50">
          <button className="w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
   
    </div>
  );
};
