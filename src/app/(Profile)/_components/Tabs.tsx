import React, { useState } from "react";

type TabItem = { 
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  content: React.ReactNode;
};

const Tabs = ({ tabs }: { tabs: TabItem[] }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const getTabColor = (tabId: string) => {
    const isActive = activeTab === tabId;
    const isHovered = hoveredTab === tabId;

    if (isActive) return "#c084fc"; // purple-400 always, even on hover
    if (isHovered) return "#fb923c"; // orange-400 only for inactive
    return "#9ca3af"; // gray-400 default
  };

  return (
    <div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const color = getTabColor(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors"
                style={{
                  color,
                  borderBottomColor: isActive ? "#c084fc" : "transparent",
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs text-black bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;