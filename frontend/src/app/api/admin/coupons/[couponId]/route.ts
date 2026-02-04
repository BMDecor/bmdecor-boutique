import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ couponId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { couponId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `COUPON#${couponId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      code: item.code,
      discountType: item.discountType || 'percentage',
      discountValue: item.discountValue ?? 0,
      minOrderEur: item.minOrderEur ?? 0,
      maxUses: item.maxUses ?? 0,
      usedCount: item.usedCount ?? 0,
      validFrom: item.validFrom || null,
      validUntil: item.validUntil || null,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Coupon GET:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { couponId } = await params;
    const body = await request.json();

    if (body.code !== undefined) {
      body.code = body.code.toUpperCase().trim();
    }

    const updateParams = buildDynamicUpdate(body, [
      'code', 'discountType', 'discountValue', 'minOrderEur',
      'maxUses', 'validFrom', 'validUntil', 'isActive',
    ]);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `COUPON#${couponId}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id: couponId });
  } catch (error) {
    console.error('Coupon PUT:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { couponId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `COUPON#${couponId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupon DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
