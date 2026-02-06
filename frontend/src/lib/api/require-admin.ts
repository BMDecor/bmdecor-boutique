import { NextRequest } from 'next/server';
import { verifyIdToken, extractGroups } from '@/lib/auth/jwt-verify';

/**
 * Verify the request has a valid Admin JWT or API key.
 * Throws if unauthenticated or not authorized.
 *
 * Supports two authentication methods:
 * 1. Cognito JWT via cookie (for browser sessions)
 * 2. Admin API Key via X-Admin-Key header (for scripts/curl)
 */
export async function requireAdmin(request: NextRequest) {
  // Method 1: Check for API key header (for admin scripts)
  const apiKey = request.headers.get('X-Admin-Key');
  const expectedKey = process.env.ADMIN_API_KEY;

  if (apiKey && expectedKey && apiKey === expectedKey) {
    return { sub: 'api-key-admin', groups: ['Admin'] };
  }

  // Method 2: Check for Cognito JWT cookie (for browser sessions)
  const token = request.cookies.get('bmdecor_id_token')?.value;
  if (!token) throw new Error('Not authenticated');
  const payload = await verifyIdToken(token);
  if (!extractGroups(payload).includes('Admin')) throw new Error('Not admin');
  return payload;
}
