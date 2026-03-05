import React, { useState } from "react";
import { Heart, MessageCircle, requestmark } from "lucide-react";

type TabItem = { 
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  content: React.ReactNode;
};

const Tabs = ({ tabs }: { tabs: TabItem[] }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-orange-400 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-orange-400'
                }`}
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

      {/* Tab Content */}
      <div className="p-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;
