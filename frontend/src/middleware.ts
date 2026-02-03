import { NextRequest, NextResponse } from 'next/server';

/**
 * Cart session middleware — ensures every request has a bmdecor_cart_id cookie.
 * Uses httpOnly cookie with 30-day TTL. Cart ID is a UUID v4 used as
 * DynamoDB PK suffix: CART#GUEST_{uuid}.
 */
export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const existing = request.cookies.get('bmdecor_cart_id');

    if (!existing) {
      const cartId = crypto.randomUUID();
      response.cookies.set('bmdecor_cart_id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch {
    // Never block page load — pass through without cookie
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|rooms/).*)'],
};
