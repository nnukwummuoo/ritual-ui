import React, { useState, useRef, useEffect } from "react";
// Replace with your actual menu icon SVG or import
import { FiMoreHorizontal } from "react-icons/fi";

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="px-2"
        aria-label="Options"
      >
        <FiMoreHorizontal size={22} className="text-white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <a
            href="#"
            className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Block User
          </a>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;