'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaAngleRight } from "react-icons/fa";
import { MdReport, MdVerifiedUser, MdAttachMoney, MdGroup } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import HeaderBackNav from "@/components/navs/HeaderBackNav"; // Adjust import path as needed
import type { AppDispatch, RootState } from "@/store/store";
import { adminnotify } from "@/store/admin";

const AdminPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const admin = useSelector((state: any) => state.register.admin);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const notifyme = useSelector((s: RootState) => s.admin.notifyme);
  const notifycount = useSelector((s: RootState) => s.admin.notifycount);

  // Optional client-side redirect if not admin
  // useEffect(() => {
  //   if (!admin) {
  //     router.push("/");
  //   }
  // }, [admin, router]);

  useEffect(() => {
    let timer: any;
    const ping = () => {
      if (token) dispatch(adminnotify({ token } as any));
    };
    ping();
    timer = setInterval(ping, 60000);
    const onVis = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [dispatch, token]);

  const navdata = [
    {
      name: "Reports",
      icon: <MdReport color="white" size={20} />,
      linktitle: "mmeko/admin/reports",
    },
    {
      name: "Creator Verification",
      icon: <MdVerifiedUser color="white" size={20} />,
      linktitle: "mmeko/admin/creator-verification",
    },
    {
      name: "Withdrawal Requests",
      icon: <MdAttachMoney color="white" size={20} />,
      linktitle: "mmeko/admin/withdrawal",
    },
    {
      name: "Users",
      icon: <MdGroup color="white" size={20} />,
      linktitle: "mmeko/admin/users",
    },
  ];

  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto bg-gray-900 min-h-screen md:mt-0 mt-10">
      <div className="w-[90%] mx-auto md:w-3/5 text-white my-6 p-4 md:mr-auto md:ml-0">
        <HeaderBackNav />

        <header>
          <div className="flex items-center gap-3">
            <h4 className="font-bold text-lg text-white hidden sm:block">
              ADMIN DASHBOARD
            </h4>
            {notifyme && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                Notifications: {notifycount}
              </span>
            )}
          </div>
        </header>

        <div className="pt-4">
          {navdata.map((nav, index) => (
            <div
              key={index}
              className="flex justify-between items-center mb-6 cursor-pointer"
              onClick={() => router.push(`/${nav.linktitle}`)}
            >
              <div className="flex gap-2 items-center">
                <div>{nav.icon}</div>
                <h4 className="text-lg text-white font-semibold">{nav.name}</h4>
              </div>
              <div>
                <FaAngleRight color="white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
