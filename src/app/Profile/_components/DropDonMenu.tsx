import React from "react";
import { useCall } from "@/lib/context/callContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import { useCall } from "../../views/messageview/context";

interface DropdownMenuProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const DropdownMenu = ({ userId, isOwnProfile = false }: DropdownMenuProps) => {
  const { toggleoption, opening } = useCall();
  const router = useRouter();

  const handleAboutPage = () => {
    if (userId) {
      router.push(`/Profile/${userId}/about`);
    }
    toggleoption();
  };

  return (
    <div>
      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
          <Image alt="options" src={"/icons/menu.svg"} width={20} height={20} />
        </button>

        {opening && (
          <div
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              {!isOwnProfile && (
                <button
                  onClick={handleAboutPage}
                  className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                  role="menuitem"
                >
                  About this Page
                </button>
              )}
              {!isOwnProfile && (
                <button
                  onClick={toggleoption}
                  className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                  role="menuitem"
                >
                  Block User
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
