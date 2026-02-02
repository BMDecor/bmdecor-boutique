'use client';

import Link from 'next/link';
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
  // Extended technical data (simulated from BM API)
  lrv?: number;
  rgb?: { r: number; g: number; b: number };
  complementary?: string[];
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
  { id: 'historical', label: 'Historical Collection', count: 25 },
  { id: 'classics', label: 'Benjamin Moore Classics', count: 0 },
  { id: 'affinity', label: 'Affinity Collection', count: 0 },
  { id: 'aura', label: 'Color Stories (Aura)', count: 0 },
];

// Helper: Calculate LRV from hex
function calculateLRV(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
  const [r, g, b] = rgb.map((c) => c / 255);
  // Simplified LRV calculation
  const lrv = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 100;
  return Math.round(lrv);
}

// Helper: Get RGB from hex
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

// Helper: Generate complementary colors
function getComplementaryColors(hex: string): string[] {
  const rgb = hexToRGB(hex);
  // Complementary (opposite on color wheel)
  const comp = {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b,
  };
  // Analogous (nearby on wheel)
  const analog1 = {
    r: Math.min(255, rgb.r + 30),
    g: Math.max(0, rgb.g - 20),
    b: rgb.b,
  };
  const analog2 = {
    r: Math.max(0, rgb.r - 30),
    g: Math.min(255, rgb.g + 20),
    b: rgb.b,
  };

  const toHex = (c: { r: number; g: number; b: number }) =>
    `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`.toUpperCase();

  return [toHex(comp), toHex(analog1), toHex(analog2)];
}

// Helper: Text color based on luminance
function getTextColor(hex: string): string {
  const lrv = calculateLRV(hex);
  return lrv > 50 ? '#2C2C2C' : '#FFFFFF';
}

