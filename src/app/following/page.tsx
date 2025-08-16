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

const firstname = "Jane"; 
const lastname = "Doe";

const FollowingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [toggle, setToggle] = useState(false);
  const [search, setSearch] = useState("");
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const getfollow_stats = useSelector((s: RootState) => s.profile.getfollow_stats);
  const getfollow_data = useSelector((s: RootState) => s.profile.getfollow_data as any);
  const getfollow_error = useSelector((s: RootState) => s.profile.fllowmsg as string);

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
                modelId: data.modelId,
                isModel: data.isModel,
              })
            );
          }
        }
      } catch {}
    }
  }, [userid, dispatch]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[FollowingPage] mount; creds", { userid, hasToken: Boolean(token) });
    if (userid) {
      // eslint-disable-next-line no-console
      console.log("[FollowingPage] dispatch getfollow with userid", { userid });
      dispatch(getfollow({ userid, token }));
    }
  }, [userid, token, dispatch]);

  const loading = getfollow_stats === "loading";
  const apiFollowers: User[] = (getfollow_data?.followers as User[]) || [];
  const apiFollowing: User[] = (getfollow_data?.following as User[]) || [];
  // eslint-disable-next-line no-console
  console.log("[FollowingPage] stats/data", { getfollow_stats, counts: { followers: apiFollowers.length, following: apiFollowing.length } });

  // Prefer "Following" if it has items; otherwise default to "Fans" if it has items
  const initialActiveTab = React.useMemo(() => {
    if (apiFollowing.length > 0) return 0; // Following
    if (apiFollowers.length > 0) return 1; // Fans
    return 0;
  }, [apiFollowing.length, apiFollowers.length]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[FollowingPage] render tabs", { loading });
  }, [loading]);

  const followers = () => {
    const followersData = apiFollowers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
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
            <FollowerCard
              key={`${index}_${user.id}`}
              image={user.image}
              name={user.name}
              modelid={user.modelid}
            />
          ))}
        </div>
      </div>
    );
  };

  const following = () => {
    const filtered = apiFollowing.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="">
        <h1 className="text-lg font-bold text-white px-2 text-left mt-4">
          {filtered.length} Following
        </h1>
        <div className="flex flex-col items-start px-2">
          {!loading && filtered.length === 0 && (
            <p className="text-gray-400 px-2 py-4">Not following anyone yet.</p>
          )}
          {filtered.map((user, index) => (
            <FollowerCard
              key={`${index}_${user.id}`}
              image={user.image}
              name={user.name}
              modelid={user.modelid}
            />
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
              { label: "Following", content: following() },
              { label: "Fans", content: followers() },
            ]}
            initialActive={initialActiveTab}
          />
        </div>
      </div>
    </div>
    
  );
};

export default FollowingPage;
