'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ROOM_SCENES } from '@/lib/visualizer/room-scenes';
import UniversalVisualizer from '@/components/UniversalVisualizer';
import GenericPaintCalculator from '@/components/GenericPaintCalculator';
import MetricVariantSelector from '@/components/cart/MetricVariantSelector';
import type { MetricSelectedVariant } from '@/components/cart/MetricVariantSelector';
import CartBadge from '@/components/cart/CartBadge';
import AddToBagButton from '@/components/cart/AddToBagButton';
import StickySubtotalBar from '@/components/cart/StickySubtotalBar';
import BrandPageTabs from '@/components/BrandPageTabs';
import WallpaperCard, { type WallpaperData } from '@/components/WallpaperCard';
import WallpaperDrawer from '@/components/WallpaperDrawer';

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

const LG_FINISH_TYPES = [
  'Intelligent Matt Emulsion',
  'Absolute Matt Emulsion',
  'Intelligent Eggshell',
  'Intelligent Satin',
  'Intelligent Gloss',
  'Intelligent Exterior Eggshell',
  'Intelligent ASP',
  "Tom's Oil Eggshell",
  'Traditional Oil Gloss',
  'Intelligent Floor Paint',
  'Interior Oil Eggshell',
  'Intelligent Masonry Paint',
  'Wall Primer Sealer',
  'Distemper',
  'Limewash',
];

// Main collection groups — colors with dual-membership (e.g. "Colours of England/CS-Stone")
// are matched via includes() so they appear under both parent groups.
// CS-Stone and CS-Grey are sub-collections of Colour Scales.
const LG_COLLECTIONS = [
  'Colours of England',
  'Colour Scales',
  'CS-Stone',
  'CS-Grey',
  'Sweet Treats',
];

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

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

function getTextColor(hex: string): string {
  return calculateLRV(hex) > 50 ? '#2C2C2C' : '#FFFFFF';
}

// ─────────────────────────────────────────────────────────
// DRAWER
// ─────────────────────────────────────────────────────────

