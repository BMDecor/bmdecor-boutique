'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  calculateOptimalMetricContainers,
  calculateMetricContainerCost,
  METRIC_SIZE_DISPLAY,
} from '@/lib/cart/variant-config';

interface GenericPaintCalculatorProps {
  brand: 'LG' | 'FB';
  brandName: string;
  accentColor: string;
  bgColor: string;
  selectedColor: { name: string; colorCode: string; hexCode: string } | null;
  finishType: string;
  coverageRate: number;
}

export default function GenericPaintCalculator({
  brand,
  brandName,
  accentColor,
  bgColor,
  selectedColor,
  finishType,
  coverageRate,
}: GenericPaintCalculatorProps) {
  const [wallHeight, setWallHeight] = useState(2.5);
  const [wallWidth, setWallWidth] = useState(4);
  const [doors, setDoors] = useState(1);
  const [windows, setWindows] = useState(1);
  const [coats, setCoats] = useState(2);

  const grossArea = wallHeight * wallWidth;
  const doorArea = doors * 1.98;
  const windowArea = windows * 1.2;
  const netArea = Math.max(0, grossArea - doorArea - windowArea);

  const result = useMemo(() => {
    if (netArea <= 0) return null;

    const litersNeeded = (netArea * coats) / coverageRate;
    const containers = calculateOptimalMetricContainers(litersNeeded, finishType, brand);
    const cost = calculateMetricContainerCost(containers, brand);

    return {
      litersNeeded: Math.round(litersNeeded * 10) / 10,
      containers,
      cost,
    };
  }, [netArea, coats, coverageRate, finishType, brand]);

  return (
    <Card className="border-0 shadow-none" style={{ backgroundColor: bgColor }}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4" style={{ color: accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">{brandName} Calculator</h3>
        </div>

        {/* Selected color preview */}
        {selectedColor && (
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <div
              className="w-8 h-8 rounded-md shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: selectedColor.hexCode }}
            />
            <div className="min-w-0">
              <div className="text-xs text-white font-medium truncate">{selectedColor.name}</div>
              <div className="text-[10px] text-white/50 font-mono">{selectedColor.colorCode}</div>
            </div>
          </div>
        )}

        {/* Wall Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Height (m)</label>
            <input
              type="number"
              value={wallHeight}
              onChange={(e) => setWallHeight(Math.max(0, Number(e.target.value)))}
              step="0.1"
              className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-1 focus:border-white/30"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Width (m)</label>
            <input
              type="number"
              value={wallWidth}
              onChange={(e) => setWallWidth(Math.max(0, Number(e.target.value)))}
              step="0.1"
              className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-1 focus:border-white/30"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Openings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Doors</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setDoors(Math.max(0, doors - 1))} className="w-7 h-7 rounded-md bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20">&minus;</button>
              <span className="text-white text-sm w-6 text-center">{doors}</span>
              <button onClick={() => setDoors(doors + 1)} className="w-7 h-7 rounded-md bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20">+</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Windows</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setWindows(Math.max(0, windows - 1))} className="w-7 h-7 rounded-md bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20">&minus;</button>
              <span className="text-white text-sm w-6 text-center">{windows}</span>
              <button onClick={() => setWindows(windows + 1)} className="w-7 h-7 rounded-md bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20">+</button>
            </div>
          </div>
        </div>

        {/* Net Area */}
        <div className="flex justify-between text-xs text-white/60 bg-white/5 rounded-lg p-2">
          <span>Net area</span>
          <span className="text-white font-medium">{netArea.toFixed(1)} m²</span>
        </div>

        {/* Coats */}
        <div>
          <label className="text-xs text-white/60 mb-1 block">Coats: {coats}</label>
          <input
            type="range"
            min={1}
            max={3}
            value={coats}
            onChange={(e) => setCoats(Number(e.target.value))}
            className="w-full accent-current"
            style={{ color: accentColor }}
          />
          <div className="flex justify-between text-[10px] text-white/40">
            <span>1</span><span>2</span><span>3</span>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="bg-white/10 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Litres needed</span>
              <span className="text-white font-medium">{result.litersNeeded}L</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Coverage</span>
              <span className="text-white font-medium">{coverageRate} m²/L</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              {result.cost.breakdown.map((b, i) => (
                <div key={i} className="flex justify-between text-xs text-white/60">
                  <span>{b.quantity}× {METRIC_SIZE_DISPLAY[b.size] || b.size}</span>
                  <span>&euro;{(b.unitPrice * b.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-semibold pt-1">
              <span className="text-white">Estimate</span>
              <span style={{ color: accentColor }}>&euro;{result.cost.eur.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-white/40 text-center">IVA incluido (21%)</div>
          </div>
        ) : (
          <div className="text-center py-3 text-white/50 text-sm">
            Enter wall dimensions to calculate
          </div>
        )}
      </CardContent>
    </Card>
  );
}
