/**
 * BM Decoracion — Multi-Brand Product Variant Configuration
 *
 * Supports three brand sizing conventions:
 *
 * Benjamin Moore (BM) — US Imperial sizes with SKU suffix codes:
 *   -001 = Gallon (3.79L)
 *   -004 = Quart  (0.94L)
 *   -005 = 5 Gallon (18.93L)
 *   -008 = Pint (0.47L)
 *
 * Little Greene (LG) & Farrow & Ball (FB) — UK/EU Metric sizes:
 *   750ml, 1L, 2.5L, 5L
 *
 * All pricing EUR, IVA incluido (21% Spanish VAT).
 */

// ─────────────────────────────────────────────────────────
// CONTAINER SIZE TYPE (supports both BM imperial and LG/FB metric)
// ─────────────────────────────────────────────────────────

export type ContainerSize =
  | 'Pint' | 'Quart' | 'Gallon' | '5 Gallon'              // BM imperial
  | '60ml' | '750ml' | '1L' | '2.5L' | '5L' | '10L';      // LG/FB metric

// ─────────────────────────────────────────────────────────
// BENJAMIN MOORE — Imperial Sizes
// ─────────────────────────────────────────────────────────

/** SKU suffix code per BM container size */
export const BM_SKU_SUFFIX: Record<string, string> = {
  'Pint':      '008',
  'Quart':     '004',
  'Gallon':    '001',
  '5 Gallon':  '005',
};

/** BM size in liters */
export const SIZE_LITERS: Record<string, number> = {
  'Pint':      0.47,
  'Quart':     0.94,
  'Gallon':    3.79,
  '5 Gallon': 18.93,
};

/** BM human-readable label with metric equivalent */
export const SIZE_DISPLAY: Record<string, string> = {
  'Pint':      'Pint (0.47L)',
  'Quart':     'Quart (0.94L)',
  'Gallon':    'Gallon (3.79L)',
  '5 Gallon':  '5 Gal (18.93L)',
};

