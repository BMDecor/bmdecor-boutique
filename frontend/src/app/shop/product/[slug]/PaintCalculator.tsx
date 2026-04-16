'use client';

import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, Ruler, Layers, Package } from 'lucide-react';
import type { ContainerSize } from '@/types/store';

interface PaintCalculatorProps {
  coverageRateM2PerL: number;
  productName: string;
  availableSizes: ContainerSize[];
  onRecommendQuantity?: (size: ContainerSize, quantity: number) => void;
}

// Container sizes in liters
const SIZE_LITERS: Record<ContainerSize, number> = {
  'sample-pot': 0.06,
  'quart': 0.946,
  'gallon': 3.785,
};

export default function PaintCalculator({
  coverageRateM2PerL,
  productName,
  availableSizes,
  onRecommendQuantity,
}: PaintCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'dimensions' | 'area'>('dimensions');

  // Room dimensions
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('2.5');

  // Direct area input
  const [directArea, setDirectArea] = useState<string>('');

  // Coats
  const [coats, setCoats] = useState<number>(2);

  // Calculate wall area from room dimensions
  const calculatedArea = useMemo(() => {
    if (inputMode === 'area') {
      return parseFloat(directArea) || 0;
    }

    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 2.5;

    if (l === 0 || w === 0) return 0;

    // Calculate 4 walls: 2*(length*height) + 2*(width*height)
    // Subtract ~10% for windows/doors
    const totalWallArea = 2 * (l * h) + 2 * (w * h);
    return Math.round(totalWallArea * 0.9 * 10) / 10;
  }, [inputMode, length, width, height, directArea]);

  // Calculate paint needed
  const calculation = useMemo(() => {
    if (calculatedArea === 0) return null;

    const totalAreaTocover = calculatedArea * coats;
    const litersNeeded = totalAreaTocover / coverageRateM2PerL;

    // Find optimal container combination from available sizes
    // Sort by size descending (gallon first, then quart, then sample-pot)
    const sortedSizes = [...availableSizes].sort((a, b) =>
      (SIZE_LITERS[b] || 0) - (SIZE_LITERS[a] || 0)
    );

    const containers: { size: ContainerSize; quantity: number; liters: number }[] = [];
    let remaining = litersNeeded;

    for (const size of sortedSizes) {
      if (size === 'sample-pot') continue; // Skip sample pots for coverage calc

      const sizeLiters = SIZE_LITERS[size] || 0;
      if (sizeLiters === 0) continue;

      const count = Math.floor(remaining / sizeLiters);
      if (count > 0) {
        containers.push({ size, quantity: count, liters: sizeLiters });
        remaining -= count * sizeLiters;
      }
    }

    // If there's remaining, add one more of the smallest usable size
    if (remaining > 0.01) {
      // Find smallest available size (excluding sample-pot)
      const smallestSize = sortedSizes.find(s => s !== 'sample-pot' && SIZE_LITERS[s] > 0);
      if (smallestSize) {
        const existing = containers.find(c => c.size === smallestSize);
        if (existing) {
          existing.quantity += 1;
        } else {
          containers.push({
            size: smallestSize,
            quantity: 1,
            liters: SIZE_LITERS[smallestSize]
          });
        }
      }
    }

    // Convert to US gallons (1 gallon = 3.785 liters)
    const gallonsNeeded = litersNeeded / 3.785;
    // Convert sq meters to sq feet (1 m² = 10.764 sq ft)
    const areaSqFt = calculatedArea * 10.764;
    const totalAreaSqFt = totalAreaTocover * 10.764;

    return {
      areaPerCoat: calculatedArea,
      areaSqFt: Math.round(areaSqFt),
      totalArea: totalAreaTocover,
      totalAreaSqFt: Math.round(totalAreaSqFt),
      litersNeeded: Math.round(litersNeeded * 10) / 10,
      gallonsNeeded: Math.round(gallonsNeeded * 10) / 10,
      containers,
    };
  }, [calculatedArea, coats, coverageRateM2PerL, availableSizes]);

  const handleApplyRecommendation = (size: ContainerSize, quantity: number) => {
    if (onRecommendQuantity) {
      onRecommendQuantity(size, quantity);
      setIsOpen(false);
    }
  };

  const getSizeLabel = (size: ContainerSize): string => {
    switch (size) {
      case 'sample-pot': return 'Sample Pot';
      case 'quart': return 'Quart (946ml)';
      case 'gallon': return 'Gallon (3.78L)';
      default: return size;
    }
  };

  return (
    <div className="bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#F5F1EB] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C9A86C]/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#C9A86C]" />
          </div>
          <div className="text-left">
            <span className="block font-medium text-[#2C2C2C]">Paint Calculator</span>
            <span className="block text-xs text-[#2C2C2C]/50">
              Calculate how much paint you need
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#2C2C2C]/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#2C2C2C]/40" />
        )}
      </button>

      {/* Calculator Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#E8E2D9]">
          {/* Input Mode Toggle */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setInputMode('dimensions')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                inputMode === 'dimensions'
                  ? 'bg-[#2C2C2C] text-white'
                  : 'bg-white border border-[#E8E2D9] text-[#2C2C2C]/70 hover:border-[#C9A86C]/50'
              }`}
            >
              <Ruler className="w-4 h-4" />
              Room Dimensions
            </button>
            <button
              onClick={() => setInputMode('area')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                inputMode === 'area'
                  ? 'bg-[#2C2C2C] text-white'
                  : 'bg-white border border-[#E8E2D9] text-[#2C2C2C]/70 hover:border-[#C9A86C]/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Direct Area
            </button>
          </div>

          {/* Input Fields */}
          {inputMode === 'dimensions' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#2C2C2C]/50 mb-1">Length (m)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="4.5"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] bg-white text-[#2C2C2C] text-sm focus:outline-none focus:border-[#C9A86C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#2C2C2C]/50 mb-1">Width (m)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="3.5"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] bg-white text-[#2C2C2C] text-sm focus:outline-none focus:border-[#C9A86C]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#2C2C2C]/50 mb-1">Height (m)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="2.5"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] bg-white text-[#2C2C2C] text-sm focus:outline-none focus:border-[#C9A86C]"
                  />
                </div>
              </div>
              <p className="text-xs text-[#2C2C2C]/40">
                Calculates 4 walls minus ~10% for windows/doors
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-[#2C2C2C]/50 mb-1">Total Wall Area (m²)</label>
              <input
                type="number"
                value={directArea}
                onChange={(e) => setDirectArea(e.target.value)}
                placeholder="35"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] bg-white text-[#2C2C2C] text-sm focus:outline-none focus:border-[#C9A86C]"
              />
            </div>
          )}

          {/* Number of Coats */}
          <div>
            <label className="block text-xs text-[#2C2C2C]/50 mb-1">Number of Coats</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setCoats(n)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                    coats === n
                      ? 'bg-[#C9A86C] text-white'
                      : 'bg-white border border-[#E8E2D9] text-[#2C2C2C]/70 hover:border-[#C9A86C]/50'
                  }`}
                >
                  {n} coat{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {calculation && (
            <div className="bg-white rounded-lg border border-[#E8E2D9] p-4 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-[#2C2C2C]/50">Wall Area</p>
                  <p className="text-lg font-semibold text-[#2C2C2C]">{calculation.areaPerCoat}m²</p>
                  <p className="text-xs text-[#2C2C2C]/40">{calculation.areaSqFt} sq ft</p>
                </div>
                <div>
                  <p className="text-xs text-[#2C2C2C]/50">Coverage</p>
                  <p className="text-lg font-semibold text-[#2C2C2C]">{calculation.totalArea}m²</p>
                  <p className="text-xs text-[#2C2C2C]/40">{calculation.totalAreaSqFt} sq ft ({coats} coats)</p>
                </div>
                <div>
                  <p className="text-xs text-[#2C2C2C]/50">Paint Needed</p>
                  <p className="text-lg font-semibold text-[#C9A86C]">{calculation.litersNeeded}L</p>
                  <p className="text-xs text-[#C9A86C]/70">{calculation.gallonsNeeded} gal</p>
                </div>
              </div>

              {/* Recommended Containers */}
              {calculation.containers.length > 0 && (
                <div className="pt-4 border-t border-[#E8E2D9]">
                  <p className="text-xs text-[#2C2C2C]/50 mb-3 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Recommended Purchase
                  </p>
                  <div className="space-y-2">
                    {calculation.containers.map((container) => (
                      <div
                        key={container.size}
                        className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-[#2C2C2C]">
                            {container.quantity}× {getSizeLabel(container.size)}
                          </span>
                          <span className="text-xs text-[#2C2C2C]/40 ml-2">
                            ({(container.quantity * container.liters).toFixed(1)}L total)
                          </span>
                        </div>
                        {onRecommendQuantity && (
                          <button
                            onClick={() => handleApplyRecommendation(container.size, container.quantity)}
                            className="text-xs px-3 py-1 bg-[#C9A86C] text-white rounded-full hover:bg-[#B8975B] transition-colors"
                          >
                            Add to Order
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coverage Note */}
              <p className="text-xs text-[#2C2C2C]/40 pt-2 border-t border-[#E8E2D9]">
                Based on {productName} coverage rate of {coverageRateM2PerL} m²/L.
                Actual coverage may vary based on surface texture and application method.
              </p>
            </div>
          )}

          {!calculation && calculatedArea === 0 && (
            <div className="text-center py-6 text-sm text-[#2C2C2C]/40">
              Enter your room dimensions to calculate paint needs
            </div>
          )}
        </div>
      )}
    </div>
  );
}
