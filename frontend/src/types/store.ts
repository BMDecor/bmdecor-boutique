/**
 * BM Decoración - Industry Standard Paint & Decor Taxonomy
 *
 * This file defines the core data structures aligned with professional
 * paint industry standards for the storefront experience.
 */

// =============================================================================
// DEPARTMENTS (Top-level store organization)
// =============================================================================

/** Store departments - primary navigation categories */
export type Department = 'Paint' | 'Wallpaper' | 'Supplies' | 'Samples';

/** Department metadata for display */
export interface DepartmentInfo {
  id: Department;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'Paint',
    name: 'Paint',
    slug: 'paint',
    description: 'Premium interior and exterior paints from world-class brands',
  },
  {
    id: 'Wallpaper',
    name: 'Wallpaper',
    slug: 'wallpaper',
    description: 'Designer wallcoverings and artisan papers',
  },
  {
    id: 'Supplies',
    name: 'Supplies',
    slug: 'supplies',
    description: 'Professional brushes, rollers, and application tools',
  },
  {
    id: 'Samples',
    name: 'Samples',
    slug: 'samples',
    description: 'Color samples, peel & stick swatches, and test pots',
  },
];

// =============================================================================
// PAINT CATEGORIES (Within Paint Department)
// =============================================================================

/** Paint application categories */
export type PaintCategory = 'Interior' | 'Exterior' | 'Trim & Door' | 'Primer' | 'Specialty';

/** Paint category metadata */
export interface PaintCategoryInfo {
  id: PaintCategory;
  name: string;
  slug: string;
  description: string;
}

export const PAINT_CATEGORIES: PaintCategoryInfo[] = [
  {
    id: 'Interior',
    name: 'Interior',
    slug: 'interior',
    description: 'Wall and ceiling paints for indoor spaces',
  },
  {
    id: 'Exterior',
    name: 'Exterior',
    slug: 'exterior',
    description: 'Weather-resistant paints for outdoor surfaces',
  },
  {
    id: 'Trim & Door',
    name: 'Trim & Door',
    slug: 'trim-door',
    description: 'High-durability finishes for woodwork and doors',
  },
  {
    id: 'Primer',
    name: 'Primer',
    slug: 'primer',
    description: 'Surface preparation and sealing primers',
  },
  {
    id: 'Specialty',
    name: 'Specialty',
    slug: 'specialty',
    description: 'Floor paint, masonry, limewash, and specialty finishes',
  },
];

// =============================================================================
// FINISH TYPES (Sheen levels)
// =============================================================================

/** Standard paint finish/sheen levels */
export type FinishSheen = 'Matte' | 'Eggshell' | 'Satin' | 'Semi-Gloss' | 'Gloss';

/** Finish sheen metadata with typical use cases */
export interface FinishSheenInfo {
  id: FinishSheen;
  name: string;
  description: string;
  durability: 'Low' | 'Medium' | 'High';
  bestFor: string[];
}

export const FINISH_SHEENS: FinishSheenInfo[] = [
  {
    id: 'Matte',
    name: 'Matte / Flat',
    description: 'No sheen, hides imperfections',
    durability: 'Low',
    bestFor: ['Ceilings', 'Low-traffic walls', 'Adult bedrooms'],
  },
  {
    id: 'Eggshell',
    name: 'Eggshell',
    description: 'Subtle sheen, easy to clean',
    durability: 'Medium',
    bestFor: ['Living rooms', 'Dining rooms', 'Hallways'],
  },
  {
    id: 'Satin',
    name: 'Satin / Pearl',
    description: 'Soft luster, durable and washable',
    durability: 'Medium',
    bestFor: ['Kitchens', 'Bathrooms', 'Kids rooms'],
  },
  {
    id: 'Semi-Gloss',
    name: 'Semi-Gloss',
    description: 'Noticeable shine, highly durable',
    durability: 'High',
    bestFor: ['Trim', 'Doors', 'Cabinets', 'High-moisture areas'],
  },
  {
    id: 'Gloss',
    name: 'High Gloss',
    description: 'Maximum shine and durability',
    durability: 'High',
    bestFor: ['Doors', 'Furniture', 'Accent pieces'],
  },
];

// =============================================================================
// CONTAINER SIZES
// =============================================================================

/** Standard paint container sizes */
export type ContainerSize = 'Sample' | 'Quart' | 'Gallon' | '5-Gallon';

/** Container size metadata */
export interface ContainerSizeInfo {
  id: ContainerSize;
  name: string;
  metric: string;
  coverageM2: number; // Approximate coverage in m²
}

