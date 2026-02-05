'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import BrandCollectionHero from '@/components/shared/BrandCollectionHero';
import BrandSearchBar from '@/components/shared/BrandSearchBar';
import InfiniteColorGrid from '@/components/shared/InfiniteColorGrid';

// Theme
const ACCENT = '#C9A86C';
const BG_DARK = '#2C2C2C';

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function BenjaminMoorePage() {
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionCounts, setCollectionCounts] = useState<Map<string, number>>(new Map());

  // Fetch collection counts on mount using dedicated counts API
  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await fetch('/api/color-counts?brand=BM');
        if (response.ok) {
          const data = await response.json();
          // API returns { total, collections: { name: count } }
          const counts = new Map<string, number>();
          if (data.collections) {
            Object.entries(data.collections).forEach(([col, count]) => {
              counts.set(col, count as number);
            });
          }
          setCollectionCounts(counts);
        }
      } catch (error) {
        console.error('Failed to fetch collection counts:', error);
      }
    }
    fetchCounts();
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Get display name for selected collection
  const getDisplayName = () => {
    if (selectedCollection === 'all') return 'All Benjamin Moore Colors';
    if (selectedCollection === 'Color Trends') return 'Color Trends Collection';
    if (selectedCollection === 'Benjamin Moore Classics') return 'Classics Collection';
    return selectedCollection;
  };

  // Calculate total count
  const totalCount = useMemo(() => {
    let total = 0;
    collectionCounts.forEach((v) => (total += v));
    return total;
  }, [collectionCounts]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="text-white sticky top-0 z-40" style={{ backgroundColor: BG_DARK }}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Grand Lobby
            </Link>
            <Badge style={{ backgroundColor: ACCENT, color: BG_DARK }}>
              {totalCount.toLocaleString()} Colors
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-white py-8" style={{ backgroundColor: BG_DARK }}>
        <div className="container mx-auto px-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight mb-1">
            Benjamin Moore
          </h1>
          <p className="text-white/60 text-sm max-w-xl">
            4,000+ official colors with infinite scroll. Click any color for product details, visualizer, and calculator.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Collection Hero Navigation */}
        <BrandCollectionHero
          brand="BM"
          selectedCollection={selectedCollection}
          onSelect={setSelectedCollection}
          collectionCounts={collectionCounts}
        />

        {/* Search and Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              {searchQuery ? `Search Results` : getDisplayName()}
            </h2>
          </div>
          <BrandSearchBar
            brand="BM"
            brandName="Benjamin Moore"
            onSearch={handleSearch}
            accentColor={ACCENT}
          />
        </div>

        {/* Infinite Scroll Color Grid */}
        <InfiniteColorGrid
          brand="BM"
          searchQuery={searchQuery}
          collection={selectedCollection}
          accentColor={ACCENT}
          bgColor={BG_DARK}
          pageSize={48}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] bg-white mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>Benjamin Moore&reg; Production API · BM Decoraci&oacute;n, Marbella</span>
            <span>IVA Incluido (21%) · Prices in EUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
