/**
 * BM Decoracion — Product Variant Configuration
 *
 * BM Production API (GetProductDetail) does NOT return container sizes
 * or pricing. Sizes are based on BM's internal dealer SKU suffix convention:
 *   -001 = Gallon (3.79L)
 *   -004 = Quart  (0.94L)
 *   -005 = 5 Gallon (18.93L)
 *   -006 = Half Pint (0.24L) — color samples only
 *   -008 = Pint (0.47L)
 *
 * Pricing sourced from benjaminmoore.com.es (EUR, IVA incluido 21%).
 */

/**
 * Container sizes matching BM's SKU suffix codes.
 * Display label · SKU suffix · metric equivalent.
 */
export type ContainerSize = 'Pint' | 'Quart' | 'Gallon' | '5 Gallon';

/** SKU suffix code per container size (appended to product number for ordering) */
export const BM_SKU_SUFFIX: Record<ContainerSize, string> = {
  'Pint':      '008',
  'Quart':     '004',
  'Gallon':    '001',
  '5 Gallon':  '005',
};

/** Metric equivalent in liters for each container size */
export const SIZE_LITERS: Record<ContainerSize, number> = {
  'Pint':      0.47,
  'Quart':     0.94,
  'Gallon':    3.79,
  '5 Gallon': 18.93,
};

/** Human-readable label with metric equivalent */
export const SIZE_DISPLAY: Record<ContainerSize, string> = {
  'Pint':      'Pint (0.47L)',
  'Quart':     'Quart (0.94L)',
  'Gallon':    'Gallon (3.79L)',
  '5 Gallon':  '5 Gal (18.93L)',
};

/**
 * EUR pricing per product line + container size (IVA incluido, 21% Spanish VAT).
 * Sourced from benjaminmoore.com.es — prices vary by product line.
 */
export const BM_PRICE_MATRIX: Record<string, Partial<Record<ContainerSize, number>>> = {
  'Aura Interior': {
    'Pint':      20.27,
    'Quart':     61.14,
    'Gallon':   180.00,
  },
  'Aura Exterior': {
    'Quart':     61.14,
    'Gallon':   180.00,
  },
  'Aura Bath & Spa': {
    'Quart':     61.14,
    'Gallon':   180.00,
  },
  'Regal Select Interior': {
    'Quart':     50.72,
    'Gallon':   149.00,
    '5 Gallon': 530.00,
  },
  'Regal Select Exterior': {
    'Quart':     50.72,
    'Gallon':   149.00,
    '5 Gallon': 530.00,
  },
  'ben Interior': {
    'Quart':     42.91,
    'Gallon':   103.41,
    '5 Gallon': 364.28,
  },
  'Woodluxe Exterior Stain': {
    'Quart':     42.91,
    'Gallon':   103.41,
    '5 Gallon': 364.28,
  },
};

/**
 * Flat fallback price list (used by dynamo-cart for server-side price enforcement
 * when a product-line-specific price isn't found).
 */
export const BM_PRICE_LIST: Record<ContainerSize, number> = {
  'Pint':      20.27,
  'Quart':     50.72,
  'Gallon':   149.00,
  '5 Gallon': 530.00,
};

/** Available container sizes per product line */
export const BM_SIZE_CONFIG: Record<string, ContainerSize[]> = {
  'Aura Interior':            ['Pint', 'Quart', 'Gallon'],
  'Aura Exterior':            ['Quart', 'Gallon'],
  'Aura Bath & Spa':          ['Quart', 'Gallon'],
  'Regal Select Interior':    ['Quart', 'Gallon', '5 Gallon'],
  'Regal Select Exterior':    ['Quart', 'Gallon', '5 Gallon'],
  'ben Interior':             ['Quart', 'Gallon', '5 Gallon'],
  'Woodluxe Exterior Stain':  ['Quart', 'Gallon', '5 Gallon'],
};

/** Get available sizes for a product line */
export function getAvailableSizes(productLine: string): ContainerSize[] {
  return BM_SIZE_CONFIG[productLine] || ['Quart', 'Gallon'];
}

/** Get price for a container size within a product line */
export function getPriceForSize(size: ContainerSize, productLine?: string): number {
  if (productLine && BM_PRICE_MATRIX[productLine]) {
    const linePrice = BM_PRICE_MATRIX[productLine][size];
    if (linePrice !== undefined) return linePrice;
  }
  return BM_PRICE_LIST[size];
}

/** Build full BM SKU from product number + size (e.g., N524-001 for Gallon) */
export function buildSku(productNumber: string, size: ContainerSize): string {
  return `${productNumber}-${BM_SKU_SUFFIX[size]}`;
}

/**
 * Calculate optimal containers from available sizes for a given product line.
 * Respects per-product-line size availability from BM_SIZE_CONFIG.
 */
export function calculateOptimalContainersForLine(
  litersNeeded: number,
  productLine: string,
): { size: ContainerSize; quantity: number }[] {
  const available = getAvailableSizes(productLine);
  // Sort sizes descending by liters
  const sorted = [...available].sort((a, b) => SIZE_LITERS[b] - SIZE_LITERS[a]);

  const containers: { size: ContainerSize; quantity: number }[] = [];
  let remaining = litersNeeded;

  for (const size of sorted) {
    const liters = SIZE_LITERS[size];
    if (remaining >= liters) {
      const count = Math.floor(remaining / liters);
      containers.push({ size, quantity: count });
      remaining -= count * liters;
    }
  }

  // If there's remaining paint needed, add one more of the smallest available size
  if (remaining > 0.01 && sorted.length > 0) {
    const smallest = sorted[sorted.length - 1];
    const existing = containers.find((c) => c.size === smallest);
    if (existing) {
      existing.quantity += 1;
    } else {
      containers.push({ size: smallest, quantity: 1 });
    }
  }

  return containers;
}

/**
 * Calculate total cost for a set of containers within a product line.
 */
export function calculateContainerCost(
  containers: { size: ContainerSize; quantity: number }[],
  productLine?: string,
): {
  eur: number;
  breakdown: { size: ContainerSize; unitPrice: number; quantity: number }[];
} {
  let total = 0;
  const breakdown: { size: ContainerSize; unitPrice: number; quantity: number }[] = [];

  for (const c of containers) {
    const unitPrice = getPriceForSize(c.size, productLine);
    total += unitPrice * c.quantity;
    breakdown.push({ size: c.size, unitPrice, quantity: c.quantity });
  }

  return { eur: Math.round(total * 100) / 100, breakdown };
}
