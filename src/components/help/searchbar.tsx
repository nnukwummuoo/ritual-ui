import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = () => {
  return (
    <div className="mb-3">
      <div className="relative">
        <FaSearch className="absolute top-3 left-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for articles..."
          className="w-full bg-gray-800 text-white py-3 px-12 rounded-md focus:outline-none"
        />
      </div>
    </div>
  );
};

export default SearchBar;
