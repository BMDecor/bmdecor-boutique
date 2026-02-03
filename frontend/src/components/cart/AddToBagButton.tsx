'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart/cart-context';
import type { AddToCartRequest } from '@/lib/cart/types';

interface AddToBagButtonProps {
  item: Omit<AddToCartRequest, 'quantity'> | null;
  disabled?: boolean;
}

export default function AddToBagButton({ item, disabled }: AddToBagButtonProps) {
  const { addItem } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async () => {
    if (!item || disabled) return;

    setState('loading');
    try {
      await addItem({ ...item, quantity: 1 });
      setState('success');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('idle');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!item || disabled || state === 'loading'}
      className={`w-full py-3 px-6 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
        !item || disabled
          ? 'bg-secondary text-muted-foreground cursor-not-allowed'
          : state === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-[#2C2C2C] text-white hover:bg-[#404040] active:scale-[0.98]'
      }`}
    >
      <AnimatePresence mode="wait">
        {state === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
        ) : state === 'success' ? (
          <motion.svg
            key="success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </motion.svg>
        ) : (
          <motion.svg
            key="bag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
          ? 'Adding...'
          : state === 'success'
            ? 'Added to Bag'
            : !item
              ? 'Select size to add'
              : 'Add to Boutique Bag'}
      </span>
    </button>
  );
}
