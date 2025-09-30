"use client";
import React, { useState, useRef, useEffect } from "react";
import { Ellipsis } from 'lucide-react';

const DropdownMenu = () => {
  const [opening, setOpening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleoption = () => {
    setOpening(!opening);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpening(false);
      }
    };

    if (opening) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [opening]);

  return (
    <div ref={dropdownRef}>
      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
        <Ellipsis />
        </button>

        {opening && (
          <div
            className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-gray-800 border border-gray-700 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              <button
                className="text-gray-300 block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                role="menuitem"
                onClick={() => {
                  setOpening(false);
                  // Add block user functionality here
                  console.log('Block user clicked');
                }}
              >
                Block User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
