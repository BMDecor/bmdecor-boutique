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
      ExpressionAttributeValues: { ':type': 'BANNER' },
    });

    const banners = items.map((item) => ({
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
    }));

    banners.sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number));
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners GET:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
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

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `BANNER#${id}`,
        SK: 'METADATA',
        entityType: 'BANNER',
        id,
        title: body.title || '',
        subtitle: body.subtitle || '',
        imageUrl: body.imageUrl || '',
        linkUrl: body.linkUrl || '',
        linkText: body.linkText || '',
        position: body.position || 'hero',
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Banners POST:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
