/**
 * Slug utilities for SEO-friendly product URLs.
 *
 * Format: {brand}-{name}-{code} (kebab-case)
 * Example: bm-chantilly-lace-oc-65
 */

export interface SlugProduct {
  brand: string;
  name: string;
  colorCode: string;
}

/**
 * Create a URL-safe slug from a product.
 * Format: brand-name-code (all lowercase, kebab-case)
 */
export function createSlug(product: SlugProduct): string {
  const brand = product.brand.toLowerCase();
  const name = slugify(product.name);
  const code = slugify(product.colorCode);

  return `${brand}-${name}-${code}`;
}

/**
 * Parse a slug back into its components.
 * Returns null if the slug format is invalid.
 *
 * Handles multiple code formats:
 * - BM: oc-65, hc-172, 2163-10, af-705 (two segments)
 * - FB: no9908, no2005 (single alphanumeric segment like "No.9908")
 * - LG: numeric codes like 113, 50 (single numeric segment)
 */
export function parseSlug(slug: string): { brand: string; nameSlug: string; codeSlug: string } | null {
  const parts = slug.split('-');
  if (parts.length < 3) return null;

  const brand = parts[0].toUpperCase();
  let codeStartIndex = -1;

  // Pattern 1: Two-segment codes like "oc-65", "hc-172", "2163-10"
  // Look for numeric final segment preceded by letter/number prefix
  for (let i = parts.length - 1; i >= 2; i--) {
    const segment = parts[i];
    const prevSegment = parts[i - 1];

    if (/^\d+$/.test(segment)) {
      // Previous segment is letters (oc, hc, af) or numbers (2163)
      if (/^[a-z]+$/.test(prevSegment) || /^\d+$/.test(prevSegment)) {
        codeStartIndex = i - 1;
        break;
      }
    }
  }

  // Pattern 2: Single alphanumeric segment like "no9908" (FB codes: No.9908)
  // Format: letters followed by numbers
  if (codeStartIndex === -1) {
    const lastPart = parts[parts.length - 1];
    if (/^[a-z]+\d+$/.test(lastPart)) {
      codeStartIndex = parts.length - 1;
    }
  }

  // Pattern 3: Single numeric segment like "113" or "50" (LG codes)
  if (codeStartIndex === -1) {
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart) && parts.length >= 3) {
      codeStartIndex = parts.length - 1;
    }
  }

  // Fallback: assume last two segments are the code
  if (codeStartIndex === -1) {
    codeStartIndex = Math.max(1, parts.length - 2);
  }

  const nameSlug = parts.slice(1, codeStartIndex).join('-');
  const codeSlug = parts.slice(codeStartIndex).join('-');

  return { brand, nameSlug, codeSlug };
}

/**
 * Convert a string to a URL-safe slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')  // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Trim leading/trailing hyphens
}