// Technical Specs Drawer Component
function TechnicalSpecsDrawer({
  color,
  isOpen,
  onClose,
}: {
  color: BMColor | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!color) return null;

  const lrv = calculateLRV(color.hexCode);
  const rgb = hexToRGB(color.hexCode);
  const complementary = getComplementaryColors(color.hexCode);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)] text-2xl">
            {color.name}
          </SheetTitle>
          <SheetDescription>{color.colorCode} · {color.collection}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Color Swatch Preview */}
          <div
            className="w-full aspect-video rounded-xl shadow-lg"
            style={{ backgroundColor: color.hexCode }}
          />

          {/* Room Visualizer Placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Room Visualizer
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs text-gray-500">
                Living Room
              </div>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs text-gray-500">
                Bedroom
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              API Integration: Room mockups powered by Benjamin Moore Visualizer
            </p>
          </div>

          <Separator />

          {/* Color Science Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Color Science
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* LRV */}
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Light Reflectance Value</div>
                <div className="text-3xl font-semibold text-foreground">{lrv}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {lrv > 50 ? 'Light color' : 'Dark color'}
                </div>
              </div>

              {/* Hex */}
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Hex Code</div>
                <div className="text-xl font-mono font-semibold text-foreground">
                  {color.hexCode}
                </div>
              </div>

              {/* RGB */}
              <div className="p-4 bg-secondary rounded-lg col-span-2">
                <div className="text-xs text-muted-foreground mb-2">RGB Values</div>
                <div className="flex items-center gap-4">
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
          </div>

          <Separator />

          {/* Complementary Palette */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Complementary Palette</h3>
            <div className="flex gap-2">
              {complementary.map((comp, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="aspect-square rounded-lg shadow-sm mb-1"
                    style={{ backgroundColor: comp }}
                  />
                  <div className="text-xs font-mono text-center text-muted-foreground">
                    {comp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

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

// Advanced Paint Calculator Component
function AdvancedPaintCalculator() {
  const [area, setArea] = useState<number>(0);
  const [coats, setCoats] = useState<number>(2);
  const [coverage, setCoverage] = useState<number>(12); // m² per liter

  const litersNeeded = area > 0 ? (area * coats) / coverage : 0;
  const containersNeeded = Math.ceil(litersNeeded / 2.5); // 2.5L containers
  const estimatedCost = containersNeeded * 68; // €68 per 2.5L

  return (
    <Card className="bg-[#2C2C2C] text-white border-0">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold">Paint Calculator</h3>
        </div>

        {/* Area Input */}
        <div className="space-y-4">
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

          <Separator className="bg-white/10" />

          {/* Results */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-white/60 mb-1">Liters Needed</div>
              <div className="text-xl font-semibold text-white">
                {litersNeeded.toFixed(1)}L
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-white/60 mb-1">Containers (2.5L)</div>
              <div className="text-xl font-semibold text-white">
                {containersNeeded || '—'}
              </div>
            </div>
          </div>

          {area > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#C9A86C]/20 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Estimated Cost</span>
                <span className="text-xl font-semibold text-[#C9A86C]">
                  €{estimatedCost.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Based on Regal Select Matte @ €68/2.5L
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Color Card with Technical Drawer Trigger
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => onSelect(color)}
      >
        {/* Color Swatch */}
        <div
          className="aspect-square w-full relative"
          style={{ backgroundColor: color.hexCode }}
        >
          {/* LRV Badge */}
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: `${textColor}20`, color: textColor }}
          >
            LRV {lrv}
          </div>

          {/* Color Code */}
          <div
            className="absolute bottom-3 left-3 font-mono text-sm font-semibold"
            style={{ color: textColor }}
          >
            {color.colorCode}
          </div>

          {/* Technical Drawer Icon */}
          <div
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: textColor }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card Content */}
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
  const [selectedCollection, setSelectedCollection] = useState('historical');

  // Fetch colors on mount
  useEffect(() => {
    async function fetchColors() {
      try {
        const response = await fetch('/api/colors?brand=BM');
        if (response.ok) {
          const data = await response.json();
          setColors(data);
        }
      } catch {
        // Fallback handled by API
      }
    }
    fetchColors();
  }, []);

  // Filter colors based on selections
  const filteredColors = colors.filter((color) => {
    const lrv = calculateLRV(color.hexCode);
    return lrv >= lrvRange[0] && lrv <= lrvRange[1];
  });

  const handleColorSelect = (color: BMColor) => {
    setSelectedColor(color);
    setIsDrawerOpen(true);
  };

  const toggleFinish = (finishId: string) => {
    setSelectedFinishes((prev) =>
      prev.includes(finishId)
        ? prev.filter((f) => f !== finishId)
        : [...prev, finishId]
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
              <Badge className="bg-[#C9A86C] text-[#2C2C2C] hover:bg-[#C9A86C]">
                {filteredColors.length} Colors
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#2C2C2C] text-white py-10">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-6 bg-[#C9A86C] rounded-full" />
            <span className="text-[#C9A86C] font-medium uppercase tracking-wider text-xs">
              Technical Boutique
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Benjamin Moore
          </h1>
          <p className="text-white/60 max-w-xl text-sm">
            Professional-grade paints with advanced color science. Click any color for
            full technical specifications, LRV data, and room visualizations.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Charcoal Sidebar */}
          <aside className="lg:w-72 shrink-0 space-y-6">
            {/* Paint Calculator */}
            <AdvancedPaintCalculator />

            {/* LRV Range Filter */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  LRV Range
                </h3>
                <div className="space-y-3">
                  <Slider
                    value={lrvRange}
                    onValueChange={(v) => setLrvRange(v as [number, number])}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Dark ({lrvRange[0]})</span>
                    <span>Light ({lrvRange[1]})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Finish Types */}
            <Card className="bg-[#2C2C2C] text-white border-0">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4">Finish Type</h3>
                <div className="space-y-2">
                  {FINISH_TYPES.map((finish) => (
                    <label
                      key={finish.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFinishes.includes(finish.id)}
                        onChange={() => toggleFinish(finish.id)}
                        className="mt-1 rounded border-white/30 bg-white/10 text-[#C9A86C] focus:ring-[#C9A86C]"
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
                  {COLLECTIONS.map((col) => (
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
                      {col.count > 0 && (
                        <span className="text-xs opacity-60">{col.count}</span>
                      )}
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
                {COLLECTIONS.find((c) => c.id === selectedCollection)?.label}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredColors.length} colors · Click for specs
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
                <p className="text-sm mt-1">Try adjusting the LRV range.</p>
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
            <span>Benjamin Moore® · Available at BM Decoración, Marbella</span>
            <span>IVA Incluido (21%) · Prices in EUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
