import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${id}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
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
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Admin product GET:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updateParams = buildDynamicUpdate(body, [
      'brand', 'name', 'colorCode', 'hexCode', 'priceEur', 'finishType',
      'volume', 'collection', 'productType', 'description', 'coverageRate',
      'inStock',
    ]);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${id}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin product PUT:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${id}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin product DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
