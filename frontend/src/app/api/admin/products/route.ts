import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedScan } from '@/lib/aws/dynamo-helpers';
import { ulid } from 'ulid';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await paginatedScan({
      FilterExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'PRODUCT' },
    });

    const products = items.map((item) => ({
      id: item.id,
      brand: item.brand,
      name: item.name,
      colorCode: item.colorCode,
      hexCode: item.hexCode,
      priceEur: item.priceEur ?? 0,
      productType: item.productType || 'paint',
      inStock: item.inStock ?? true,
      finishType: item.finishType,
      volume: item.volume,
      collection: item.collection,
      description: item.description,
      coverageRate: item.coverageRate,
      createdAt: item.createdAt,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Admin products GET:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = body.id || ulid();
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `PRODUCT#${id}`,
        SK: 'METADATA',
        entityType: 'PRODUCT',
        id,
        brand: body.brand,
        name: body.name,
        colorCode: body.colorCode || '',
        hexCode: body.hexCode || '#CCCCCC',
        priceEur: body.priceEur ?? 0,
        finishType: body.finishType || '',
        volume: body.volume || '',
        collection: body.collection || '',
        productType: body.productType || 'paint',
        description: body.description || '',
        coverageRate: body.coverageRate ?? null,
        inStock: body.inStock ?? true,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin products POST:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
