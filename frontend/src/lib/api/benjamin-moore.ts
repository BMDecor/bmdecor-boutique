/**
 * Benjamin Moore API Integration Service
 *
 * Provides access to:
 * - Visualizer Tool: Room scene images for colors
 * - Color Discovery: Complementary color suggestions
 * - Official Calculator: Technical-grade coverage data
 */

// Types
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
  type: 'complementary' | 'analogous' | 'triadic' | 'monochromatic';
  colors: BMColor[];
}

export interface CoverageData {
  colorNumber: string;
  productLine: string;
  finish: string;
  coveragePerLiter: number; // m² per liter
  coveragePerGallon: number; // sq ft per gallon
  coatsRecommended: number;
  dryTime: {
    touchDry: number; // hours
    recoat: number; // hours
  };
  voc: number; // g/L
}

export interface CalculatorResult {
  colorNumber: string;
  surfaceArea: number;
  coats: number;
  litersNeeded: number;
  containersNeeded: {
    size: string;
    quantity: number;
  }[];
  estimatedCost: {
    eur: number;
    breakdown: { size: string; unitPrice: number; quantity: number }[];
  };
  coverageData: CoverageData;
}

// API Configuration
const BM_API_CONFIG = {
  baseUrl: 'https://api.benjaminmoore.com',
  visualizerEndpoint: '/v1/visualizer',
  discoveryEndpoint: '/v1/colors/discover',
  calculatorEndpoint: '/v1/calculator',
};

// Simulated room scene images (would come from BM API in production)
const ROOM_SCENE_TEMPLATES: Record<string, Omit<RoomScene, 'imageUrl'>[]> = {
  default: [
    { id: 'living-1', name: 'Modern Living Room', roomType: 'living-room' },
    { id: 'bedroom-1', name: 'Serene Bedroom', roomType: 'bedroom' },
    { id: 'kitchen-1', name: 'Contemporary Kitchen', roomType: 'kitchen' },
    { id: 'bathroom-1', name: 'Spa Bathroom', roomType: 'bathroom' },
    { id: 'dining-1', name: 'Elegant Dining Room', roomType: 'dining-room' },
    { id: 'office-1', name: 'Home Office', roomType: 'office' },
  ],
};

// Coverage data by product line
const COVERAGE_DATA: Record<string, Partial<CoverageData>> = {
  'Aura': {
    coveragePerLiter: 14,
    coveragePerGallon: 400,
    coatsRecommended: 2,
    dryTime: { touchDry: 1, recoat: 4 },
    voc: 50,
  },
  'Regal Select': {
    coveragePerLiter: 12,
    coveragePerGallon: 350,
    coatsRecommended: 2,
    dryTime: { touchDry: 1, recoat: 4 },
    voc: 50,
  },
  'ben': {
    coveragePerLiter: 11,
    coveragePerGallon: 325,
    coatsRecommended: 2,
    dryTime: { touchDry: 1, recoat: 4 },
    voc: 100,
  },
};

// Price list (EUR, IVA included)
const PRICE_LIST = {
  '750ml': 28.0,
  '1L': 36.0,
  '2.5L': 68.0,
  '5L': 125.0,
};

/**
 * Benjamin Moore Visualizer Tool
 * Returns room scene images with the selected color applied
 */
export async function getVisualizerScenes(
  colorNumber: string,
  hexCode: string
): Promise<RoomScene[]> {
  // In production, this would call the BM API:
  // const response = await fetch(`${BM_API_CONFIG.baseUrl}${BM_API_CONFIG.visualizerEndpoint}`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ colorNumber, scenes: ['living-room', 'bedroom', 'kitchen'] })
  // });

  // Simulated response with color-tinted placeholder images
  const scenes = ROOM_SCENE_TEMPLATES.default.map((scene) => ({
    ...scene,
    // Generate a placeholder with the color
    imageUrl: generateVisualizerPlaceholder(hexCode, scene.roomType),
  }));

  return scenes;
}

