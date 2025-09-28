import React from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialActive?: number;
}

const Tabs: React.FC<TabsProps> = ({ tabs, initialActive = 0 }) => {
  const [active, setActive] = React.useState(initialActive);

  React.useEffect(() => {
    // Keep active index in range when tabs or initialActive changes
    const next = Math.min(Math.max(initialActive, 0), Math.max(tabs.length - 1, 0));
    setActive(next);
  }, [initialActive, tabs.length]);

  return (
    <div>
      <div className="flex border-b border-gray-700">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-6 py-2 font-semibold ${
              active === idx
                ? 'border-b-2 border-white text-white'
                : 'text-gray-400'
            }`}
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
};

export default Tabs;