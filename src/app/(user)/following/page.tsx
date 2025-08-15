"use client";
import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Tabs from "../../components/following/Tabs";
import SearchBar from "../../components/following/SearchBar";
import FollowerCard from "../../components/following/FollowerCard";
import Spinner from "../../components/ui/Spinner";
import { mockFollowData } from "../../utils/mockData";
import { User } from "../../types/user";

const firstname = "Jane"; 
const lastname = "Doe";

const FollowingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [userFollowing, setUserFollowing] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUserFollowing(mockFollowData.following);
  }, []);

  const followers = () => {
    const followersData = mockFollowData.followers.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div>
        <h1 className="text-lg font-bold text-white px-2 text-left mb-4 mt-4">
          {followersData.length} Fans
        </h1>
        <div className="flex flex-col items-start px-2">
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
    const filtered = userFollowing.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="">
        <h1 className="text-lg font-bold text-white px-2 text-left mt-4">
          {filtered.length} Following
        </h1>
        <div className="flex flex-col items-start px-2">
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
    <div className="flex flex-col justify-center items-center min-h-screen w-full">
      <div className="w-full max-w-md mx-auto my-6 p-4">
        {/* Header with back arrow + name and search icon */}
        <div className="flex justify-between items-center px-2 py-4 top-0 sticky z-10 bg-transparent">
          {/* Arrow + Name vertically aligned */}
          <div className="flex items-center gap-2">
            <FaAngleLeft
              color="white"
              size={30}
              onClick={() => window.history.back()}
              className="cursor-pointer"
            />
            <h4 className="text-gray-900 font-bold">{`${firstname} ${lastname}`}</h4>
          </div>

          {/* Search icon */}
          <FiSearch
            color="white"
            size={30}
            onClick={() => setToggle((v) => !v)}
            className="cursor-pointer"
          />
        </div>

        {/* Search bar aligned under search icon */}
        {toggle && (
          <div className="w-full flex justify-end px-2 mb-2">
            <div  className="w-full">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        )}

        {/* Tabs and content */}
        <div>
          {loading && <Spinner />}
          <Tabs
            tabs={[
              { label: "Following", content: following() },
              { label: "Fans", content: followers() },
            ]}
          />
        </div>
      </div>
    </div>
    
  );
};

export default FollowingPage;
