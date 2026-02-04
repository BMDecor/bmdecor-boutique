'use client';

import { useMemo } from 'react';
import AccessoryCard, { type AccessoryData } from './AccessoryCard';

interface AccessoryGridProps {
  accessories: AccessoryData[];
  accentColor?: string;
}

const CATEGORY_ORDER = ['brush', 'roller', 'paste', 'primer', 'book', 'sample', 'other'];
const CATEGORY_LABELS: Record<string, string> = {
  brush: 'Brushes',
  roller: 'Rollers',
  paste: 'Adhesives & Paste',
  primer: 'Primers & Undercoat',
  book: 'Colour Books & Cards',
  sample: 'Samples',
  other: 'Other',
};

export default function AccessoryGrid({ accessories, accentColor = '#C9A86C' }: AccessoryGridProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, AccessoryData[]>();
    for (const acc of accessories) {
      const cat = acc.category || 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(acc);
    }
    // Sort groups by category order
    const sorted = new Map<string, AccessoryData[]>();
    for (const cat of CATEGORY_ORDER) {
      if (groups.has(cat)) sorted.set(cat, groups.get(cat)!);
    }
    // Any remaining categories not in CATEGORY_ORDER
    for (const [cat, items] of groups) {
      if (!sorted.has(cat)) sorted.set(cat, items);
    }
    return sorted;
  }, [accessories]);

  if (accessories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/30">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-sm">No accessories available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: `${accentColor}cc` }}
          >
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((acc) => (
              <AccessoryCard
                key={acc.id}
                accessory={acc}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
