import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';
import { ulid } from 'ulid';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'COUPON' },
    });

    const coupons = items.map((item) => ({
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
    }));

    coupons.sort((a, b) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Coupons GET:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = ulid();
    const now = new Date().toISOString();
    const code = (body.code || '').toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Check uniqueness
    const existing = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'COUPON' },
    });
    if (existing.some((c) => (c.code as string).toUpperCase() === code)) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
    }

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `COUPON#${id}`,
        SK: 'METADATA',
        entityType: 'COUPON',
        id,
        code,
        discountType: body.discountType || 'percentage',
        discountValue: body.discountValue ?? 10,
        minOrderEur: body.minOrderEur ?? 0,
        maxUses: body.maxUses ?? 0,
        usedCount: 0,
        validFrom: body.validFrom || null,
        validUntil: body.validUntil || null,
        isActive: body.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Coupons POST:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
