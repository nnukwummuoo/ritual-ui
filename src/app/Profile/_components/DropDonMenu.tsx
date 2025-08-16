import React, { useState } from "react";
import { useCall } from "@/lib/context/callContext";
// import { useCall } from "../../views/messageview/context";
const DropdownMenu = () => {
  const { closeOption, toggleoption , opening} = useCall()

  return (
    <div>
      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
          <img alt="options" src={"/icons/menu.svg"} />
        </button>

        {opening && (
          <div
            className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              {/* <a
                href="#"
                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                role="menuitem"
                onClick={toggleoption}
              >
                Report
              </a>
              <a
                href="#"
                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                role="menuitem"
                onClick={toggleoption}
              >
                Share
              </a> */}
              <a
                href="#"
                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                role="menuitem"
                onClick={toggleoption}
              >
                Block User
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