/**
 * Generate a placeholder visualizer image URL
 * In production, this comes from the BM Visualizer API
 */
function generateVisualizerPlaceholder(hexCode: string, roomType: string): string {
  const color = hexCode.replace('#', '');
  // Using a placeholder service that can apply color overlays
  // In production, this would be actual rendered room images from BM
  return `https://placehold.co/600x400/${color}/ffffff?text=${encodeURIComponent(roomType.replace('-', ' '))}`;
}

/**
 * Benjamin Moore Color Discovery API
 * Returns complementary, analogous, and related colors
 */
export async function discoverComplementaryColors(
  colorNumber: string,
  hexCode: string
): Promise<ComplementaryResult[]> {
  // In production, this would call the BM Color Discovery API
  // which returns curated color palettes based on color theory

  const rgb = hexToRgb(hexCode);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Generate color theory based palettes
  const results: ComplementaryResult[] = [
    {
      type: 'complementary',
      colors: generateComplementaryColors(hsl, hexCode),
    },
    {
      type: 'analogous',
      colors: generateAnalogousColors(hsl, hexCode),
    },
    {
      type: 'triadic',
      colors: generateTriadicColors(hsl, hexCode),
    },
    {
      type: 'monochromatic',
      colors: generateMonochromaticColors(hsl, hexCode),
    },
  ];

  return results;
}

/**
 * Official Benjamin Moore Calculator
 * Provides technical-grade coverage data and recommendations
 */
export async function calculatePaintNeeds(
  colorNumber: string,
  surfaceArea: number,
  coats: number = 2,
  productLine: string = 'Regal Select',
  finish: string = 'Matte'
): Promise<CalculatorResult> {
  // In production, this would call the BM Calculator API
  // which provides accurate coverage data for each product

  const coverage = COVERAGE_DATA[productLine] || COVERAGE_DATA['Regal Select'];
  const coveragePerLiter = coverage.coveragePerLiter || 12;

  // Calculate liters needed
  const litersNeeded = (surfaceArea * coats) / coveragePerLiter;

  // Determine optimal container sizes
  const containers = calculateOptimalContainers(litersNeeded);

  // Calculate cost
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
      finish,
      coveragePerLiter,
      coveragePerGallon: coverage.coveragePerGallon || 350,
      coatsRecommended: coverage.coatsRecommended || 2,
      dryTime: coverage.dryTime || { touchDry: 1, recoat: 4 },
      voc: coverage.voc || 50,
    },
  };
}

/**
 * Calculate optimal container combination
 */
function calculateOptimalContainers(litersNeeded: number): { size: string; quantity: number }[] {
  const containers: { size: string; quantity: number }[] = [];
  let remaining = litersNeeded;

  // Try to use larger containers first for better value
  if (remaining >= 5) {
    const count = Math.floor(remaining / 5);
    containers.push({ size: '5L', quantity: count });
    remaining -= count * 5;
  }

  if (remaining >= 2.5) {
    const count = Math.floor(remaining / 2.5);
    containers.push({ size: '2.5L', quantity: count });
    remaining -= count * 2.5;
  }

  // Round up for remaining
  if (remaining > 0) {
    if (remaining <= 1) {
      containers.push({ size: '1L', quantity: 1 });
    } else {
      containers.push({ size: '2.5L', quantity: 1 });
    }
  }

  return containers;
}

/**
 * Calculate total cost
 */
function calculateCost(containers: { size: string; quantity: number }[]): {
  eur: number;
  breakdown: { size: string; unitPrice: number; quantity: number }[];
} {
  let total = 0;
  const breakdown: { size: string; unitPrice: number; quantity: number }[] = [];

  for (const container of containers) {
    const unitPrice = PRICE_LIST[container.size as keyof typeof PRICE_LIST] || 68;
    const subtotal = unitPrice * container.quantity;
    total += subtotal;
    breakdown.push({
      size: container.size,
      unitPrice,
      quantity: container.quantity,
    });
  }

  return { eur: Math.round(total * 100) / 100, breakdown };
}

