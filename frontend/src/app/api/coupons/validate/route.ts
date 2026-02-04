import { NextRequest, NextResponse } from 'next/server';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body.code || '').toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ valid: false, reason: 'No code provided' });
    }

    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'COUPON' },
    });

    const coupon = items.find((c) => (c.code as string).toUpperCase() === code);

    if (!coupon) {
      return NextResponse.json({ valid: false, reason: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, reason: 'Coupon is no longer active' });
    }

    const now = new Date();

    if (coupon.validFrom) {
      const from = new Date(coupon.validFrom as string);
      if (now < from) {
        return NextResponse.json({ valid: false, reason: 'Coupon is not yet valid' });
      }
    }

    if (coupon.validUntil) {
      const until = new Date(coupon.validUntil as string);
      if (now > until) {
        return NextResponse.json({ valid: false, reason: 'Coupon has expired' });
      }
    }

    const maxUses = (coupon.maxUses as number) ?? 0;
    const usedCount = (coupon.usedCount as number) ?? 0;
    if (maxUses > 0 && usedCount >= maxUses) {
      return NextResponse.json({ valid: false, reason: 'Coupon usage limit reached' });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderEur: coupon.minOrderEur ?? 0,
    });
  } catch (error) {
    console.error('Coupon validate:', error);
    return NextResponse.json({ valid: false, reason: 'Validation error' });
  }
}
