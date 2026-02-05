/**
 * BM Decoración - Shopping Archetype Logic Layer
 *
 * This file exports helper functions that standardize the rules for
 * the 5 Shopping Archetypes:
 *
 * 1. The Problem Solver - "I need paint for my bathroom"
 * 2. The Color Dreamer - "I want something blue"
 * 3. The Brand Loyalist - "Show me Benjamin Moore"
 * 4. The Project Planner - "I'm renovating my kitchen"
 * 5. The Expert Specifier - "I need HC-154 in Aura Matte"
 *
 * These functions provide the data layer for intelligent search and recommendations.
 */

import type { Product, Color, ColorFamily, BrandId } from '@/types/store';
import {
  INITIAL_INVENTORY,
  getProductsByTag,
  getProductsByBrandId as getProductsByBrandIdFromInventory,
  getProductsByCategory,
  getProductsByType,
  searchProducts,
} from './inventory';
import {
  COLOR_DATABASE,
  getColorsByFamily as getColorsByFamilyFromColors,
  getColorsByBrandId as getColorsByBrandIdFromColors,
  getColorByCode,
  searchColors,
  getColorsByLrvRange,
} from './colors';

// =============================================================================
// ARCHETYPE 1: THE PROBLEM SOLVER
// "I need paint for my bathroom" / "What's good for trim?"
// =============================================================================

/**
 * Get products by project/room tag
 * For the Problem Solver who knows WHAT they need to paint
 */
export function getProductsByProject(tag: string): Product[] {
  return getProductsByTag(tag);
}

/**
 * Get products for common project scenarios
 */
export const PROJECT_TAGS = {
  bathroom: ['bath', 'bathroom', 'high-humidity', 'mold-resistant', 'moisture'],
  kitchen: ['kitchen', 'high-humidity', 'mold-resistant', 'cabinets'],
  bedroom: ['bedroom', 'living-room', 'walls', 'interior'],
  exterior: ['exterior', 'facade', 'weather-resistant', 'siding'],
  trim: ['trim', 'doors', 'cabinets', 'woodwork'],
  furniture: ['furniture', 'cabinets', 'self-leveling'],
  highTraffic: ['high-traffic', 'hallway', 'durable'],
} as const;

/**
 * Get recommended products for a specific room type
 */
export function getProductsForRoom(room: keyof typeof PROJECT_TAGS): Product[] {
  const tags = PROJECT_TAGS[room];
  return INITIAL_INVENTORY.filter((p) =>
    p.tags.some((pTag) =>
      tags.some((searchTag) => pTag.toLowerCase().includes(searchTag.toLowerCase()))
    )
  );
}

// =============================================================================
// ARCHETYPE 2: THE COLOR DREAMER
// "I want something blue" / "Show me neutrals"
// =============================================================================

/**
 * Get colors by family
 * For the Dreamer who knows the MOOD they want
 */
export function getColorsByFamily(family: ColorFamily): Color[] {
  return getColorsByFamilyFromColors(family);
}

/**
 * Available color families for browsing
 */
export const COLOR_FAMILIES: ColorFamily[] = [
  'white',
  'neutral',
  'grey',
  'blue',
  'green',
  'dark',
];

/**
 * Get colors by lightness (using LRV)
 * Light colors: LRV > 60
 * Medium colors: LRV 30-60
 * Dark colors: LRV < 30
 */
export function getColorsByLightness(lightness: 'light' | 'medium' | 'dark'): Color[] {
  switch (lightness) {
    case 'light':
      return getColorsByLrvRange(60, 100);
    case 'medium':
      return getColorsByLrvRange(30, 60);
    case 'dark':
      return getColorsByLrvRange(0, 30);
  }
}

/**
 * Get popular/trending colors (curated selection)
 */
export function getTrendingColors(): Color[] {
  const trendingIds = [
    'bm-hale-navy',
    'bm-white-dove',
    'bm-aegean-teal',
    'fb-hague-blue',
    'fb-elephants-breath',
    'lg-french-grey',
  ];
  return COLOR_DATABASE.filter((c) => trendingIds.includes(c.id));
}

// =============================================================================
// ARCHETYPE 3: THE BRAND LOYALIST
// "Show me Benjamin Moore" / "I only use Farrow & Ball"
// =============================================================================

/**
 * Get products by brand ID
 * For the Loyalist who trusts a specific brand
 */
export function getProductsByBrand(brandId: BrandId): Product[] {
  return getProductsByBrandIdFromInventory(brandId);
}

/**
 * Get colors by brand ID
 */
export function getColorsByBrand(brandId: BrandId): Color[] {
  return getColorsByBrandIdFromColors(brandId);
}

/**
 * Get complete brand catalog (products + colors)
 */
export function getBrandCatalog(brandId: BrandId): {
  products: Product[];
  colors: Color[];
  productCount: number;
  colorCount: number;
} {
  const products = getProductsByBrand(brandId);
  const colors = getColorsByBrand(brandId);
  return {
    products,
    colors,
    productCount: products.length,
    colorCount: colors.length,
  };
}

/**
 * Brand metadata for display
 */
