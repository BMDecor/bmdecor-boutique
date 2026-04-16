'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';
import type { BrandId } from '@/types/store';

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
  { id: 'all', label: 'All Colors', hex: '#C9A86C' },
  { id: 'white', label: 'Whites', hex: '#F9F7F3' },
  { id: 'grey', label: 'Greys', hex: '#9A9A8E' },
  { id: 'blue', label: 'Blues', hex: '#4A90B8' },
  { id: 'green', label: 'Greens', hex: '#5A8C6A' },
  { id: 'yellow', label: 'Yellows', hex: '#E8C870' },
  { id: 'orange', label: 'Oranges', hex: '#D48C4C' },
  { id: 'red', label: 'Reds', hex: '#C45C5C' },
  { id: 'pink', label: 'Pinks', hex: '#E8A0B0' },
  { id: 'purple', label: 'Purples', hex: '#8870A8' },
  { id: 'neutral', label: 'Neutrals', hex: '#B5A99A' },
] as const;

type TabId = typeof COLOR_TABS[number]['id'];

/**
 * Convert hex to HSL values for proper color family detection
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Determine color family based on HSL values
 * Every color MUST be classified into exactly one family
 *
 * Key insight: "Neutrals" are specifically warm, desaturated colors (beiges, taupes, tans, browns)
 * Muted cool colors (sage green, dusty blue) should stay in their hue family
 */
