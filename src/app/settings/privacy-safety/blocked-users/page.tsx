"use client"
import React, {useState, useEffect} from 'react'
import PacmanLoader from "react-spinners/RotateLoader";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import Head from '../../../../components/Head';
import { Listofblockusers } from '../../_components/Listofblockusers';
import { URL as API_URL } from '@/api/config';
import axios from 'axios';

 const Blockusers = () => {
    const [loading, setloading] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [error, setError] = useState("");
    let [color, setColor] = useState("#d49115");
    
    const userid = useSelector((state: RootState) => state.register.userID);
    const profileUserId = useSelector((state: RootState) => state.profile?.userId || state.profile?.creatorID);
    
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
                console.log("🔍 [BLOCKED_USERS] UserID from localStorage:", userId);
              }
            }
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }, [userid]);

    const loggedInUserId = userid || profileUserId || localUserid;
    const dispatch = useDispatch();

    const fetchBlockedUsers = async () => {
      if (!loggedInUserId) {
        setError("Please log in to view blocked users");
        setloading(false);
        return;
      }

      try {
        const token = (() => {
          try {
            const raw = localStorage.getItem("login");
            if (raw) {
              const data = JSON.parse(raw);
              return data?.refreshtoken || data?.accesstoken;
            }
          } catch (error) {
            console.error("[BlockedUsers] Error retrieving token:", error);
          }
          return "";
        })();

        if (!token) {
          setError("Please log in to view blocked users");
          setloading(false);
          return;
        }

        const response = await axios.post(`${API_URL}/block/blocked-users`, {
          userId: loggedInUserId
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.data.ok) {
          console.log("🔍 [BLOCKED_USERS] API Response:", response.data);
          console.log("🔍 [BLOCKED_USERS] Blocked users data:", response.data.blockedUsers);
          setBlockedUsers(response.data.blockedUsers);
        } else {
          console.error("🔍 [BLOCKED_USERS] API Error:", response.data);
          setError(response.data.message || "Failed to load blocked users");
        }
      } catch (error: any) {
        console.error("Error fetching blocked users:", error);
        setError("Failed to load blocked users. Please try again.");
      } finally {
        setloading(false);
      }
    };

    useEffect(() => {
      fetchBlockedUsers();
    }, [loggedInUserId]);

    const showcontent = () => {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center py-16">
            <PacmanLoader
              color={color}
              loading={loading}
              size={15}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="text-gray-400 mt-4">Loading blocked users...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className='w-full'>
            <p className='w-full mt-16 text-xs text-center text-red-400'>{error}</p>
          </div>
        );
      }

      if (blockedUsers.length > 0) {
        return (
          <div className="space-y-3">
            {blockedUsers.map((user, index) => (
              <Listofblockusers 
                id={user.id} 
                photolink={user.photolink} 
                location={user.location} 
                online={user.online} 
                name={user.name} 
                key={index}
                onUnblock={() => fetchBlockedUsers()} // Refresh list after unblock
              />
            ))}
          </div>
        );
      } else {
        return (
          <div className='w-full text-center py-16'>
            <div className="text-gray-400 text-6xl mb-4">🚫</div>
            <h3 className="text-xl text-gray-300 mb-2">No Blocked Users</h3>
            <p className="text-gray-500">You haven't blocked any users yet.</p>
          </div>
        );
      }
    };
 
    return (
      <div className="w-screen mx-auto mt-16 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 md:mt-6">
  
      <div className='flex flex-col w-full'>
      <Head heading='List Of blocked users' />
      {loading && (
                <div className="flex flex-col items-center w-full">
                    <PacmanLoader
                    color={color}
                    loading={loading}
                    size={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    />

                    <p className="text-xs">Please wait...</p>
                </div>
      )}

     {showcontent()}
      </div>
      
    </div>
  )
}

export default Blockusers
