/**
 * Benjamin Moore Production API Integration
 *
 * Real API endpoints discovered from api.benjaminmoore.com:
 *   - color/GetColorDetail?colorNumber={NUM}  → description, LRV, harmony, similar, shades
 *   - color/GetPaletteByCode?code={CODE}&colorData=true → collection colors
 *   - product/GetProductDetail?productNumber={NUM} → sheen, VOC, resin, use, datasheets
 *   - product/GetProducts → full product catalog
 *
 * API key is embedded in URL path: /api/{API_KEY}/...
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromIni } from '@aws-sdk/credential-providers';
import { apiConfig } from '@/config/api-config';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

/** Color from the BM API */
export interface BMApiColor {
  number: string;
  name: string;
  family: string;
  url: string;
  shortURL: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  exteriorAvailability: string;
  wetSampleSKU: string;
  drySampleSKU: string;
  eStoreAvailable: boolean;
  productTypesAvailable: string;
  stainOpacitiesAvailable: string | null;
}

/** Full color detail from GetColorDetail */
export interface BMColorDetail {
  color: BMApiColor;
  description: string;
  lrv: number;
  isActive: boolean;
  harmony: BMPalette[];
  similar: BMPalette;
  shades: BMPalette;
}

/** Palette structure used in harmony/similar/shades */
export interface BMPalette {
  name: string;
  category: string | null;
  colors: BMApiColor[];
}

/** Product from GetProductDetail */
export interface BMProductDetail {
  product: {
    number: string;
    name: string;
    longName: string;
    url: string;
    shortURL: string;
    image1x: string;
    image2x: string;
    image3x: string;
    productGroup: string;
    eStoreProductCode: string;
  };
  colors: string;
  details: string;
  stainFinish: string;
  sheen: string;
  cleanup: string;
  resin: string;
  use: string;
  mpi: string;
  voc_range: string;
  dataSheets: {
    label: string;
    count: number;
    list: { name: string; url: string; description: string }[];
  }[];
}

/** Product list item from GetProducts */
export interface BMProductListItem {
  number: string;
  name: string;
  longName: string;
  url: string;
  shortURL: string;
  image1x: string;
  image2x: string;
  image3x: string;
  productGroup: string;
  eStoreProductCode: string;
}

/** Frontend-facing types */
export interface BMColor {
  colorNumber: string;
  colorName: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  collection?: string;
}

export interface RoomScene {
  id: string;
  name: string;
  imageUrl: string;
  roomType: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining-room' | 'office';
}

export interface ComplementaryResult {
  type: string;
  colors: BMColor[];
}

export interface CoverageData {
  colorNumber: string;
  productLine: string;
  finish: string;
  coveragePerLiter: number;
  coveragePerGallon: number;
  coatsRecommended: number;
  dryTime: { touchDry: number; recoat: number };
  voc: string;
}

export interface CalculatorResult {
  colorNumber: string;
  surfaceArea: number;
  coats: number;
  litersNeeded: number;
  containersNeeded: { size: string; quantity: number }[];
  estimatedCost: {
    eur: number;
    breakdown: { size: string; unitPrice: number; quantity: number }[];
  };
  coverageData: CoverageData;
}

// ─────────────────────────────────────────────────────────
// CONFIG & SECRETS
// ─────────────────────────────────────────────────────────

const AWS_CONFIG = {
  profile: 'bmdecor',
  region: 'eu-west-1',
  secretName: 'BmDecor/BenjaminMoore',
};

interface BMSecrets {
  BM_API_KEY: string;
  BM_API_ENDPOINT: string;
}

let cachedSecrets: BMSecrets | null = null;

async function getSecrets(): Promise<BMSecrets> {
  if (cachedSecrets) return cachedSecrets;

  const client = new SecretsManagerClient({
    region: AWS_CONFIG.region,
    credentials: fromIni({ profile: AWS_CONFIG.profile }),
  });

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: AWS_CONFIG.secretName })
  );

  if (!response.SecretString) throw new Error('BM secret value is empty');
  cachedSecrets = JSON.parse(response.SecretString) as BMSecrets;
  return cachedSecrets;
}

function buildUrl(endpoint: string, apiKey: string, params: Record<string, string> = {}): string {
  return apiConfig.buildBmUrl(apiKey, endpoint, params);
}

// ─────────────────────────────────────────────────────────
// RAW API CALLS
// ─────────────────────────────────────────────────────────

/** Get detailed color info including harmony, similar, shades, LRV, description */
export async function fetchColorDetail(colorNumber: string): Promise<BMColorDetail> {
  const secrets = await getSecrets();
  const url = buildUrl('color/GetColorDetail', secrets.BM_API_KEY, {
    colorNumber,
  });

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`BM API error: ${res.status}`);

  const body = await res.json();
  if (!body.data || !body.data.color) {
    throw new Error(body.error || 'No color data returned');
  }

  return body.data as BMColorDetail;
}

