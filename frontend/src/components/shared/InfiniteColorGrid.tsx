'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSlug } from '@/lib/utils/slugs';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export interface ColorItem {
  id: string;
  brand: string;
  name: string;
  colorCode: string;
  hexCode: string;
  finishType: string;
  priceEur: number;
  volume: string;
  collection?: string;
  description?: string;
  inStock: boolean;
}

interface InfiniteColorGridProps {
  brand: 'BM' | 'FB' | 'LG';
  searchQuery: string;
  collection: string; // 'all' or collection name
  accentColor: string;
  bgColor: string;
  pageSize?: number;
}

interface ApiResponse {
  items: ColorItem[];
  nextCursor: string | null;
  total: number | null;
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

function calculateLRV(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
  const [r, g, b] = rgb.map((c) => c / 255);
  return Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) * 100);
}

function getTextColor(hex: string): string {
  return calculateLRV(hex) > 50 ? '#2C2C2C' : '#FFFFFF';
}

// Collection matching logic (moved from BrandCollectionHero)
function matchesCollection(
  colorCollection: string | undefined,
  selectedId: string,
  brand: 'BM' | 'FB' | 'LG'
): boolean {
  if (selectedId === 'all') return true;
  if (!colorCollection) return false;

  // BM uses partial matching for grouped collections
  if (brand === 'BM') {
    if (selectedId === 'Color Trends') {
      return colorCollection.includes('Color Trends');
    }
    if (selectedId === 'Affinity') {
      return colorCollection.includes('Affinity');
    }
    if (selectedId === 'Benjamin Moore Classics') {
      return colorCollection.includes('Benjamin Moore Classics') || colorCollection.includes('Designer Classics');
    }
  }

  // LG uses includes for dual-membership
  if (brand === 'LG') {
    return colorCollection.includes(selectedId);
  }

  // FB uses exact matching
  return colorCollection === selectedId;
}

// ─────────────────────────────────────────────────────────
// COLOR CARD
// ─────────────────────────────────────────────────────────

function ColorCard({ color, accentColor }: { color: ColorItem; accentColor: string }) {
  const textColor = getTextColor(color.hexCode);
  const lrv = calculateLRV(color.hexCode);
  const slug = createSlug(color);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/color/${slug}`}>
        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div
            className="aspect-square w-full relative"
            style={{ backgroundColor: color.hexCode }}
          >
            <div
              className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: `${textColor}20`, color: textColor }}
            >
              LRV {lrv}
            </div>
            <div
              className="absolute bottom-3 left-3 font-mono text-sm font-semibold"
              style={{ color: textColor }}
            >
              {color.colorCode}
            </div>
            <div
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: textColor }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
          <CardContent className="p-4 space-y-1 bg-white">
            <h3 className="font-medium text-foreground leading-tight line-clamp-1">
              {color.name}
            </h3>
            <p className="text-xs text-muted-foreground">{color.collection}</p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold" style={{ color: accentColor }}>
                &euro;{color.priceEur.toFixed(2)}
              </span>
              <Badge variant="outline" className="text-xs">
                {color.volume}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────

function ColorCardSkeleton() {
  return (
    <div className="animate-pulse">
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="aspect-square w-full bg-gray-200" />
        <CardContent className="p-4 space-y-2 bg-white">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-5 bg-gray-100 rounded w-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────

export default function InfiniteColorGrid({
  brand,
  searchQuery,
  collection,
  accentColor,
  bgColor,
  pageSize = 48,
}: InfiniteColorGridProps) {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Intersection Observer ref
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Build API URL
  const buildApiUrl = useCallback(
    (cursor: string | null) => {
      const params = new URLSearchParams({
        brand,
        limit: String(pageSize),
        sortBy: 'code',
        sortOrder: 'asc',
      });

      if (cursor) {
        params.set('cursor', cursor);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      // Map collection for API (handle BM grouped collections)
      if (collection && collection !== 'all') {
        params.set('collection', collection);
      }

      return `/api/colors?${params.toString()}`;
    },
    [brand, pageSize, searchQuery, collection]
  );

  // Fetch colors
  const fetchColors = useCallback(
    async (cursor: string | null, append: boolean = false) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const url = buildApiUrl(cursor);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch colors');
        }

        const data: ApiResponse = await response.json();

        // Filter by collection client-side for complex matching
        const filteredItems = data.items.filter((item) =>
          matchesCollection(item.collection, collection, brand)
        );

        if (append) {
          setColors((prev) => [...prev, ...filteredItems]);
        } else {
          setColors(filteredItems);
        }

        setNextCursor(data.nextCursor);
        if (data.total !== null) {
          setTotal(data.total);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    },
    [buildApiUrl, collection, brand, isLoading]
  );

  // Reset and fetch when search/collection changes
  useEffect(() => {
    setColors([]);
    setNextCursor(null);
    setTotal(null);
    setIsInitialLoad(true);
    fetchColors(null, false);
  }, [searchQuery, collection, brand]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up Intersection Observer
  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && nextCursor) {
          fetchColors(nextCursor, true);
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading before reaching the end
        threshold: 0,
      }
    );

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [nextCursor, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state for initial load
  if (isInitialLoad) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ColorCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchColors(null, false)}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: bgColor }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (colors.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {searchQuery ? (
          <p>No colors match &quot;{searchQuery}&quot;</p>
        ) : (
          <p>No colors found in this collection.</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Color count */}
      {total !== null && (
        <p className="text-sm text-muted-foreground mb-4">
          {searchQuery ? `Found ${colors.length} colors matching "${searchQuery}"` : `${total} colors`}
        </p>
      )}

      {/* Color Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {colors.map((color) => (
            <motion.div
              key={color.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ColorCard color={color} accentColor={accentColor} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading skeletons while fetching more */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <ColorCardSkeleton key={`skeleton-${i}`} />)}
      </div>

      {/* Intersection Observer trigger element */}
      <div ref={loadMoreRef} className="h-10 mt-8" />

      {/* Loading indicator */}
      {isLoading && !isInitialLoad && (
        <div className="flex justify-center py-4">
          <div
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${accentColor}40`, borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* End of results */}
      {!nextCursor && !isLoading && colors.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Showing all {colors.length} colors
        </p>
      )}
    </>
  );
}
