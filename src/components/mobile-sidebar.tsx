import { useAuth } from "@/lib/context/auth-context";
import "../styles/app.css"
import Image from "next/image";
import anyaLogo from '@/icons/logo.png';
import MmekoLogo from '@/icons/Mmeko_mobile_logo.png';
import Link from "next/link";
import React from "react";
import {
  FaCamera,
  FaCog,
  FaComments,
  FaCompass,
  FaHeart,
  FaQuestionCircle,
  FaUpload,
  FaUsersCog,
  FaVideo,
  FaStar,
  FaTimes,
  FaBars,
} from "react-icons/fa";

export default function MobileSidebar() {
  const sideBarItems = [
    {
      route: "/",
      name: "For You",
      icon: <FaHeart size={25} />,
    },
    {
      route: "/creators",
      name: "Creators",
      icon: <FaCamera size={25} />,
    },
    {
      route: "/search",
      name: "Explorer",
      icon: <FaCompass size={25} />,
    },
    {
      route: "/upload",
      name: "Upload",
      icon: <FaUpload size={25} />,
    },
    {
      route: "/",
      name: "Live",
      icon: <FaVideo size={25} />,
    },
    {
      route: "/settings",
      name: "Settings",
      icon: <FaCog size={25} />,
    },
    {
      route: "/feedback",
      name: "Feedback",
      icon: <FaComments size={25} />,
    },
    {
      route: "/support",
      name: "Support",
      icon: <FaQuestionCircle size={25} />,
    },
    {
      route: "/guidelines",
      name: "Guidelines",
      icon: <FaUsersCog size={25} />,
    },
  ];
  const { isOpen, toggle } = useAuth();
  return (
    <section
      className={`sidebar bg-gray-900 ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <Link href="/" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Image src={anyaLogo} alt="logo" className="brand-logo w-20" />
        <Image src={MmekoLogo} alt="logo" className="sidebar-logo" />
      </Link>
      <button onClick={toggle} className="navBtn">
        {/* {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />} */}
        <span className="bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-blue-500">
          {isOpen ? <FaTimes size={25} className="text-blue-500" /> : <FaBars size={25} />}
        </span>
      </button>
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
