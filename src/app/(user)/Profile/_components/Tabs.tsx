import React, { useState } from "react";

const Tabs = ({ tabs }: {tabs: {label: string, content: string}[]}) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex space-x-4 border-b border-gray-300 mb-4">
        {tabs.map((tab: {label: string}, index: number) => (
          <button
            key={index}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === index
                ? "border-b-2 border-yellow-600 text-yellow-600"
                : "text-gray-600 hover:text-yellow-600"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tabs;
