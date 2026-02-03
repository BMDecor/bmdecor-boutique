import { NextRequest, NextResponse } from 'next/server';
import { getCart, addItem } from '@/lib/cart/dynamo-cart';
import type { AddToCartRequest } from '@/lib/cart/types';

function getCartId(request: NextRequest): string | null {
  return request.cookies.get('bmdecor_cart_id')?.value || null;
}

/** GET /api/cart — Fetch current cart */
export async function GET(request: NextRequest) {
  const cartId = getCartId(request);
  if (!cartId) {
    return NextResponse.json({ cartId: '', itemCount: 0, subtotalEur: 0, items: [] });
  }

  try {
    const cart = await getCart(cartId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/** POST /api/cart — Add item to cart */
export async function POST(request: NextRequest) {
  const cartId = getCartId(request);
  if (!cartId) {
    return NextResponse.json(
      { error: 'No cart session. Refresh the page.' },
      { status: 400 }
    );
  }

  try {
    const body: AddToCartRequest = await request.json();

    if (!body.colorNumber || !body.productLine || !body.sheen || !body.size || !body.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: colorNumber, productLine, sheen, size, quantity' },
        { status: 400 }
      );
    }

    const cart = await addItem(cartId, body);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}
