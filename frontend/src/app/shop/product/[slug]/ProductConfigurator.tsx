'use client';

import { useState, useMemo } from 'react';
import type { Product, FinishSheenInfo, ContainerSizeInfo, FinishSheen, ContainerSize } from '@/types/store';
import { calculatePrice } from '@/lib/inventory';

interface ProductConfiguratorProps {
  product: Product;
  availableFinishInfo: FinishSheenInfo[];
  availableSizeInfo: ContainerSizeInfo[];
}

// Mock color validation - in production this would query the color database
const SAMPLE_COLORS: Record<string, { name: string; hex: string }> = {
  'HC-154': { name: 'Hale Navy', hex: '#2C3E50' },
  'HC-172': { name: 'Revere Pewter', hex: '#B5A99A' },
  'OC-17': { name: 'White Dove', hex: '#F3EFE7' },
  'CC-40': { name: 'Cloud White', hex: '#F5F2ED' },
  '2163-10': { name: 'Chantilly Lace', hex: '#F9F7F3' },
  '2125-10': { name: 'Wrought Iron', hex: '#3D3D3D' },
  'AF-685': { name: 'Thunder', hex: '#4A4A4A' },
  '1479': { name: 'Sea Salt', hex: '#D8E0D8' },
};

export default function ProductConfigurator({
  product,
  availableFinishInfo,
  availableSizeInfo,
}: ProductConfiguratorProps) {
  // State for configuration
  const [selectedFinish, setSelectedFinish] = useState<FinishSheen>(
    product.availableFinishes[0]
  );
  const [selectedSize, setSelectedSize] = useState<ContainerSize>(
    product.availableSizes[0]
  );
  const [colorCode, setColorCode] = useState('');
  const [colorError, setColorError] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Calculate price based on selections
  const price = useMemo(() => {
    return calculatePrice(product.basePrice, selectedSize, selectedFinish);
  }, [product.basePrice, selectedSize, selectedFinish]);

  // Validate color code
  const validatedColor = useMemo(() => {
    if (!colorCode) return null;
    const normalizedCode = colorCode.toUpperCase().trim();
    return SAMPLE_COLORS[normalizedCode] || null;
  }, [colorCode]);

  // Handle color input change
  const handleColorChange = (value: string) => {
    setColorCode(value);
    setColorError('');

    // Only show error if user has typed something substantial
    if (value.length >= 3 && !SAMPLE_COLORS[value.toUpperCase().trim()]) {
      // Don't show error while typing, only validate on blur or submit
    }
  };

  // Handle color validation on blur
  const handleColorBlur = () => {
    if (colorCode && !validatedColor) {
      setColorError('Color code not found. Try HC-154, OC-17, or 2163-10.');
    }
  };

  // Get size info for display
  const sizeInfo = availableSizeInfo.find((s) => s.id === selectedSize);

  // Total price
  const totalPrice = price * quantity;

  return (
    <div className="space-y-6">
      {/* Sheen Selection */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
          Select Finish
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {product.availableFinishes.map((finish) => {
            const info = availableFinishInfo.find((f) => f.id === finish);
            return (
              <button
                key={finish}
                onClick={() => setSelectedFinish(finish)}
                className={`px-4 py-3 text-sm rounded-lg border transition-all text-left ${
                  selectedFinish === finish
                    ? 'border-[#C9A86C] bg-[#C9A86C]/5 text-[#2C2C2C]'
                    : 'border-[#E8E2D9] bg-white text-[#2C2C2C]/70 hover:border-[#C9A86C]/50'
                }`}
              >
                <span className="block font-medium">{info?.name || finish}</span>
                <span className="block text-xs text-[#2C2C2C]/50 mt-0.5">
                  {info?.durability} durability
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
          Select Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {product.availableSizes.map((size) => {
            const info = availableSizeInfo.find((s) => s.id === size);
            const sizePrice = calculatePrice(product.basePrice, size, selectedFinish);
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-3 text-sm rounded-lg border transition-all text-left ${
                  selectedSize === size
                    ? 'border-[#C9A86C] bg-[#C9A86C]/5 text-[#2C2C2C]'
                    : 'border-[#E8E2D9] bg-white text-[#2C2C2C]/70 hover:border-[#C9A86C]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-medium">{info?.name || size}</span>
                    <span className="block text-xs text-[#2C2C2C]/50">
                      {info?.metric} · ~{info?.coverageM2}m²
                    </span>
                  </div>
                  <span className="font-medium">€{sizePrice.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tint Engine / Color Selection */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
          Choose Your Color
        </label>

        {product.isTintable ? (
          <div className="space-y-3">
            {/* Color Input */}
            <div className="relative">
              <input
                type="text"
                value={colorCode}
                onChange={(e) => handleColorChange(e.target.value)}
                onBlur={handleColorBlur}
                placeholder="Enter color code (e.g., HC-154)"
                className={`w-full px-4 py-3 pr-24 text-sm rounded-lg border transition-colors ${
                  colorError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : validatedColor
                    ? 'border-[#4A5240] focus:border-[#4A5240] focus:ring-[#4A5240]/10'
                    : 'border-[#E8E2D9] focus:border-[#C9A86C] focus:ring-[#C9A86C]/10'
                } focus:ring-2 focus:outline-none`}
              />
              {validatedColor && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: validatedColor.hex }}
                  />
                  <svg className="w-5 h-5 text-[#4A5240]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Color Preview */}
            {validatedColor && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#4A5240]/20">
                <div
                  className="w-12 h-12 rounded-lg shadow-inner"
                  style={{ backgroundColor: validatedColor.hex }}
                />
                <div>
                  <p className="font-medium text-[#2C2C2C]">{validatedColor.name}</p>
                  <p className="text-xs text-[#2C2C2C]/50">{colorCode.toUpperCase()}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {colorError && (
              <p className="text-sm text-red-500">{colorError}</p>
            )}

            {/* Color Suggestions */}
            {!validatedColor && !colorError && (
              <div className="pt-2">
                <p className="text-xs text-[#2C2C2C]/50 mb-2">Popular colors:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SAMPLE_COLORS).slice(0, 4).map(([code, color]) => (
                    <button
                      key={code}
                      onClick={() => setColorCode(code)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E2D9] rounded-full text-xs hover:border-[#C9A86C] transition-colors"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[#2C2C2C]/70">{code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Link to Color Search */}
            <p className="text-xs text-[#2C2C2C]/50">
              Don&apos;t know your color code?{' '}
              <a href="/search" className="text-[#C9A86C] hover:underline">
                Browse our color collection
              </a>
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[#F5F3F0] rounded-lg border border-[#E8E2D9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg border border-[#E8E2D9] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#2C2C2C]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#2C2C2C]">No Color Required</p>
                <p className="text-xs text-[#2C2C2C]/50">
                  This product is a primer and doesn&apos;t require tinting.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
          Quantity
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-[#E8E2D9] rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 text-[#2C2C2C]/60 hover:bg-[#FAF8F5] transition-colors"
            >
              −
            </button>
            <span className="px-6 py-2 text-[#2C2C2C] font-medium border-x border-[#E8E2D9] bg-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 text-[#2C2C2C]/60 hover:bg-[#FAF8F5] transition-colors"
            >
              +
            </button>
          </div>
          {sizeInfo && (
            <p className="text-sm text-[#2C2C2C]/50">
              Coverage: ~{(sizeInfo.coverageM2 * quantity).toFixed(0)}m²
            </p>
          )}
        </div>
      </div>

      {/* Price & Add to Cart */}
      <div className="pt-6 border-t border-[#E8E2D9]">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-sm text-[#2C2C2C]/50">Total Price</p>
            <p className="text-3xl font-semibold text-[#2C2C2C]">
              €{totalPrice.toFixed(2)}
            </p>
            <p className="text-xs text-[#2C2C2C]/40">IVA incluido</p>
          </div>

          {/* Configuration Summary */}
          <div className="text-right text-sm text-[#2C2C2C]/60">
            <p>{availableFinishInfo.find((f) => f.id === selectedFinish)?.name}</p>
            <p>{sizeInfo?.name} × {quantity}</p>
            {validatedColor && <p className="text-[#C9A86C]">{validatedColor.name}</p>}
          </div>
        </div>

        <button
          disabled={product.isTintable && !validatedColor}
          className={`w-full py-4 rounded-xl font-medium transition-colors ${
            product.isTintable && !validatedColor
              ? 'bg-[#E8E2D9] text-[#2C2C2C]/40 cursor-not-allowed'
              : 'bg-[#2C2C2C] text-white hover:bg-[#C9A86C]'
          }`}
        >
          {product.isTintable && !validatedColor
            ? 'Select a Color to Continue'
            : 'Add to Boutique Bag'
          }
        </button>

        {/* Pickup Notice */}
        <p className="text-xs text-center text-[#2C2C2C]/50 mt-4">
          Free in-store pickup at Calle Dublín 21, Marbella
        </p>
      </div>
    </div>
  );
}
