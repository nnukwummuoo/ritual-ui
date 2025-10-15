import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { MdAlternateEmail } from "react-icons/md";
import { MdLaptopChromerequest } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useRouter } from "next/navigation";
import NavigateBack from "../_components/NavigateBtn";
import NavigateForward from "../_components/NavigateForward";


 const NotificationPage = () => {

  const navdata = [
    {
      name: "Push Notification",
      icon: <IoMdNotificationsOutline color="white" size={20} />,
      linktitle: "push-notification",
    },

    {
      name: "Email Notification",
      icon: <MdAlternateEmail color="white" size={20} />,
      linktitle: "email-notification",
    },
    
  ];
  return (
    <div className="w-screen mx-auto text-white sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
    
    <div className='flex flex-col w-full px-4 md:px-0 '>
    <header className="flex items-center gap-4 pt-14 md:pt-4">
        <NavigateBack />
        <h4 className="text-lg font-bold text-white">NOTIFICATION</h4>
      </header>

      <p className="py-4 text-sm text-slate-400">
        See informationa about your account, change Password or learn more about
        your account deactivation
      </p>
      <div className="pt-4">
        {navdata.map((nav, index) => (
          <NavigateForward key={index} to={`notification/${nav.linktitle}`} name={nav.name} icon={nav.icon} />
        ))}
      </div>
    </div>
     
    </div>
  );
};

export default NotificationPage;