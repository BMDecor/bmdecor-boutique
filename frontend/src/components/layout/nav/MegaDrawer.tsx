'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MegaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * MegaDrawer - Glassmorphism slide-down container for mega menus
 * Uses framer-motion for smooth animations
 */
export default function MegaDrawer({ isOpen, onClose, children }: MegaDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="absolute top-full left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9] shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
