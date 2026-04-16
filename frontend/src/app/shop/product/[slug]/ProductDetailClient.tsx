'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product, FinishSheenInfo, ContainerSizeInfo, ProductLine, ContainerSize } from '@/types/store';
import ProductConfigurator from './ProductConfigurator';
import PaintCalculator from './PaintCalculator';
import type { ColorItem } from '@/components/shop/ColorPickerModal';

interface ProductDetailClientProps {
  product: Product;
  productLine: ProductLine | undefined;
  availableFinishInfo: FinishSheenInfo[];
  availableSizeInfo: ContainerSizeInfo[];
}

/**
 * Check if an image URL is valid (external http/https URL)
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export default function ProductDetailClient({
  product,
  productLine,
  availableFinishInfo,
  availableSizeInfo,
}: ProductDetailClientProps) {
  // Lift color state here so it can affect the image background
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);

  // Lift size and quantity state so calculator can influence configurator
  const [selectedSize, setSelectedSize] = useState<ContainerSize>(product.availableSizes[0]);
  const [quantity, setQuantity] = useState(1);

  // Handle calculator recommendation
  const handleCalculatorRecommendation = (size: ContainerSize, recommendedQuantity: number) => {
    setSelectedSize(size);
    setQuantity(recommendedQuantity);
  };

  // Calculate a lighter tint of the selected color for the background
  const getBackgroundStyle = () => {
    if (!selectedColor?.hex) return {};

    // Use the selected color with transparency for a subtle background
    return {
      backgroundColor: selectedColor.hex,
    };
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Product Image */}
      <div className="space-y-4">
        <div
          className="relative aspect-square rounded-2xl border border-[#E8E2D9] overflow-hidden transition-colors duration-500"
          style={selectedColor ? getBackgroundStyle() : {}}
        >
          {/* Background gradient when no color selected */}
          {!selectedColor && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F1EB]" />
          )}

          {/* Subtle pattern overlay - only shown when no color selected */}
          {!selectedColor && (
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A86C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          )}

          {isValidImageUrl(product.imageUrl) ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* Image container with shadow and frame - LARGER SIZE */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Soft shadow behind image */}
                <div className={`absolute inset-0 rounded-xl blur-xl transform scale-90 ${
                  selectedColor
                    ? 'bg-black/20'
                    : 'bg-gradient-to-br from-[#C9A86C]/5 to-[#2C2C2C]/10'
                }`} />

                {/* Image wrapper */}
                <div className={`relative rounded-lg p-5 shadow-xl ring-1 ${
                  selectedColor
                    ? 'bg-white/95 ring-white/50'
                    : 'bg-white ring-[#E8E2D9]'
                }`}>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={220}
                    height={215}
                    className="object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                    priority
                    unoptimized={product.imageUrl.includes('benjaminmoore.com')}
                  />
                </div>
              </div>

              {/* Brand watermark */}
              <div className={`absolute bottom-4 right-4 text-xs font-medium tracking-wider ${
                selectedColor ? 'text-white/60' : 'text-[#C9A86C]/40'
              }`}>
                {product.brand === 'BM' ? 'BENJAMIN MOORE' : product.brand === 'FB' ? 'FARROW & BALL' : 'LITTLE GREENE'}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {/* Paint Can SVG Placeholder - LARGER */}
                <div className="w-40 h-52 mx-auto mb-4 relative">
                  <svg
                    viewBox="0 0 80 100"
                    className="w-full h-full drop-shadow-lg"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Can body */}
                    <rect x="10" y="25" width="60" height="70" rx="4" fill="#E8E2D9" stroke="#C9A86C" strokeWidth="2" />
                    {/* Can lid */}
                    <rect x="5" y="15" width="70" height="15" rx="3" fill="#F5F3F0" stroke="#C9A86C" strokeWidth="2" />
                    {/* Handle */}
                    <path d="M25 15 Q40 0 55 15" stroke="#C9A86C" strokeWidth="3" fill="none" strokeLinecap="round" />
                    {/* Label area */}
                    <rect x="18" y="40" width="44" height="40" rx="2" fill="white" stroke="#E8E2D9" strokeWidth="1" />
                    {/* Brand indicator */}
                    <text x="40" y="58" textAnchor="middle" fontSize="8" fill="#C9A86C" fontWeight="bold">
                      {product.brand}
                    </text>
                    <text x="40" y="72" textAnchor="middle" fontSize="6" fill="#2C2C2C" opacity="0.5">
                      PAINT
                    </text>
                  </svg>
                </div>
                <span className={`text-sm font-medium ${selectedColor ? 'text-white/80' : 'text-[#2C2C2C]/40'}`}>
                  {product.brand === 'BM' ? 'Benjamin Moore' : product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
                </span>
                <p className={`text-xs mt-1 ${selectedColor ? 'text-white/60' : 'text-[#2C2C2C]/30'}`}>
                  Product image coming soon
                </p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {productLine && (
              <span className={`text-xs px-3 py-1 rounded-full ${
                productLine.tier === 'Premium' ? 'bg-[#C9A86C] text-white' :
                productLine.tier === 'Professional' ? 'bg-[#2C2C2C] text-white' :
                'bg-[#4A5240] text-white'
              }`}>
                {productLine.tier}
              </span>
            )}
            {product.inStock && (
              <span className="text-xs px-3 py-1 bg-[#4A5240] text-white rounded-full">
                In Stock
              </span>
            )}
          </div>

          {/* Selected color indicator */}
          {selectedColor && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div
                className="w-6 h-6 rounded-full ring-2 ring-white shadow-inner"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div className="text-xs">
                <p className="font-medium text-[#2C2C2C]">{selectedColor.name}</p>
                <p className="text-[#2C2C2C]/50">{selectedColor.code}</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Features */}
        {productLine && productLine.features.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
            <h3 className="font-medium text-[#2C2C2C] mb-4">Key Features</h3>
            <ul className="space-y-2">
              {productLine.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-[#2C2C2C]/70">
                  <svg className="w-4 h-4 text-[#C9A86C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Finish Guide - Moved here under Key Features */}
        <div className="bg-[#F5F3F0] rounded-xl p-6">
          <h3 className="font-medium text-[#2C2C2C] mb-4">Finish Guide</h3>
          <div className="space-y-3">
            {availableFinishInfo.map((finish) => (
              <div key={finish.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2C2C2C]">{finish.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    finish.durability === 'High' ? 'bg-[#4A5240]/10 text-[#4A5240]' :
                    finish.durability === 'Medium' ? 'bg-[#C9A86C]/10 text-[#C9A86C]' :
                    'bg-[#2C2C2C]/10 text-[#2C2C2C]'
                  }`}>
                    {finish.durability} Durability
                  </span>
                </div>
                <p className="text-[#2C2C2C]/60 mt-1">{finish.description}</p>
                <p className="text-xs text-[#2C2C2C]/40 mt-1">
                  Best for: {finish.bestFor.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Info & Configurator */}
      <div className="space-y-6">
        {/* Brand & Product Line */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#2C2C2C]/50">
            {product.brand === 'BM' ? 'Benjamin Moore' : product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
          </span>
          {productLine && (
            <>
              <span className="text-[#2C2C2C]/20">•</span>
              <span className="text-sm text-[#C9A86C]">{productLine.name}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-[#2C2C2C]">
          {product.name}
        </h1>

        {/* Description */}
        <p className="text-[#2C2C2C]/70 leading-relaxed">
          {product.description}
        </p>

        {/* Coverage Info */}
        <div className="flex items-center gap-6 py-4 border-y border-[#E8E2D9]">
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wide">Coverage</p>
            <p className="text-lg font-medium text-[#2C2C2C]">
              {product.coverageRateM2PerL} m²/L
            </p>
          </div>
          <div className="h-8 w-px bg-[#E8E2D9]" />
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wide">Sizes</p>
            <p className="text-lg font-medium text-[#2C2C2C]">
              {product.availableSizes.length} options
            </p>
          </div>
          <div className="h-8 w-px bg-[#E8E2D9]" />
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wide">Finishes</p>
            <p className="text-lg font-medium text-[#2C2C2C]">
              {product.availableFinishes.length} sheens
            </p>
          </div>
        </div>

        {/* Paint Calculator */}
        <PaintCalculator
          coverageRateM2PerL={product.coverageRateM2PerL}
          productName={product.name}
          availableSizes={product.availableSizes}
          onRecommendQuantity={handleCalculatorRecommendation}
        />

        {/* Product Configurator - now receives color and size state handlers */}
        <ProductConfigurator
          product={product}
          availableFinishInfo={availableFinishInfo}
          availableSizeInfo={availableSizeInfo}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>
    </div>
  );
}
