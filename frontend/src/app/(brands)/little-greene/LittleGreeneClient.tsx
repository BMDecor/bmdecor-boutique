'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CartBadge from '@/components/cart/CartBadge';
import BrandPageTabs from '@/components/BrandPageTabs';
import BrandCollectionHero, { matchesCollection } from '@/components/shared/BrandCollectionHero';
import WallpaperCard, { type WallpaperData } from '@/components/WallpaperCard';
import WallpaperDrawer from '@/components/WallpaperDrawer';
import { createSlug } from '@/lib/utils/slugs';

// ─────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────

interface LGColor {
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

// Theme
const ACCENT = '#E8E4D9';
const BG_DARK = '#4A5240';

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

// Sort by color code ascending for gradient flow
function sortByIdAscending(a: LGColor, b: LGColor): number {
  // LG codes are numeric (e.g., "87", "138")
  const aNum = parseInt(a.colorCode, 10) || 0;
  const bNum = parseInt(b.colorCode, 10) || 0;
  return aNum - bNum;
}

// ─────────────────────────────────────────────────────────
// COLOR CARD (Links to SEO product page)
// ─────────────────────────────────────────────────────────

function LGColorCard({ color }: { color: LGColor }) {
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
              <span className="text-sm font-semibold" style={{ color: BG_DARK }}>
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
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function LittleGreenePage() {
  const [colors, setColors] = useState<LGColor[]>([]);
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperData | null>(null);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [wpCollection, setWpCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wpSearchQuery, setWpSearchQuery] = useState('');
  const [activeProductTab, setActiveProductTab] = useState('paint');

  // Build collection counts from data (handling dual-membership)
  const collectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    colors.forEach((c) => {
      const col = c.collection || 'Unknown';
      counts.set(col, (counts.get(col) || 0) + 1);
    });
    return counts;
  }, [colors]);

  // Wallpaper collections
  const wpCollections = useMemo(() => {
    const cols = new Map<string, number>();
    for (const wp of wallpapers) {
      const c = wp.collection || 'Other';
      cols.set(c, (cols.get(c) || 0) + 1);
    }
    return Array.from(cols.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [wallpapers]);

  useEffect(() => {
    async function fetchColors() {
      try {
        const response = await fetch('/api/colors?brand=LG');
        if (response.ok) {
          const data = await response.json();
          // Sort by ID ascending for gradient flow
          data.sort(sortByIdAscending);
          setColors(data);
        }
      } catch (error) {
        console.error('Failed to fetch LG colors:', error);
      }
    }
    async function fetchWallpapers() {
      try {
        const response = await fetch('/api/colors?brand=LG&type=wallpaper');
        if (response.ok) {
          const data = await response.json();
          setWallpapers(data);
        }
      } catch (error) {
        console.error('Failed to fetch LG wallpapers:', error);
      }
    }
    fetchColors();
    fetchWallpapers();
  }, []);

  // Filter colors
  const filteredColors = useMemo(() => {
    return colors.filter((color) => {
      const collectionMatch = matchesCollection(color.collection, selectedCollection, 'LG');
      const searchMatch =
        !searchQuery ||
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.colorCode.toLowerCase().includes(searchQuery.toLowerCase());
      return collectionMatch && searchMatch;
    });
  }, [colors, selectedCollection, searchQuery]);

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
                {filteredColors.length} Colours
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
            204 colours sorted in gradient flow. Click any colour for product details and finish options.
          </p>
        </div>
      </section>

      {/* Product Tabs */}
      <BrandPageTabs
        tabs={[
          { id: 'paint', label: 'Paint', count: colors.length },
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

            {/* Search Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {getDisplayName()}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredColors.length} colours
                </span>
              </div>
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="Search colours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Full Width Color Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredColors.map((color) => (
                  <motion.div
                    key={color.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <LGColorCard color={color} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredColors.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No colours match your search.</p>
              </div>
            )}
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
