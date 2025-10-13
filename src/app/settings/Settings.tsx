"use client"
import React, {useEffect} from "react";
import { FaAngleRight } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useRouter } from "next/navigation";
import PushNotificationToggle from "@/components/PushNotificationToggle";

// import { useSelector } from "react-redux";
// import HeaderBackNav from "../../navs/HeaderBackNav";

export const SettingPage = () => {
  const router = useRouter()
  // const navigate = useNavigate();
  // const login = useSelector((state) => state.register.logedin);
  
  // useEffect(()=>{
  //   if (!login) {
  //     window.location.href = "/";
  //   }
  // },[])

  const navdata = [
    {
      name: "Account",
      icon: <FiUser color="white" size={20} />,
      linktitle: "account",
    },

    // {
    //   name: "Notification",
    //   icon: <IoMdNotificationsOutline color="white" size={20} />,
    //   linktitle: "notification",
    // },
    {
      name: "Privacy & safety",
      icon: <AiOutlineSafetyCertificate color="white" size={20} />,
      linktitle: "privacy-safety",
    },

    {
      name: "Help & Support",
      icon: <IoMdInformationCircleOutline color="white" size={20} />,
      linktitle: "help_&_support",
    },
  ];
  return (
    <div className="w-screen pt-8 mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:pt-0">
        
      {/* <HeaderBackNav title='SETTING'/> */}
      {/* <p className="mx-auto text-lg font-semibold text-center ">SETTINGS</p> */}
      <div className=' w-[90%] mx-auto text-white my-6 p-4 md:mr-auto md:ml-0'>
      {/* w-full md:w-2/4 mt-16 px-4 */}
      <header>
        <h4 className="text-lg font-bold text-center text-white sm:block">SETTING</h4>
      </header>
      <div className="pt-4">
        {/* Push Notifications Toggle */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IoMdNotificationsOutline color="white" size={20} />
              <h4 className="text-lg font-semibold text-white">Push Notifications</h4>
            </div>
          </div>
          <div className="ml-8">
            <PushNotificationToggle size="md" showLabel={true} />
          </div>
        </div>


        {navdata.map((nav, index) => (
          <div
            className="flex items-center justify-between mb-6 "
            key={index}
            onClick={() => router.push(`/settings/${nav.linktitle}`)}
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