// Color theory helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function generateComplementaryColors(hsl: { h: number; s: number; l: number }, _originalHex: string): BMColor[] {
  // Complementary is 180° opposite on the color wheel
  const compH = (hsl.h + 180) % 360;

  return [
    {
      colorNumber: 'COMP-1',
      colorName: 'Complementary Primary',
      hex: hslToHex(compH, hsl.s, hsl.l),
      rgb: hexToRgb(hslToHex(compH, hsl.s, hsl.l)),
    },
    {
      colorNumber: 'COMP-2',
      colorName: 'Complementary Light',
      hex: hslToHex(compH, hsl.s * 0.8, Math.min(hsl.l + 15, 95)),
      rgb: hexToRgb(hslToHex(compH, hsl.s * 0.8, Math.min(hsl.l + 15, 95))),
    },
    {
      colorNumber: 'COMP-3',
      colorName: 'Complementary Dark',
      hex: hslToHex(compH, hsl.s * 0.9, Math.max(hsl.l - 15, 10)),
      rgb: hexToRgb(hslToHex(compH, hsl.s * 0.9, Math.max(hsl.l - 15, 10))),
    },
  ];
}

function generateAnalogousColors(hsl: { h: number; s: number; l: number }, _originalHex: string): BMColor[] {
  // Analogous colors are 30° apart on the color wheel
  return [
    {
      colorNumber: 'ANALOG-1',
      colorName: 'Analogous Left',
      hex: hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      rgb: hexToRgb(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)),
    },
    {
      colorNumber: 'ANALOG-2',
      colorName: 'Analogous Right',
      hex: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      rgb: hexToRgb(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)),
    },
    {
      colorNumber: 'ANALOG-3',
      colorName: 'Analogous Far',
      hex: hslToHex((hsl.h + 60) % 360, hsl.s * 0.9, hsl.l),
      rgb: hexToRgb(hslToHex((hsl.h + 60) % 360, hsl.s * 0.9, hsl.l)),
    },
  ];
}

function generateTriadicColors(hsl: { h: number; s: number; l: number }, _originalHex: string): BMColor[] {
  // Triadic colors are 120° apart on the color wheel
  return [
    {
      colorNumber: 'TRIAD-1',
      colorName: 'Triadic First',
      hex: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      rgb: hexToRgb(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l)),
    },
    {
      colorNumber: 'TRIAD-2',
      colorName: 'Triadic Second',
      hex: hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
      rgb: hexToRgb(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)),
    },
  ];
}

function generateMonochromaticColors(hsl: { h: number; s: number; l: number }, _originalHex: string): BMColor[] {
  // Monochromatic uses same hue with different saturation/lightness
  return [
    {
      colorNumber: 'MONO-1',
      colorName: 'Lighter Shade',
      hex: hslToHex(hsl.h, hsl.s * 0.7, Math.min(hsl.l + 20, 95)),
      rgb: hexToRgb(hslToHex(hsl.h, hsl.s * 0.7, Math.min(hsl.l + 20, 95))),
    },
    {
      colorNumber: 'MONO-2',
      colorName: 'Darker Shade',
      hex: hslToHex(hsl.h, hsl.s * 1.1, Math.max(hsl.l - 20, 10)),
      rgb: hexToRgb(hslToHex(hsl.h, hsl.s * 1.1, Math.max(hsl.l - 20, 10))),
    },
    {
      colorNumber: 'MONO-3',
      colorName: 'Muted Shade',
      hex: hslToHex(hsl.h, hsl.s * 0.5, hsl.l),
      rgb: hexToRgb(hslToHex(hsl.h, hsl.s * 0.5, hsl.l)),
    },
  ];
}