function LGDrawer({
  color,
  isOpen,
  onClose,
  allColors,
}: {
  color: LGColor | null;
  isOpen: boolean;
  onClose: () => void;
  allColors: LGColor[];
}) {
  const [activeTab, setActiveTab] = useState<'collection' | 'visualizer' | 'specs'>('collection');
  const [metricVariant, setMetricVariant] = useState<MetricSelectedVariant | null>(null);

  // Reset tab when opening a new color
  useEffect(() => {
    if (isOpen) setActiveTab('collection');
  }, [color?.id, isOpen]);

  if (!color) return null;

  const lrv = calculateLRV(color.hexCode);
  const rgb = hexToRGB(color.hexCode);

  // Sibling colors from same collection
  const siblings = allColors
    .filter((c) => c.collection === color.collection && c.colorCode !== color.colorCode)
    .slice(0, 8);

  // Map metric variant to SelectedVariant for StickySubtotalBar
  const selectedVariant = metricVariant
    ? {
        productLine: metricVariant.finishType,
        productNumber: `LG-${color.colorCode}`,
        sheen: metricVariant.finishType,
        size: metricVariant.size,
        unitPriceEur: metricVariant.unitPriceEur,
      }
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)] text-2xl flex items-center gap-3">
            {color.name}
          </SheetTitle>
          <SheetDescription>{color.colorCode} · {color.collection}</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {/* Color Swatch */}
          <div
            className="w-full aspect-[3/1] rounded-xl shadow-lg mb-3"
            style={{ backgroundColor: color.hexCode }}
          />

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-secondary p-1 rounded-lg">
            {(['collection', 'visualizer', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={activeTab === tab ? { backgroundColor: BG_DARK } : undefined}
              >
                {tab === 'collection' ? 'Collection' : tab === 'visualizer' ? 'Visualizer' : 'Technical'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'collection' && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" style={{ color: BG_DARK }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <h3 className="text-sm font-semibold">More from {color.collection}</h3>
                </div>

                {siblings.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {siblings.map((c) => (
                      <div key={c.colorCode} className="text-center">
                        <div
                          className="aspect-square rounded-lg shadow-sm mb-1"
                          style={{ backgroundColor: c.hexCode }}
                        />
                        <div className="text-[10px] font-medium text-foreground truncate">{c.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{c.colorCode}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No other colours in this collection.
                  </p>
                )}
              </motion.div>
            )}

            {activeTab === 'visualizer' && (
              <UniversalVisualizer
                color={{
                  name: color.name,
                  colorCode: color.colorCode,
                  hexCode: color.hexCode,
                }}
                roomScenes={ROOM_SCENES}
                isLoading={false}
                lrv={lrv}
                rgb={rgb}
                accentColor={ACCENT}
              />
            )}

            {activeTab === 'specs' && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">LRV</div>
                    <div className="text-3xl font-semibold text-foreground">{lrv}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {lrv > 70 ? 'Very Light' : lrv > 50 ? 'Light' : lrv > 30 ? 'Medium' : lrv > 15 ? 'Dark' : 'Very Dark'}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Hex</div>
                    <div className="text-xl font-mono font-semibold text-foreground">{color.hexCode}</div>
                  </div>
                </div>

                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">RGB Values</div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500" />
                      <span className="font-mono text-sm">{rgb.r}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <span className="font-mono text-sm">{rgb.g}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500" />
                      <span className="font-mono text-sm">{rgb.b}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collection</span>
                    <span className="font-medium">{color.collection}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Default Finish</span>
                    <span className="font-medium">{color.finishType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium">13 m&sup2;/L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">In Stock</span>
                    <span className="font-medium">{color.inStock ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator className="my-4" />

          {/* Metric Variant Selector */}
          <MetricVariantSelector
            brand="LG"
            finishTypes={LG_FINISH_TYPES}
            accentColor={BG_DARK}
            onVariantChange={setMetricVariant}
          />

          {/* Add to Bag */}
          <div className="mt-4">
            <AddToBagButton
              item={
                metricVariant && color
                  ? {
                      colorNumber: color.colorCode,
                      colorName: color.name,
                      hexCode: color.hexCode,
                      productLine: metricVariant.finishType,
                      productNumber: `LG-${color.colorCode}`,
                      sheen: metricVariant.finishType,
                      size: metricVariant.size,
                      brand: 'LG',
                    }
                  : null
              }
            />
          </div>

          {/* Sticky Subtotal */}
          <StickySubtotalBar variant={selectedVariant} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────
// COLOR CARD
// ─────────────────────────────────────────────────────────

function LGColorCard({
  color,
  onSelect,
}: {
  color: LGColor;
  onSelect: (color: LGColor) => void;
}) {
  const textColor = getTextColor(color.hexCode);
  const lrv = calculateLRV(color.hexCode);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onSelect(color)}
      >
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function LittleGreenePage() {
  const [colors, setColors] = useState<LGColor[]>([]);
  const [wallpapers, setWallpapers] = useState<WallpaperData[]>([]);
  const [selectedColor, setSelectedColor] = useState<LGColor | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lrvRange, setLrvRange] = useState<[number, number]>([0, 100]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [wpCollection, setWpCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wpSearchQuery, setWpSearchQuery] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('Intelligent Matt Emulsion');
  const [activeProductTab, setActiveProductTab] = useState('paint');

  // Collection counts — use includes() so dual-membership colors count under both groups
  const collectionCounts = new Map<string, number>();
  LG_COLLECTIONS.forEach((col) => {
    const count = colors.filter((c) => (c.collection || '').includes(col)).length;
    collectionCounts.set(col, count);
  });

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

  const filteredColors = colors.filter((color) => {
    const lrv = calculateLRV(color.hexCode);
    const lrvMatch = lrv >= lrvRange[0] && lrv <= lrvRange[1];
    const collectionMatch = selectedCollection === 'all' || (color.collection || '').includes(selectedCollection);
    const searchMatch =
      !searchQuery ||
      color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.colorCode.toLowerCase().includes(searchQuery.toLowerCase());
    return lrvMatch && collectionMatch && searchMatch;
  });

  const handleColorSelect = (color: LGColor) => {
    setSelectedColor(color);
    setIsDrawerOpen(true);
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
            204 colours from the official Master Product List. Colours of England, Colour Scales &amp; Sweet Treats collections.
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

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        {activeProductTab === 'paint' ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-5">
            {/* Calculator */}
            <GenericPaintCalculator
              brand="LG"
              brandName="Little Greene"
              accentColor={ACCENT}
              bgColor={BG_DARK}
              selectedColor={selectedColor ? { name: selectedColor.name, colorCode: selectedColor.colorCode, hexCode: selectedColor.hexCode } : null}
              finishType={selectedFinish}
              coverageRate={13}
            />

            {/* Search */}
            <Card className="border-0 text-white" style={{ backgroundColor: BG_DARK }}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: ACCENT }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </h3>
                <Input
                  type="text"
                  placeholder="Colour name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </CardContent>
            </Card>

            {/* LRV Range */}
            <Card className="border-0 text-white" style={{ backgroundColor: BG_DARK }}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: ACCENT }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  LRV Range
                </h3>
                <Slider
                  value={lrvRange}
                  onValueChange={(v) => setLrvRange(v as [number, number])}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-xs text-white/60 mt-2">
                  <span>Dark ({lrvRange[0]})</span>
                  <span>Light ({lrvRange[1]})</span>
                </div>
              </CardContent>
            </Card>

            {/* Collections */}
            <Card className="border-0 text-white" style={{ backgroundColor: BG_DARK }}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Collections</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCollection('all')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      selectedCollection === 'all' ? 'text-[#2C2C2C]' : 'hover:bg-white/10 text-white/80'
                    }`}
                    style={selectedCollection === 'all' ? { backgroundColor: ACCENT } : undefined}
                  >
                    <span>All Colours</span>
                    <span className="text-xs opacity-60">{colors.length}</span>
                  </button>
                  {LG_COLLECTIONS.map((col) => {
                    const count = collectionCounts.get(col) || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={col}
                        onClick={() => setSelectedCollection(col)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                          selectedCollection === col ? 'text-[#2C2C2C]' : 'hover:bg-white/10 text-white/80'
                        }`}
                        style={selectedCollection === col ? { backgroundColor: ACCENT } : undefined}
                      >
                        <span>{col}</span>
                        <span className="text-xs opacity-60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Finish Selector (for calculator) */}
            <Card className="border-0 text-white" style={{ backgroundColor: BG_DARK }}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Calculator Finish</h3>
                <div className="flex flex-wrap gap-1.5">
                  {LG_FINISH_TYPES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                        selectedFinish === f
                          ? 'text-[#2C2C2C] font-medium'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                      style={selectedFinish === f ? { backgroundColor: ACCENT } : undefined}
                    >
                      {f.replace('Intelligent ', 'I. ').replace('Absolute ', 'Abs. ')}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Color Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedCollection === 'all' ? 'All Little Greene Colours' : selectedCollection}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredColors.length} colours
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredColors.map((color) => (
                  <motion.div
                    key={color.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <LGColorCard color={color} onSelect={handleColorSelect} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredColors.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No colours match your filter criteria.</p>
              </div>
            )}
          </div>
        </div>
        ) : (
        /* ─── WALLPAPER TAB ─── */
        <div className="flex flex-col lg:flex-row gap-8 bg-[#2a2f26] -mx-6 px-6 py-8 rounded-xl text-white">
          {/* Wallpaper Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-5">
            {/* Search */}
            <Card className="border-0 text-white" style={{ backgroundColor: BG_DARK }}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: ACCENT }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Wallpapers
                </h3>
                <Input
                  type="text"
                  placeholder="Design name or colourway..."
                  value={wpSearchQuery}
                  onChange={(e) => setWpSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </CardContent>
            </Card>

            {/* Wallpaper Collections */}
            <Card className="border-0 text-white" style={{ backgroundColor: BG_DARK }}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Collections</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setWpCollection('all')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      wpCollection === 'all' ? 'text-[#2C2C2C]' : 'hover:bg-white/10 text-white/80'
                    }`}
                    style={wpCollection === 'all' ? { backgroundColor: ACCENT } : undefined}
                  >
                    <span>All Designs</span>
                    <span className="text-xs opacity-60">{wallpapers.length}</span>
                  </button>
                  {wpCollections.map(([col, count]) => (
                    <button
                      key={col}
                      onClick={() => setWpCollection(col)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        wpCollection === col ? 'text-[#2C2C2C]' : 'hover:bg-white/10 text-white/80'
                      }`}
                      style={wpCollection === col ? { backgroundColor: ACCENT } : undefined}
                    >
                      <span>{col}</span>
                      <span className="text-xs opacity-60">{count}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Wallpaper Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {wpCollection === 'all' ? 'All Little Greene Wallpapers' : wpCollection}
              </h2>
              <span className="text-sm text-muted-foreground">
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
        </div>
        )}
      </main>

      {/* Drawer */}
      <LGDrawer
        color={selectedColor}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        allColors={colors}
      />

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
