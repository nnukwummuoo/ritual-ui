import React, { useState } from "react";
import Options from "../../icons/menu.svg";
import { useCallContext } from "../contextAPI/useCallContext";
// import { useCall } from "../contextAPI/useCallContext";
const DropdownMenu = () => {
  const { closeOption, toggleoption , opening} = useCallContext()

 

  return (
    <div>
      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
          <img alt="options" src={Options} />
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
