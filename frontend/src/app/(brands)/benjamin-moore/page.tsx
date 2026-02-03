'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
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
import type { CalculatorResult, ComplementaryResult, RoomScene } from '@/lib/api/benjamin-moore';
import BMVisualizer from '@/components/BMVisualizer';

// Types
interface BMColor {
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

// Discovery API response with real BM data
interface DiscoveryResponse {
  palettes: ComplementaryResult[];
  description: string;
  lrv: number;
  isActive: boolean;
}

// Core collection name patterns (everything else goes to Design Trends)
const CORE_COLLECTION_PATTERNS = [
  'Affinity', 'Benjamin Moore Classics', 'Designer Classics',
  'Color Preview', 'Color Stories', 'Williamsburg',
  'Historical Colors', 'Off White', 'Ready-Mix',
];

function isCorCollection(name: string): boolean {
  return CORE_COLLECTION_PATTERNS.some((pattern) => name.includes(pattern));
}

/** Strip HTML entities from collection names for display */
function cleanCollectionName(name: string): string {
  return name
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+Color Collection$/i, '')
    .replace(/\s+Colors$/i, '')
    .replace(/\s+Paint Color Collection$/i, '')
    .trim();
}

interface CollectionGroup {
  label: string;
  items: { name: string; displayName: string; count: number }[];
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
    sheens: [
      { label: 'Matte', productNumber: '532' },
    ],
  },
  {
    name: 'Woodluxe Exterior Stain',
    sheens: [
      { label: 'Solid', productNumber: 'ES-10' },
      { label: 'Semi-Transparent', productNumber: 'ES-40' },
      { label: 'Translucent', productNumber: 'ES-65' },
    ],
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

// ─────────────────────────────────────────────────────────
// PROFESSIONAL CALCULATOR (with real BM product lines)
// ─────────────────────────────────────────────────────────

function ProfessionalCalculator({ selectedColor }: { selectedColor: BMColor | null }) {
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
  const doorArea = doors * 1.98; // Standard door ~1.98 m²
  const windowArea = windows * 1.2; // Standard window ~1.2 m²
  const netArea = Math.max(0, grossArea - doorArea - windowArea);

  const line = PRODUCT_LINES[selectedLine];
  const sheen = line.sheens[selectedSheen] || line.sheens[0];

  const calculateNeeds = useCallback(async () => {
    if (!selectedColor || netArea <= 0) return;

    setIsCalculating(true);
    try {
      const response = await fetch('/api/bm/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorNumber: selectedColor.colorCode,
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
  }, [selectedColor, netArea, coats, line.name, sheen.productNumber]);

  useEffect(() => {
    if (netArea > 0 && selectedColor) {
      const debounce = setTimeout(calculateNeeds, 600);
      return () => clearTimeout(debounce);
    }
  }, [netArea, coats, selectedLine, selectedSheen, selectedColor, calculateNeeds]);

  return (
    <Card className="bg-[#2C2C2C] text-white border-0">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
              onChange={(e) => { setSelectedLine(Number(e.target.value)); setSelectedSheen(0); }}
              className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg p-2"
            >
              {PRODUCT_LINES.map((pl, i) => (
                <option key={pl.name} value={i} className="bg-[#2C2C2C]">{pl.name}</option>
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
              Gross: {grossArea.toFixed(1)}m² − Doors: {doorArea.toFixed(1)}m² − Windows: {windowArea.toFixed(1)}m² = <span className="text-[#C9A86C] font-medium">{netArea.toFixed(1)}m² net</span>
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

          {/* Selected Color */}
          {selectedColor && (
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: selectedColor.hexCode }} />
              <div className="text-sm">
                <div className="font-medium">{selectedColor.name}</div>
                <div className="text-white/60 text-xs">{selectedColor.colorCode}</div>
              </div>
            </div>
          )}

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
                  <div className="text-lg font-semibold text-white">{result.coverageData.coveragePerLiter}m²/L</div>
                </div>
              </div>

              {/* Container Breakdown */}
              <div className="p-2.5 bg-white/5 rounded-lg">
                <div className="text-xs text-white/60 mb-1.5">Recommended Purchase</div>
                <div className="space-y-1">
                  {result.containersNeeded.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{c.quantity}x {c.size}</span>
                      <span className="text-white/60">
                        €{((result.estimatedCost.breakdown[i]?.unitPrice || 0) * c.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-3 bg-[#C9A86C]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Total Estimate</span>
                  <span className="text-xl font-semibold text-[#C9A86C]">€{result.estimatedCost.eur.toFixed(2)}</span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {line.name} · {sheen.label} · {coats} coats · IVA incluido
                </p>
              </div>

              {/* Tech Data */}
              <div className="text-xs text-white/50 space-y-0.5">
                <div className="flex justify-between">
                  <span>Product</span>
                  <span className="font-mono">{sheen.productNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Finish</span>
                  <span>{result.coverageData.finish}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dry Time (touch)</span>
                  <span>{result.coverageData.dryTime.touchDry}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Recoat Time</span>
                  <span>{result.coverageData.dryTime.recoat}h</span>
                </div>
                <div className="flex justify-between">
                  <span>VOC</span>
                  <span>{result.coverageData.voc}</span>
                </div>
              </div>
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
// TECHNICAL SPECS DRAWER (real BM API data)
// ─────────────────────────────────────────────────────────

function TechnicalSpecsDrawer({
  color,
  isOpen,
  onClose,
  allColors,
}: {
  color: BMColor | null;
  isOpen: boolean;
  onClose: () => void;
  allColors: BMColor[];
}) {
  const [roomScenes, setRoomScenes] = useState<RoomScene[]>([]);
  const [palettes, setPalettes] = useState<ComplementaryResult[]>([]);
  const [apiDescription, setApiDescription] = useState<string>('');
  const [apiLRV, setApiLRV] = useState<number | null>(null);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [isLoadingPalettes, setIsLoadingPalettes] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'colors' | 'specs'>('colors');

  useEffect(() => {
    if (color && isOpen) {
      // Load visualizer scenes
      setIsLoadingScenes(true);
      fetch('/api/bm/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorNumber: color.colorCode, hexCode: color.hexCode }),
      })
        .then((res) => res.json())
        .then((data) => setRoomScenes(data.scenes || []))
        .finally(() => setIsLoadingScenes(false));

      // Load real BM discovery data (harmony, similar, shades, description, LRV)
      setIsLoadingPalettes(true);
      fetch('/api/bm/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorNumber: color.colorCode }),
      })
        .then((res) => res.json())
        .then((data: DiscoveryResponse) => {
          setPalettes(data.palettes || []);
          setApiDescription(data.description || '');
          setApiLRV(data.lrv ?? null);
        })
        .finally(() => setIsLoadingPalettes(false));
    }
  }, [color, isOpen]);

  if (!color) return null;

  const fallbackLRV = calculateLRV(color.hexCode);
  const lrv = apiLRV !== null ? Math.round(apiLRV) : fallbackLRV;
  const rgb = hexToRGB(color.hexCode);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)] text-2xl flex items-center gap-3">
            {color.name}
            <Badge className="bg-[#C9A86C] text-[#2C2C2C]">BM API</Badge>
          </SheetTitle>
          <SheetDescription>{color.colorCode} · {color.collection}</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {/* Color Swatch */}
          <div
            className="w-full aspect-[3/1] rounded-xl shadow-lg mb-3"
            style={{ backgroundColor: color.hexCode }}
          />

          {/* Official Description from BM API */}
          {apiDescription && (
            <p className="text-sm text-muted-foreground italic mb-4 px-1">
              &ldquo;{apiDescription}&rdquo;
            </p>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-4 bg-secondary p-1 rounded-lg">
            {(['colors', 'visualizer', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
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
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <h3 className="text-sm font-semibold">Official BM Color Palettes</h3>
                </div>

                {isLoadingPalettes ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : palettes.length > 0 ? (
                  <div className="space-y-4">
                    {palettes.map((palette) => (
                      <div key={palette.type} className="p-3 bg-secondary rounded-lg">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          {palette.type}
                        </h4>
                        <div className="flex gap-2">
                          {palette.colors.map((c) => (
                            <div key={c.colorNumber} className="flex-1 min-w-0">
                              <div
                                className="aspect-square rounded-lg shadow-sm mb-1"
                                style={{ backgroundColor: c.hex }}
                              />
                              <div className="text-[10px] font-medium text-foreground truncate">
                                {c.colorName}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground">
                                {c.colorNumber}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ─── Palette Fail-Safe: Collection Fallback ─── */
                  (() => {
                    const siblings = allColors
                      .filter(
                        (c) =>
                          c.collection === color.collection &&
                          c.colorCode !== color.colorCode
                      )
                      .slice(0, 4);

                    return siblings.length > 0 ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-secondary rounded-lg">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            More from {cleanCollectionName(color.collection || 'Collection')}
                          </h4>
                          <div className="flex gap-2">
                            {siblings.map((c) => (
                              <div key={c.colorCode} className="flex-1 min-w-0">
                                <div
                                  className="aspect-square rounded-lg shadow-sm mb-1"
                                  style={{ backgroundColor: c.hexCode }}
                                />
                                <div className="text-[10px] font-medium text-foreground truncate">
                                  {c.name}
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">
                                  {c.colorCode}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Local collection fallback — BM Discovery API returned no palettes
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No palette data available for this color.
                      </div>
                    );
                  })()
                )}
                <p className="text-xs text-muted-foreground">
                  Curated by Benjamin Moore via GetColorDetail API
                </p>
              </motion.div>
            )}

            {activeTab === 'visualizer' && (
              <BMVisualizer
                color={{
                  name: color.name,
                  colorCode: color.colorCode,
                  hexCode: color.hexCode,
                }}
                roomScenes={roomScenes}
                isLoading={isLoadingScenes}
                lrv={lrv}
                rgb={rgb}
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
                    <div className="text-xs text-muted-foreground mb-1">
                      LRV {apiLRV !== null ? '(Official)' : '(Calculated)'}
                    </div>
                    <div className="text-3xl font-semibold text-foreground">{lrv}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {lrv > 50 ? 'Light reflectance' : 'Low reflectance'}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Hex</div>
                    <div className="text-xl font-mono font-semibold text-foreground">
                      {color.hexCode}
                    </div>
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
                    <span className="text-muted-foreground">Finish</span>
                    <span className="font-medium">{color.finishType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-medium">{color.volume}</span>
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

          {/* Pricing & Add to Cart */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-2xl font-semibold text-[#C9A86C]">€{color.priceEur.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{color.volume} · IVA Incluido</div>
            </div>
            <button className="px-6 py-3 bg-[#2C2C2C] text-white font-medium rounded-lg hover:bg-[#404040] transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────
// COLOR CARD
// ─────────────────────────────────────────────────────────

function BMColorCard({
  color,
  onSelect,
}: {
  color: BMColor;
  onSelect: (color: BMColor) => void;
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
            <span className="text-sm font-semibold text-[#C9A86C]">
              €{color.priceEur.toFixed(2)}
            </span>
            <Badge variant="outline" className="text-xs">
              {color.finishType.split(' ')[0]}
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

export default function BenjaminMoorePage() {
  const [colors, setColors] = useState<BMColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<BMColor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lrvRange, setLrvRange] = useState<[number, number]>([0, 100]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic collections built from DynamoDB data
  const [collectionGroups, setCollectionGroups] = useState<CollectionGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchColors() {
      try {
        const response = await fetch('/api/colors?brand=BM');
        if (response.ok) {
          const data = await response.json();
          setColors(data);

          // Build dynamic collection map from actual data
          const counts = new Map<string, number>();
          data.forEach((c: BMColor) => {
            const col = c.collection || 'Unknown';
            counts.set(col, (counts.get(col) || 0) + 1);
          });

          setTotalCount(data.length);

          // Group into Core Collections and Design Trends
          const core: { name: string; displayName: string; count: number }[] = [];
          const trends: { name: string; displayName: string; count: number }[] = [];

          for (const [name, count] of counts.entries()) {
            const entry = { name, displayName: cleanCollectionName(name), count };
            if (isCorCollection(name)) {
              core.push(entry);
            } else {
              trends.push(entry);
            }
          }

          // Sort: core by count descending, trends by name
          core.sort((a, b) => b.count - a.count);
          trends.sort((a, b) => a.displayName.localeCompare(b.displayName));

          const groups: CollectionGroup[] = [];
          if (core.length > 0) groups.push({ label: 'Core Collections', items: core });
          if (trends.length > 0) groups.push({ label: 'Design Trends', items: trends });
          setCollectionGroups(groups);
        }
      } catch (error) {
        console.error('Failed to fetch colors:', error);
      }
    }
    fetchColors();
  }, []);

  // Filter colors — selectedCollection is either 'all' or the raw DynamoDB collection name
  const filteredColors = colors.filter((color) => {
    const lrv = calculateLRV(color.hexCode);
    const lrvMatch = lrv >= lrvRange[0] && lrv <= lrvRange[1];

    const collectionMatch =
      selectedCollection === 'all' || color.collection === selectedCollection;

    const searchMatch =
      !searchQuery ||
      color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.colorCode.toLowerCase().includes(searchQuery.toLowerCase());

    return lrvMatch && collectionMatch && searchMatch;
  });

  const handleColorSelect = (color: BMColor) => {
    setSelectedColor(color);
    setIsDrawerOpen(true);
  };

  // Find the display name for the currently selected collection
  const selectedDisplayName =
    selectedCollection === 'all'
      ? 'All Benjamin Moore Colors'
      : collectionGroups
          .flatMap((g) => g.items)
          .find((i) => i.name === selectedCollection)?.displayName || selectedCollection;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Pro Header */}
      <header className="bg-[#2C2C2C] text-white sticky top-0 z-40">
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
              <Badge className="bg-[#C9A86C]/20 text-[#C9A86C]">Production API</Badge>
              <Badge className="bg-[#C9A86C] text-[#2C2C2C]">
                {filteredColors.length} Colors
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#2C2C2C] text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 bg-[#C9A86C] rounded-full" />
            <span className="text-[#C9A86C] font-medium uppercase tracking-wider text-xs">
              Technical Boutique · BM Production API
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight mb-1">
            Benjamin Moore
          </h1>
          <p className="text-white/60 text-sm max-w-xl">
            4,000+ official colors with real BM Color Discovery, Professional Calculator, and Room Visualizer.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-5">
            {/* Calculator */}
            <ProfessionalCalculator selectedColor={selectedColor} />

            {/* Search */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </h3>
                <Input
                  type="text"
                  placeholder="Color name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </CardContent>
            </Card>

            {/* LRV Range */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Dynamic Collections from DynamoDB */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Collections</h3>
                <div className="space-y-1">
                  {/* All Colors button */}
                  <button
                    onClick={() => setSelectedCollection('all')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      selectedCollection === 'all'
                        ? 'bg-[#C9A86C] text-[#2C2C2C]'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span>All Collections</span>
                    <span className="text-xs opacity-60">{totalCount}</span>
                  </button>

                  {/* Grouped collections */}
                  {collectionGroups.map((group) => (
                    <div key={group.label}>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mt-3 mb-1 px-3">
                        {group.label}
                      </div>
                      {group.items.map((col) => (
                        <button
                          key={col.name}
                          onClick={() => setSelectedCollection(col.name)}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                            selectedCollection === col.name
                              ? 'bg-[#C9A86C] text-[#2C2C2C]'
                              : 'hover:bg-white/10 text-white/80'
                          }`}
                        >
                          <span className="truncate mr-2">{col.displayName}</span>
                          <span className="text-xs opacity-60 shrink-0">{col.count}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Color Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedDisplayName}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredColors.length} colors · Click for BM tools
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredColors.slice(0, 200).map((color) => (
                  <motion.div
                    key={color.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <BMColorCard color={color} onSelect={handleColorSelect} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredColors.length > 200 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Showing 200 of {filteredColors.length} colors. Use search or filters to narrow results.
              </div>
            )}

            {filteredColors.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No colors match your filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Technical Specs Drawer */}
      <TechnicalSpecsDrawer
        color={selectedColor}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        allColors={colors}
      />

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] bg-white mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>Benjamin Moore® Production API · BM Decoraci&oacute;n, Marbella</span>
            <span>IVA Incluido (21%) · Prices in EUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
