'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart/cart-context';

export interface AccessoryData {
  id: string;
  brand: string;
  name: string;
  priceEur: number;
  description?: string;
  imageUrl?: string;
  category: string;
  size?: string;
  inStock?: boolean;
}

interface AccessoryCardProps {
  accessory: AccessoryData;
  accentColor?: string;
}

export default function AccessoryCard({ accessory, accentColor = '#C9A86C' }: AccessoryCardProps) {
  const { addItem } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleAdd = async () => {
    setState('loading');
    try {
      await addItem({
        productType: 'accessory',
        brand: accessory.brand as 'BM' | 'FB' | 'LG',
        quantity: 1,
        accessoryId: accessory.id,
        accessoryName: accessory.name,
        accessoryCategory: accessory.category,
        unitPriceEur: accessory.priceEur,
      });
      setState('success');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('idle');
    }
  };

  const categoryIcon: Record<string, string> = {
    brush: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z',
    roller: 'M3 5h12a2 2 0 012 2v2a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2zM8 11v8m0 0h2m-2 0H6',
    paste: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    primer: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl ring-1 ring-white/10 overflow-hidden"
    >
      {/* Image / Icon placeholder */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
        {accessory.imageUrl ? (
          <img
            src={accessory.imageUrl}
            alt={accessory.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg className="w-12 h-12 opacity-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d={categoryIcon[accessory.category] || categoryIcon.brush}
            />
          </svg>
        )}
      </div>

      {/* Info + Add button */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium text-white/90 leading-tight">{accessory.name}</h3>
        {accessory.size && (
          <p className="text-xs text-white/50">{accessory.size}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: accentColor }}>
            &euro;{accessory.priceEur.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={state === 'loading'}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: state === 'success' ? '#16a34a' : accentColor,
              color: '#1a1a1a',
            }}
          >
            {state === 'loading' ? '...' : state === 'success' ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