/** Get product technical details (sheen, VOC, resin, use, datasheets) */
export async function fetchProductDetail(productNumber: string): Promise<BMProductDetail> {
  const secrets = await getSecrets();
  const url = buildUrl('product/GetProductDetail', secrets.BM_API_KEY, {
    productNumber,
  });

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`BM API error: ${res.status}`);

  const body = await res.json();
  if (!body.data) throw new Error(body.error || 'No product data returned');

  return body.data as BMProductDetail;
}

/** Get all products in catalog */
export async function fetchProductList(): Promise<BMProductListItem[]> {
  const secrets = await getSecrets();
  const url = buildUrl('product/GetProducts', secrets.BM_API_KEY);

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`BM API error: ${res.status}`);

  const body = await res.json();
  const products = body.data || [];
  return products.filter((p: BMProductListItem | null) => p !== null);
}

// ─────────────────────────────────────────────────────────
// PRODUCT LINES (Official BM product numbers)
// ─────────────────────────────────────────────────────────

export const BM_PRODUCT_LINES = {
  'Aura Interior': [
    { number: 'N522', sheen: 'Matte' },
    { number: 'N524', sheen: 'Eggshell' },
    { number: 'N526', sheen: 'Satin' },
    { number: 'N528', sheen: 'Semi-Gloss' },
  ],
  'Aura Exterior': [
    { number: 'N629', sheen: 'Flat' },
    { number: 'N631', sheen: 'Satin' },
    { number: 'N632', sheen: 'Soft Gloss' },
    { number: 'N634', sheen: 'Low Lustre' },
  ],
  'Aura Bath & Spa': [
    { number: '532', sheen: 'Matte' },
  ],
  'Regal Select Interior': [
    { number: 'N547', sheen: 'Flat' },
    { number: 'N548', sheen: 'Matte' },
    { number: 'N549', sheen: 'Eggshell' },
    { number: 'N550', sheen: 'Pearl' },
    { number: 'N551', sheen: 'Semi-Gloss' },
  ],
  'Regal Select Exterior': [
    { number: '400', sheen: 'Flat' },
    { number: '401', sheen: 'Low Lustre' },
    { number: '403', sheen: 'Soft Gloss' },
  ],
  'ben Interior': [
    { number: 'N624', sheen: 'Matte' },
    { number: 'N626', sheen: 'Eggshell' },
    { number: 'N627', sheen: 'Semi-Gloss' },
    { number: 'N628', sheen: 'Pearl' },
  ],
} as const;

// Coverage rates per product line (m² per liter, from TDS)
const COVERAGE_RATES: Record<string, number> = {
  'Aura Interior': 14,
  'Aura Exterior': 12,
  'Aura Bath & Spa': 14,
  'Regal Select Interior': 12,
  'Regal Select Exterior': 11,
  'ben Interior': 11,
  'Woodluxe Exterior Stain': 8,
};

// Price list (EUR, IVA incluido) — real BM container sizes
const PRICE_LIST: Record<string, number> = {
  'Pint':      20.27,
  'Quart':     50.72,
  'Gallon':   149.00,
  '5 Gallon': 530.00,
};

// ─────────────────────────────────────────────────────────
// COLOR DISCOVERY (powered by GetColorDetail)
// ─────────────────────────────────────────────────────────

function apiColorToBMColor(c: BMApiColor, collection?: string): BMColor {
  return {
    colorNumber: c.number,
    colorName: c.name,
    hex: `#${c.hex}`,
    rgb: { r: c.r, g: c.g, b: c.b },
    collection,
  };
}

/**
 * Discover complementary/coordinating colors from the BM API.
 * Uses real "Goes Great With", "Similar Colors", and "More Shades" data.
 */
