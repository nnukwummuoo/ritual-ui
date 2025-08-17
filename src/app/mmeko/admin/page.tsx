'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaAngleRight } from "react-icons/fa";
import { MdReport, MdVerifiedUser, MdAttachMoney, MdGroup } from "react-icons/md";
import { useSelector } from "react-redux";
import HeaderBackNav from "@/components/navs/HeaderBackNav"; // Adjust import path as needed

const AdminPage = () => {
  const router = useRouter();
  const admin = useSelector((state: any) => state.register.admin);

  // Optional client-side redirect if not admin
  // useEffect(() => {
  //   if (!admin) {
  //     router.push("/");
  //   }
  // }, [admin, router]);

  const navdata = [
    {
      name: "Reports",
      icon: <MdReport color="white" size={20} />,
      linktitle: "mmeko/admin/reports",
    },
    {
      name: "Model Verification",
      icon: <MdVerifiedUser color="white" size={20} />,
      linktitle: "mmeko/admin/model-verification",
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
          <h4 className="font-bold text-lg text-white hidden sm:block">
            ADMIN DASHBOARD
          </h4>
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
