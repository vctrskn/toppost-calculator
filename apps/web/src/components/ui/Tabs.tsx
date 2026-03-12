'use client';

import { useRef, useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeTab}"]`,
    );
    if (activeEl) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="relative flex rounded-full bg-gray-100 p-1"
    >
      <div
        className="absolute top-1 bottom-1 rounded-full bg-brand shadow-sm transition-all duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />

      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-tab-id={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