export async function discoverComplementaryColors(
  colorNumber: string,
): Promise<ComplementaryResult[]> {
  const detail = await fetchColorDetail(colorNumber);
  const results: ComplementaryResult[] = [];

  // Harmony palettes ("Goes Great With")
  if (detail.harmony && detail.harmony.length > 0) {
    // Merge all harmony entries into one palette
    const harmonyColors: BMColor[] = [];
    for (const h of detail.harmony) {
      if (h.colors) {
        for (const c of h.colors) {
          if (c && !harmonyColors.some(hc => hc.colorNumber === c.number)) {
            harmonyColors.push(apiColorToBMColor(c));
          }
        }
      }
    }
    if (harmonyColors.length > 0) {
      results.push({ type: 'Goes Great With', colors: harmonyColors });
    }
  }

  // Similar colors
  if (detail.similar && detail.similar.colors) {
    const similar = detail.similar.colors
      .filter(c => c !== null)
      .map(c => apiColorToBMColor(c));
    if (similar.length > 0) {
      results.push({ type: 'Similar Colors', colors: similar });
    }
  }

  // Shades (light-to-dark variations)
  if (detail.shades && detail.shades.colors) {
    const shades = detail.shades.colors
      .filter(c => c !== null)
      .map(c => apiColorToBMColor(c));
    if (shades.length > 0) {
      results.push({ type: 'More Shades', colors: shades });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// VISUALIZER (color-tinted room previews)
// ─────────────────────────────────────────────────────────

/**
 * Marbella Room Set — local architectural SVG scenes.
 *
 * BM Photo/RenderRoom API returned 404 across 30+ endpoint probes on both
 * Stage and Production. BM's "Color a Room" is a browser-only compositing
 * tool with no server-side API. These local SVGs are designed with white/light
 * walls so CSS mix-blend-mode: multiply tints them with the selected color.
 *
 * To upgrade: replace SVG paths with S3-hosted photography URLs.
 */
const ROOM_SCENES: RoomScene[] = [
  { id: 'living-1', name: 'Modern Living Room', roomType: 'living-room', imageUrl: '/rooms/living-room.svg' },
  { id: 'bedroom-1', name: 'Serene Bedroom', roomType: 'bedroom', imageUrl: '/rooms/bedroom.svg' },
  { id: 'kitchen-1', name: 'Contemporary Kitchen', roomType: 'kitchen', imageUrl: '/rooms/kitchen.svg' },
  { id: 'bathroom-1', name: 'Spa Bathroom', roomType: 'bathroom', imageUrl: '/rooms/bathroom.svg' },
  { id: 'dining-1', name: 'Elegant Dining Room', roomType: 'dining-room', imageUrl: '/rooms/dining-room.svg' },
  { id: 'office-1', name: 'Home Office', roomType: 'office', imageUrl: '/rooms/office.svg' },
];

export async function getVisualizerScenes(
  _colorNumber: string,
  _hexCode: string,
): Promise<RoomScene[]> {
  return ROOM_SCENES;
}

// ─────────────────────────────────────────────────────────
// CALCULATOR (official product specs + coverage math)
// ─────────────────────────────────────────────────────────

/**
 * Calculate paint needs using official BM product data.
 * Fetches real product specs (sheen, VOC, resin) from the API.
 */
export async function calculatePaintNeeds(
  colorNumber: string,
  surfaceArea: number,
  coats: number = 2,
  productLine: string = 'Regal Select Interior',
  productNumber?: string,
): Promise<CalculatorResult> {
  // Fetch real product specs if product number provided
  let sheen = 'Matte';
  let vocRange = '< 50 g/L';

  if (productNumber) {
    try {
      const detail = await fetchProductDetail(productNumber);
      sheen = detail.sheen || sheen;
      vocRange = detail.voc_range || vocRange;
    } catch {
      // Fall back to defaults if product API fails
    }
  }

  const coveragePerLiter = COVERAGE_RATES[productLine] || 12;
  const litersNeeded = (surfaceArea * coats) / coveragePerLiter;
  const containers = calculateOptimalContainers(litersNeeded);
  const estimatedCost = calculateCost(containers);

  return {
    colorNumber,
    surfaceArea,
    coats,
    litersNeeded: Math.round(litersNeeded * 10) / 10,
    containersNeeded: containers,
    estimatedCost,
    coverageData: {
      colorNumber,
      productLine,
      finish: sheen,
      coveragePerLiter,
      coveragePerGallon: Math.round(coveragePerLiter * 3.785 * 10.764),
      coatsRecommended: 2,
      dryTime: { touchDry: 1, recoat: 4 },
      voc: vocRange,
    },
  };
}

function calculateOptimalContainers(litersNeeded: number): { size: string; quantity: number }[] {
  // BM container sizes in liters (descending): 5 Gallon, Gallon, Quart, Pint
  const sizes: { name: string; liters: number }[] = [
    { name: '5 Gallon', liters: 18.93 },
    { name: 'Gallon',   liters: 3.79 },
    { name: 'Quart',    liters: 0.94 },
  ];

  const containers: { size: string; quantity: number }[] = [];
  let remaining = litersNeeded;

  for (const s of sizes) {
    if (remaining >= s.liters) {
      const count = Math.floor(remaining / s.liters);
      containers.push({ size: s.name, quantity: count });
      remaining -= count * s.liters;
    }
  }

  // If there's remaining paint, add one more Quart
  if (remaining > 0.01) {
    const existing = containers.find((c) => c.size === 'Quart');
    if (existing) {
      existing.quantity += 1;
    } else {
      containers.push({ size: 'Quart', quantity: 1 });
    }
  }

  return containers;
}

function calculateCost(containers: { size: string; quantity: number }[]): {
  eur: number;
  breakdown: { size: string; unitPrice: number; quantity: number }[];
} {
  let total = 0;
  const breakdown: { size: string; unitPrice: number; quantity: number }[] = [];

  for (const container of containers) {
    const unitPrice = PRICE_LIST[container.size] || 149;
    const subtotal = unitPrice * container.quantity;
    total += subtotal;
    breakdown.push({ size: container.size, unitPrice, quantity: container.quantity });
  }

  return { eur: Math.round(total * 100) / 100, breakdown };
}
