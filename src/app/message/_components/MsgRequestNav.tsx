"use client";

import React, { useState } from "react";
import { Unreadmsg } from "./Unreadmsg";
import { Recentmessage } from "./Recentmessage";
import { VideoCallPage } from "./VideoCall";
import { useRouter } from "next/navigation";
import { FaHeadset } from "react-icons/fa";

export const MsgRequestNav = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "unread" | "video">("recent");
  const router = useRouter();

  const renderTabContent = () => {
    switch (activeTab) {
      case "recent":
        return <Recentmessage />;
      case "unread":
        return <Unreadmsg />;
      // case "video":
      //   return <VideoCallPage />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="pb-4 flex-col items-center w-full">
        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 p-2">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "recent" 
                ? "bg-blue-600 text-white" 
                : "bg-blue-800/30 text-blue-300 hover:bg-blue-700/50"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recent
          </button>

          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "unread" 
                ? "bg-blue-600 text-white" 
                : "bg-blue-800/30 text-blue-300 hover:bg-blue-700/50"
            }`}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </button>
        </div>

        {/* Render the tab content */}
        <div className="mt-4">{renderTabContent()}</div>
        
        {/* Support Button */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaHeadset className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white">Need Help?</h3>
                <p className="text-sm text-blue-200">Get support from our team</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/message/support")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Chat Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
