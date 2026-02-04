import { NextRequest, NextResponse } from 'next/server';
import { decodeIdTokenUnsafe } from '@/lib/auth/jwt-verify';
import { mergeCarts, recalculateUserSession } from '@/lib/cart/dynamo-cart';

export async function POST(request: NextRequest) {
  try {
    const guestCartId = request.cookies.get('bmdecor_cart_id')?.value;
    const idToken = request.cookies.get('bmdecor_id_token')?.value;

    if (!guestCartId || !idToken) {
      return NextResponse.json({ merged: false, reason: 'Missing cart or token' });
    }

    const payload = decodeIdTokenUnsafe(idToken);
    if (!payload?.sub) {
      return NextResponse.json({ merged: false, reason: 'Invalid token' });
    }

    await mergeCarts(guestCartId, payload.sub);
    await recalculateUserSession(payload.sub);

    return NextResponse.json({ merged: true, userId: payload.sub });
  } catch (error) {
    console.error('Cart merge error:', error);
    return NextResponse.json({ merged: false, reason: 'Merge failed' }, { status: 500 });
  }
}
