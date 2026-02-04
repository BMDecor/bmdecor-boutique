'use client';

import { motion } from 'framer-motion';

export interface BrandTab {
  id: string;
  label: string;
  count: number;
}

interface BrandPageTabsProps {
  tabs: BrandTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor: string;
  bgColor: string;
  textColor?: string;
}

export default function BrandPageTabs({
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  bgColor,
  textColor = '#FFFFFF',
}: BrandPageTabsProps) {
  return (
    <div
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{ backgroundColor: `${bgColor}ee`, borderColor: `${accentColor}30` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? bgColor : `${textColor}99`,
                  backgroundColor: isActive ? accentColor : 'transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className="relative z-10 text-xs tabular-nums px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? `${bgColor}30` : `${textColor}15`,
                    color: isActive ? bgColor : `${textColor}70`,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
