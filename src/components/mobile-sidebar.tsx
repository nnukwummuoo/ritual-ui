'use client';

import { useState } from 'react';
import { useAuth } from "@/lib/context/auth-context";
import { useContentFilter } from "@/lib/context/content-filter-context";
import "../styles/app.css"
import Image from "next/image";
import anyaLogo from '@/icons/logo.png';
import MmekoLogo from '@/icons/Mmeko_mobile_logo.png';
import Link from "next/link";
import React, { useEffect, useRef } from "react";
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

  // NEW: upload choice modal state
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggle]);

  const handleAllClick = () => {
    if (isHomePage) {
      if (isOpen) {
        toggle();
      }
      setIsModalOpen(true);
    }
  };

  const handleFilterApply = (selectedFilter: typeof filter) => {
    setFilter(selectedFilter);
    setIsModalOpen(false);
  };

  const handleFilterClose = () => {
    setIsModalOpen(false);
  };

  const sideBarItems = [
    ...(isHomePage ? [{
      route: "#",
      name: "All",
      icon: <FaCompass size={25} />,
      isFilter: true,
    }] : []),
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
      route: "/discover",
      name: "Discover",
      icon: <FaCompass size={25} />,
    },
    {
      route: "/upload",
      name: "Upload",
      icon: <FaUpload size={25} />,
      isUpload: true, // NEW flag — intercepts navigation to open modal
    },
    {
      route: "/refer-and-earn",
      name: "Refer & Earn",
      icon: <FaUserPlus size={25} />,
    },
    {
      route: "/settings",
      name: "Settings",
      icon: <FaCog size={25} />,
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

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999] md:hidden"
          onClick={toggle}
        />
      )}

      <section
        ref={sidebarRef}
        className={`sidebar bg-[#080b14] h-full flex flex-col overflow-y-auto ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <Link
          href="/"
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
          onClick={() => {
            if (isOpen) {
              toggle();
            }
          }}
        >
          <div className="flex items-center gap-2 cursor-pointer justify-center py-4">
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg,#6c63ff,#9b59f5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "white", flexShrink: 0,
            }}
            className="sidebar-logo-icon"
            >M</div>
            <span
              style={{
                fontSize: 17, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px",
                display: "none",
              }}
              className="sidebar-logo-text"
            >
              mmeko
            </span>
            <style>{`
              @media (min-width: 1024px) {
                .sidebar-logo-text { display: block !important; font-size: 22px !important; }
                .sidebar-logo-icon { width: 42px !important; height: 42px !important; font-size: 20px !important; border-radius: 11px !important; }
              }
            `}</style>
          </div>
        </Link>

        <button onClick={toggle} className="navBtn">
          <span className="bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-blue-500">
            {isOpen ? <FaTimes size={25} className="text-blue-500" /> : <FaBars size={25} />}
          </span>
        </button>

        <ul className="py-4">
          {sideBarItems.map((item) => (
            <li key={item.name} className="gap-y-3.5 text-sm">
              {item.isFilter ? (
                // "All" filter button
                <button
                  className="flex items-center gap-4 text-white space-x-2 hover:opacity-80 transition-opacity"
                  onClick={handleAllClick}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {item.icon}
                  <p className="text-lg">{item.name}</p>
                </button>
              ) : (item as any).isUpload ? (
                // "Upload" — opens choice modal, same visual style as a Link
                <button
                  className="flex items-center gap-4 text-white space-x-2 hover:opacity-80 transition-opacity"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => {
                    if (isOpen) toggle();
                    setShowUploadModal(true);
                  }}
                >
                  {item.icon}
                  <p className="text-lg">{item.name}</p>
                </button>
              ) : (
                // All other nav links
                <Link
                  className="flex items-center gap-4 text-white space-x-2 hover:opacity-80 transition-opacity"
                  href={item.route}
                  onClick={() => {
                    if (isOpen) {
                      toggle();
                    }
                  }}
                >
                  {item.icon}
                  <p className="text-lg">{item.name}</p>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Content Filter Modal */}
      {isHomePage && (
        <ContentFilterModal
          isOpen={isModalOpen}
          onClose={handleFilterClose}
          onApply={handleFilterApply}
          currentFilter={filter}
        />
      )}

      {/* Upload Choice Modal */}
      <UploadChoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </>
  );
}