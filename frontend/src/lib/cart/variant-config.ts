/**
 * BM Decoracion — Product Variant Configuration
 *
 * BM Production API (GetProductDetail) does NOT return container sizes
 * or pricing. Sizes defined per-product-line based on BM standard packaging.
 * Prices are Marbella boutique EUR pricing, IVA incluido (21%).
 *
 * Phase 7b API probe result: Only eStoreProductCode returned, no size/volume fields.
 */

export type ContainerSize = '750ml' | '1L' | '2.5L' | '5L';

/** Available container sizes per product line */
export const BM_SIZE_CONFIG: Record<string, ContainerSize[]> = {
  'Aura Interior':            ['750ml', '1L', '2.5L', '5L'],
  'Aura Exterior':            ['1L', '2.5L', '5L'],
  'Aura Bath & Spa':          ['750ml', '1L', '2.5L'],
  'Regal Select Interior':    ['750ml', '1L', '2.5L', '5L'],
  'Regal Select Exterior':    ['1L', '2.5L', '5L'],
  'ben Interior':             ['750ml', '1L', '2.5L', '5L'],
  'Woodluxe Exterior Stain':  ['750ml', '2.5L', '5L'],
};

/** EUR pricing per container size (IVA incluido, 21% Spanish VAT) */
export const BM_PRICE_LIST: Record<ContainerSize, number> = {
  '750ml': 28.00,
  '1L':    36.00,
  '2.5L':  68.00,
  '5L':   125.00,
};

/** Size in liters for calculator alignment */
export const SIZE_LITERS: Record<ContainerSize, number> = {
  '750ml': 0.75,
  '1L':    1,
  '2.5L':  2.5,
  '5L':    5,
};

/** Get available sizes for a product line (defaults to standard 4-size set) */
export function getAvailableSizes(productLine: string): ContainerSize[] {
  return BM_SIZE_CONFIG[productLine] || ['750ml', '1L', '2.5L', '5L'];
}

/** Get price for a container size */
export function getPriceForSize(size: ContainerSize): number {
  return BM_PRICE_LIST[size];
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
 * Calculate total cost for a set of containers.
 */
export function calculateContainerCost(containers: { size: ContainerSize; quantity: number }[]): {
  eur: number;
  breakdown: { size: ContainerSize; unitPrice: number; quantity: number }[];
} {
  let total = 0;
  const breakdown: { size: ContainerSize; unitPrice: number; quantity: number }[] = [];

  for (const c of containers) {
    const unitPrice = BM_PRICE_LIST[c.size];
    total += unitPrice * c.quantity;
    breakdown.push({ size: c.size, unitPrice, quantity: c.quantity });
  }

  return { eur: Math.round(total * 100) / 100, breakdown };
}
