'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
import type { RoomScene, ComplementaryResult, CalculatorResult } from '@/lib/api/benjamin-moore';

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

// Finish type options
const FINISH_TYPES = [
  { id: 'matte', label: 'Matte', description: 'Flat, non-reflective finish' },
  { id: 'eggshell', label: 'Eggshell', description: 'Soft, low-sheen finish' },
  { id: 'satin', label: 'Satin', description: 'Pearl-like, subtle shine' },
  { id: 'semi-gloss', label: 'Semi-Gloss', description: 'Durable, easy to clean' },
];

// Collection options
const COLLECTIONS = [
  { id: 'all', label: 'All Collections', count: 0 },
  { id: 'historical', label: 'Historical Collection', count: 0 },
  { id: 'classics', label: 'Benjamin Moore Classics', count: 0 },
  { id: 'affinity', label: 'Affinity Collection', count: 0 },
  { id: 'color-stories', label: 'Color Stories', count: 0 },
  { id: 'off-white', label: 'Off-White Collection', count: 0 },
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

// Official BM API Calculator Component
function OfficialBMCalculator({ selectedColor }: { selectedColor: BMColor | null }) {
  const [area, setArea] = useState<number>(0);
  const [coats, setCoats] = useState<number>(2);
  const [productLine, setProductLine] = useState('Regal Select');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateNeeds = async () => {
    if (!selectedColor || area <= 0) return;

    setIsCalculating(true);
    try {
      const response = await fetch('/api/bm/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorNumber: selectedColor.colorCode,
          surfaceArea: area,
          coats,
          productLine,
          finish: 'Matte',
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

  useEffect(() => {
    if (area > 0 && selectedColor) {
      const debounce = setTimeout(calculateNeeds, 500);
      return () => clearTimeout(debounce);
    }
  }, [area, coats, productLine, selectedColor]);

  return (
    <Card className="bg-[#2C2C2C] text-white border-0">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold">Official BM Calculator</h3>
          <Badge className="bg-[#C9A86C]/20 text-[#C9A86C] text-xs">API</Badge>
        </div>

        <div className="space-y-4">
          {/* Product Line Selection */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">Product Line</label>
            <select
              value={productLine}
              onChange={(e) => setProductLine(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white text-sm rounded-lg p-2"
            >
              <option value="Aura">Aura (Premium)</option>
              <option value="Regal Select">Regal Select</option>
              <option value="ben">ben (Value)</option>
            </select>
          </div>

          {/* Area Input */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">Surface Area (m²)</label>
            <Input
              type="number"
              placeholder="Enter area..."
              value={area || ''}
              onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Coats Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/60">Number of Coats</label>
              <span className="text-sm font-medium text-[#C9A86C]">{coats}</span>
            </div>
            <Slider
              value={[coats]}
              onValueChange={([v]) => setCoats(v)}
              min={1}
              max={3}
              step={1}
              className="py-2"
            />
          </div>

          {/* Selected Color */}
          {selectedColor && (
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
              <div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: selectedColor.hexCode }}
              />
              <div className="text-sm">
                <div className="font-medium">{selectedColor.name}</div>
                <div className="text-white/60 text-xs">{selectedColor.colorCode}</div>
              </div>
            </div>
          )}

          <Separator className="bg-white/10" />

          {/* Results */}
          {isCalculating ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-[#C9A86C] border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-white/60 mt-2">Calculating...</p>
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Liters Needed</div>
                  <div className="text-xl font-semibold text-white">
                    {result.litersNeeded}L
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Coverage</div>
                  <div className="text-xl font-semibold text-white">
                    {result.coverageData.coveragePerLiter}m²/L
                  </div>
                </div>
              </div>

              {/* Container Breakdown */}
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-white/60 mb-2">Recommended Purchase</div>
                <div className="space-y-1">
                  {result.containersNeeded.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{c.quantity}x {c.size}</span>
                      <span className="text-white/60">
                        €{(result.estimatedCost.breakdown[i]?.unitPrice * c.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Cost */}
              <div className="p-4 bg-[#C9A86C]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Total Estimate</span>
                  <span className="text-2xl font-semibold text-[#C9A86C]">
                    €{result.estimatedCost.eur.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {productLine} · {coats} coats · IVA incluido
                </p>
              </div>

              {/* Technical Data */}
              <div className="text-xs text-white/50 space-y-1">
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
                  <span>{result.coverageData.voc} g/L</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-white/50 text-sm">
              Enter surface area to calculate
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Technical Specs Drawer with BM API Integration
function TechnicalSpecsDrawer({
  color,
  isOpen,
  onClose,
}: {
  color: BMColor | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [roomScenes, setRoomScenes] = useState<RoomScene[]>([]);
  const [palettes, setPalettes] = useState<ComplementaryResult[]>([]);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [isLoadingPalettes, setIsLoadingPalettes] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'colors' | 'specs'>('visualizer');

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

      // Load complementary palettes
      setIsLoadingPalettes(true);
      fetch('/api/bm/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorNumber: color.colorCode, hexCode: color.hexCode }),
      })
        .then((res) => res.json())
        .then((data) => setPalettes(data.palettes || []))
        .finally(() => setIsLoadingPalettes(false));
    }
  }, [color, isOpen]);

  if (!color) return null;

  const lrv = calculateLRV(color.hexCode);
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
            className="w-full aspect-[3/1] rounded-xl shadow-lg mb-4"
            style={{ backgroundColor: color.hexCode }}
          />

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-4 bg-secondary p-1 rounded-lg">
            {(['visualizer', 'colors', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-[#2C2C2C] text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'visualizer' ? 'Room Visualizer' : tab === 'colors' ? 'Color Palette' : 'Technical Specs'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'visualizer' && (
              <motion.div
                key="visualizer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <h3 className="text-sm font-semibold">BM Visualizer Tool</h3>
                </div>

                {isLoadingScenes ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-video bg-secondary rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {roomScenes.slice(0, 4).map((scene) => (
                      <div key={scene.id} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={scene.imageUrl}
                            alt={scene.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <span className="text-xs text-white font-medium">{scene.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Powered by Benjamin Moore Visualizer API
                </p>
              </motion.div>
            )}

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
                  <h3 className="text-sm font-semibold">BM Color Discovery</h3>
                </div>

                {isLoadingPalettes ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {palettes.map((palette) => (
                      <div key={palette.type} className="p-3 bg-secondary rounded-lg">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          {palette.type}
                        </h4>
                        <div className="flex gap-2">
                          {palette.colors.map((c, i) => (
                            <div key={i} className="flex-1">
                              <div
                                className="aspect-square rounded-lg shadow-sm mb-1"
                                style={{ backgroundColor: c.hex }}
                              />
                              <div className="text-xs font-mono text-center text-muted-foreground">
                                {c.hex}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Powered by Benjamin Moore Color Discovery API
                </p>
              </motion.div>
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

// Color Card Component
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

// Main Page Component
export default function BenjaminMoorePage() {
  const [colors, setColors] = useState<BMColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<BMColor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lrvRange, setLrvRange] = useState<[number, number]>([0, 100]);
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>(['matte']);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchColors() {
      try {
        const response = await fetch('/api/colors?brand=BM');
        if (response.ok) {
          const data = await response.json();
          setColors(data);

          // Count by collection
          const counts: Record<string, number> = { all: data.length };
          data.forEach((c: BMColor) => {
            const col = c.collection || 'Unknown';
            counts[col] = (counts[col] || 0) + 1;
          });
          setCollectionCounts(counts);
        }
      } catch (error) {
        console.error('Failed to fetch colors:', error);
      }
    }
    fetchColors();
  }, []);

  // Filter colors
  const filteredColors = colors.filter((color) => {
    const lrv = calculateLRV(color.hexCode);
    const lrvMatch = lrv >= lrvRange[0] && lrv <= lrvRange[1];

    const collectionMatch =
      selectedCollection === 'all' ||
      (selectedCollection === 'historical' && color.collection === 'Historical Collection') ||
      (selectedCollection === 'classics' && color.collection === 'Benjamin Moore Classics') ||
      (selectedCollection === 'affinity' && color.collection === 'Affinity Collection') ||
      (selectedCollection === 'color-stories' && color.collection === 'Color Stories') ||
      (selectedCollection === 'off-white' && color.collection === 'Off-White Collection');

    return lrvMatch && collectionMatch;
  });

  const handleColorSelect = (color: BMColor) => {
    setSelectedColor(color);
    setIsDrawerOpen(true);
  };

  const toggleFinish = (finishId: string) => {
    setSelectedFinishes((prev) =>
      prev.includes(finishId) ? prev.filter((f) => f !== finishId) : [...prev, finishId]
    );
  };

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
              <Badge className="bg-[#C9A86C]/20 text-[#C9A86C]">BM API Tools</Badge>
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
              Technical Boutique · Full API Integration
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight mb-1">
            Benjamin Moore
          </h1>
          <p className="text-white/60 text-sm max-w-xl">
            Full catalog with Visualizer, Color Discovery, and Official Calculator powered by BM API.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Charcoal Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-6">
            {/* Official BM Calculator */}
            <OfficialBMCalculator selectedColor={selectedColor} />

            {/* LRV Range */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
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

            {/* Finish Types */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4">Finish Type</h3>
                <div className="space-y-2">
                  {FINISH_TYPES.map((finish) => (
                    <label key={finish.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFinishes.includes(finish.id)}
                        onChange={() => toggleFinish(finish.id)}
                        className="mt-1 rounded border-white/30 bg-white/10 text-[#C9A86C]"
                      />
                      <div>
                        <div className="text-sm font-medium group-hover:text-[#C9A86C] transition-colors">
                          {finish.label}
                        </div>
                        <div className="text-xs text-white/50">{finish.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collections */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4">Collections</h3>
                <div className="space-y-1">
                  {COLLECTIONS.map((col) => {
                    const count =
                      col.id === 'all'
                        ? collectionCounts.all || 0
                        : collectionCounts[
                            col.id === 'historical'
                              ? 'Historical Collection'
                              : col.id === 'classics'
                              ? 'Benjamin Moore Classics'
                              : col.id === 'affinity'
                              ? 'Affinity Collection'
                              : col.id === 'color-stories'
                              ? 'Color Stories'
                              : 'Off-White Collection'
                          ] || 0;

                    return (
                      <button
                        key={col.id}
                        onClick={() => setSelectedCollection(col.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                          selectedCollection === col.id
                            ? 'bg-[#C9A86C] text-[#2C2C2C]'
                            : 'hover:bg-white/10 text-white/80'
                        }`}
                      >
                        <span>{col.label}</span>
                        <span className="text-xs opacity-60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Color Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedCollection === 'all'
                  ? 'All Benjamin Moore Colors'
                  : COLLECTIONS.find((c) => c.id === selectedCollection)?.label}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredColors.length} colors · Click for BM tools
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
                    <BMColorCard color={color} onSelect={handleColorSelect} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

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
      />

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] bg-white mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>Benjamin Moore® API Integration · BM Decoración, Marbella</span>
            <span>IVA Incluido (21%) · Prices in EUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
