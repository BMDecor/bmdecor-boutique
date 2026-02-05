/**
 * BM Decoración - Universal Color Database (Static Mock Data)
 *
 * This file provides the color palette for the "Color Dreamer" universal search.
 * Colors from all three brand houses are normalized into a single searchable database.
 */

import type { Color, ColorFamily, BrandId } from '@/types/store';

// =============================================================================
// UNIVERSAL COLOR DATABASE
// =============================================================================

export const COLOR_DATABASE: Color[] = [
  // ---------------------------------------------------------------------------
  // BENJAMIN MOORE COLORS
  // ---------------------------------------------------------------------------
  {
    id: 'bm-hale-navy',
    code: 'HC-154',
    name: 'Hale Navy',
    hex: '#2C3E50',
    brand: 'BM',
    brandId: 'benjamin-moore',
    family: 'blue',
    collection: 'Historical Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 4.59,
    undertone: 'Rich blue with slight purple undertone',
  },
  {
    id: 'bm-white-dove',
    code: 'OC-17',
    name: 'White Dove',
    hex: '#F3EFE7',
    brand: 'BM',
    brandId: 'benjamin-moore',
    family: 'white',
    collection: 'Off-White Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 85.38,
    undertone: 'Warm white with subtle yellow undertone',
  },
  {
    id: 'bm-revere-pewter',
    code: 'HC-172',
    name: 'Revere Pewter',
    hex: '#B5A99A',
    brand: 'BM',
    brandId: 'benjamin-moore',
    family: 'neutral',
    collection: 'Historical Collection',
    usage: ['Interior'],
    lrv: 55.51,
    undertone: 'Warm greige with green undertone',
  },
  {
    id: 'bm-chantilly-lace',
    code: 'OC-65',
    name: 'Chantilly Lace',
    hex: '#F9F7F3',
    brand: 'BM',
    brandId: 'benjamin-moore',
    family: 'white',
    collection: 'Off-White Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 92.2,
    undertone: 'Crisp, clean white with no undertone',
  },
  {
    id: 'bm-aegean-teal',
    code: '2136-40',
    name: 'Aegean Teal',
    hex: '#5D8A8E',
    brand: 'BM',
    brandId: 'benjamin-moore',
    family: 'blue',
    collection: 'Color of the Year 2021',
    usage: ['Interior', 'Exterior'],
    lrv: 23.96,
    undertone: 'Blue-green with grey undertone',
  },
  {
    id: 'bm-wrought-iron',
    code: '2124-10',
    name: 'Wrought Iron',
    hex: '#3D3D3D',
    brand: 'BM',
    brandId: 'benjamin-moore',
    family: 'dark',
    collection: 'Classic Colors',
    usage: ['Interior', 'Exterior'],
    lrv: 6.16,
    undertone: 'Deep charcoal with slight blue undertone',
  },

  // ---------------------------------------------------------------------------
  // FARROW & BALL COLORS
  // ---------------------------------------------------------------------------
  {
    id: 'fb-hague-blue',
    code: 'No.30',
    name: 'Hague Blue',
    hex: '#2C4251',
    brand: 'FB',
    brandId: 'farrow-ball',
    family: 'blue',
    collection: 'Traditional Neutrals',
    usage: ['Interior', 'Exterior'],
    lrv: 5,
    undertone: 'Deep blue with teal undertone',
  },
  {
    id: 'fb-elephants-breath',
    code: 'No.229',
    name: 'Elephant\'s Breath',
    hex: '#B3A99B',
    brand: 'FB',
    brandId: 'farrow-ball',
    family: 'neutral',
    collection: 'Neutral Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 40,
    undertone: 'Warm grey with pink and mauve undertones',
  },
  {
    id: 'fb-skimming-stone',
    code: 'No.241',
    name: 'Skimming Stone',
    hex: '#D4CCBD',
    brand: 'FB',
    brandId: 'farrow-ball',
    family: 'neutral',
    collection: 'Neutral Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 64,
    undertone: 'Warm stone grey',
  },
  {
    id: 'fb-stiffkey-blue',
    code: 'No.281',
    name: 'Stiffkey Blue',
    hex: '#3C4D59',
    brand: 'FB',
    brandId: 'farrow-ball',
    family: 'blue',
    collection: 'Blue & Green Group',
    usage: ['Interior', 'Exterior'],
    lrv: 8,
    undertone: 'Inky blue inspired by Stiffkey beach mud',
  },
  {
    id: 'fb-railings',
    code: 'No.31',
    name: 'Railings',
    hex: '#2B2B2B',
    brand: 'FB',
    brandId: 'farrow-ball',
    family: 'dark',
    collection: 'Traditional Neutrals',
    usage: ['Interior', 'Exterior'],
    lrv: 3,
    undertone: 'Blue-black soft black',
  },

  // ---------------------------------------------------------------------------
  // LITTLE GREENE COLORS
  // ---------------------------------------------------------------------------
  {
    id: 'lg-hicks-blue',
    code: '208',
    name: 'Hicks\' Blue',
    hex: '#4A6670',
    brand: 'LG',
    brandId: 'little-greene',
    family: 'blue',
    collection: 'Archive Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 15,
    undertone: 'Mid-blue with grey undertone',
  },
  {
    id: 'lg-french-grey',
    code: '113',
    name: 'French Grey',
    hex: '#9A9A8E',
    brand: 'LG',
    brandId: 'little-greene',
    family: 'grey',
    collection: 'Grey Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 34,
    undertone: 'Classic grey with green undertone',
  },
  {
    id: 'lg-slaked-lime',
    code: '105',
    name: 'Slaked Lime',
    hex: '#E8E2D4',
    brand: 'LG',
    brandId: 'little-greene',
    family: 'white',
    collection: 'White Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 78,
    undertone: 'Warm white with yellow undertone',
  },
  {
    id: 'lg-invisible-green',
    code: '56',
    name: 'Invisible Green',
    hex: '#2F3B31',
    brand: 'LG',
    brandId: 'little-greene',
    family: 'green',
    collection: 'Green Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 5,
    undertone: 'Dark green with black undertone',
  },
  {
    id: 'lg-portland-stone',
    code: '77',
    name: 'Portland Stone',
    hex: '#C9C2B3',
    brand: 'LG',
    brandId: 'little-greene',
    family: 'neutral',
    collection: 'Stone Collection',
    usage: ['Interior', 'Exterior'],
    lrv: 52,
    undertone: 'Warm stone with pink undertone',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all colors
 */
export function getAllColors(): Color[] {
  return COLOR_DATABASE;
}

/**
 * Get color by ID
 */
export function getColorById(id: string): Color | undefined {
  return COLOR_DATABASE.find((c) => c.id === id);
}

/**
 * Get color by code (brand-specific)
 */
export function getColorByCode(code: string): Color | undefined {
  const normalizedCode = code.toUpperCase().trim();
  return COLOR_DATABASE.find(
    (c) => c.code.toUpperCase() === normalizedCode
  );
}

/**
 * Get colors by brand ID
 */
export function getColorsByBrandId(brandId: BrandId): Color[] {
  return COLOR_DATABASE.filter((c) => c.brandId === brandId);
}

/**
 * Get colors by family (for Color Dreamer archetype)
 */
export function getColorsByFamily(family: ColorFamily): Color[] {
  return COLOR_DATABASE.filter((c) => c.family === family);
}

/**
 * Get colors by LRV range
 */
export function getColorsByLrvRange(min: number, max: number): Color[] {
  return COLOR_DATABASE.filter((c) => {
    if (!c.lrv) return false;
    return c.lrv >= min && c.lrv <= max;
  });
}

/**
 * Search colors by query (searches name, code, collection)
 */
export function searchColors(query: string): Color[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return COLOR_DATABASE.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(normalizedQuery);
    const codeMatch = c.code.toLowerCase().includes(normalizedQuery);
    const collectionMatch = c.collection?.toLowerCase().includes(normalizedQuery);
    const undertoneMatch = c.undertone?.toLowerCase().includes(normalizedQuery);
    const familyMatch = c.family.toLowerCase().includes(normalizedQuery);
    return nameMatch || codeMatch || collectionMatch || undertoneMatch || familyMatch;
  });
}

/**
 * Get all unique color families
 */
export function getColorFamilies(): ColorFamily[] {
  const families = new Set(COLOR_DATABASE.map((c) => c.family));
  return Array.from(families);
}

/**
 * Get color count by brand
 */
export function getColorCountByBrand(): Record<BrandId, number> {
  return COLOR_DATABASE.reduce((acc, color) => {
    acc[color.brandId] = (acc[color.brandId] || 0) + 1;
    return acc;
  }, {} as Record<BrandId, number>);
}
