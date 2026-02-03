'use client';

import { useState, useEffect } from 'react';
import { getAvailableSizes, getPriceForSize, SIZE_DISPLAY } from '@/lib/cart/variant-config';
import type { ContainerSize } from '@/lib/cart/variant-config';
import type { SelectedVariant } from '@/lib/cart/types';

interface ProductLine {
  name: string;
  sheens: { label: string; productNumber: string }[];
}

interface VariantSelectorProps {
  productLines: ProductLine[];
  onVariantChange: (variant: SelectedVariant | null) => void;
}

export default function VariantSelector({ productLines, onVariantChange }: VariantSelectorProps) {
  const [selectedLine, setSelectedLine] = useState(0);
  const [selectedSheen, setSelectedSheen] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ContainerSize | null>(null);

  const line = productLines[selectedLine];
  const sheen = line?.sheens[selectedSheen] || line?.sheens[0];
  const sizes = line ? getAvailableSizes(line.name) : [];

  // Reset sheen and size when product line changes
  useEffect(() => {
    setSelectedSheen(0);
    setSelectedSize(null);
  }, [selectedLine]);

  // Reset size when sheen changes
  useEffect(() => {
    setSelectedSize(null);
  }, [selectedSheen]);

  // Notify parent of variant selection
  useEffect(() => {
    if (line && sheen && selectedSize) {
      onVariantChange({
        productLine: line.name,
        productNumber: sheen.productNumber,
        sheen: sheen.label,
        size: selectedSize,
        unitPriceEur: getPriceForSize(selectedSize, line.name),
      });
    } else {
      onVariantChange(null);
    }
  }, [selectedLine, selectedSheen, selectedSize, line, sheen, onVariantChange]);

  return (
    <div className="space-y-3">
      {/* Product Line */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Product Line</label>
        <select
          value={selectedLine}
          onChange={(e) => setSelectedLine(Number(e.target.value))}
          className="w-full bg-secondary border border-border text-foreground text-sm rounded-lg p-2"
        >
          {productLines.map((pl, i) => (
            <option key={pl.name} value={i}>{pl.name}</option>
          ))}
        </select>
      </div>

      {/* Sheen */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Finish</label>
        <div className="flex flex-wrap gap-1.5">
          {line?.sheens.map((s, i) => (
            <button
              key={s.productNumber}
              onClick={() => setSelectedSheen(i)}
              className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                selectedSheen === i
                  ? 'bg-[#2C2C2C] text-white font-medium'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Size</label>
        <div className={`grid gap-2 ${sizes.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {sizes.map((size) => {
            const price = getPriceForSize(size, line?.name);
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-2 px-1 rounded-lg text-center transition-all ${
                  selectedSize === size
                    ? 'bg-[#C9A86C] text-[#2C2C2C] ring-2 ring-[#C9A86C] ring-offset-1'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <div className="text-xs font-medium">{SIZE_DISPLAY[size]}</div>
                <div className="text-[10px] opacity-70 mt-0.5">€{price.toFixed(2)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
