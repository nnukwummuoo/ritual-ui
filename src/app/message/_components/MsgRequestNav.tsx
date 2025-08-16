"use client"
import React, { useState } from "react";
import { Unreadmsg } from "./Unreadmsg"
import { Recentmessage } from "./Recentmessage";
import { VideoCallPage } from "./VideoCall";
import { useRouter } from "next/navigation";

export const MsgRequestNav = () => {
  const [all, setall] = useState<string>("#292d31");
  const [accepted, setaccepted] = useState<string>("");
  const router = useRouter();

  return (
    <div className="w-screen md:w-11/12 lg:w-10/12 xl:w-10/12 mx-auto   ">
      <div className="pb-4 overflow-auto flex-col items-center w-full mt-1">
        <div className=" overflow-auto flex justify-evenly">
          <button
            className="text-slate-400 mt-3  w-1/4 rounded-lg py-1 px-6"
            onClick={(e) => {
              setall("#292d31");
              setaccepted("");
              router.push("recentmessage/");
            }}
            style={{ backgroundColor: `${all}` }}
          >
            <div className="flex justify-center">
              <p className="text-center text-xs">Recent</p>
            </div>
          </button>

          <button
            className="text-slate-400 mt-3  rounded-lg py-2 px-6"
            onClick={(e) => {
              setall("");
              setaccepted("#292d31");
              router.push("unreadmsg/");
            }}
            style={{ backgroundColor: `${accepted}` }}
          >
            <div className="flex justify-center">
              <p className="text-center text-xs">Unread</p>
            </div>
          </button>
        </div>

        {/* <Routes>
          <Route path="recentmessage/" element={<Recentmessage />} />
          <Route path="unreadmsg/" element={<Unreadmsg />} />
          <Route path="videocall/" element={<VideoCallPage />} />
        </Routes> */}
      </div>
    </div>
  );
};
