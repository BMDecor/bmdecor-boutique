import { NextRequest } from 'next/server';
import { verifyIdToken, extractGroups } from '@/lib/auth/jwt-verify';

/**
 * Verify the request has a valid Admin JWT.
 * Throws if unauthenticated or not in the Admin group.
 */
export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('bmdecor_id_token')?.value;
  if (!token) throw new Error('Not authenticated');
  const payload = await verifyIdToken(token);
  if (!extractGroups(payload).includes('Admin')) throw new Error('Not admin');
  return payload;
}
