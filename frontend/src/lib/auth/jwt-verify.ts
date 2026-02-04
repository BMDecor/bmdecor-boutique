/**
 * Server-side JWT verification for Cognito tokens.
 * Uses Web Crypto API (crypto.subtle) — no external library needed.
 */

import type { UserGroup } from './types';

const POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
const REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || 'eu-west-1';
const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/jwks.json`;

interface JWK {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg: string;
  use: string;
}

interface JWKSResponse {
  keys: JWK[];
}

interface TokenPayload {
  sub: string;
  email: string;
  'custom:display_name'?: string;
  'cognito:groups'?: string[];
  token_use: string;
  iss: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

let cachedJwks: JWKSResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getJwks(): Promise<JWKSResponse> {
  if (cachedJwks && Date.now() - cacheTimestamp < CACHE_TTL) return cachedJwks;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error('Failed to fetch JWKS');
  cachedJwks = await res.json() as JWKSResponse;
  cacheTimestamp = Date.now();
  return cachedJwks;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function importJwk(jwk: JWK): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: jwk.alg, ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export async function verifyIdToken(token: string): Promise<TokenPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]))) as TokenPayload;

  // Validate claims
  const expectedIss = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`;
  if (payload.iss !== expectedIss) throw new Error('Invalid issuer');
  if (payload.token_use !== 'id') throw new Error('Not an ID token');
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');

  // Verify signature
  const jwks = await getJwks();
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown signing key');

  const key = await importJwk(jwk);
  const signature = base64UrlDecode(parts[2]);
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature as ArrayBufferView<ArrayBuffer>, data as ArrayBufferView<ArrayBuffer>);
  if (!valid) throw new Error('Invalid signature');

  return payload;
}

/** Fast decode without crypto verification — for middleware route guards only. */
export function decodeIdTokenUnsafe(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]))) as TokenPayload;
  } catch {
    return null;
  }
}

export function extractGroups(payload: TokenPayload): UserGroup[] {
  return (payload['cognito:groups'] || []) as UserGroup[];
}

export async function requireGroup(token: string, group: UserGroup): Promise<TokenPayload> {
  const payload = await verifyIdToken(token);
  const groups = extractGroups(payload);
  if (!groups.includes(group)) throw new Error(`User is not in ${group} group`);
  return payload;
}
