"use client";

import React, { useState } from "react";
import { Unreadmsg } from "./Unreadmsg";
import { Recentmessage } from "./Recentmessage";
import { VideoCallPage } from "./VideoCall";

export const MsgRequestNav = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "unread" | "video">("recent");

  const renderTabContent = () => {
    switch (activeTab) {
      case "recent":
        return <Recentmessage />;
      case "unread":
        return <Unreadmsg />;
      case "video":
        return <VideoCallPage />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen md:w-11/12 lg:w-10/12 xl:w-10/12 mx-auto">
      <div className="pb-4 overflow-auto flex-col items-center w-full mt-1">
        {/* Tab Buttons */}
        <div className="overflow-auto flex justify-evenly">
          <button
            className={`text-slate-400 mt-3 w-1/4 rounded-lg py-1 px-6 ${
              activeTab === "recent" ? "bg-[#292d31]" : ""
            }`}
            onClick={() => setActiveTab("recent")}
          >
            <p className="text-center text-xs">Recent</p>
          </button>

          <button
            className={`text-slate-400 mt-3 w-1/4 rounded-lg py-1 px-6 ${
              activeTab === "unread" ? "bg-[#292d31]" : ""
            }`}
            onClick={() => setActiveTab("unread")}
          >
            <p className="text-center text-xs">Unread</p>
          </button>

          <button
            className={`text-slate-400 mt-3 w-1/4 rounded-lg py-1 px-6 ${
              activeTab === "video" ? "bg-[#292d31]" : ""
            }`}
            onClick={() => setActiveTab("video")}
          >
            <p className="text-center text-xs">Video Call</p>
          </button>
        </div>

        {/* Render the tab content */}
        <div className="mt-4">{renderTabContent()}</div>
      </div>
    </div>
  );
};