export const BRAND_INFO: Record<BrandId, {
  name: string;
  shortName: string;
  tagline: string;
  heritage: string;
}> = {
  'benjamin-moore': {
    name: 'Benjamin Moore',
    shortName: 'BM',
    tagline: 'Color Lock® Technology',
    heritage: 'American innovation since 1883',
  },
  'farrow-ball': {
    name: 'Farrow & Ball',
    shortName: 'F&B',
    tagline: 'Richly Pigmented Paint',
    heritage: 'British heritage since 1946',
  },
  'little-greene': {
    name: 'Little Greene',
    shortName: 'LG',
    tagline: 'Eco-Conscious Excellence',
    heritage: 'British craftsmanship since 1773',
  },
};

// =============================================================================
// ARCHETYPE 4: THE PROJECT PLANNER
// "I'm renovating my kitchen" / "Planning a whole-home refresh"
// =============================================================================

/**
 * Get a complete project kit recommendation
 */
export interface ProjectKit {
  name: string;
  description: string;
  products: Product[];
  suggestedColors: Color[];
  tags: string[];
}

/**
 * Get recommended kit for a project type
 */
export function getProjectKit(projectType: string): ProjectKit | null {
  const kits: Record<string, () => ProjectKit> = {
    bathroom: () => ({
      name: 'Bathroom Renovation Kit',
      description: 'Everything you need for a humidity-resistant bathroom finish',
      products: getProductsForRoom('bathroom'),
      suggestedColors: getColorsByFamily('white').slice(0, 3),
      tags: ['bathroom', 'high-humidity', 'mold-resistant'],
    }),
    kitchen: () => ({
      name: 'Kitchen Refresh Kit',
      description: 'Durable finishes for walls and cabinets',
      products: [...getProductsForRoom('kitchen'), ...getProductsByProject('cabinets')].filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
      ),
      suggestedColors: getColorsByFamily('neutral').slice(0, 3),
      tags: ['kitchen', 'cabinets', 'durable'],
    }),
    exterior: () => ({
      name: 'Exterior Paint Kit',
      description: 'Weather-resistant solutions for facades and trim',
      products: [...getProductsByCategory('exterior'), ...getProductsByType('primer')].filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
      ),
      suggestedColors: getColorsByFamily('neutral').concat(getColorsByFamily('white')).slice(0, 4),
      tags: ['exterior', 'weather-resistant', 'primer'],
    }),
    'whole-home': () => ({
      name: 'Whole-Home Refresh',
      description: 'Complete selection for interior walls, trim, and specialty areas',
      products: INITIAL_INVENTORY.filter((p) => p.type === 'paint'),
      suggestedColors: getTrendingColors(),
      tags: ['interior', 'trim', 'walls'],
    }),
  };

  const kitBuilder = kits[projectType.toLowerCase()];
  return kitBuilder ? kitBuilder() : null;
}

// =============================================================================
// ARCHETYPE 5: THE EXPERT SPECIFIER
// "I need HC-154 in Aura Matte" / "OC-17 for trim"
// =============================================================================

/**
 * Get color by exact code (for professionals who know what they want)
 */
export function getExactColor(code: string): Color | undefined {
  return getColorByCode(code);
}

/**
 * Get products compatible with a specific color
 */
export function getProductsForColor(color: Color): Product[] {
  // Filter tintable products that support the color's usage
  return INITIAL_INVENTORY.filter((p) => {
    if (!p.isTintable) return false;

    // Check if product category aligns with color usage
    if (color.usage.includes('All')) return true;
    if (color.usage.includes('Interior') && ['Interior', 'Trim & Door'].includes(p.category)) return true;
    if (color.usage.includes('Exterior') && p.category === 'Exterior') return true;

    return false;
  });
}

/**
 * Build a complete specification from color code and product preferences
 */
export interface Specification {
  color: Color;
  recommendedProducts: Product[];
  brandMatch: boolean;
}

export function buildSpecification(
  colorCode: string,
  preferredBrandId?: BrandId
): Specification | null {
  const color = getExactColor(colorCode);
  if (!color) return null;

  let products = getProductsForColor(color);

  // Prioritize same-brand products
  const brandMatch = preferredBrandId === color.brandId || !preferredBrandId;
  if (preferredBrandId) {
    products = products.filter((p) => p.brandId === preferredBrandId);
  }

  return {
    color,
    recommendedProducts: products,
    brandMatch,
  };
}

// =============================================================================
// UNIVERSAL SEARCH (combines all archetypes)
// =============================================================================

export interface UniversalSearchResult {
  products: Product[];
  colors: Color[];
  projectKits: ProjectKit[];
  query: string;
}

/**
 * Perform intelligent search across all data
 */
export function universalSearch(query: string): UniversalSearchResult {
  const normalizedQuery = query.toLowerCase().trim();

  // Search products and colors
  const products = searchProducts(query);
  const colors = searchColors(query);

  // Check for project kit matches
  const projectKits: ProjectKit[] = [];
  const projectKeywords = ['bathroom', 'kitchen', 'exterior', 'whole-home'];
  for (const keyword of projectKeywords) {
    if (normalizedQuery.includes(keyword)) {
      const kit = getProjectKit(keyword);
      if (kit) projectKits.push(kit);
    }
  }

  return {
    products,
    colors,
    projectKits,
    query,
  };
}
