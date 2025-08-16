import { useAuth } from "@/lib/context/auth-context";
import "@/styles/app.css"
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BiSolidReport } from "react-icons/bi";
import {
  FaHeart,
} from "react-icons/fa";
import { IoPerson, IoShieldCheckmark } from "react-icons/io5";
import { MdPayment } from "react-icons/md";

export default function MobileSidebar() {
  const sideBarItems = [
    {
      route: "/mmeko/admin/",
      name: "Overview",
      icon: <FaHeart size={25} />,
    },
    {
      route: "/mmeko/admin/reports",
      name: "Reports",
      icon: <BiSolidReport size={25} />,
    },
    {
      route: "/mmeko/admin/model-verification",
      name: "Model",
      icon: <IoShieldCheckmark size={25} />,
    },
    {
      route: "/mmeko/admin/withdrawal",
      name: "Withdrawal",
      icon: <MdPayment size={25} />,
    },
    {
      route: "/mmeko/admin/users",
      name: "Users",
      icon: <IoPerson size={25} />,
    }
  ];
  const { isOpen, toggle } = useAuth();
  return (
    <section
      className={`sidebar bg-gray-900 ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <Link href="/" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <img src={'/icons/logo.png'} alt="logo" className="brand-logo w-20" />
        <img src={'/icons/icon-192.png'} alt="logo" className="sidebar-logo" />
      </Link>
      <ul className="py-4">
        {sideBarItems.map((item) => (
          <li key={item.name} className="gap-y-3.5 text-sm">
            <Link
              className="flex items-center gap-4 text-white space-x-2"
              href={item.route}
              onClick={toggle}
            >
              {item.icon}
              <p className="text-lg">{item.name}</p>
            </Link>
          </li>

        ))}
      </ul>
    </section>
  );
}
