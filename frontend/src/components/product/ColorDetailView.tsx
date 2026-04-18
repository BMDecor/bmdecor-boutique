'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { ComplementaryResult, RoomScene, CalculatorResult } from '@/lib/api/benjamin-moore';
import type { SelectedVariant } from '@/lib/cart/types';
import UniversalVisualizer from '@/components/UniversalVisualizer';
import VariantSelector from '@/components/cart/VariantSelector';
import AddToBagButton from '@/components/cart/AddToBagButton';
import StickySubtotalBar from '@/components/cart/StickySubtotalBar';
import CalculatorCartBridge from '@/components/cart/CalculatorCartBridge';
import { createSlug } from '@/lib/utils/slugs';
import { decodeHtmlEntities } from '@/lib/utils/html-entities';

interface ColorProduct {
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
  exteriorAvailability?: string;
  eStoreAvailable?: boolean;
  productTypesAvailable?: string;
}

interface Props {
  product: ColorProduct;
  brandName: string;
  allBrandColors: ColorProduct[];
}

// Product lines with real BM product numbers
const PRODUCT_LINES = [
  {
    name: 'Aura Interior',
    sheens: [
      { label: 'Matte', productNumber: 'N522' },
      { label: 'Eggshell', productNumber: 'N524' },
      { label: 'Satin', productNumber: 'N526' },
      { label: 'Semi-Gloss', productNumber: 'N528' },
    ],
  },
  {
    name: 'Regal Select Interior',
    sheens: [
      { label: 'Flat', productNumber: 'N547' },
      { label: 'Matte', productNumber: 'N548' },
      { label: 'Eggshell', productNumber: 'N549' },
      { label: 'Pearl', productNumber: 'N550' },
      { label: 'Semi-Gloss', productNumber: 'N551' },
    ],
  },
  {
    name: 'ben Interior',
    sheens: [
      { label: 'Matte', productNumber: 'N624' },
      { label: 'Eggshell', productNumber: 'N626' },
      { label: 'Semi-Gloss', productNumber: 'N627' },
      { label: 'Pearl', productNumber: 'N628' },
    ],
  },
  {
    name: 'Aura Exterior',
    sheens: [
      { label: 'Flat', productNumber: 'N629' },
      { label: 'Satin', productNumber: 'N631' },
      { label: 'Soft Gloss', productNumber: 'N632' },
      { label: 'Low Lustre', productNumber: 'N634' },
    ],
  },
  {
    name: 'Regal Select Exterior',
    sheens: [
      { label: 'Flat', productNumber: '400' },
      { label: 'Low Lustre', productNumber: '401' },
      { label: 'Soft Gloss', productNumber: '403' },
    ],
  },
  {
    name: 'Aura Bath & Spa',
    sheens: [{ label: 'Matte', productNumber: '532' }],
  },
];

// Helper functions
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

function cleanCollectionName(name: string): string {
  return decodeHtmlEntities(name)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+Color Collection$/i, '')
    .replace(/\s+Colors$/i, '')
    .replace(/\s+Paint Color Collection$/i, '')
    .trim();
}

// ─────────────────────────────────────────────────────────
// PROFESSIONAL CALCULATOR
// ─────────────────────────────────────────────────────────

