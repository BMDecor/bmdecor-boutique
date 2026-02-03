import { NextRequest, NextResponse } from 'next/server';
import { updateItemQuantity, removeItem } from '@/lib/cart/dynamo-cart';

function getCartId(request: NextRequest): string | null {
  return request.cookies.get('bmdecor_cart_id')?.value || null;
}

/** PATCH /api/cart/[itemSk] — Update item quantity */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemSk: string }> }
) {
  const cartId = getCartId(request);
  if (!cartId) {
    return NextResponse.json({ error: 'No cart session' }, { status: 400 });
  }

  try {
    const { itemSk } = await params;
    const sk = decodeURIComponent(itemSk);
    const body = await request.json();
    const quantity = typeof body.quantity === 'number' ? body.quantity : 0;

    const cart = await updateItemQuantity(cartId, sk, quantity);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Cart PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

/** DELETE /api/cart/[itemSk] — Remove item from cart */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemSk: string }> }
) {
  const cartId = getCartId(request);
  if (!cartId) {
    return NextResponse.json({ error: 'No cart session' }, { status: 400 });
  }

  try {
    const { itemSk } = await params;
    const sk = decodeURIComponent(itemSk);

    const cart = await removeItem(cartId, sk);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
