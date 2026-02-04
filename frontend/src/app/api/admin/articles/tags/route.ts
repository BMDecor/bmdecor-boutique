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
      ExpressionAttributeValues: { ':type': 'ARTICLE_TAG' },
    });

    const tags = items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    tags.sort((a, b) =>
      (a.name as string).localeCompare(b.name as string)
    );
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Article tags GET:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
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
        PK: `ARTICLE_TAG#${id}`,
        SK: 'METADATA',
        entityType: 'ARTICLE_TAG',
        id,
        name: body.name,
        slug: body.slug || slugify(body.name || ''),
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Article tags POST:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
