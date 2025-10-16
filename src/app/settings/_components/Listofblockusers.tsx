import React, {useState, useEffect} from 'react'
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import PacmanLoader from "react-spinners/RotateLoader";
import person from "../../../icons/icons8-profile_Icon.png"
import onlineIcon from "../../../icons/onlineIcon.svg"
import offlineIcon from "../../../icons/offlineIcon.svg"
import { getCountryData } from '../../../api/getCountries';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { URL as API_URL } from '@/api/config';
import axios from 'axios';
import { toast } from 'material-react-toastify';

type ListOfBlockUsersProps = {
  id: string;
  photolink?: string;
  location: string;
  online: boolean;
  name: string;
  onUnblock?: () => void;
};

export const Listofblockusers: React.FC<ListOfBlockUsersProps> = ({ id, photolink, location, online, name, onUnblock }) => {

let timeout: number | undefined;
const userid = useSelector((state: RootState) => state.register.userID as string);
const profileUserId = useSelector((state: RootState) => state.profile?.userId || state.profile?.creator_portfolio_id);

// Get userid from localStorage if not in Redux (same pattern as DropdownMenu)
const [localUserid, setLocalUserid] = React.useState("");

React.useEffect(() => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        
        // Set user ID if not in Redux - check multiple possible keys
        if (!userid) {
          const userId = data?.userID || data?.userid || data?.id;
          if (userId) {
            setLocalUserid(userId);
            console.log("🔍 [UNBLOCK] UserID from localStorage:", userId);
          }
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }
}, [userid]);

const loggedInUserId = userid || profileUserId || localUserid;
const [loading, setloading] = useState(false);
// Store image as a string URL for use in <img src="..."/>
const [image, setimage] = useState<string>(typeof person === 'string' ? person : (person as StaticImageData).src);
let [color, setColor] = useState("#d49115");
let [disable, setdisable] = useState(false);
let [buttonpressed, set_buttonpressed] = useState(false)
const dispatch = useDispatch<AppDispatch>()

const [countryData, setCountryData] = useState({
    flag: "",
    abbreviation: "",
    fifa: "",
  });
  
  useEffect(() => {

    if(photolink){
      setimage(photolink)
    }
    const fetchData = async () => {
      const data = await getCountryData(location);
      if (data) setCountryData(data);
    };
    fetchData();
  }, []);

  const unblockClick = async () => {
    if (loading) return;

    // Add confirmation dialog
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.info(
        <div className="flex flex-col gap-3 bg-blue-900 p-4 rounded-lg">
          <div className="text-white">
            Are you sure you want to unblock {name}? You will be able to see their posts and they will be able to see yours.
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
            >
              Unblock User
            </button>
            <button
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          className: "toast-confirmation",
          style: {
            backgroundColor: "#1e3a8a", // dark blue background
            color: "white"
          }
        }
      );
    });

    if (!confirmed) {
      return;
    }

    setloading(true);
    setdisable(true);

    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[UnblockUser] Error retrieving token:", error);
        }
        return "";
      })();

      if (!token) {
        toast.error("Please log in to unblock users");
        return;
      }

      const response = await axios.post(`${API_URL}/block/unblock`, {
        blockerId: loggedInUserId,
        blockedUserId: id
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.ok) {
        toast.success("User unblocked successfully");
        if (onUnblock) {
          onUnblock(); // Refresh the list
        }
      } else {
        toast.error(response.data.message || "Failed to unblock user");
      }

    } catch (error: any) {
      console.error("Error unblocking user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to unblock user. Please try again.");
      }
    } finally {
      setloading(false);
      set_buttonpressed(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          {/* Profile Picture */}
          <div className="relative">
            {image && image !== (typeof person === 'string' ? person : (person as StaticImageData).src) ? (
              <Image
                alt="Profile"
                src={image}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                <span className="text-white font-bold text-lg">
                  {(() => {
                    // Remove @ symbol and get the second word, then take first letter
                    const cleanName = name.replace('@', '');
                    const words = cleanName.split(' ');
                    const secondWord = words[1] || words[0]; // Use second word or first if only one word
                    return secondWord.charAt(0).toUpperCase();
                  })()}
                </span>
              </div>
            )}
            {/* Online Status */}
            <div className="absolute -bottom-1 -right-1">
              <div className={`w-4 h-4 rounded-full border-2 border-gray-800 ${
                online ? "bg-green-500" : "bg-gray-500"
              }`}></div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{name}</h3>
            <div className="flex items-center space-x-2 mt-1">
             
              
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-400 text-sm">
                {online ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Unblock Button */}
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="flex items-center space-x-2">
              <PacmanLoader
                color={color}
                loading={loading}
                size={8}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <span className="text-gray-400 text-sm">Unblocking...</span>
            </div>
          ) : (
            <button
              onClick={unblockClick}
              disabled={disable}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Unblock
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
