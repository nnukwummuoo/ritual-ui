"use client";
import React, { ReactNode, useEffect, useState } from "react";
import homeicon from "../icons/homeIcon.svg";
import searchIcon from "../icons/searchIcon1.svg";
import notificationIcon from "../icons/notificationIcon.svg";
import Link from "next/link";
import Image from "next/image";
import { FaThLarge } from "react-icons/fa";
import Navapp from "@/navs/NavApp";
import MenuContext from "@/lib/context/MenuContext";
import MenuProvider from "@/lib/context/MenuContext";
import OpenMobileMenuBtn from "./OpenMobileMenuBtn";
import { usePathname } from "next/navigation";
import AnyaEyeIcon from "./icons/AnyaEyeIcon";

interface BottomNavBarItemProps {
  imgUrl?: string;
  route: string;
  icon?: ReactNode;
  name?: string;
}
export default function BottomNavBar() {
  const [activeTab, setActiveTab] = useState("home");
  const pathname = usePathname()
  const handleNavigation = (path: string, home: string) => {
    console.log(path, home);
  };

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
      name: "Messages"
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
            <Link key={i} href={item.route} className={`w-12 flex flex-col items-center  group hover:scale-110 transition-all duration-500`}>
              {item.icon ? (
                <div className="">{item.icon}</div>
              ) : (
                <Image
                  src={item.imgUrl || ""}
                  className={`size-8 grayscale ${pathname === item.route ? "grayscale-0" : ""}`}
                  alt={item.name || "icon"}
                  width={100}
                  height={100}
                />
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
