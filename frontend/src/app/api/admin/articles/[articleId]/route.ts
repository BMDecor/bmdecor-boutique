import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ articleId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { articleId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ARTICLE#${articleId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      title: item.title,
      slug: item.slug,
      content: item.content || '',
      excerpt: item.excerpt || '',
      featuredImage: item.featuredImage || '',
      categoryId: item.categoryId || null,
      tags: item.tags || [],
      status: item.status || 'draft',
      author: item.author || '',
      publishedAt: item.publishedAt || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Article GET:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { articleId } = await params;
    const body = await request.json();

    // Auto-set publishedAt when publishing for the first time
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date().toISOString();
    }

    const updateParams = buildDynamicUpdate(body, [
      'title', 'slug', 'content', 'excerpt', 'featuredImage',
      'categoryId', 'tags', 'status', 'author', 'publishedAt',
    ]);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ARTICLE#${articleId}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id: articleId });
  } catch (error) {
    console.error('Article PUT:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { articleId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ARTICLE#${articleId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Article DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
