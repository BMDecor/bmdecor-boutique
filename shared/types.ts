/**
 * BM Decoracion - Unified Paint Schema
 *
 * All brands (Benjamin Moore, Farrow & Ball, Little Greene) must map to this
 * core interface for the unified product catalog.
 */

/** Brand identifiers for the three paint houses */
export type Brand = 'BM' | 'FB' | 'LG';

/** Paint finish types across all brands */
export type FinishType =
  // Benjamin Moore finishes
  | 'Aura Matte'
  | 'Aura Eggshell'
  | 'Aura Satin'
  | 'Aura Semi-Gloss'
  | 'Regal Select Matte'
  | 'Regal Select Eggshell'
  | 'Regal Select Pearl'
  | 'Regal Select Semi-Gloss'
  // Farrow & Ball finishes
  | 'Estate Emulsion'
  | 'Modern Emulsion'
  | 'Estate Eggshell'
  | 'Modern Eggshell'
  | 'Full Gloss'
  | 'Exterior Eggshell'
  | 'Exterior Masonry'
  // Little Greene finishes
  | 'Absolute Matt Emulsion'
  | 'Intelligent Matt Emulsion'
  | 'Intelligent Eggshell'
  | 'Intelligent Satinwood'
  | 'Intelligent Gloss'
  | 'Masonry Paint';

/** Standard volume sizes available */
export type Volume = '750ml' | '1L' | '2.5L' | '5L' | '10L';

/**
 * Unified Paint Product Interface
 *
 * This is the core data structure that all brand data must normalize to
 * for storage in DynamoDB and display in the frontend.
 */
export interface UnifiedPaintProduct {
  /** Unique product identifier (PK in DynamoDB) */
  id: string;

  /** Brand identifier */
  brand: Brand;

  /** Product/color name */
  name: string;

  /** Brand-specific color code (e.g., "2024-10" for BM, "No.47" for FB) */
  colorCode: string;

  /** Primary hex color code for visual swatch display */
  hexCode: string;

  /** Paint finish type */
  finishType: FinishType;

  /** Price in Euros (IVA incluido - 21% Spanish VAT included) */
  priceEur: number;

  /** Container volume */
  volume: Volume;

  /** Coverage rate in m² per liter (for paint calculator) */
  coverageRate: number;

  /** Optional color family/collection grouping */
  collection?: string;

  /** Optional product description */
  description?: string;

  /** S3 URL for high-resolution swatch image (.avif format) */
  swatchImageUrl?: string;

  /** Whether product is currently in stock */
  inStock: boolean;

  /** ISO 8601 timestamp of last data update */
  updatedAt: string;
}

/**
 * Brand-specific metadata for display and filtering
 */
export interface BrandInfo {
  id: Brand;
  name: string;
  tagline: string;
  logoUrl: string;
  website: string;
}

export const BRAND_INFO: Record<Brand, BrandInfo> = {
  BM: {
    id: 'BM',
    name: 'Benjamin Moore',
    tagline: 'Professional-Grade Technology',
    logoUrl: '/brands/benjamin-moore-logo.svg',
    website: 'https://www.benjaminmoore.com',
  },
  FB: {
    id: 'FB',
    name: 'Farrow & Ball',
    tagline: 'Artisan Heritage',
    logoUrl: '/brands/farrow-ball-logo.svg',
    website: 'https://www.farrow-ball.com',
  },
  LG: {
    id: 'LG',
    name: 'Little Greene',
    tagline: 'Eco-Conscious British Heritage',
    logoUrl: '/brands/little-greene-logo.svg',
    website: 'https://www.littlegreene.com',
  },
};

/**
 * Paint Calculator Input
 */
export interface PaintCalculatorInput {
  /** Surface area to paint in m² */
  areaSqMeters: number;
  /** Number of coats required */
  coats: number;
  /** Product coverage rate (m² per liter) */
  coverageRate: number;
}

/**
 * Paint Calculator Result
 */
export interface PaintCalculatorResult {
  /** Total liters needed */
  litersNeeded: number;
  /** Recommended container size */
  recommendedVolume: Volume;
  /** Number of containers to purchase */
  containersNeeded: number;
}

/**
 * Shipping zone for Costa del Sol / Marbella region
 */
export type ShippingZone = 'marbella' | 'costa-del-sol' | 'andalucia' | 'spain';

/**
 * Order fulfillment method
 */
export type FulfillmentMethod = 'delivery' | 'click-and-collect';

/**
 * Click & Collect location
 */
export const STORE_LOCATION = {
  name: 'BM Decoracion Marbella',
  address: 'Calle Dublín 21',
  city: 'Marbella',
  postalCode: '29660',
  country: 'Spain',
  coordinates: {
    lat: 36.5098,
    lng: -4.8863,
  },
} as const;

/**
 * Spanish VAT rate (IVA)
 */
export const IVA_RATE = 0.21;
