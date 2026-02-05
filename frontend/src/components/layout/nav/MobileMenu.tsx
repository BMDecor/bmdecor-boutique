'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import type { ColorFamily } from '@/types/store';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthClick: () => void;
}

// Shop sections
const SHOP_SECTIONS = {
  surfaces: {
    title: 'By Surface',
    items: [
      { href: '/shop/paint/interior', label: 'Interior Walls' },
      { href: '/shop/product/bm-aura-bath-spa-532', label: 'Kitchen & Bath' },
      { href: '/shop/paint/trim-door', label: 'Trim & Doors' },
      { href: '/shop/paint/exterior', label: 'Exterior' },
    ],
  },
  brands: {
    title: 'Brand Houses',
    items: [
      { href: '/benjamin-moore', label: 'Benjamin Moore' },
      { href: '/farrow-and-ball', label: 'Farrow & Ball' },
      { href: '/little-greene', label: 'Little Greene' },
    ],
  },
  essentials: {
    title: 'Essentials',
    items: [
      { href: '/shop/paint/primer', label: 'Primers' },
      { href: '/supplies', label: 'Tools & Supplies' },
      { href: '/search?type=sample', label: 'Color Samples' },
    ],
  },
};

// Color families
const COLOR_FAMILIES: { id: ColorFamily; name: string; hex: string }[] = [
  { id: 'white', name: 'Whites', hex: '#F9F7F3' },
  { id: 'grey', name: 'Greys', hex: '#9A9A8E' },
  { id: 'blue', name: 'Blues', hex: '#2C4251' },
  { id: 'green', name: 'Greens', hex: '#4A5240' },
  { id: 'neutral', name: 'Neutrals', hex: '#B5A99A' },
  { id: 'dark', name: 'Darks', hex: '#2B2B2B' },
];

// Secondary nav
const SECONDARY_NAV = [
  { href: '/about', label: 'The Atelier' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Visit Us' },
];

/**
 * MobileMenu - Slide-out drawer with accordion sections
 * Optimized for touch interactions
 */
export default function MobileMenu({ isOpen, onClose, onAuthClick }: MobileMenuProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [shopOpen, setShopOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

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
            className="fixed inset-0 z-[100] bg-black/40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] z-[101] bg-[#FAF8F5] shadow-xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#FAF8F5] border-b border-[#E8E2D9]">
              <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2C2C2C]">
                Menu
              </span>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-[#2C2C2C]/50 hover:text-[#2C2C2C] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Link */}
            <Link
              href="/search"
              onClick={onClose}
              className="flex items-center gap-3 mx-5 mt-4 px-4 py-3 bg-white border border-[#E8E2D9] rounded-xl text-[#2C2C2C]/50"
            >
              <Search className="w-5 h-5" />
              <span className="text-sm">Search colors & products...</span>
            </Link>

            {/* Navigation */}
            <nav className="px-5 py-6 space-y-2" aria-label="Mobile navigation">
              {/* Shop Accordion */}
              <div className="border-b border-[#E8E2D9]">
                <button
                  onClick={() => setShopOpen(!shopOpen)}
                  className="flex items-center justify-between w-full py-3 text-left"
                >
                  <span className="text-base font-medium text-[#2C2C2C]">Shop</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#2C2C2C]/40 transition-transform ${shopOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 space-y-4">
                        {Object.entries(SHOP_SECTIONS).map(([key, section]) => (
                          <div key={key}>
                            <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2 pl-2">
                              {section.title}
                            </p>
                            <ul className="space-y-0.5">
                              {section.items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={`block py-2 pl-4 text-sm rounded-lg transition-colors ${
                                      isActive(item.href)
                                        ? 'text-[#C9A86C] bg-[#C9A86C]/5 font-medium'
                                        : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-white'
                                    }`}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Color Studio Accordion */}
              <div className="border-b border-[#E8E2D9]">
                <button
                  onClick={() => setStudioOpen(!studioOpen)}
                  className="flex items-center justify-between w-full py-3 text-left"
                >
                  <span className="text-base font-medium text-[#2C2C2C]">Color Studio</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#2C2C2C]/40 transition-transform ${studioOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {studioOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4">
                        {/* Color Families */}
                        <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-3 pl-2">
                          By Color Family
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {COLOR_FAMILIES.map((family) => (
                            <Link
                              key={family.id}
                              href={`/search?family=${family.id}`}
                              onClick={onClose}
                              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors"
                            >
                              <div
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: family.hex }}
                              />
                              <span className="text-xs text-[#2C2C2C]/70">{family.name}</span>
                            </Link>
                          ))}
                        </div>

                        {/* All Colors Link */}
                        <Link
                          href="/search"
                          onClick={onClose}
                          className="block py-2 pl-4 text-sm text-[#C9A86C] font-medium"
                        >
                          Browse all colors →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Direct Links */}
              <div className="pt-2 space-y-1">
                {SECONDARY_NAV.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`block py-2.5 text-sm rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'text-[#C9A86C] font-medium'
                        : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Account Section */}
            <div className="px-5 py-4 border-t border-[#E8E2D9] bg-white/50">
              {isAuthenticated ? (
                <Link
                  href="/my-studio"
                  onClick={onClose}
                  className="block w-full py-3 text-center text-sm font-medium text-[#2C2C2C] bg-white border border-[#E8E2D9] rounded-xl hover:border-[#C9A86C] transition-colors"
                >
                  My Studio
                </Link>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onAuthClick();
                  }}
                  className="block w-full py-3 text-center text-sm font-medium text-white bg-[#2C2C2C] rounded-xl hover:bg-[#C9A86C] transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
