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
 */
export function parseSlug(slug: string): { brand: string; nameSlug: string; codeSlug: string } | null {
  // Expected format: brand-name-words-code-suffix
  // Brand is first segment, code is typically last 1-2 segments
  const parts = slug.split('-');
  if (parts.length < 3) return null;

  const brand = parts[0].toUpperCase();

  // The code is typically at the end (e.g., "oc-65" or "2163-10")
  // Try to find where the code starts by looking for patterns
  // Common BM patterns: OC-65, HC-172, 2163-10, AF-705
  let codeStartIndex = -1;

  for (let i = parts.length - 1; i >= 1; i--) {
    const segment = parts[i];
    const prevSegment = i > 0 ? parts[i - 1] : '';

    // Check if this looks like the end of a code (numeric)
    if (/^\d+$/.test(segment)) {
      // Check if previous segment is a code prefix (letters or numbers)
      if (/^[a-z]+$/.test(prevSegment) || /^\d+$/.test(prevSegment)) {
        codeStartIndex = i - 1;
        break;
      }
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
