"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Navapp from "@/navs/NavApp";
import MenuProvider from "@/lib/context/MenuContext";
import OpenMobileMenuBtn from "./OpenMobileMenuBtn";
import { usePathname } from "next/navigation";
import AnyaEyeIcon from "./icons/AnyaEyeIcon";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface BottomNavBarItemProps {
  imgUrl?: string;
  route: string;
  icon?: ReactNode;
  name?: string;
  showUnreadIndicator?: boolean;
  unreadCount?: number;
}
export default function BottomNavBar() {
  const pathname = usePathname()
  
  // Get message data from Redux store
  const recentmsg = useSelector((state: RootState) => state.message.recentmsg);
  
  // Calculate total unread messages
  const totalUnreadCount = React.useMemo(() => {
    if (!recentmsg || !Array.isArray(recentmsg)) return 0;
    
    return recentmsg.reduce((total, message) => {
      const unreadCount = message.messagecount || message.unreadCount || 0;
      const hasUnread = message.unread || unreadCount > 0;
      return total + (hasUnread ? unreadCount : 0);
    }, 0);
  }, [recentmsg]);

  const routes: BottomNavBarItemProps[] = [
    {
      imgUrl: "/icons/icons8-home.png",
      route: "/",
      name: "Home"
    },
    // {
    //   imgUrl: "/icons/icons8-search-2.png",
    //   route: "/",
    //   name: "Search"
    // },
    {
      imgUrl: "/icons/icons8-notification-1.png",
      route: "/notifications",
      name: "Notifications"
    },
    {
      icon: <AnyaEyeIcon active={pathname === "/search"} />,
      route: "/anya",
      name: "",
    },
    {
      imgUrl: "/icons/icons8-message.png",
      route: "/message",
      name: "Messages",
      showUnreadIndicator: totalUnreadCount > 0,
      unreadCount: totalUnreadCount
    },
    // {
    //   route: "/",
    //   icon: <FaThLarge className="w-8 h-8 text-gray-500" />,
    // },
  ];
  return (
    <MenuProvider>
      <div className=" h-fit mr-8 mt-4 max-[600px]:m-0 fixed right-0 max-[600px]:bottom-6 max-[600px]:w-full">
        <div className="w-[25rem] mx-auto max-[600px]:w-[90%] rounded-2xl px-4 pt-4 pb-2 bg-gray-900 flex justify-between max-[500px]:w-[93%] bottom-4">
          {routes.map((item, i) => (
            <Link key={i} href={item.route} className={`w-12 flex flex-col items-center group hover:scale-110 transition-all duration-500 relative`}>
              {item.icon ? (
                <div className="">{item.icon}</div>
              ) : (
                <div className="relative">
                  <Image
                    src={item.imgUrl || ""}
                    className={`size-8 grayscale ${pathname === item.route ? "grayscale-0" : ""}`}
                    alt={item.name || "icon"}
                    width={100}
                    height={100}
                  />
                  {/* Unread indicator */}
                  {item.showUnreadIndicator && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {item.unreadCount && item.unreadCount > 99 ? (
                        <span className="flex items-center">
                          <span>99</span>
                          <span className="text-[10px] ml-0.5">+</span>
                        </span>
                      ) : (
                        item.unreadCount
                      )}
                    </div>
                  )}
                </div>
              )}
              <p className={` group-hover:opacity-100 opacity-0 mt-1 ${pathname === item.route ? "text-white" : "text-gray-500 "} text-xs transition-all duration-300`}>{item.name}</p>
            </Link>
          ))}
          <div className="max-[600px]:-top-0 max-[600px]:fixed"><Navapp /></div>
          <div className="max-[600px]:block hidden"><OpenMobileMenuBtn /></div>
        </div>
      </div>
    </MenuProvider>

  );
}
