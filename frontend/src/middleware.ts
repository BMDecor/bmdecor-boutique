import { NextRequest, NextResponse } from 'next/server';
import {
  evaluatePrelaunch,
  PRELAUNCH_BYPASS_COOKIE,
  PRELAUNCH_BYPASS_COOKIE_MAX_AGE,
} from '@/lib/prelaunch';

/**
 * Middleware — four concerns:
 * 1. Pre-launch gate (see lib/prelaunch.ts). While PRELAUNCH_MODE is enabled,
 *    non-authorised visitors to the Next.js app are shown /coming-soon.
 * 2. Cart session cookie (ensures bmdecor_cart_id exists)
 * 3. Auth route guard for /admin (requires Admin group)
 * 4. Auth route guard for /my-studio (requires any authenticated user)
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

    // Decode Cognito JWT once — used by both the pre-launch gate and the
    // route guards below.
    const idToken = request.cookies.get('bmdecor_id_token')?.value;
    const payload = idToken ? decodeJwtPayload(idToken) : null;
    const isExpired = payload ? (payload.exp as number) * 1000 < Date.now() : true;
    const groups = (!isExpired && payload?.['cognito:groups']) as string[] | undefined;
    const isCognitoAdmin = Array.isArray(groups) && groups.includes('Admin');

    // 1. Pre-launch gate — keep the preview subdomain private until launch.
    //    Skip: API routes (handle their own auth), static assets, and the
    //    coming-soon route itself. Everything else is gated when enabled.
    const isGateExempt =
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname === '/coming-soon' ||
      pathname === '/favicon.ico' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml';

    if (!isGateExempt) {
      const decision = evaluatePrelaunch(
        {
          cookies: request.cookies,
          searchParam: (name) => request.nextUrl.searchParams.get(name),
        },
        isCognitoAdmin
      );

      // While the gate is active (even when a visitor is bypassed) prevent
      // search engines from indexing the preview URL.
      if (process.env.PRELAUNCH_MODE?.toLowerCase() === 'true') {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      }

      if (decision.blocked) {
        const url = request.nextUrl.clone();
        url.pathname = '/coming-soon';
        url.search = ''; // drop query params when redirecting
        const rewriteResp = NextResponse.rewrite(url);
        rewriteResp.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return rewriteResp;
      }

      if (decision.setBypassCookie) {
        // Token matched — remember this visitor so they don't need the
        // parameter again. Also strip the token from the URL so it isn't
        // bookmarked or shared accidentally.
        const clean = request.nextUrl.clone();
        clean.searchParams.delete('preview');
        const redirectResp = NextResponse.redirect(clean);
        redirectResp.cookies.set(PRELAUNCH_BYPASS_COOKIE, '1', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: PRELAUNCH_BYPASS_COOKIE_MAX_AGE,
          path: '/',
        });
        return redirectResp;
      }
    }

    // 2. Cart cookie
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

    // Admin page guard (not API routes - those handle their own auth)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
      if (!groups || !groups.includes('Admin')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('authRequired', 'admin');
        return NextResponse.redirect(url);
      }
    }

    // API admin routes - let them through, they handle their own auth via requireAdmin()
    if (pathname.startsWith('/api/admin')) {
      return response;
    }

    if (pathname.startsWith('/my-studio')) {
      if (!payload || isExpired) {
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
