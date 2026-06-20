'use client';

import React, { useState, useEffect } from "react";
import {
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoPeopleOutline,
  IoGridOutline,
  IoHomeOutline,
  IoChatbubbleOutline,
  IoAnalyticsOutline,
  IoServerOutline,
  IoCardOutline,
  IoBarChartOutline,
  IoGiftOutline,
  IoFingerPrintOutline,
  IoSparkles,
  IoRefreshOutline,
  IoConstructOutline,
  IoTimerOutline,
  IoLockOpenOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { adminnotify } from "@/store/admin";
import { getdocument, getFanDocuments } from "@/store/creatorSlice";
import axios from "axios";
import { URL } from "@/api/config";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { useRouter } from "next/navigation";
import DeviceFingerprintStats from "../../../components/admin/DeviceFingerprintStats";

// Your actual components are used here, no changes needed for them
import AdminVerifyDocumentPage from "./creator-verification/page";
import WithdrawalRequests from "./withdrawal/page";
import Users from "./users/page";
import Reports from "./reports/page";
import AdminSupportChat from "./support-chat/page";
import VipAnalysisPage from "./vip-analysis/page";
import WebsiteAnalyticsPage from "./website-analytics/page";
import BackupManagement from "./backup/page";
import TransactionsPage from "./transactions/page";
import RevenuePage from "./revenue/page";
import ReferralAnalysisPage from "./referral-analysis/page";
import AnyaAnalyticsPage from "./anya-analytics/page";
import SeriesConfigPage from "./series-config/page";
import AdminUpdatesPage from "./updates/page";
import PPVRequestsPage from "./ppv-requests/page";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import MaintenanceToggle from "@/components/admin/MaintenanceToggle";
import MaintenanceControl from "@/components/admin/MaintenanceControl";
import SortToggle from "@/components/admin/SortToggle";
import AdminFanVerificationPage from "./adminfan-verification/page";

const AdminPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // State defaults to "Reports" view
  const [activeView, setActiveView] = useState("Reports");

  const token = useAuthToken();
  const userID = useSelector((s: RootState) => s.register.userID);
  const notifyme = useSelector((s: RootState) => s.admin.notifyme);
  const notifycount = useSelector((s: RootState) => s.admin.notifycount);
  const docCount = useSelector(
    (state: RootState) =>
      state.creator.documents.filter((doc: { verify?: string }) => !doc.verify || doc.verify === "pending").length
  );
  const fanDocCount = useSelector(
  (state: RootState) =>
    state.creator.fanDocuments.filter((doc: { verify?: boolean }) => !doc.verify).length
);

  // State for pending withdrawal requests count
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);

  // State for support chat count
  const [supportChatCount, setSupportChatCount] = useState(0);

  // State for PPV requests count (pending)
  const [ppvRequestsCount, setPpvRequestsCount] = useState(0);

  // Notification logic remains unchanged
  useEffect(() => {
    const ping = () => {
      if (token && userID) dispatch(adminnotify({ userid: userID } as any)); // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    ping();
    const timer = setInterval(ping, 60000);
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dispatch, token, userID]);

  // Fetch documents on mount to get the count
useEffect(() => {
  dispatch(getdocument());
  dispatch(getFanDocuments()); // 👈 add this
}, [dispatch]);

  // Fetch pending withdrawals count on mount and periodically
  useEffect(() => {
    const fetchPendingWithdrawalsCount = async () => {
      try {
        const res = await axios.get(`${URL}/withdraw-request`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const allRequests = res.data.requests || [];
        const pendingRequests = allRequests.filter((req: { status: string }) => req.status === 'pending');
        setPendingWithdrawalsCount(pendingRequests.length);
      } catch (err) {
        console.error("Error fetching pending withdrawals count:", err);
        setPendingWithdrawalsCount(0);
      }
    };

    if (token) {
      fetchPendingWithdrawalsCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingWithdrawalsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Fetch support chat count on mount and periodically
  useEffect(() => {
    const fetchSupportChatCount = async () => {
      try {
        const res = await axios.get(`${URL}/support-chat/admin/all?status=open`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const openChats = res.data.supportChats || [];
        setSupportChatCount(openChats.length);
      } catch (err) {
        console.error("Error fetching support chat count:", err);
        setSupportChatCount(0);
      }
    };

    if (token) {
      fetchSupportChatCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchSupportChatCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Fetch PPV requests count on mount and periodically
  useEffect(() => {
    const fetchPpvRequestsCount = async () => {
      try {
        const res = await axios.get(`${URL}/api/ppv/admin/requests`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const requests = res.data?.ok ? res.data.requests || [] : [];
        setPpvRequestsCount(requests.length);
      } catch (err) {
        console.error("Error fetching PPV requests count:", err);
        setPpvRequestsCount(0);
      }
    };

    if (token) {
      fetchPpvRequestsCount();
      const interval = setInterval(fetchPpvRequestsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Sidebar navigation items
  const navdata = [
    {
      name: "Reports",
      icon: <IoDocumentTextOutline size={22} />,
      component: <Reports />,
    },
    {
      name: "VIP Analysis",
      icon: <IoAnalyticsOutline size={22} />,
      component: <VipAnalysisPage />,
    },
    {
      name: "Website Analytics",
      icon: <IoAnalyticsOutline size={22} />,
      component: <WebsiteAnalyticsPage />,
    },
    {
      name: "Referral Analysis",
      icon: <IoGiftOutline size={22} />,
      component: <ReferralAnalysisPage />,
    },
    {
      name: "Anya Analytics",
      icon: <IoSparkles size={22} />,
      component: <AnyaAnalyticsPage />,
    },
    {
      name: "Ritual Series Config",
      icon: <IoDocumentTextOutline size={22} />,
      component: <SeriesConfigPage />,
    },
    // {
    //   name: "Device fingerprinting",
    //   icon: <IoFingerPrintOutline size={22} />,
    //   component: <DeviceFingerprintStats />,
    // },
    {
      name: "Support Chat",
      icon: <IoChatbubbleOutline size={22} />,
      component: <AdminSupportChat />,
    },
    {
  name: "Creator Verification",
  icon: <IoShieldCheckmarkOutline size={22} />,
  component: <AdminVerifyDocumentPage />,
},
{
  name: "Fan Verification",
  icon: (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fanNavGrad" x1="4" y1="2" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <path
        d="M12 1L3 5V11C3 15.836 6.978 20.489 12 22C17.022 20.489 21 15.836 21 11V5L12 1Z"
        fill="white"
        opacity="0.3"
      />
      <path
        d="M12 2.8L4.5 6V11C4.5 15.2 7.9 19.4 12 20.6C16.1 19.4 19.5 15.2 19.5 11V6L12 2.8Z"
        fill="url(#fanNavGrad)"
      />
      <path
        d="M12 7l1.2 2.4 2.6.4-1.9 1.85.45 2.6L12 13.1l-2.35 1.15.45-2.6L8.2 9.8l2.6-.4L12 7z"
        fill="white"
      />
    </svg>
  ),
  component: <AdminFanVerificationPage />,
},
    {
      name: "Withdrawal Requests",
      icon: <IoCashOutline size={22} />,
      component: <WithdrawalRequests />,
    },
    {
      name: "Transactions",
      icon: <IoCardOutline size={22} />,
      component: <TransactionsPage />,
    },
    {
      name: "Revenue",
      icon: <IoBarChartOutline size={22} />,
      component: <RevenuePage />,
    },
    {
      name: "Users",
      icon: <IoPeopleOutline size={22} />,
      component: <Users />,
    },
    {
      name: "PPV Requests",
      icon: <IoLockOpenOutline size={22} />,
      component: <PPVRequestsPage />,
    },
    {
      name: "Backup Management",
      icon: <IoServerOutline size={22} />,
      component: <BackupManagement />,
    },
    // {
    //   name: "Updates",
    //   icon: <IoRefreshOutline size={22} />,
    //   component: <AdminUpdatesPage />,
    // },
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
      <aside className="w-16 2xl:w-[30%] bg-[#1F2937] flex flex-col">
        <div className="p-2 2xl:p-4 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 p-2 justify-center 2xl:justify-start">
            <div className="w-9 h-9 bg-indigo-600 rounded-md grid place-items-center">
              <IoGridOutline color="white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden 2xl:inline">Dashboard</h1>
          </div>

          {/* Push Notifications Toggle */}
          <div className="mb-6 p-3 bg-[#111624] rounded-lg">
            <div className="flex items-center justify-center 2xl:justify-start gap-2 mb-2">
              <IoChatbubbleOutline color="white" size={20} />
              <span className="font-medium text-white hidden 2xl:inline">Push Notifications</span>
            </div>
            <div className="flex justify-center md:justify-start">
              <PushNotificationToggle size="sm" showLabel={false} />
            </div>
          </div>

          {/* Maintenance Toggle */}
          <div className="mb-6 p-3 bg-[#111624] rounded-lg">
            <div className="flex items-center justify-center 2xl:justify-start gap-2 mb-2">
              <IoConstructOutline color="white" size={20} />
              <span className="font-medium text-white hidden 2xl:inline">Maintenance</span>
            </div>
            <div className="flex justify-center md:justify-start">
              <MaintenanceToggle showLabel={true} />
            </div>
          </div>

          {/* Sort Creator Toggle */}
          <div className="mb-6 p-3 bg-[#111624] rounded-lg">
            <div className="flex items-center justify-center 2xl:justify-start gap-2 mb-2">
              <IoTimerOutline color="white" size={20} />
              <span className="font-medium text-white hidden 2xl:inline">Creator Sorting</span>
            </div>
            <div className="flex justify-center md:justify-start">
              <SortToggle showLabel={true} />
            </div>
          </div>

          {/* Navigation */}
          <ul className="space-y-2">
            {navdata.map((item) => (
              <li
                key={item.name}
                onClick={() => setActiveView(item.name)}
                className={`flex items-center justify-center md:justify-start gap-0 md:gap-4 px-0 md:px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                  ${activeView === item.name
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-700 text-gray-400 hover:text-white"
                  }`}
              >
                {item.icon}
                <span className="font-medium hidden 2xl:inline ml-0 2xl:ml-2">{item.name}</span>
                {item.name === "Creator Verification" && docCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-1.5 py-1 rounded-full text-xs">
                    {docCount}
                  </span>
                )}
{item.name === "Fan Verification" && fanDocCount > 0 && (
  <span className="ml-2 bg-red-500 text-white px-1.5 py-1 rounded-full text-xs">
    {fanDocCount}
  </span>
)}
                {item.name === "Support Chat" && supportChatCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-1.5 py-1 rounded-full text-xs">
                    {supportChatCount}
                  </span>
                )}
                {item.name === "Withdrawal Requests" && pendingWithdrawalsCount > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white px-1.5 py-1 rounded-full text-xs">
                    {pendingWithdrawalsCount}
                  </span>
                )}
                {item.name === "PPV Requests" && ppvRequestsCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-1.5 py-1 rounded-full text-xs">
                    {ppvRequestsCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content: responsive width */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header - hidden for Support Chat */}
        {activeView !== "Support Chat" && (
          <header className="flex justify-between items-center p-4 md:p-8 pb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{activeView}</h2>
            <div className="flex items-center gap-3">
              {notifyme && (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-600 text-white">
                  Notifications: {notifycount}
                </span>
              )}
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                <IoHomeOutline size={18} />
                <span className="hidden sm:inline">Back to Home</span>
              </button>
            </div>
          </header>
        )}

        {/* Content Section */}
        <section className={`flex-1 ${activeView === "Support Chat" ? "h-full" : "flex items-start justify-center p-4 md:p-8 pt-4"}`}>
          <div className="w-full h-full">{renderContent()}</div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;