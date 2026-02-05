'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CartBadge from '@/components/cart/CartBadge';
import BrandPageTabs from '@/components/BrandPageTabs';
import BrandCollectionHero from '@/components/shared/BrandCollectionHero';
import BrandSearchBar from '@/components/shared/BrandSearchBar';
import InfiniteColorGrid from '@/components/shared/InfiniteColorGrid';
import WallpaperCard, { type WallpaperData } from '@/components/WallpaperCard';
import WallpaperDrawer from '@/components/WallpaperDrawer';

// Theme
const ACCENT = '#E8E4D9';
const BG_DARK = '#4A5240';

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function LittleGreenePage() {
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperData | null>(null);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [wpCollection, setWpCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wpSearchQuery, setWpSearchQuery] = useState('');
  const [activeProductTab, setActiveProductTab] = useState('paint');
  const [collectionCounts, setCollectionCounts] = useState<Map<string, number>>(new Map());
  const [colorCount, setColorCount] = useState(0);

  // Fetch collection counts on mount
  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await fetch('/api/colors?brand=LG');
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.items || [];
          const counts = new Map<string, number>();
          items.forEach((c: { collection?: string }) => {
            const col = c.collection || 'Unknown';
            counts.set(col, (counts.get(col) || 0) + 1);
          });
          setCollectionCounts(counts);
          setColorCount(items.length);
        }
      } catch (error) {
        console.error('Failed to fetch collection counts:', error);
      }
    }
    fetchCounts();
  }, []);

  // Fetch wallpapers
  useEffect(() => {
    async function fetchWallpapers() {
      try {
        const response = await fetch('/api/colors?brand=LG&type=wallpaper');
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.items || [];
          setWallpapers(items);
        }
      } catch (error) {
        console.error('Failed to fetch LG wallpapers:', error);
      }
    }
    fetchWallpapers();
  }, []);

  // Wallpaper collections
  const wpCollections = useMemo(() => {
    const cols = new Map<string, number>();
    for (const wp of wallpapers) {
      const c = wp.collection || 'Other';
      cols.set(c, (cols.get(c) || 0) + 1);
    }
    return Array.from(cols.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [wallpapers]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Get display name for selected collection
  const getDisplayName = () => {
    if (selectedCollection === 'all') return 'All Little Greene Colours';
    return selectedCollection;
  };

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
            <div className="flex items-center gap-3">
              <Badge style={{ backgroundColor: `${ACCENT}30`, color: ACCENT }}>
                Master Product List
              </Badge>
              <Badge style={{ backgroundColor: ACCENT, color: BG_DARK }}>
                {colorCount} Colours
              </Badge>
              <CartBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-white py-8" style={{ backgroundColor: BG_DARK }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: ACCENT }} />
            <span className="font-medium uppercase tracking-wider text-xs" style={{ color: ACCENT }}>
              Eco-Conscious British Heritage
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight mb-1">
            Little Greene
          </h1>
          <p className="text-white/60 text-sm max-w-xl">
            204 colours with infinite scroll. Click any colour for product details and finish options.
          </p>
        </div>
      </section>

      {/* Product Tabs */}
      <BrandPageTabs
        tabs={[
          { id: 'paint', label: 'Paint', count: colorCount },
          { id: 'wallpaper', label: 'Wallpaper', count: wallpapers.length },
        ]}
        activeTab={activeProductTab}
        onTabChange={setActiveProductTab}
        accentColor={ACCENT}
        bgColor={BG_DARK}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {activeProductTab === 'paint' ? (
          <>
            {/* Collection Hero Navigation */}
            <BrandCollectionHero
              brand="LG"
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
                brand="LG"
                brandName="Little Greene"
                onSearch={handleSearch}
                accentColor={BG_DARK}
              />
            </div>

            {/* Infinite Scroll Color Grid */}
            <InfiniteColorGrid
              brand="LG"
              searchQuery={searchQuery}
              collection={selectedCollection}
              accentColor={BG_DARK}
              bgColor={BG_DARK}
              pageSize={48}
            />
          </>
        ) : (
          /* ─── WALLPAPER TAB ─── */
          <div className="bg-[#2a2f26] -mx-6 px-6 py-8 rounded-xl text-white">
            {/* Wallpaper Search and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {wpCollection === 'all' ? 'All Little Greene Wallpapers' : wpCollection}
                </h2>
                <span className="text-sm text-white/60">
                  {wallpapers.filter((wp) => {
                    const colMatch = wpCollection === 'all' || wp.collection === wpCollection;
                    const searchMatch = !wpSearchQuery ||
                      wp.name.toLowerCase().includes(wpSearchQuery.toLowerCase()) ||
                      (wp.colourway || '').toLowerCase().includes(wpSearchQuery.toLowerCase()) ||
                      (wp.designName || '').toLowerCase().includes(wpSearchQuery.toLowerCase());
                    return colMatch && searchMatch;
                  }).length} designs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Search designs..."
                  value={wpSearchQuery}
                  onChange={(e) => setWpSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 w-48"
                />
                <select
                  value={wpCollection}
                  onChange={(e) => setWpCollection(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2"
                >
                  <option value="all" className="bg-[#2a2f26]">All Collections</option>
                  {wpCollections.map(([col, count]) => (
                    <option key={col} value={col} className="bg-[#2a2f26]">
                      {col} ({count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wallpaper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {wallpapers
                  .filter((wp) => {
                    const colMatch = wpCollection === 'all' || wp.collection === wpCollection;
                    const searchMatch = !wpSearchQuery ||
                      wp.name.toLowerCase().includes(wpSearchQuery.toLowerCase()) ||
                      (wp.colourway || '').toLowerCase().includes(wpSearchQuery.toLowerCase()) ||
                      (wp.designName || '').toLowerCase().includes(wpSearchQuery.toLowerCase());
                    return colMatch && searchMatch;
                  })
                  .map((wp) => (
                    <WallpaperCard
                      key={wp.id}
                      wallpaper={wp}
                      onClick={setSelectedWallpaper}
                      accentColor={ACCENT}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Wallpaper Drawer */}
      <WallpaperDrawer
        wallpaper={selectedWallpaper}
        onClose={() => setSelectedWallpaper(null)}
        accentColor={ACCENT}
        bgColor={BG_DARK}
      />

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] bg-white mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>Little Greene&reg; Master Product List · BM Decoraci&oacute;n, Marbella</span>
            <span>IVA Incluido (21%) · Prices in EUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
