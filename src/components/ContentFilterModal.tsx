"use client";

import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

export type ContentFilterType = "all" | "text" | "video" | "photo";

interface ContentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: ContentFilterType) => void;
  currentFilter: ContentFilterType;
}

const ContentFilterModal: React.FC<ContentFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilter,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ContentFilterType>(currentFilter);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(selectedFilter);
    onClose();
  };

  const filterOptions = [
    { label: "All", value: "all" as ContentFilterType },
    { label: "Text only", value: "text" as ContentFilterType },
    { label: "Videos only", value: "video" as ContentFilterType },
    { label: "Photos only", value: "photo" as ContentFilterType },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 w-full h-full">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full max-w-md mx-4 rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-800 flex items-center justify-between px-4 py-3 border-b border-gray-700 rounded-t-lg">
          <h2 className="text-white text-lg font-semibold">Filter Content</h2>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Filter Options */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <input
                  type="radio"
                  name="contentFilter"
                  value={option.value}
                  checked={selectedFilter === option.value}
                  onChange={(e) => setSelectedFilter(e.target.value as ContentFilterType)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-200 text-base">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentFilterModal;