export const CONTAINER_SIZES: ContainerSizeInfo[] = [
  { id: 'Sample', name: 'Sample Pot', metric: '60ml', coverageM2: 0.5 },
  { id: 'Quart', name: 'Quart', metric: '946ml', coverageM2: 9 },
  { id: 'Gallon', name: 'Gallon', metric: '3.78L', coverageM2: 37 },
  { id: '5-Gallon', name: '5-Gallon', metric: '18.9L', coverageM2: 185 },
];

// =============================================================================
// PRODUCT LINE (Brand-specific product ranges)
// =============================================================================

/** Brand identifier */
export type Brand = 'BM' | 'FB' | 'LG';

/** Product line within a brand (e.g., Aura, Regal Select) */
export interface ProductLine {
  id: string;
  brand: Brand;
  name: string;
  slug: string;
  description: string;
  category: PaintCategory;
  tier: 'Premium' | 'Professional' | 'Value';
  features: string[];
}

/** Benjamin Moore Product Lines */
export const BM_PRODUCT_LINES: ProductLine[] = [
  {
    id: 'bm-aura',
    brand: 'BM',
    name: 'Aura',
    slug: 'aura',
    description: 'Premium interior paint with Color Lock technology',
    category: 'Interior',
    tier: 'Premium',
    features: ['Color Lock Technology', 'Zero VOC', 'Exceptional Coverage'],
  },
  {
    id: 'bm-regal-select',
    brand: 'BM',
    name: 'Regal Select',
    slug: 'regal-select',
    description: 'Professional-grade interior paint with superior durability',
    category: 'Interior',
    tier: 'Professional',
    features: ['Mildew Resistant', 'Excellent Touch-Up', 'Easy Application'],
  },
  {
    id: 'bm-advance',
    brand: 'BM',
    name: 'Advance',
    slug: 'advance',
    description: 'Waterborne alkyd for trim, doors, and cabinets',
    category: 'Trim & Door',
    tier: 'Premium',
    features: ['Furniture-Grade Finish', 'Self-Leveling', 'Low VOC'],
  },
  {
    id: 'bm-ben',
    brand: 'BM',
    name: 'ben',
    slug: 'ben',
    description: 'Quality interior paint at an accessible price point',
    category: 'Interior',
    tier: 'Value',
    features: ['Zero VOC', 'Easy Application', 'Great Value'],
  },
];

// =============================================================================
// PRODUCT (Purchasable item)
// =============================================================================

/** Core product definition - a purchasable paint item */
export interface Product {
  id: string;
  name: string;
  brand: Brand;
  productLine: string; // Reference to ProductLine.id
  department: Department;
  category: PaintCategory;
  basePrice: number; // Price in EUR for base size
  availableFinishes: FinishSheen[];
  availableSizes: ContainerSize[];
  isTintable: boolean; // Primers/clear coats might be false
  description?: string;
  imageUrl?: string;
  coverageRateM2PerL: number;
  inStock: boolean;
  updatedAt: string;
}

// =============================================================================
// COLOR (The tintable attribute, separate from Product)
// =============================================================================

/** Color usage context */
export type ColorUsage = 'Interior' | 'Exterior' | 'All';

/** Color definition - an attribute that can be applied to tintable products */
export interface Color {
  code: string; // Brand-specific code (e.g., "HC-154", "No.47")
  name: string;
  hex: string;
  brand: Brand;
  collection?: string; // Color family/collection
  usage: ColorUsage[]; // Where this color can be used
  lrv?: number; // Light Reflectance Value (0-100)
  undertone?: string; // Color undertone description
}

// =============================================================================
// CART & PURCHASE TYPES
// =============================================================================

/** Cart item combining product, color, size, and finish selections */
export interface CartItem {
  productId: string;
  colorCode?: string; // Optional - solid products don't need color
  finish: FinishSheen;
  size: ContainerSize;
  quantity: number;
  unitPrice: number;
}

/** Price variant based on finish and size */
export interface PriceVariant {
  productId: string;
  finish: FinishSheen;
  size: ContainerSize;
  price: number;
  sku: string;
}

// =============================================================================
// NAVIGATION HELPERS
// =============================================================================

/** Navigation link structure */
export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** Department with subcategories for mega menu */
export interface DepartmentNav {
  department: DepartmentInfo;
  categories?: NavLink[];
}

/** Build paint department navigation */
export function getPaintNav(): DepartmentNav {
  return {
    department: DEPARTMENTS.find((d) => d.id === 'Paint')!,
    categories: PAINT_CATEGORIES.map((cat) => ({
      label: cat.name,
      href: `/shop/paint/${cat.slug}`,
      description: cat.description,
    })),
  };
}
