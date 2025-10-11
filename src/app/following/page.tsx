/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Tabs from "../../components/following/Tabs";
import SearchBar from "../../components/following/SearchBar";
import FollowerCard from "../../components/following/FollowerCard";
import Spinner from "../../components/ui/Spinner";
import { User } from "../../types/user";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getfollow } from "../../store/profile";
import { loginAuthUser } from "../../store/registerSlice";
import { getAllUsers } from "../../store/profile";

// Utility function to format numbers with k notation
const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 10000) {
    const k = (num / 1000).toFixed(1);
    return k.endsWith('.0') ? k.slice(0, -2) + 'k' : k + 'k';
  }
  
  return Math.floor(num / 1000) + 'k';
};

const FollowingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [toggle, setToggle] = useState(false);
  const [search, setSearch] = useState("");
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const getfollow_stats = useSelector((s: RootState) => s.profile.getfollow_stats);
  const getfollow_data = useSelector((s: RootState) => s.profile.getfollow_data as any);
  const getfollow_error = useSelector((s: RootState) => s.profile.fllowmsg as string);
  const getAllUsers_stats = useSelector((s: RootState) => s.profile.getAllUsers_stats);
  const getAllUsers_data = useSelector((s: RootState) => s.profile.getAllUsers_data as any);

  // Logged-in user's name from profile slice
  const firstname = useSelector((s: RootState) => s.profile.firstname) || "";
  const lastname = useSelector((s: RootState) => s.profile.lastname) || "";

  // 1) Hydrate register slice from localStorage if empty (client-only)
  useEffect(() => {
    if (!userid && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw || "{}");
          if (data?.userID) {
            dispatch(
              loginAuthUser({
                email: data.email || "",
                password: data.password || "",
                message: "restored",
                refreshtoken: data.refreshtoken || "",
                accesstoken: data.accesstoken || "",
                userID: data.userID || "",
                creator_portfoliio_Id: data.creator_portfoliio_Id,
                creator_portfolio: data.creator_portfolio,
              })
            );
          }
        }
      } catch {}
    }
  }, [userid, dispatch]);

  useEffect(() => {
    // Get token from localStorage if not in Redux state
    let authToken = token;
    let currentUserid = userid;
    
    if (!authToken && typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          authToken = parsedData.refreshtoken || parsedData.accesstoken;
        }
      } catch (error) {
        // Silent fail
      }
    }
    
    // Get userid from localStorage if not in Redux
    if (!currentUserid && typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          currentUserid = parsedData.userID || parsedData.userid || parsedData.id;
        }
      } catch (error) {
        // Silent fail
      }
    }

    if (currentUserid && authToken) {
      dispatch(getfollow({ userid: currentUserid, token: authToken }));
      // Also fetch all users for discovery
      dispatch(getAllUsers({ token: authToken, userid: currentUserid }));
    }
  }, [userid, token, dispatch]);

  const loading = getfollow_stats === "loading" || getAllUsers_stats === "loading";
  
  // Get current userid from multiple sources (same logic as useEffect)
  let currentUserid = userid;
  if (!currentUserid && typeof window !== 'undefined') {
    try {
      const loginData = localStorage.getItem('login');
      if (loginData) {
        const parsedData = JSON.parse(loginData);
        currentUserid = parsedData.userID || parsedData.userid || parsedData.id;
      }
    } catch (error) {
      // Silent fail
    }
  }
  
  // Debug: Log current userid and data
  console.log("🔍 [FollowingPage] Current userid:", currentUserid);
  console.log("🔍 [FollowingPage] Raw followers data:", getfollow_data?.followers?.length || 0);
  console.log("🔍 [FollowingPage] Raw following data:", getfollow_data?.following?.length || 0);
  
  // Get followers/following from API response and filter out current user
  const apiFollowers: User[] = (getfollow_data?.followers as User[])?.filter(user => {
    const isNotCurrentUser = String(user.id) !== String(currentUserid);
    if (!isNotCurrentUser) {
      console.log("🔍 [FollowingPage] Filtering out current user from followers:", { userId: user.id, currentUserid: currentUserid, userName: user.name });
    }
    return isNotCurrentUser;
  }) || [];
  const apiFollowing: User[] = (getfollow_data?.following as User[])?.filter(user => {
    const isNotCurrentUser = String(user.id) !== String(currentUserid);
    if (!isNotCurrentUser) {
      console.log("🔍 [FollowingPage] Filtering out current user from following:", { userId: user.id, currentUserid: currentUserid, userName: user.name });
    }
    return isNotCurrentUser;
  }) || [];
  
  // Use useMemo to prevent unnecessary re-renders and filter out current user
  const allUsers = React.useMemo(() => {
    return (getAllUsers_data as User[])?.filter(user => 
      String(user._id) !== String(currentUserid)
    ) || [];
  }, [getAllUsers_data, currentUserid]);
  
  // Check if user object has followers/following arrays directly
  // This is for when the backend returns user data with these arrays
  useEffect(() => {
    if (allUsers.length > 0 && userid) {
      try {
        // Find current user in allUsers
        const currentUser = allUsers.find((user: any) => String(user._id) === String(userid));
        if (currentUser && Array.isArray(currentUser.following)) {
          // Found following array in user data
        }
      } catch (e) {
        // Silent fail
      }
    }
  }, [allUsers, userid]);

  // Prefer "Following" if it has items; otherwise default to "Fans" if it has items
  // Always default to the Discover tab (index 2) when there are no followers/following
  const initialActiveTab = React.useMemo(() => {
    if (apiFollowing.length > 0) return 0; // Following
    if (apiFollowers.length > 0) return 1; // Fans
    return 2; // Discover tab by default if no relationships exist
  }, [apiFollowing.length, apiFollowers.length]);


  const followers = () => {
    // CHANGED: Show ALL users who follow me (both mutual and non-mutual follows)
    // These are users who follow me - regardless of whether I follow them back
    const followersData = apiFollowers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) && 
      String(user.id) !== String(currentUserid) // Exclude current user
    );
    
    return (
      <div>
        <h1 className="text-lg font-bold text-white px-2 text-left mb-4 mt-4">
          {followersData.length} Fans
        </h1>
        <div className="flex flex-col items-start px-2">
          {!loading && followersData.length === 0 && (
            <p className="text-gray-400 px-2 py-4">No fans to show yet.</p>
          )}
          {followersData.map((user, index) => (
            <div key={`fan_${index}_${user.id}`} className=" w-full">
              <FollowerCard
                key={`fan_${index}_${user.id}`}
                image={user.image || ""}
                name={user.name}
                creator_portfoliio_Id={user.creator_portfoliio_Id}
                userId={user.id}
                isVip={user.isVip || false}
                vipStartDate={user.vipStartDate}
                vipEndDate={user.vipEndDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const following = () => {
    // These are users I follow - both mutual and non-mutual follows
    // Get all users I follow from apiFollowing (database is the source of truth)
    const combinedFollowing = apiFollowing.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) && 
      String(user.id) !== String(currentUserid) // Exclude current user
    );
    
    return (
      <div className="">
        <h1 className="text-lg font-bold text-white px-2 text-left mt-4">
          {combinedFollowing.length} Following
        </h1>
        <div className="flex flex-col items-start px-2">
          {!loading && combinedFollowing.length === 0 && (
            <p className="text-gray-400 px-2 py-4">Not following anyone yet.</p>
          )}
          {combinedFollowing.map((user, index) => {
            // Pre-mark these cards as followed since they're in the Following tab
            return (
              <div key={`following_${index}_${user.id}`} className="following-user w-full flex" data-followed="true">
                <FollowerCard
                  key={`following_${index}_${user.id}`}
                  image={user.image || ""}
                  name={user.name}
                  creator_portfoliio_Id={user.creator_portfoliio_Id}
                  userId={user.id}
                  isVip={user.isVip || false}
                  vipStartDate={user.vipStartDate}
                  vipEndDate={user.vipEndDate}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const discoverUsers = () => {
    // Get all following IDs from apiFollowing
    const followingIds = new Set(apiFollowing.map(u => String(u.id)));
    
    // Get all follower IDs from apiFollowers
    const followerIds = new Set(apiFollowers.map(u => String(u.id)));
    
    // Filter users for the Discover tab - only show users that:
    // 1. Are not the current user
    // 2. Are not already followed by the current user
    // 3. Are not following the current user
    // 4. Match the search query
    const discoverableUsers = allUsers.filter((user: any) => {
      const fullName = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim().toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase());
      const isNotCurrentUser = String(user._id) !== String(userid);
      
      // If we have no followers/following data, just filter out current user
      if (apiFollowers.length === 0 && apiFollowing.length === 0) {
        return matchesSearch && isNotCurrentUser;
      }
      
      // Otherwise, use the filtering logic based on database data
      const isNotAlreadyFollowing = !followingIds.has(String(user._id));
      const isNotFollowingMe = !followerIds.has(String(user._id));
      return matchesSearch && isNotCurrentUser && isNotAlreadyFollowing && isNotFollowingMe;
    });

    return (
      <div className="">
        <h1 className="text-lg font-bold text-white px-2 text-left mt-4">
          {formatNumber(discoverableUsers.length)}  Verified Members Ready to Connect
        </h1>
        <div className="flex flex-col items-start px-2">
          {!loading && discoverableUsers.length === 0 && (
            <p className="text-gray-400 px-2 py-4">No users to discover right now.</p>
          )}
          {discoverableUsers.map((user: any, index: number) => (
            <div key={`discover_${index}_${user._id}`} className="discover-user w-full flex ">
              <FollowerCard
                key={`discover_${index}_${user._id}`}
                image={user.photolink || ""}
                name={`${user.firstname} ${user.lastname}`.trim()}
                creator_portfoliio_Id={user.creator_portfoliio_Id || ""}
                userId={user._id}
                isVip={user.isVip || false}
                vipStartDate={user.vipStartDate}
                vipEndDate={user.vipEndDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0e0f2a] text-white overflow-y-scroll [scrollbar-gutter:stable]">
      <div className="w-full max-w-[1400px] mx-auto pt-6 px-4 md:px-6 lg:px-8">
        {/* Header with back arrow + name and search icon */}
        <div className="bg-[#0e0f2a] py-2 px-2">
          <div className="flex justify-between items-center">
          {/* Arrow + Name vertically aligned */}
          <div className="flex items-center gap-2">
            <FaAngleLeft
              color="white"
              size={30}
              onClick={() => window.history.back()}
              className="cursor-pointer"
            />
            <h4 className="text-white font-bold">{`${firstname} ${lastname}`}</h4>
          </div>

          {/* Search icon */}
          <FiSearch
            color="white"
            size={30}
            onClick={() => setToggle((v) => !v)}
            className="cursor-pointer"
          />
        </div>

        </div>

        {/* Search bar aligned under search icon */}
        <div className="w-full px-2 md:px-0 mb-2 min-h-[56px] flex items-center">
          <div className={toggle ? "w-full" : "w-full invisible"}>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        {/* Error banner */}
        {getfollow_stats === "failed" && (
          <div className="mx-2 md:mx-0 mb-3 rounded border border-red-500 bg-red-900/30 text-red-300 p-3 flex items-start justify-between gap-3">
            <div className="text-sm">
              {getfollow_error || "Failed to load followers. Please try again."}
            </div>
            <button
              onClick={() => userid && dispatch(getfollow({ userid, token }))}
              className="shrink-0 px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs and content */}
        <div className="px-2 md:px-0">
          {loading && <Spinner />}
          <Tabs
            tabs={[
              { label: "Following", content: <div className="following-tab">{following()}</div> },
              { label: "Fans", content: <div className="fans-tab">{followers()}</div> },
              { label: "Discover", content: <div className="discover-tab">{discoverUsers()}</div> },
            ]}
            initialActive={initialActiveTab}
          />
        </div>
      </div>
    </div>
    
  );
};

export default FollowingPage;