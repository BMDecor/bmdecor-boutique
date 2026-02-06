'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';
import type { BrandId, ColorFamily } from '@/types/store';

// Color item from API or static data
export interface ColorItem {
  id: string;
  name: string;
  code: string;
  hex: string;
  collection?: string;
}

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (color: ColorItem) => void;
  brandId: BrandId;
  selectedColorCode?: string;
}

// Brand display names
const BRAND_NAMES: Record<BrandId, string> = {
  'benjamin-moore': 'Benjamin Moore',
  'farrow-ball': 'Farrow & Ball',
  'little-greene': 'Little Greene',
};

// Color family tabs with representative colors
const COLOR_TABS = [
  { id: 'popular', label: 'Popular', hex: '#C9A86C' },
  { id: 'white', label: 'Whites', hex: '#F9F7F3' },
  { id: 'grey', label: 'Greys', hex: '#9A9A8E' },
  { id: 'blue', label: 'Blues', hex: '#2C4251' },
  { id: 'green', label: 'Greens', hex: '#4A5240' },
  { id: 'neutral', label: 'Neutrals', hex: '#B5A99A' },
] as const;

type TabId = typeof COLOR_TABS[number]['id'];

/**
 * ColorPickerModal - Visual Fan Deck for selecting colors
 * Features search, tabs, and grid of color swatches
 */
export default function ColorPickerModal({
  isOpen,
  onClose,
  onSelect,
  brandId,
  selectedColorCode,
}: ColorPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('popular');
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 48;

  // Map brand to short code for API
  const brandCode = useMemo(() => {
    const map: Record<BrandId, string> = {
      'benjamin-moore': 'BM',
      'farrow-ball': 'FB',
      'little-greene': 'LG',
    };
    return map[brandId];
  }, [brandId]);

  // Fetch colors from API
  const fetchColors = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        brand: brandCode,
        limit: String(ITEMS_PER_PAGE),
        cursor: reset ? '0' : String(page * ITEMS_PER_PAGE),
      });

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/colors?${params.toString()}`);
      const data = await response.json();

      const newColors: ColorItem[] = (data.items || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        name: item.name as string,
        code: item.colorCode as string,
        hex: item.hexCode as string || '#CCCCCC',
        collection: item.collection as string | undefined,
      }));

      if (reset) {
        setColors(newColors);
        setPage(1);
      } else {
        setColors((prev) => [...prev, ...newColors]);
        setPage((prev) => prev + 1);
      }

      setHasMore(newColors.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setLoading(false);
    }
  }, [brandCode, searchQuery, page, loading]);

  // Initial fetch when modal opens or brand changes
  useEffect(() => {
    if (isOpen) {
      setColors([]);
      setPage(0);
      setHasMore(true);
      fetchColors(true);
    }
  }, [isOpen, brandCode]);

  // Search with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setPage(0);
      fetchColors(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter colors by tab (client-side filtering for demo)
  const filteredColors = useMemo(() => {
    if (activeTab === 'popular') {
      // Return first 48 as "popular"
      return colors.slice(0, 48);
    }

    // Simple heuristic filtering by hex value for color families
    return colors.filter((color) => {
      const hex = color.hex.toLowerCase();
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114);

      switch (activeTab) {
        case 'white':
          return luminance > 220;
        case 'grey':
          return Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && luminance > 100 && luminance < 200;
        case 'blue':
          return b > r && b > g && b > 100;
        case 'green':
          return g > r && g > b * 0.8 && g > 80;
        case 'neutral':
          return Math.abs(r - g) < 40 && Math.abs(g - b) < 40 && luminance > 120 && luminance < 220;
        default:
          return true;
      }
    });
  }, [colors, activeTab]);

  // Handle color selection
  const handleSelect = (color: ColorItem) => {
    onSelect(color);
    onClose();
  };

  // Load more colors
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchColors(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

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
            className="fixed inset-0 z-[100] bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[101] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C]">
                  Choose Your Color
                </h2>
                <p className="text-sm text-[#2C2C2C]/50 mt-0.5">
                  {BRAND_NAMES[brandId]} collection
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#E8E2D9] rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-[#2C2C2C]/60" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-[#E8E2D9]">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${colors.length.toLocaleString()}+ ${BRAND_NAMES[brandId]} colors...`}
                  className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-[#E8E2D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30 focus:border-[#C9A86C] transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-3 border-b border-[#E8E2D9] flex gap-2 overflow-x-auto scrollbar-hide">
              {COLOR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#2C2C2C] text-white'
                      : 'bg-[#FAF8F5] text-[#2C2C2C]/70 hover:bg-[#E8E2D9]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: tab.hex }}
                  />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Color Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && colors.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-2 border-[#C9A86C] border-t-transparent rounded-full" />
                </div>
              ) : filteredColors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#2C2C2C]/50">
                  <p className="text-lg">No colors found</p>
                  <p className="text-sm mt-1">Try a different search or tab</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {filteredColors.map((color) => {
                      const isSelected = color.code === selectedColorCode;
                      return (
                        <button
                          key={color.id}
                          onClick={() => handleSelect(color)}
                          className={`group relative aspect-square rounded-lg overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C9A86C] ${
                            isSelected ? 'ring-2 ring-[#C9A86C]' : ''
                          }`}
                          title={`${color.name} (${color.code})`}
                        >
                          {/* Color Swatch */}
                          <div
                            className="absolute inset-0"
                            style={{ backgroundColor: color.hex }}
                          />

                          {/* Selected Check */}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Check className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          )}

                          {/* Hover Tooltip */}
                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-medium text-white truncate">
                              {color.name}
                            </p>
                            <p className="text-[9px] text-white/70">{color.code}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  {hasMore && !searchQuery && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-[#FAF8F5] text-sm text-[#2C2C2C]/70 rounded-lg hover:bg-[#E8E2D9] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load More Colors'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8E2D9] bg-[#FAF8F5] flex items-center justify-between">
              <p className="text-sm text-[#2C2C2C]/50">
                {filteredColors.length} colors shown
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
