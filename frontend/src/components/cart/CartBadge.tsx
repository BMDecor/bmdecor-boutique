'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart/cart-context';

export default function CartBadge() {
  const { itemCount } = useCart();

  return (
    <button className="relative p-2 text-white/70 hover:text-white transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#C9A86C] text-[#2C2C2C] text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
