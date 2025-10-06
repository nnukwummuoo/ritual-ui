'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    IoDocumentTextOutline, 
    IoShieldCheckmarkOutline, 
    IoCashOutline, 
    IoPeopleOutline, 
    IoGridOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { adminnotify } from "@/store/admin";

// Your actual components are used here, no changes needed for them
import AdminVerifyDocumentPage from "./creator-verification/page";
import WithdrawalRequests from "./withdrawal/page";
import Users from "./users/page";
import Reports from "./reports/page";

const AdminPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // State defaults to "Reports" view
  const [activeView, setActiveView] = useState("Reports");

  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const notifyme = useSelector((s: RootState) => s.admin.notifyme);
  const notifycount = useSelector((s: RootState) => s.admin.notifycount);

  // Notification logic remains unchanged
  useEffect(() => {
    let timer: any;
    const ping = () => {
      if (token) dispatch(adminnotify({ token } as any));
    };
    ping();
    timer = setInterval(ping, 60000);
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dispatch, token]);

  // Sidebar navigation items
  const navdata = [
    {
      name: "Reports",
      icon: <IoDocumentTextOutline size={22} />,
      component: <Reports />,
    },
    {
      name: "Creator Verification",
      icon: <IoShieldCheckmarkOutline size={22} />,
      component: <AdminVerifyDocumentPage />,
    },
    {
      name: "Withdrawal Requests",
      icon: <IoCashOutline size={22} />,
      component: <WithdrawalRequests />,
    },
    {
      name: "Users",
      icon: <IoPeopleOutline size={22} />,
      component: <Users />,
    },
  ];

  // Render function for content
  const renderContent = () => {
    const current = navdata.find((item) => item.name === activeView);
    return current ? current.component : <Reports />;
  };

  return (
    // Full-height page with flexbox for 20%/80% split
  <div className="flex min-h-screen h-screen bg-[#111827] text-gray-200 font-sans">
      {/* Sidebar: responsive width */}
      <aside className="w-16 md:w-[30%] bg-[#1F2937] flex flex-col justify-between">
        <div className="p-2 md:p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 p-2 justify-center md:justify-start">
            <div className="w-9 h-9 bg-indigo-600 rounded-md grid place-items-center">
              <IoGridOutline color="white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden md:inline">Dashboard</h1>
          </div>

          {/* Navigation */}
          <ul className="space-y-2">
            {navdata.map((item) => (
              <li
                key={item.name}
                onClick={() => setActiveView(item.name)}
                className={`flex items-center justify-center md:justify-start gap-0 md:gap-4 px-0 md:px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                  ${
                    activeView === item.name
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-700 text-gray-400 hover:text-white"
                  }`}
              >
                {item.icon}
                <span className="font-medium hidden md:inline ml-0 md:ml-2">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content: responsive width */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
        <header className="flex justify-between items-center -mb-15">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{activeView}</h2>
          {notifyme && (
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-600 text-white">
              Notifications: {notifycount}
            </span>
          )}
        </header>

        {/* Content Section */}
        <section className="flex-1 flex items-center justify-center">
          <div className="w-full">{renderContent()}</div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;