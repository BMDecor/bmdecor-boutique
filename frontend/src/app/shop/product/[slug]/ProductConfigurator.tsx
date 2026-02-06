'use client';

import { useState, useMemo } from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import type { Product, FinishSheenInfo, ContainerSizeInfo, FinishSheen, ContainerSize } from '@/types/store';
import { calculatePrice } from '@/lib/inventory';
import ColorPickerModal, { type ColorItem } from '@/components/shop/ColorPickerModal';

interface ProductConfiguratorProps {
  product: Product;
  availableFinishInfo: FinishSheenInfo[];
  availableSizeInfo: ContainerSizeInfo[];
}

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
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Calculate price based on selections
  const price = useMemo(() => {
    return calculatePrice(product.basePrice, selectedSize, selectedFinish);
  }, [product.basePrice, selectedSize, selectedFinish]);

  // Get size info for display
  const sizeInfo = availableSizeInfo.find((s) => s.id === selectedSize);

  // Total price
  const totalPrice = price * quantity;

  // Handle color selection from modal
  const handleColorSelect = (color: ColorItem) => {
    setSelectedColor(color);
  };

  // Clear selected color
  const handleClearColor = () => {
    setSelectedColor(null);
  };

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

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
          Choose Your Color
        </label>

        {product.isTintable ? (
          <div className="space-y-3">
            {selectedColor ? (
              /* State 2: Color Selected */
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9]">
                {/* Color Swatch */}
                <div
                  className="w-16 h-16 rounded-lg shadow-inner shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />

                {/* Color Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2C2C2C] truncate">
                    {selectedColor.name}
                  </p>
                  <p className="text-sm text-[#2C2C2C]/50">{selectedColor.code}</p>
                  {selectedColor.collection && (
                    <p className="text-xs text-[#C9A86C] mt-1">{selectedColor.collection}</p>
                  )}
                </div>

                {/* Change Button */}
                <button
                  onClick={() => setColorPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2C2C2C]/60 hover:text-[#C9A86C] border border-[#E8E2D9] rounded-lg hover:border-[#C9A86C]/50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change
                </button>
              </div>
            ) : (
              /* State 1: No Color Selected */
              <button
                onClick={() => setColorPickerOpen(true)}
                className="w-full flex items-center justify-center gap-3 p-6 bg-[#FAF8F5] border-2 border-dashed border-[#E8E2D9] rounded-xl hover:border-[#C9A86C]/50 hover:bg-[#C9A86C]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A86C]/20 to-[#C9A86C]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Palette className="w-6 h-6 text-[#C9A86C]" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-medium text-[#2C2C2C]">
                    Select Color
                  </span>
                  <span className="block text-xs text-[#2C2C2C]/50">
                    Browse our collection of colors
                  </span>
                </div>
              </button>
            )}

            {/* Color Picker Modal */}
            <ColorPickerModal
              isOpen={colorPickerOpen}
              onClose={() => setColorPickerOpen(false)}
              onSelect={handleColorSelect}
              brandId={product.brandId}
              selectedColorCode={selectedColor?.code}
            />
          </div>
        ) : (
          /* Non-tintable product (Primer) */
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
            {selectedColor && (
              <p className="text-[#C9A86C]">{selectedColor.name}</p>
            )}
          </div>
        </div>

        <button
          disabled={product.isTintable && !selectedColor}
          className={`w-full py-4 rounded-xl font-medium transition-colors ${
            product.isTintable && !selectedColor
              ? 'bg-[#E8E2D9] text-[#2C2C2C]/40 cursor-not-allowed'
              : 'bg-[#2C2C2C] text-white hover:bg-[#C9A86C]'
          }`}
        >
          {product.isTintable && !selectedColor
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
