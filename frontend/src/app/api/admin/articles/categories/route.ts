import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';
import { ulid } from 'ulid';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'ARTICLE_CATEGORY' },
    });

    const categories = items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      sortOrder: item.sortOrder ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    categories.sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number));
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Article categories GET:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
        PK: `ARTICLE_CATEGORY#${id}`,
        SK: 'METADATA',
        entityType: 'ARTICLE_CATEGORY',
        id,
        name: body.name,
        slug: body.slug || slugify(body.name || ''),
        description: body.description || '',
        sortOrder: body.sortOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Article categories POST:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
