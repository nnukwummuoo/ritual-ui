import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="mb-3">
    <div className="relative">
      <FaSearch className="absolute top-3 left-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search Fans or Following..."
        className="w-full bg-gray-800 text-white py-3 px-12 rounded-md focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

export default SearchBar;
