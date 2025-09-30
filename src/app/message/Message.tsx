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
import { MessageList } from "./_components/MessageList";

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
    <div className="h-screen w-full overflow-hidden">
      <div className="w-full h-full mx-auto">
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

      

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto h-full">
          <MessageList />
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
