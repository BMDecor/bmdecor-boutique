/**
 * BM Decoración - Initial Inventory (Static Mock Data)
 *
 * This file serves as the temporary source of truth for product data
 * until the Admin Portal is connected to DynamoDB.
 *
 * Real Benjamin Moore SKUs with accurate industry specifications.
 * Enhanced with shopping archetype tags and brand identifiers.
 */

import type { Product, FinishSheen, ContainerSize, BrandId } from '@/types/store';

// =============================================================================
// PRICE MULTIPLIERS BY SIZE
// =============================================================================

export const SIZE_MULTIPLIERS: Record<ContainerSize, number> = {
  'Sample': 0.15,
  'Quart': 0.35,
  'Gallon': 1.0,
  '5-Gallon': 4.5,
};

// =============================================================================
// PRICE ADJUSTMENT BY SHEEN (some finishes cost more)
// =============================================================================

export const SHEEN_ADJUSTMENTS: Record<FinishSheen, number> = {
  'Matte': 0,
  'Eggshell': 0,
  'Satin': 2,
  'Semi-Gloss': 4,
  'Gloss': 6,
};

// =============================================================================
// INITIAL INVENTORY - Core Benjamin Moore Products
// =============================================================================

export const INITIAL_INVENTORY: Product[] = [
  // ---------------------------------------------------------------------------
  // AURA INTERIOR (Premium Interior)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-aura-interior-524',
    name: 'Aura Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-aura',
    department: 'Paint',
    category: 'Interior',
    type: 'paint',
    tags: ['interior', 'walls', 'premium', 'living-room', 'bedroom', 'zero-voc'],
    basePrice: 79.95,
    availableFinishes: ['Matte', 'Eggshell', 'Satin'],
    availableSizes: ['Sample', 'Quart', 'Gallon'],
    isTintable: true,
    description:
      'Benjamin Moore\'s top-of-the-line interior paint featuring proprietary Color Lock® technology for richer, truer color that stays true over time. Zero VOC formula provides exceptional coverage and durability.',
    imageUrl: '/images/products/aura-interior.jpg',
    coverageRateM2PerL: 10,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },

  // ---------------------------------------------------------------------------
  // REGAL SELECT (Professional Interior)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-regal-select-547',
    name: 'Regal Select Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-regal-select',
    department: 'Paint',
    category: 'Interior',
    type: 'paint',
    tags: ['interior', 'walls', 'professional', 'high-traffic', 'hallway', 'durable'],
    basePrice: 64.95,
    availableFinishes: ['Matte', 'Eggshell', 'Satin', 'Semi-Gloss'],
    availableSizes: ['Sample', 'Quart', 'Gallon', '5-Gallon'],
    isTintable: true,
    description:
      'A trusted favorite among painting professionals for over 60 years. Regal Select offers easy application, excellent touch-up, and a mildew-resistant finish perfect for any room.',
    imageUrl: '/images/products/regal-select.jpg',
    coverageRateM2PerL: 10,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },

  // ---------------------------------------------------------------------------
  // AURA BATH & SPA (Premium Bath/Kitchen)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-aura-bath-spa-532',
    name: 'Aura Bath & Spa',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-aura',
    department: 'Paint',
    category: 'Interior',
    type: 'paint',
    tags: ['interior', 'bath', 'bathroom', 'kitchen', 'high-humidity', 'mold-resistant', 'moisture', 'spa'],
    basePrice: 84.95,
    availableFinishes: ['Matte', 'Satin'],
    availableSizes: ['Sample', 'Quart', 'Gallon'],
    isTintable: true,
    description:
      'Specifically formulated for high-humidity environments like bathrooms and spas. Features mildew-resistant coating and Color Lock® technology for enduring beauty in moisture-prone areas.',
    imageUrl: '/images/products/aura-bath-spa.jpg',
    coverageRateM2PerL: 10,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },

  // ---------------------------------------------------------------------------
  // ADVANCE (Premium Trim & Door)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-advance-792',
    name: 'Advance Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-advance',
    department: 'Paint',
    category: 'Trim & Door',
    type: 'paint',
    tags: ['interior', 'trim', 'doors', 'cabinets', 'furniture', 'woodwork', 'self-leveling'],
    basePrice: 84.95,
    availableFinishes: ['Satin', 'Semi-Gloss', 'Gloss'],
    availableSizes: ['Quart', 'Gallon'],
    isTintable: true,
    description:
      'A premium waterborne alkyd delivering a flawless, furniture-grade finish on trim, doors, and cabinets. Self-leveling formula minimizes brush marks for a smooth, professional result.',
    imageUrl: '/images/products/advance.jpg',
    coverageRateM2PerL: 11,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },

  // ---------------------------------------------------------------------------
  // AURA EXTERIOR (Premium Exterior)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-aura-exterior-634',
    name: 'Aura Exterior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-aura',
    department: 'Paint',
    category: 'Exterior',
    type: 'paint',
    tags: ['exterior', 'masonry', 'wood', 'facade', 'siding', 'weather-resistant', 'fade-resistant'],
    basePrice: 89.95,
    availableFinishes: ['Matte', 'Satin'],
    availableSizes: ['Gallon', '5-Gallon'],
    isTintable: true,
    description:
      'Premium exterior paint with Color Lock® technology for exceptional fade resistance. Advanced resin technology provides superior adhesion and flexibility in all weather conditions.',
    imageUrl: '/images/products/aura-exterior.jpg',
    coverageRateM2PerL: 9,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },

  // ---------------------------------------------------------------------------
  // FRESH START PRIMER (Universal Primer)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-fresh-start-023',
    name: 'Fresh Start All-Purpose Primer',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-fresh-start',
    department: 'Paint',
    category: 'Primer',
    type: 'primer',
    tags: ['primer', 'universal', 'prep', 'preparation', 'interior', 'exterior', 'adhesion'],
    basePrice: 54.95,
    availableFinishes: ['Matte'],
    availableSizes: ['Quart', 'Gallon', '5-Gallon'],
    isTintable: false,
    description:
      'A high-hiding, multi-purpose primer suitable for interior and exterior surfaces. Provides excellent adhesion on previously painted surfaces, new drywall, and cured plaster.',
    imageUrl: '/images/products/fresh-start.jpg',
    coverageRateM2PerL: 11,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },

  // ---------------------------------------------------------------------------
  // BEN INTERIOR (Value Interior)
  // ---------------------------------------------------------------------------
  {
    id: 'bm-ben-625',
    name: 'ben Interior Paint',
    brand: 'BM',
    brandId: 'benjamin-moore',
    productLine: 'bm-ben',
    department: 'Paint',
    category: 'Interior',
    type: 'paint',
    tags: ['interior', 'walls', 'value', 'budget', 'zero-voc', 'bedroom', 'rental'],
    basePrice: 49.95,
    availableFinishes: ['Matte', 'Eggshell', 'Semi-Gloss'],
    availableSizes: ['Sample', 'Quart', 'Gallon'],
    isTintable: true,
    description:
      'Quality interior paint at an accessible price point. Zero VOC formula with excellent hide and coverage makes ben a smart choice for any interior project.',
    imageUrl: '/images/products/ben.jpg',
    coverageRateM2PerL: 9,
    inStock: true,
    updatedAt: new Date().toISOString(),
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate price for a specific product variant
 */
export function calculatePrice(
  basePrice: number,
  size: ContainerSize,
  finish: FinishSheen
): number {
  const sizeMultiplier = SIZE_MULTIPLIERS[size];
  const sheenAdjustment = SHEEN_ADJUSTMENTS[finish];
  return Math.round((basePrice * sizeMultiplier + sheenAdjustment) * 100) / 100;
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return INITIAL_INVENTORY.find((p) => p.id === id);
}

/**
 * Get product by slug (derived from ID)
 */
export function getProductBySlug(slug: string): Product | undefined {
  return INITIAL_INVENTORY.find((p) => p.id === slug);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): Product[] {
  const categoryMap: Record<string, string> = {
    'interior': 'Interior',
    'exterior': 'Exterior',
    'trim-door': 'Trim & Door',
    'primer': 'Primer',
    'specialty': 'Specialty',
  };

  const categoryName = categoryMap[category.toLowerCase()];
  if (!categoryName) return [];

  return INITIAL_INVENTORY.filter((p) => p.category === categoryName);
}

/**
 * Get products by product line
 */
export function getProductsByProductLine(productLineId: string): Product[] {
  return INITIAL_INVENTORY.filter((p) => p.productLine === productLineId);
}

/**
 * Get products by brand ID
 */
export function getProductsByBrandId(brandId: BrandId): Product[] {
  return INITIAL_INVENTORY.filter((p) => p.brandId === brandId);
}

/**
 * Get products by tag (for Problem Solver archetype)
 */
export function getProductsByTag(tag: string): Product[] {
  const normalizedTag = tag.toLowerCase();
  return INITIAL_INVENTORY.filter((p) =>
    p.tags.some((t) => t.toLowerCase().includes(normalizedTag))
  );
}

/**
 * Get products by type
 */
export function getProductsByType(type: Product['type']): Product[] {
  return INITIAL_INVENTORY.filter((p) => p.type === type);
}

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return INITIAL_INVENTORY;
}

/**
 * Generate URL-safe slug from product ID
 */
export function productToSlug(product: Product): string {
  return product.id;
}

/**
 * Search products by query (searches name, description, and tags)
 */
export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return INITIAL_INVENTORY.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(normalizedQuery);
    const descMatch = p.description?.toLowerCase().includes(normalizedQuery);
    const tagMatch = p.tags.some((t) => t.toLowerCase().includes(normalizedQuery));
    const categoryMatch = p.category.toLowerCase().includes(normalizedQuery);
    return nameMatch || descMatch || tagMatch || categoryMatch;
  });
}
