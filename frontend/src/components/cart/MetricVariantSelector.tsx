'use client';

import { useState, useEffect } from 'react';
import {
  getAvailableMetricSizes,
  getPriceForSize,
  METRIC_SIZE_DISPLAY,
} from '@/lib/cart/variant-config';
import type { ContainerSize } from '@/lib/cart/variant-config';

export interface MetricSelectedVariant {
  finishType: string;
  size: ContainerSize;
  unitPriceEur: number;
}

interface MetricVariantSelectorProps {
  brand: 'LG' | 'FB';
  finishTypes: string[];
  accentColor: string;
  onVariantChange: (variant: MetricSelectedVariant | null) => void;
}

export default function MetricVariantSelector({
  brand,
  finishTypes,
  accentColor,
  onVariantChange,
}: MetricVariantSelectorProps) {
  const [selectedFinish, setSelectedFinish] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ContainerSize | null>(null);

  const finish = finishTypes[selectedFinish];
  const sizes = finish ? getAvailableMetricSizes(finish, brand) : [];

  // Reset size when finish changes
  useEffect(() => {
    setSelectedSize(null);
  }, [selectedFinish]);

  // Notify parent of variant selection
  useEffect(() => {
    if (finish && selectedSize) {
      onVariantChange({
        finishType: finish,
        size: selectedSize,
        unitPriceEur: getPriceForSize(selectedSize, undefined, brand),
      });
    } else {
      onVariantChange(null);
    }
  }, [selectedFinish, selectedSize, finish, brand, onVariantChange]);

  return (
    <div className="space-y-3">
      {/* Finish selector */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Finish</label>
        <div className="flex flex-wrap gap-1.5">
          {finishTypes.map((f, i) => (
            <button
              key={f}
              onClick={() => setSelectedFinish(i)}
              className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                selectedFinish === i
                  ? 'text-white font-medium'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
              style={selectedFinish === i ? { backgroundColor: accentColor } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Size</label>
        <div className={`grid gap-2 ${sizes.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {sizes.map((size) => {
            const price = getPriceForSize(size, undefined, brand);
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-2 px-1 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'text-white ring-2 ring-offset-1'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
                style={isSelected ? { backgroundColor: accentColor, '--tw-ring-color': accentColor } as React.CSSProperties : undefined}
              >
                <div className="text-xs font-medium">{METRIC_SIZE_DISPLAY[size] || size}</div>
                <div className="text-[10px] opacity-70 mt-0.5">&euro;{price.toFixed(2)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