function getColorFamily(hex: string): TabId {
  const { h, s, l } = hexToHSL(hex);

  // Very light colors → white
  if (l > 94) return 'white';

  // Very dark colors → grey
  if (l < 12) return 'grey';

  // Very low saturation (achromatic) → white or grey
  if (s < 6) return l > 80 ? 'white' : 'grey';

  // Low saturation colors - only warm hues become neutrals
  // Cool hues (greens, blues, purples) stay in their hue family even when muted
  if (s < 20) {
    if (l > 88) return 'white';
    if (l < 20) return 'grey';

    // Only warm hues (reds, oranges, yellows: 0-70°) become neutrals when desaturated
    // These are the true beiges, taupes, tans, khakis, browns
    if (h < 70 || h >= 340) {
      return 'neutral';
    }
    // Cool hues with low saturation: classify by hue (muted green is still green)
    if (h >= 70 && h < 165) return 'green';
    if (h >= 165 && h < 260) return 'blue';
    if (h >= 260 && h < 300) return 'purple';
    if (h >= 300 && h < 340) return 'pink';
  }

  // Light pastel handling
  if (l > 75 && s < 60) {
    if (h < 25 || h >= 340) return 'pink';
    // Light warm colors in cream/ivory range
    if (h >= 25 && h < 50 && s < 30) return 'neutral';
  }

  // Saturated colors - classify by hue
  // Hue wheel: 0=red, 60=yellow, 120=green, 180=cyan, 240=blue, 300=magenta, 360=red
  if (h < 12 || h >= 345) return 'red';
  if (h >= 12 && h < 38) return 'orange';
  if (h >= 38 && h < 70) return l > 90 && s < 35 ? 'white' : 'yellow';
  if (h >= 70 && h < 165) return 'green';
  if (h >= 165 && h < 260) return 'blue';
  if (h >= 260 && h < 300) return 'purple';
  if (h >= 300 && h < 345) return 'pink';

  return 'neutral';
}

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
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Reference to the scroll container for infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // Track current fetch to handle race conditions
  const fetchIdRef = useRef(0);

  // Load a good batch of colors
  const ITEMS_PER_PAGE = 200;

  // Map brand to short code for API
  const brandCode = useMemo(() => {
    const map: Record<BrandId, string> = {
      'benjamin-moore': 'BM',
      'farrow-ball': 'FB',
      'little-greene': 'LG',
    };
    return map[brandId];
  }, [brandId]);

  // Fetch colors from API - takes explicit parameters to avoid stale closures
  const fetchColors = useCallback(async (options: {
    reset?: boolean;
    family: TabId;
    cursor?: string | null;
    search?: string;
  }) => {
    const { reset = false, family, cursor, search } = options;

    // For non-reset fetches, check if we're already loading
    if (!reset && loading) return;

    // Generate a unique ID for this fetch to handle race conditions
    const currentFetchId = ++fetchIdRef.current;

    setLoading(true);

    try {
      const params = new URLSearchParams({
        brand: brandCode,
        limit: String(ITEMS_PER_PAGE),
      });

      // Use provided cursor or start from beginning
      if (!reset && cursor) {
        params.set('cursor', cursor);
      }

      if (search) {
        params.set('search', search);
      }

      // Pass color family to API for server-side filtering (except for 'all')
      if (family !== 'all') {
        params.set('colorFamily', family);
      }

      const response = await fetch(`/api/colors?${params.toString()}`);
      const data = await response.json();

      // Check if this fetch is still the most recent one
      if (currentFetchId !== fetchIdRef.current) {
        return; // A newer fetch was started, ignore this result
      }

      const newColors: ColorItem[] = (data.items || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        name: item.name as string,
        code: item.colorCode as string,
        hex: item.hexCode as string || '#CCCCCC',
        collection: item.collection as string | undefined,
      }));

      if (reset) {
        setColors(newColors);
      } else {
        setColors((prev) => [...prev, ...newColors]);
      }

      // Use nextCursor from API to determine if there are more colors
      setNextCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      // Only update loading state if this is still the current fetch
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [brandCode, loading]);

  // Initial fetch when modal opens or brand changes
  useEffect(() => {
    if (isOpen) {
      setColors([]);
      setNextCursor(null);
      setHasMore(true);
      fetchColors({ reset: true, family: activeTab, search: searchQuery });
    }
  }, [isOpen, brandCode]);

  // Refetch when tab changes
  useEffect(() => {
    if (!isOpen) return;
    setColors([]);
    setNextCursor(null);
    setHasMore(true);
    fetchColors({ reset: true, family: activeTab, search: searchQuery });
  }, [activeTab]);

  // Search with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setColors([]);
      setNextCursor(null);
      setHasMore(true);
      fetchColors({ reset: true, family: activeTab, search: searchQuery });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Colors are now filtered server-side, so just use loaded colors directly
  const filteredColors = colors;

  // Handle color selection
  const handleSelect = (color: ColorItem) => {
    onSelect(color);
    onClose();
  };

  // Refs for current state values to access in IntersectionObserver callback
  const stateRef = useRef({ activeTab, nextCursor, searchQuery, hasMore, loading });
  stateRef.current = { activeTab, nextCursor, searchQuery, hasMore, loading };

  // Load more colors (for manual button click if needed)
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchColors({ reset: false, family: activeTab, cursor: nextCursor, search: searchQuery });
    }
  };

  // Infinite scroll - load more when reaching bottom
  useEffect(() => {
    if (!isOpen || !loadMoreTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const { activeTab: tab, nextCursor: cursor, searchQuery: search, hasMore: more, loading: isLoading } = stateRef.current;
        if (entry.isIntersecting && more && !isLoading) {
          fetchColors({ reset: false, family: tab, cursor, search });
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '200px', // Load more before reaching the very bottom
        threshold: 0,
      }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => observer.disconnect();
  }, [isOpen, fetchColors]);

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
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
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

                  {/* Infinite scroll trigger - invisible element at the bottom */}
                  <div ref={loadMoreTriggerRef} className="h-4" />

                  {/* Loading indicator for infinite scroll */}
                  {loading && colors.length > 0 && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-[#C9A86C] border-t-transparent rounded-full" />
                    </div>
                  )}

                  {/* End of colors message */}
                  {!hasMore && colors.length > 0 && (
                    <div className="text-center py-4 text-sm text-[#2C2C2C]/40">
                      All {colors.length.toLocaleString()} colors loaded
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
