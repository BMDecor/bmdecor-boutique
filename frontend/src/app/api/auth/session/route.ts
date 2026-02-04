import { NextRequest, NextResponse } from 'next/server';
import { decodeIdTokenUnsafe, extractGroups } from '@/lib/auth/jwt-verify';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(request: NextRequest) {
  try {
    const { idToken, accessToken, refreshToken } = await request.json();
    if (!idToken || !accessToken) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('bmdecor_id_token', idToken, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60, // 1 hour
    });
    response.cookies.set('bmdecor_access_token', accessToken, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60,
    });
    if (refreshToken) {
      response.cookies.set('bmdecor_refresh_token', refreshToken, {
        ...COOKIE_OPTS,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get('bmdecor_id_token')?.value;
  if (!idToken) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const payload = decodeIdTokenUnsafe(idToken);
  if (!payload || payload.exp * 1000 < Date.now()) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const groups = extractGroups(payload);
  return NextResponse.json({
    authenticated: true,
    user: {
      sub: payload.sub,
      email: payload.email,
      displayName: (payload['custom:display_name'] as string) || payload.email?.split('@')[0] || '',
      groups,
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('bmdecor_id_token', '', { ...COOKIE_OPTS, maxAge: 0 });
  response.cookies.set('bmdecor_access_token', '', { ...COOKIE_OPTS, maxAge: 0 });
  response.cookies.set('bmdecor_refresh_token', '', { ...COOKIE_OPTS, maxAge: 0 });
  return response;
}