function ProfessionalCalculator({ color }: { color: ColorProduct }) {
  const [wallHeight, setWallHeight] = useState<number>(0);
  const [wallWidth, setWallWidth] = useState<number>(0);
  const [doors, setDoors] = useState<number>(1);
  const [windows, setWindows] = useState<number>(1);
  const [coats, setCoats] = useState<number>(2);
  const [selectedLine, setSelectedLine] = useState(0);
  const [selectedSheen, setSelectedSheen] = useState(0);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate net surface area
  const grossArea = wallHeight * wallWidth;
  const doorArea = doors * 1.98;
  const windowArea = windows * 1.2;
  const netArea = Math.max(0, grossArea - doorArea - windowArea);

  const line = PRODUCT_LINES[selectedLine];
  const sheen = line.sheens[selectedSheen] || line.sheens[0];

  useEffect(() => {
    const calculateNeeds = async () => {
      if (netArea <= 0) return;

      setIsCalculating(true);
      try {
        const response = await fetch('/api/bm/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            colorNumber: color.colorCode,
            surfaceArea: netArea,
            coats,
            productLine: line.name,
            productNumber: sheen.productNumber,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResult(data);
        }
      } catch (error) {
        console.error('Calculator error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    if (netArea > 0) {
      const debounce = setTimeout(calculateNeeds, 600);
      return () => clearTimeout(debounce);
    }
  }, [netArea, coats, selectedLine, selectedSheen, color.colorCode, line.name, sheen.productNumber]);

  return (
    <Card className="bg-[#2C2C2C] text-white border-0">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-[#C9A86C]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="font-semibold text-sm">Professional Calculator</h3>
          <Badge className="bg-[#C9A86C]/20 text-[#C9A86C] text-xs">BM API</Badge>
        </div>

        <div className="space-y-3">
          {/* Product Line */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">Product Line</label>
            <select
              value={selectedLine}
              onChange={(e) => {
                setSelectedLine(Number(e.target.value));
                setSelectedSheen(0);
              }}
              className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg p-2"
            >
              {PRODUCT_LINES.map((pl, i) => (
                <option key={pl.name} value={i} className="bg-[#2C2C2C]">
                  {pl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sheen */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">Sheen</label>
            <div className="flex flex-wrap gap-1.5">
              {line.sheens.map((s, i) => (
                <button
                  key={s.productNumber}
                  onClick={() => setSelectedSheen(i)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    selectedSheen === i
                      ? 'bg-[#C9A86C] text-[#2C2C2C] font-medium'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wall Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Wall Height (m)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="2.5"
                value={wallHeight || ''}
                onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-9"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Wall Width (m)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="4.0"
                value={wallWidth || ''}
                onChange={(e) => setWallWidth(parseFloat(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-9"
              />
            </div>
          </div>

          {/* Doors & Windows */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Doors</label>
              <Input
                type="number"
                min="0"
                value={doors}
                onChange={(e) => setDoors(parseInt(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white h-9"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Windows</label>
              <Input
                type="number"
                min="0"
                value={windows}
                onChange={(e) => setWindows(parseInt(e.target.value) || 0)}
                className="bg-white/10 border-white/20 text-white h-9"
              />
            </div>
          </div>

          {/* Net Area Display */}
          {grossArea > 0 && (
            <div className="text-xs text-white/50 px-1">
              Gross: {grossArea.toFixed(1)}m² - Doors: {doorArea.toFixed(1)}m² - Windows:{' '}
              {windowArea.toFixed(1)}m² ={' '}
              <span className="text-[#C9A86C] font-medium">{netArea.toFixed(1)}m² net</span>
            </div>
          )}

          {/* Coats */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/60">Coats</label>
              <span className="text-sm font-medium text-[#C9A86C]">{coats}</span>
            </div>
            <Slider
              value={[coats]}
              onValueChange={([v]) => setCoats(v)}
              min={1}
              max={3}
              step={1}
              className="py-1"
            />
          </div>

          <Separator className="bg-white/10" />

          {/* Results */}
          {isCalculating ? (
            <div className="text-center py-3">
              <div className="animate-spin w-5 h-5 border-2 border-[#C9A86C] border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-white/60 mt-2">Calculating...</p>
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-0.5">Liters Needed</div>
                  <div className="text-lg font-semibold text-white">{result.litersNeeded}L</div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-0.5">Coverage</div>
                  <div className="text-lg font-semibold text-white">
                    {result.coverageData.coveragePerLiter}m²/L
                  </div>
                </div>
              </div>

              {/* Container Breakdown */}
              <div className="p-2.5 bg-white/5 rounded-lg">
                <div className="text-xs text-white/60 mb-1.5">Recommended Purchase</div>
                <div className="space-y-1">
                  {result.containersNeeded.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {c.quantity}x {c.size}
                      </span>
                      <span className="text-white/60">
                        €
                        {(
                          (result.estimatedCost.breakdown[i]?.unitPrice || 0) * c.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-3 bg-[#C9A86C]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Total Estimate</span>
                  <span className="text-xl font-semibold text-[#C9A86C]">
                    €{result.estimatedCost.eur.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {line.name} · {sheen.label} · {coats} coats · IVA incluido
                </p>
              </div>

              {/* Calculator → Cart Bridge */}
              <CalculatorCartBridge
                result={result}
                selectedColor={{
                  name: color.name,
                  colorCode: color.colorCode,
                  hexCode: color.hexCode,
                }}
                productLine={line.name}
                productNumber={sheen.productNumber}
                sheen={sheen.label}
              />
            </div>
          ) : (
            <div className="text-center py-3 text-white/50 text-sm">
              Enter wall dimensions to calculate
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COLOR DETAIL VIEW
// ─────────────────────────────────────────────────────────

export default function ColorDetailView({ product, brandName, allBrandColors }: Props) {
  const [roomScenes, setRoomScenes] = useState<RoomScene[]>([]);
  const [palettes, setPalettes] = useState<ComplementaryResult[]>([]);
  const [apiDescription, setApiDescription] = useState<string>('');
  const [apiLRV, setApiLRV] = useState<number | null>(null);
  const [isLoadingScenes, setIsLoadingScenes] = useState(true);
  const [isLoadingPalettes, setIsLoadingPalettes] = useState(true);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'colors' | 'specs'>('colors');
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null);

  // Fetch BM API data on mount
  useEffect(() => {
    // Load visualizer scenes
    fetch('/api/bm/visualizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colorNumber: product.colorCode, hexCode: product.hexCode }),
    })
      .then((res) => res.json())
      .then((data) => setRoomScenes(data.scenes || []))
      .finally(() => setIsLoadingScenes(false));

    // Load real BM discovery data
    fetch('/api/bm/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colorNumber: product.colorCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPalettes(data.palettes || []);
        setApiDescription(data.description || '');
        setApiLRV(data.lrv ?? null);
      })
      .finally(() => setIsLoadingPalettes(false));
  }, [product.colorCode, product.hexCode]);

  const fallbackLRV = calculateLRV(product.hexCode);
  const lrv = apiLRV !== null ? Math.round(apiLRV) : fallbackLRV;
  const rgb = hexToRGB(product.hexCode);
  const textColor = getTextColor(product.hexCode);

  // Sibling colors from same collection
  const siblingColors = useMemo(() => {
    if (!product.collection) return [];
    return allBrandColors
      .filter((c) => c.collection === product.collection && c.colorCode !== product.colorCode)
      .slice(0, 4);
  }, [allBrandColors, product.collection, product.colorCode]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Pro Header */}
      <header className="bg-[#2C2C2C] text-white sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={product.brand === 'BM' ? '/benjamin-moore' : '/'}
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to {brandName}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Calculator + Color Info */}
          <aside className="lg:w-80 shrink-0 space-y-5">
            {/* Color Swatch Card */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div
                className="aspect-square w-full relative"
                style={{ backgroundColor: product.hexCode }}
              >
                <div
                  className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${textColor}20`, color: textColor }}
                >
                  LRV {lrv}
                </div>
                <div
                  className="absolute bottom-3 left-3 font-mono text-sm font-semibold"
                  style={{ color: textColor }}
                >
                  {product.colorCode}
                </div>
              </div>
              <CardContent className="p-4 bg-white">
                <h1 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2C2C2C]">
                  {decodeHtmlEntities(product.name)}
                </h1>
                <p className="text-sm text-[#2C2C2C]/50 mt-1">
                  {product.colorCode} · {decodeHtmlEntities(product.collection)}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-lg font-semibold text-[#C9A86C]">
                    €{product.priceEur.toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {product.finishType.split(' ')[0]}
                  </Badge>
                  {product.exteriorAvailability &&
                    product.exteriorAvailability.toLowerCase() === 'available' && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#C9A86C]/40 bg-[#C9A86C]/10 text-[#8a6e44]"
                        title="This colour can be formulated in exterior paint lines."
                      >
                        Suitable for Exterior
                      </Badge>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Calculator */}
            <ProfessionalCalculator color={product} />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Hero Description */}
            {(apiDescription || product.description) && (
              <div className="mb-6">
                <p className="text-lg text-[#2C2C2C]/70 italic leading-relaxed">
                  &ldquo;{apiDescription || product.description}&rdquo;
                </p>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-secondary p-1 rounded-lg w-fit">
              {(['colors', 'visualizer', 'specs'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-[#2C2C2C] text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'colors' ? 'BM Palettes' : tab === 'visualizer' ? 'Visualizer' : 'Technical'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'colors' && (
                <motion.div
                  key="colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-[#C9A86C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <h2 className="text-lg font-semibold">Official BM Color Palettes</h2>
                  </div>

                  {isLoadingPalettes ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : palettes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {palettes.map((palette) => (
                        <div key={palette.type} className="p-4 bg-white rounded-xl shadow-sm">
                          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            {palette.type}
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                            {palette.colors.map((c) => (
                              <Link
                                key={c.colorNumber}
                                href={`/color/${createSlug({ brand: product.brand, name: c.colorName, colorCode: c.colorNumber })}`}
                                className="group"
                              >
                                <div
                                  className="aspect-square rounded-lg shadow-sm group-hover:ring-2 ring-[#C9A86C] transition-all"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <div className="text-[10px] font-medium text-foreground truncate mt-1">
                                  {c.colorName}
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">
                                  {c.colorNumber}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : siblingColors.length > 0 ? (
                    // Fallback to collection siblings
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        More from {cleanCollectionName(product.collection || 'Collection')}
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {siblingColors.map((c) => (
                          <Link
                            key={c.colorCode}
                            href={`/color/${createSlug(c)}`}
                            className="group"
                          >
                            <div
                              className="aspect-square rounded-lg shadow-sm group-hover:ring-2 ring-[#C9A86C] transition-all"
                              style={{ backgroundColor: c.hexCode }}
                            />
                            <div className="text-[10px] font-medium text-foreground truncate mt-1">
                              {c.name}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {c.colorCode}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Local collection fallback — BM Discovery API returned no palettes
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No palette data available for this color.
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Curated by Benjamin Moore via GetColorDetail API
                  </p>
                </motion.div>
              )}

              {activeTab === 'visualizer' && (
                <motion.div
                  key="visualizer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <UniversalVisualizer
                    color={{
                      name: product.name,
                      colorCode: product.colorCode,
                      hexCode: product.hexCode,
                    }}
                    roomScenes={roomScenes}
                    isLoading={isLoadingScenes}
                    lrv={lrv}
                    rgb={rgb}
                    accentColor="#C9A86C"
                  />
                </motion.div>
              )}

              {activeTab === 'specs' && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <div className="text-xs text-muted-foreground mb-1">
                        LRV {apiLRV !== null ? '(Official)' : '(Calculated)'}
                      </div>
                      <div className="text-3xl font-semibold text-foreground">{lrv}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {lrv > 50 ? 'Light reflectance' : 'Low reflectance'}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <div className="text-xs text-muted-foreground mb-1">Hex</div>
                      <div className="text-xl font-mono font-semibold text-foreground">
                        {product.hexCode}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm col-span-2">
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
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Product Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-muted-foreground">Collection</span>
                        <span className="font-medium">{decodeHtmlEntities(product.collection)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-muted-foreground">Finish</span>
                        <span className="font-medium">{product.finishType}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-muted-foreground">Volume</span>
                        <span className="font-medium">{product.volume}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-muted-foreground">In Stock</span>
                        <span className="font-medium">{product.inStock ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator className="my-8" />

            {/* Variant Selector + Add to Bag */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Select Product & Add to Cart</h3>
              <VariantSelector productLines={PRODUCT_LINES} onVariantChange={setSelectedVariant} />

              <div className="mt-6">
                <AddToBagButton
                  item={
                    selectedVariant
                      ? {
                          colorNumber: product.colorCode,
                          colorName: product.name,
                          hexCode: product.hexCode,
                          productLine: selectedVariant.productLine,
                          productNumber: selectedVariant.productNumber,
                          sheen: selectedVariant.sheen,
                          size: selectedVariant.size,
                          brand: 'BM',
                        }
                      : null
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Subtotal */}
      <StickySubtotalBar variant={selectedVariant} />

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
