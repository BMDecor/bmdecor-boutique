'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart/cart-context';
import type { CalculatorResult } from '@/lib/api/benjamin-moore';

interface CalculatorCartBridgeProps {
  result: CalculatorResult;
  selectedColor: {
    name: string;
    colorCode: string;
    hexCode: string;
  };
  productLine: string;
  productNumber: string;
  sheen: string;
}

export default function CalculatorCartBridge({
  result,
  selectedColor,
  productLine,
  productNumber,
  sheen,
}: CalculatorCartBridgeProps) {
  const { addItem } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleApply = async () => {
    setState('loading');
    try {
      for (const container of result.containersNeeded) {
        await addItem({
          colorNumber: selectedColor.colorCode,
          colorName: selectedColor.name,
          hexCode: selectedColor.hexCode,
          productLine,
          productNumber,
          sheen,
          size: container.size as '750ml' | '1L' | '2.5L' | '5L',
          quantity: container.quantity,
          brand: 'BM',
        });
      }
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('idle');
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      <button
        onClick={handleApply}
        disabled={state === 'loading'}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
          state === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-[#C9A86C] text-[#2C2C2C] hover:bg-[#D4B87A] active:scale-[0.98]'
        }`}
      >
        <AnimatePresence mode="wait">
          {state === 'loading' ? (
            <motion.div
              key="spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-4 h-4 border-2 border-[#2C2C2C] border-t-transparent rounded-full animate-spin"
            />
          ) : state === 'success' ? (
            <motion.svg
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </motion.svg>
          ) : (
            <motion.svg
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </motion.svg>
          )}
        </AnimatePresence>
        <span>
          {state === 'loading'
            ? 'Adding to Bag...'
            : state === 'success'
              ? 'Applied to Bag'
              : `Apply to Bag · ${result.containersNeeded.map((c) => `${c.quantity}x ${c.size}`).join(' + ')}`}
        </span>
      </button>
    </div>
  );
}
