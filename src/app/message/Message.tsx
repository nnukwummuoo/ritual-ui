"use client"
import React, { useEffect, useState } from "react";
import PacmanLoader from "react-spinners/DotLoader";
import { FaAngleLeft } from "react-icons/fa";
import { MsgRequestNav } from "./_components/MsgRequestNav";
import { BottomNav } from "./_components/BottomNav";
import { useDispatch, useSelector } from "react-redux";
import { getmsgnitify, updatemessage } from "@/store/messageSlice";
import type { RootState } from "@/store/store";
import { RecentList } from "./List/RecentList";

export const MessageView = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#c2d0e1");
  const dispatch = useDispatch();
  const userid = useSelector((state: RootState) => state.register.userID);
  const isLoggedIn = useSelector((state: RootState) => state.register.logedin);
  const msgnotifystatus = useSelector((state: RootState) => state.message.msgnotifystatus);
  const lastmessage = useSelector((state: RootState) => state.message.lastmessage);
  const recentmsg = useSelector((state: RootState) => state.message.recentmsg);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      dispatch(getmsgnitify({ userid }) as any);
    }
  }, [isLoggedIn, userid, dispatch]);

  useEffect(() => {
    if (msgnotifystatus === "succeeded" || msgnotifystatus === "failed") {
      setLoading(false);
    }
  }, [msgnotifystatus]);

  useEffect(() => {
    if (isLoggedIn && lastmessage) {
      dispatch(updatemessage({ date: lastmessage }) as any);
    }
  }, [lastmessage, isLoggedIn, dispatch]);

  return (
    <div className="sm:w-8/12 lg:w-7/12 xl:w-7/12">
      <div className="md:w-3/5 md:mx-auto">
        <header className="flex items-center gap-4 md:ml-10">
          <FaAngleLeft color="white" size={30} />
          <h4 className="text-lg font-bold text-white">MESSAGES</h4>
        </header>
        <div className="sticky top-0 z-10">
          <div className="px-2 pb-2 md:px-4 sm:p-6 lg:pl-10">
            <input
              type="text"
              className="w-full h-10 px-4 text-center rounded-full"
              placeholder="Search for message"
            />
          </div>
          <MsgRequestNav />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-100px)] pb-3">
          <div className="flex flex-col w-full">
            {loading && (
              <div className="flex flex-col items-center mt-5">
                <PacmanLoader
                  color={color}
                  loading={loading}
                  size={35}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
                <p className="text-xs text-center text-slate-400">
                  getting message...
                </p>
              </div>
            )}
            {msgnotifystatus === 'succeeded' && recentmsg && recentmsg.length > 0 ? (
                <ul>
                    {recentmsg.map((chat: any) => (
                        <RecentList
                            key={chat.date}
                            photolink={chat.photolink}
                            username={chat.username}
                            content={chat.content}
                            toid={chat.toid}
                            fromid={chat.fromid}
                            date={chat.date}
                            online={chat.online}
                        />
                    ))}
                </ul>
            ) : msgnotifystatus === 'succeeded' && (
                 <div className="flex flex-col items-center justify-center overflow-hidden">
                   <p className="mt-16 text-slate-400">No Messages Yet!</p>
                 </div>
            )}
          </div>
        </div>
      </div>
      <div className="">
        <BottomNav />
      </div>
    </div>
  );
};
