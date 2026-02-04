'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CartBadge from '@/components/cart/CartBadge';
import MetricVariantSelector from '@/components/cart/MetricVariantSelector';
import type { MetricSelectedVariant } from '@/components/cart/MetricVariantSelector';
import AddToBagButton from '@/components/cart/AddToBagButton';
import StickySubtotalBar from '@/components/cart/StickySubtotalBar';

interface ColorProduct {
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

interface Props {
  product: ColorProduct;
  brandName: string;
  brandSlug: string;
  accentColor: string;
  bgColor: string;
  finishTypes: string[];
}

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

export default function StandardColorView({
  product,
  brandName,
  brandSlug,
  accentColor,
  bgColor,
  finishTypes,
}: Props) {
  const [metricVariant, setMetricVariant] = useState<MetricSelectedVariant | null>(null);

  const lrv = calculateLRV(product.hexCode);
  const rgb = hexToRGB(product.hexCode);
  const textColor = getTextColor(product.hexCode);

  const selectedVariant = metricVariant
    ? {
        productLine: metricVariant.finishType,
        productNumber: `${product.brand}-${product.colorCode}`,
        sheen: metricVariant.finishType,
        size: metricVariant.size,
        unitPriceEur: metricVariant.unitPriceEur,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="text-white sticky top-0 z-40" style={{ backgroundColor: bgColor }}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/${brandSlug}`}
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to {brandName}
            </Link>
            <div className="flex items-center gap-3">
              <Badge style={{ backgroundColor: `${accentColor}30`, color: accentColor }}>
                Official Catalogue
              </Badge>
              <CartBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Large Color Swatch */}
          <div className="lg:w-1/2">
            <div
              className="aspect-square w-full rounded-2xl shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: product.hexCode }}
            >
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${textColor}20`, color: textColor }}
              >
                LRV {lrv}
              </div>
              <div
                className="absolute bottom-4 left-4 font-mono text-lg font-semibold"
                style={{ color: textColor }}
              >
                {product.colorCode}
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-[#2C2C2C]">
                {product.name}
              </h1>
              <p className="text-lg text-[#2C2C2C]/60 mt-2">
                {product.colorCode} · {product.collection}
              </p>
            </div>

            {product.description && (
              <p className="text-[#2C2C2C]/70 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold" style={{ color: bgColor }}>
                €{product.priceEur.toFixed(2)}
              </span>
              <Badge variant="outline" className="text-sm">
                {product.finishType}
              </Badge>
              <Badge variant={product.inStock ? 'default' : 'secondary'} className="text-sm">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <Separator />

            {/* Technical Specs */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Hex Code</div>
                  <div className="font-mono font-semibold">{product.hexCode}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">RGB</div>
                  <div className="font-mono font-semibold">
                    {rgb.r}, {rgb.g}, {rgb.b}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">LRV</div>
                  <div className="font-semibold">{lrv}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Volume</div>
                  <div className="font-semibold">{product.volume}</div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Variant Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Select Finish & Size</h3>
              <MetricVariantSelector
                brand={product.brand as 'FB' | 'LG'}
                finishTypes={finishTypes}
                accentColor={bgColor}
                onVariantChange={setMetricVariant}
              />

              <div className="mt-6">
                <AddToBagButton
                  item={
                    metricVariant
                      ? {
                          colorNumber: product.colorCode,
                          colorName: product.name,
                          hexCode: product.hexCode,
                          productLine: metricVariant.finishType,
                          productNumber: `${product.brand}-${product.colorCode}`,
                          sheen: metricVariant.finishType,
                          size: metricVariant.size,
                          brand: product.brand as 'FB' | 'LG',
                        }
                      : null
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Subtotal */}
      <StickySubtotalBar variant={selectedVariant} />

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] bg-white mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>{brandName}&reg; Official Catalogue · BM Decoraci&oacute;n, Marbella</span>
            <span>IVA Incluido (21%) · Prices in EUR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
