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
} from "react-icons/fa";
import ContentFilterModal from "./ContentFilterModal";
import { usePathname } from "next/navigation";

export default function MobileSidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const { isOpen, toggle } = useAuth();
  const { isModalOpen, setIsModalOpen, filter, setFilter } = useContentFilter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

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
      // Close sidebar and open filter modal
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
    // Add "All" item at the beginning if on home page
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
    },
    // {
    //   route: "/",
    //   name: "Live",
    //   icon: <FaVideo size={25} />,
    // },
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
        className={`sidebar bg-gray-900 h-full flex flex-col overflow-y-auto ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
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
            {item.isFilter ? (
              <button
                className="flex items-center gap-4 text-white space-x-2 hover:opacity-80 transition-opacity"
                onClick={handleAllClick}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {item.icon}
                <p className="text-lg">{item.name}</p>
              </button>
            ) : (
              <Link
                className="flex items-center gap-4 text-white space-x-2 hover:opacity-80 transition-opacity"
                href={item.route}
                onClick={() => {
                  // Close sidebar when clicking navigation link
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
    
    {/* Content Filter Modal - Only show on home page, rendered outside sidebar for proper z-index */}
    {isHomePage && (
      <ContentFilterModal
        isOpen={isModalOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        currentFilter={filter}
      />
    )}
    </>
  );
}
