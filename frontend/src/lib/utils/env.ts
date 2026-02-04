/**
 * Environment utilities for consistent URL handling across the app.
 */

/**
 * Base URL for the site. Used for canonical tags, sitemaps, and absolute URLs.
 * Falls back to localhost in development.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

/**
 * Construct an absolute URL from a relative path.
 */
export function absoluteUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}
