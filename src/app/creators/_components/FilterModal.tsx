"use client";

import React, { useState } from "react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  totalCreators: number;
  filteredCount: number;
  initialFilters?: FilterState;
  creators?: any[];
}

export interface FilterState {
  sortBy: string;
  gender: string | null;
  region: string | null;
  ageMin: number | null;
  ageMax: number | null;
  searchQuery: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  totalCreators,
  filteredCount,
  initialFilters,
  creators = [],
}) => {
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || "");
  const [gender, setGender] = useState<string | null>(initialFilters?.gender || null);
  const [region, setRegion] = useState<string | null>(initialFilters?.region || null);
  const [ageMin, setAgeMin] = useState<number | null>(initialFilters?.ageMin || null);
  const [ageMax, setAgeMax] = useState<number | null>(initialFilters?.ageMax || null);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sortBy: true,
    gender: true,
    age: false,
    region: false,
    search: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClearAll = () => {
    setSortBy("");
    setGender(null);
    setRegion(null);
    setAgeMin(null);
    setAgeMax(null);
    setSearchQuery("");
    setSuggestions([]);
    onClear();
  };

  const handleShowModels = () => {
    onApply({
      sortBy,
      gender,
      region,
      ageMin,
      ageMax,
      searchQuery,
    });
    onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = creators
        .map((c) => c.name || c.fullName || "")
        .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(Array.from(new Set(filtered))); // Remove duplicates
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
  };

  const genderOptions = [
    { label: "Women", value: "Female", count: 0 },
    { label: "Men", value: "Male", count: 0 },
    { label: "Trans", value: "Trans", count: 0 },
    { label: "Couples", value: "Couple", count: 0 },
  ];

  const sortOptions = [
    { label: "New Creators", value: "New Creators" },
    { label: "Most Views", value: "Most Views" },
    { label: "Most Request", value: "Most Request" },
  ];

  const regionOptions = [
    { label: "All Regions", value: "All" },
    { label: "Asia", value: "Asia" },
    { label: "Europe", value: "Europe" },
    { label: "Africa", value: "Africa" },
    { label: "Americas", value: "Americas" },
    { label: "Oceania", value: "Oceania" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full h-full max-w-md mx-auto flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold">Filter</h2>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Filter Sections - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* SORT BY Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("sortBy")}
              className="w-full flex items-center justify-between py-2 font-bold text-white"
            >
              <span>SORT BY</span>
              {expandedSections.sortBy ? (
                <IoChevronDown className="w-5 h-5 text-white" />
              ) : (
                <IoChevronForward className="w-5 h-5 text-white" />
              )}
            </button>
            {expandedSections.sortBy && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {sortOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer py-1"
                  >
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={sortBy === option.value}
                      onClick={() => {
                        if (sortBy === option.value) {
                          setSortBy("");
                        } else {
                          setSortBy(option.value);
                        }
                      }}
                      onChange={() => { }} // Handled by onClick for toggle behavior
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-200">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* GENDER Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("gender")}
              className="w-full flex items-center justify-between py-2 font-bold text-white"
            >
              <span>GENDER</span>
              {expandedSections.gender ? (
                <IoChevronDown className="w-5 h-5 text-white" />
              ) : (
                <IoChevronForward className="w-5 h-5 text-white" />
              )}
            </button>
            {expandedSections.gender && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer py-1"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-200">
                      {option.label} {option.count > 0 && `(${option.count})`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* AGE Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("age")}
              className="w-full flex items-center justify-between py-2 font-bold text-white"
            >
              <span>AGE</span>
              {expandedSections.age ? (
                <IoChevronDown className="w-5 h-5 text-white" />
              ) : (
                <IoChevronForward className="w-5 h-5 text-white" />
              )}
            </button>
            {expandedSections.age && (
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={ageMin || ""}
                    onChange={(e) =>
                      setAgeMin(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="18"
                    max="100"
                  />
                  <span className="text-gray-300">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={ageMax || ""}
                    onChange={(e) =>
                      setAgeMax(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="18"
                    max="100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* REGION Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("region")}
              className="w-full flex items-center justify-between py-2 font-bold text-white"
            >
              <span>REGION</span>
              {expandedSections.region ? (
                <IoChevronDown className="w-5 h-5 text-white" />
              ) : (
                <IoChevronForward className="w-5 h-5 text-white" />
              )}
            </button>
            {expandedSections.region && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {regionOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer py-1"
                  >
                    <input
                      type="radio"
                      name="region"
                      value={option.value}
                      checked={region === option.value || (option.value === "All" && !region)}
                      onChange={(e) => setRegion(e.target.value === "All" ? null : e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-200">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SEARCH Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection("search")}
              className="w-full flex items-center justify-between py-2 font-bold text-white"
            >
              <span>SEARCH</span>
              {expandedSections.search ? (
                <IoChevronDown className="w-5 h-5 text-white" />
              ) : (
                <IoChevronForward className="w-5 h-5 text-white" />
              )}
            </button>
            {expandedSections.search && (
              <div className="mt-2 relative">
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-40 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 text-gray-200 hover:bg-gray-700 cursor-pointer"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex gap-3">
          <button
            onClick={handleClearAll}
            className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700 transition-colors"
          >
            CLEAR ALL
          </button>
          <button
            onClick={handleShowModels}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            SHOW CREATORS
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;

