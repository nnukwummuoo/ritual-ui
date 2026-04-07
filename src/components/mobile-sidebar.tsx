'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/lib/context/auth-context";
import { useContentFilter } from "@/lib/context/content-filter-context";
import "../styles/app.css";
import Link from "next/link";
import {
  FaCamera,
  FaCog,
  FaCompass,
  FaHeart,
  FaQuestionCircle,
  FaUpload,
  FaUsersCog,
  FaTimes,
  FaBars,
  FaUserPlus,
} from "react-icons/fa";
import ContentFilterModal from "./ContentFilterModal";
import UploadChoiceModal from "./UploadChoiceModal";
import { usePathname } from "next/navigation";

export default function MobileSidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const { isOpen, toggle } = useAuth();
  const { isModalOpen, setIsModalOpen, filter, setFilter } = useContentFilter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggle();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggle]);

  const handleAllClick = () => {
    if (!isHomePage) return;
    if (isOpen) toggle();
    setIsModalOpen(true);
  };

  const handleFilterApply = (selectedFilter: typeof filter) => {
    setFilter(selectedFilter);
    setIsModalOpen(false);
  };

  const sideBarItems = [
    ...(isHomePage ? [{
      route: "#",
      name: "All",
      icon: <FaCompass size={20} />,
      isFilter: true,
    }] : []),
    { route: "/",              name: "For You",    icon: <FaHeart size={20} /> },
    { route: "/creators",      name: "Creators",   icon: <FaCamera size={20} /> },
    { route: "/discover",      name: "Discover",   icon: <FaCompass size={20} /> },
    { route: "/upload",        name: "Upload",     icon: <FaUpload size={20} />, isUpload: true },
    { route: "/refer-and-earn",name: "Refer & Earn", icon: <FaUserPlus size={20} /> },
    { route: "/settings",      name: "Settings",   icon: <FaCog size={20} /> },
    { route: "/support",       name: "Support",    icon: <FaQuestionCircle size={20} /> },
    { route: "/guidelines",    name: "Guidelines", icon: <FaUsersCog size={20} /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999] md:hidden"
          onClick={toggle}
        />
      )}

      <section
        ref={sidebarRef}
        className={`sidebar bg-[#080b14] ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        {/* Logo */}
        <Link href="/" className="sidebar-logo-link" onClick={() => { if (isOpen) toggle(); }}>
          <div className="sidebar-logo-icon">M</div>
          <span className="sidebar-logo-text">mmeko</span>
        </Link>

        {/* Mobile toggle button */}
        <button onClick={toggle} className="navBtn">
          {isOpen
            ? <FaTimes size={22} className="text-blue-500" />
            : <FaBars size={22} className="text-blue-500" />
          }
        </button>

        {/* Nav items */}
        <ul className="sidebar-nav-list">
          {sideBarItems.map((item) => (
            <li key={item.name} className="sidebar-nav-item-wrapper">
              {item.isFilter ? (
                <button className="sidebar-nav-item" onClick={handleAllClick}>
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.name}</span>
                </button>
              ) : (item as any).isUpload ? (
                <button
                  className="sidebar-nav-item"
                  onClick={() => { if (isOpen) toggle(); setShowUploadModal(true); }}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.name}</span>
                </button>
              ) : (
                <Link
                  className="sidebar-nav-item"
                  href={item.route}
                  onClick={() => { if (isOpen) toggle(); }}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isHomePage && (
        <ContentFilterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApply={handleFilterApply}
          currentFilter={filter}
        />
      )}

      <UploadChoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </>
  );
}