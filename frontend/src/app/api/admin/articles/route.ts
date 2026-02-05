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
      ExpressionAttributeValues: { ':type': 'ARTICLE' },
    });

    const articles = items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      featuredImage: item.featuredImage || '',
      categoryId: item.categoryId || null,
      relatedBrand: item.relatedBrand || null,
      tags: item.tags || [],
      status: item.status || 'draft',
      author: item.author || '',
      publishedAt: item.publishedAt || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    articles.sort((a, b) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Articles GET:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
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
    const slug = body.slug || slugify(body.title || 'untitled');

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ARTICLE#${id}`,
        SK: 'METADATA',
        entityType: 'ARTICLE',
        id,
        title: body.title || 'Untitled',
        slug,
        content: body.content || '',
        excerpt: body.excerpt || '',
        featuredImage: body.featuredImage || '',
        categoryId: body.categoryId || undefined,
        relatedBrand: body.relatedBrand || undefined,
        tags: body.tags || [],
        status: body.status || 'draft',
        author: body.author || '',
        publishedAt: undefined,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Articles POST:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
