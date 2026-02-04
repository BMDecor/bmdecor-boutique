import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ bannerId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { bannerId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `BANNER#${bannerId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      title: item.title || '',
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      linkText: item.linkText || '',
      position: item.position || 'hero',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Banner GET:', error);
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { bannerId } = await params;
    const body = await request.json();

    const updateParams = buildDynamicUpdate(body, [
      'title', 'subtitle', 'imageUrl', 'linkUrl', 'linkText',
      'position', 'sortOrder', 'isActive',
    ]);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `BANNER#${bannerId}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id: bannerId });
  } catch (error) {
    console.error('Banner PUT:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { bannerId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `BANNER#${bannerId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Banner DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
