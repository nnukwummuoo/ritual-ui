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
    const dispatch = useDispatch();

    const fetchBlockedUsers = async () => {
      if (!userid) {
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
          userId: userid
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.data.ok) {
          setBlockedUsers(response.data.blockedUsers);
        } else {
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
    }, [userid]);

    const showcontent = () => {
      if (loading) {
        return null;
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
          <div className="grid grid-cols-2 gap-2 p-2 mb-3">
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
          <div className='w-full'>
            <p className='w-full mt-16 text-xs text-center text-yellow-200'>No Blocked users!</p>
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