/** BM EUR pricing per product line + container size (IVA incluido) */
export const BM_PRICE_MATRIX: Record<string, Partial<Record<string, number>>> = {
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

/** BM flat fallback price list */
export const BM_PRICE_LIST: Record<string, number> = {
  'Pint':      20.27,
  'Quart':     50.72,
  'Gallon':   149.00,
  '5 Gallon': 530.00,
};

/** BM available sizes per product line */
export const BM_SIZE_CONFIG: Record<string, ContainerSize[]> = {
  'Aura Interior':            ['Pint', 'Quart', 'Gallon'],
  'Aura Exterior':            ['Quart', 'Gallon'],
  'Aura Bath & Spa':          ['Quart', 'Gallon'],
  'Regal Select Interior':    ['Quart', 'Gallon', '5 Gallon'],
  'Regal Select Exterior':    ['Quart', 'Gallon', '5 Gallon'],
  'ben Interior':             ['Quart', 'Gallon', '5 Gallon'],
  'Woodluxe Exterior Stain':  ['Quart', 'Gallon', '5 Gallon'],
};

// ─────────────────────────────────────────────────────────
// METRIC SIZES — Little Greene & Farrow & Ball
// ─────────────────────────────────────────────────────────

/** Metric size in liters */
export const METRIC_SIZE_LITERS: Record<string, number> = {
  '60ml':  0.06,
  '750ml': 0.75,
  '1L':    1.0,
  '2.5L':  2.5,
  '5L':    5.0,
  '10L':  10.0,
};

/** Metric human-readable display labels */
export const METRIC_SIZE_DISPLAY: Record<string, string> = {
  '60ml':  '60ml Sample',
  '750ml': '750ml',
  '1L':    '1 Litre',
  '2.5L':  '2.5 Litres',
  '5L':    '5 Litres',
  '10L':   '10 Litres',
};

// ─── LITTLE GREENE PRICING (EUR, IVA incluido) ───

export const LG_PRICE_LIST: Record<string, number> = {
  '60ml':   6.50,
  '750ml': 22.00,
  '1L':    28.50,
  '2.5L':  52.00,
  '5L':    92.00,
  '10L':  170.00,
};

export const LG_SIZE_CONFIG: Record<string, ContainerSize[]> = {
  'Absolute Matt Emulsion':       ['60ml', '1L', '2.5L', '5L', '10L'],
  'Intelligent Matt Emulsion':    ['1L', '2.5L', '5L', '10L'],
  'Intelligent Eggshell':         ['1L', '2.5L', '5L'],
  'Intelligent Satin':            ['1L', '2.5L', '5L'],
  'Intelligent Gloss':            ['1L', '2.5L'],
  'Intelligent Exterior Eggshell':['1L', '2.5L'],
  'Intelligent ASP':              ['1L', '2.5L'],
  'Tom\'s Oil Eggshell':          ['1L', '2.5L'],
  'Traditional Oil Gloss':        ['1L', '2.5L'],
  'Intelligent Floor Paint':      ['1L', '2.5L'],
  'Interior Oil Eggshell':        ['1L', '2.5L', '5L'],
  'Intelligent Masonry Paint':    ['5L', '10L'],
  'Wall Primer Sealer':           ['2.5L', '10L'],
  'Distemper':                     ['5L'],
  'Limewash':                      ['5L'],
};

// ─── FARROW & BALL PRICING (EUR, IVA incluido) ───

// F&B pricing per finish + size from official CSV export (EUR, IVA incluido)
export const FB_PRICE_MATRIX: Record<string, Partial<Record<string, number>>> = {
  'Estate Emulsion':    { '2.5L': 112.00, '5L': 187.00 },
  'Modern Emulsion':    { '2.5L': 119.00, '5L': 197.00 },
  'Estate Eggshell':    { '750ml': 56.00, '2.5L': 137.00, '5L': 223.00 },
  'Modern Eggshell':    { '750ml': 59.00, '2.5L': 145.00, '5L': 243.00 },
  'Dead Flat':          { '750ml': 56.00, '2.5L': 135.00, '5L': 220.00 },
  'Flat Eggshell':      { '750ml': 59.00, '2.5L': 145.00, '5L': 243.00 },
  'Full Gloss':         { '750ml': 58.00, '2.5L': 139.00 },
  'Exterior Eggshell':  { '750ml': 62.00, '2.5L': 150.00 },
  'Exterior Masonry':   { '5L': 190.00 },
  'Casein Distemper':   { '2.5L': 128.00, '5L': 223.00 },
  'Soft Distemper':     { '5L': 178.00 },
  'Limewash':           { '5L': 134.00 },
};

/** F&B flat fallback price list (most common mid-range) */
export const FB_PRICE_LIST: Record<string, number> = {
  '100ml':  15.00,
  '750ml':  58.00,
  '2.5L':  135.00,
  '5L':    220.00,
};

export const FB_SIZE_CONFIG: Record<string, ContainerSize[]> = {
  'Estate Emulsion':    ['2.5L', '5L'],
  'Modern Emulsion':    ['2.5L', '5L'],
  'Estate Eggshell':    ['750ml', '2.5L', '5L'],
  'Modern Eggshell':    ['750ml', '2.5L', '5L'],
  'Dead Flat':          ['750ml', '2.5L', '5L'],
  'Flat Eggshell':      ['750ml', '2.5L', '5L'],
  'Full Gloss':         ['750ml', '2.5L'],
  'Exterior Eggshell':  ['750ml', '2.5L'],
  'Exterior Masonry':   ['5L'],
  'Casein Distemper':   ['2.5L', '5L'],
  'Soft Distemper':     ['5L'],
  'Limewash':           ['5L'],
};

// ─────────────────────────────────────────────────────────
// UNIVERSAL HELPERS
// ─────────────────────────────────────────────────────────

/** Get available BM sizes for a product line */
export function getAvailableSizes(productLine: string): ContainerSize[] {
  return BM_SIZE_CONFIG[productLine] || ['Quart', 'Gallon'];
}

/** Get available metric sizes for a LG/FB finish type */
export function getAvailableMetricSizes(finishType: string, brand: 'LG' | 'FB'): ContainerSize[] {
  const config = brand === 'LG' ? LG_SIZE_CONFIG : FB_SIZE_CONFIG;
  return config[finishType] || ['2.5L', '5L'];
}

/** Get price for a container size — brand-aware */
export function getPriceForSize(
  size: ContainerSize,
  productLine?: string,
  brand?: 'BM' | 'FB' | 'LG',
): number {
  // Little Greene metric pricing
  if (brand === 'LG') return LG_PRICE_LIST[size] ?? 52.00;
  // Farrow & Ball finish-specific pricing, then fallback
  if (brand === 'FB') {
    if (productLine && FB_PRICE_MATRIX[productLine]) {
      const finishPrice = FB_PRICE_MATRIX[productLine][size];
      if (finishPrice !== undefined) return finishPrice;
    }
    return FB_PRICE_LIST[size] ?? 135.00;
  }

  // BM product-line-specific pricing
  if (productLine && BM_PRICE_MATRIX[productLine]) {
    const linePrice = BM_PRICE_MATRIX[productLine][size];
    if (linePrice !== undefined) return linePrice;
  }
  return BM_PRICE_LIST[size] ?? 149.00;
}

/** Build full BM SKU from product number + size (e.g., N524-001 for Gallon) */
export function buildSku(productNumber: string, size: ContainerSize): string {
  return `${productNumber}-${BM_SKU_SUFFIX[size] || '001'}`;
}

/** Get liters for any container size (imperial or metric) */
export function getLitersForSize(size: ContainerSize): number {
  return SIZE_LITERS[size] ?? METRIC_SIZE_LITERS[size] ?? 2.5;
}

// ─────────────────────────────────────────────────────────
// BM CALCULATOR HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Calculate optimal containers from available sizes for a BM product line.
 */
export function calculateOptimalContainersForLine(
  litersNeeded: number,
  productLine: string,
): { size: ContainerSize; quantity: number }[] {
  const available = getAvailableSizes(productLine);
  const sorted = [...available].sort((a, b) => getLitersForSize(b) - getLitersForSize(a));

  const containers: { size: ContainerSize; quantity: number }[] = [];
  let remaining = litersNeeded;

  for (const size of sorted) {
    const liters = getLitersForSize(size);
    if (remaining >= liters) {
      const count = Math.floor(remaining / liters);
      containers.push({ size, quantity: count });
      remaining -= count * liters;
    }
  }

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
 * Calculate total cost for a set of BM containers.
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

// ─────────────────────────────────────────────────────────
// METRIC CALCULATOR HELPERS (LG / FB)
// ─────────────────────────────────────────────────────────

/**
 * Calculate optimal metric containers for a LG/FB finish type.
 */
export function calculateOptimalMetricContainers(
  litersNeeded: number,
  finishType: string,
  brand: 'LG' | 'FB',
): { size: ContainerSize; quantity: number }[] {
  const available = getAvailableMetricSizes(finishType, brand);
  const sorted = [...available].sort((a, b) => getLitersForSize(b) - getLitersForSize(a));

  const containers: { size: ContainerSize; quantity: number }[] = [];
  let remaining = litersNeeded;

  for (const size of sorted) {
    const liters = getLitersForSize(size);
    if (remaining >= liters) {
      const count = Math.floor(remaining / liters);
      containers.push({ size, quantity: count });
      remaining -= count * liters;
    }
  }

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
 * Calculate total cost for metric containers.
 */
export function calculateMetricContainerCost(
  containers: { size: ContainerSize; quantity: number }[],
  brand: 'LG' | 'FB',
): {
  eur: number;
  breakdown: { size: ContainerSize; unitPrice: number; quantity: number }[];
} {
  let total = 0;
  const breakdown: { size: ContainerSize; unitPrice: number; quantity: number }[] = [];

  for (const c of containers) {
    const unitPrice = getPriceForSize(c.size, undefined, brand);
    total += unitPrice * c.quantity;
    breakdown.push({ size: c.size, unitPrice, quantity: c.quantity });
  }

  return { eur: Math.round(total * 100) / 100, breakdown };
}
