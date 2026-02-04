import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ categoryId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { categoryId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FAQ_CATEGORY#${categoryId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      name: item.name,
      slug: item.slug,
      sortOrder: item.sortOrder ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('FAQ Category GET:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { categoryId } = await params;
    const body = await request.json();

    const updateParams = buildDynamicUpdate(body, [
      'name', 'slug', 'sortOrder',
    ]);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FAQ_CATEGORY#${categoryId}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id: categoryId });
  } catch (error) {
    console.error('FAQ Category PUT:', error);
    return NextResponse.json({ error: 'Failed to update FAQ category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { categoryId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FAQ_CATEGORY#${categoryId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FAQ Category DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ category' }, { status: 500 });
  }
}
