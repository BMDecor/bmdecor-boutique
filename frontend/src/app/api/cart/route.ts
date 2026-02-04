import { NextRequest, NextResponse } from 'next/server';
import { getCart, getCartForUser, addItem } from '@/lib/cart/dynamo-cart';
import { decodeIdTokenUnsafe } from '@/lib/auth/jwt-verify';
import type { AddToCartRequest } from '@/lib/cart/types';

/** Resolve cart: authenticated user → USER cart, otherwise → GUEST cart */
function resolveCart(request: NextRequest): { cartId: string; isGuest: boolean } | null {
  const idToken = request.cookies.get('bmdecor_id_token')?.value;
  if (idToken) {
    const payload = decodeIdTokenUnsafe(idToken);
    if (payload?.sub && payload.exp * 1000 > Date.now()) {
      return { cartId: payload.sub, isGuest: false };
    }
  }
  const guestId = request.cookies.get('bmdecor_cart_id')?.value;
  return guestId ? { cartId: guestId, isGuest: true } : null;
}

/** GET /api/cart — Fetch current cart */
export async function GET(request: NextRequest) {
  const resolved = resolveCart(request);
  if (!resolved) {
    return NextResponse.json({ cartId: '', itemCount: 0, subtotalEur: 0, items: [] });
  }

  try {
    const cart = resolved.isGuest
      ? await getCart(resolved.cartId)
      : await getCartForUser(resolved.cartId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error('CRITICAL CART API ERROR:', error);
    return NextResponse.json({ cartId: '', itemCount: 0, subtotalEur: 0, items: [] }, { status: 200 });
  }
}

/** POST /api/cart — Add item to cart */
export async function POST(request: NextRequest) {
  const resolved = resolveCart(request);
  if (!resolved) {
    return NextResponse.json({ error: 'No cart session. Refresh the page.' }, { status: 400 });
  }

  try {
    const body: AddToCartRequest = await request.json();
    const productType = body.productType || 'paint';

    if (productType === 'paint') {
      if (!body.colorNumber || !body.productLine || !body.sheen || !body.size || !body.quantity) {
        return NextResponse.json(
          { error: 'Missing required paint fields: colorNumber, productLine, sheen, size, quantity' },
          { status: 400 }
        );
      }
    } else if (productType === 'wallpaper') {
      if (!body.wallpaperId || !body.quantity || !body.unitPriceEur) {
        return NextResponse.json(
          { error: 'Missing required wallpaper fields: wallpaperId, quantity, unitPriceEur' },
          { status: 400 }
        );
      }
    } else if (productType === 'accessory') {
      if (!body.accessoryId || !body.quantity || !body.unitPriceEur) {
        return NextResponse.json(
          { error: 'Missing required accessory fields: accessoryId, quantity, unitPriceEur' },
          { status: 400 }
        );
      }
    }

    if (!body.brand || !body.quantity) {
      return NextResponse.json({ error: 'Missing required fields: brand, quantity' }, { status: 400 });
    }

    // For authenticated users, addItem uses guest cart PK by default.
    // We need to use the user PK instead. We pass the resolved ID.
    const cart = await addItem(resolved.cartId, body);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ success: false, cart: { cartId: '', itemCount: 0, subtotalEur: 0, items: [] } }, { status: 200 });
  }
}
