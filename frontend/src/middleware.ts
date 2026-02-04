import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware — three concerns:
 * 1. Cart session cookie (ensures bmdecor_cart_id exists)
 * 2. Auth route guard for /admin (requires Admin group)
 * 3. Auth route guard for /my-studio (requires any authenticated user)
 */

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const { pathname } = request.nextUrl;

    // 1. Cart cookie
    const existing = request.cookies.get('bmdecor_cart_id');
    if (!existing) {
      const cartId = crypto.randomUUID();
      response.cookies.set('bmdecor_cart_id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }

    // 2. Auth route guards
    const idToken = request.cookies.get('bmdecor_id_token')?.value;
    const payload = idToken ? decodeJwtPayload(idToken) : null;
    const isExpired = payload ? (payload.exp as number) * 1000 < Date.now() : true;
    const groups = (!isExpired && payload?.['cognito:groups']) as string[] | undefined;

    if (pathname.startsWith('/admin')) {
      if (!groups || !groups.includes('Admin')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('authRequired', 'admin');
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith('/my-studio')) {
      if (!groups || groups.length === 0) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('authRequired', 'customer');
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|rooms/).*)'],
};
