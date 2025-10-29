"use client";
import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
// import setting from "../../icons/settings.png";
// import { NavButton } from "../_components/navbutton";
// import { Header } from "../_components/header";
// import settingIcon from "../../../src/icons/addemojis.js.svg";
// import { FiUser } from "react-icons/fi";
// import { IoMdNotificationsOutline } from "react-icons/io";
// import { AiOutlineSafetyCertificate } from "react-icons/ai";

const AccountPage = () => {
  const router = useRouter();

  const navdata = [
    {
      name: "Password & security setting",
      icon: <MdLockOutline color="white" size={20} />,
      linktitle: "change-password",
    },
    {
      name: "Delete my account",
      icon: <RiDeleteBinLine color="white" size={20} />,
      linktitle: "delete-account",
    },
  ];
  return (
    <div className=" mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      
      <div className='flex flex-col w-full px-4 md:px-0'>
      <header className="flex items-center gap-4 pt-16 md:pt-4">
        <FaAngleLeft
          color="white"
          size={30}
          onClick={() => router.push('/settings/')}
        />

        <h4 className="text-lg font-bold text-white">ACCOUNT INFO</h4>
      </header>

      <p className="py-4 text-sm text-slate-400">
        See information about your account, change Password or learn more about
        your account deactivation
      </p>
      <div className="pt-4">
        {navdata.map((nav, index) => (
          <div
            className="flex items-center justify-between mb-6 "
            key={index}
            onClick={() => router.push(`/settings/account/${nav.linktitle}`)}
          >
            <div className="flex items-center gap-2">
              <div>{nav.icon}</div>
              <h4 className="text-lg font-semibold text-white">{nav.name}</h4>
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

export default AccountPage;
