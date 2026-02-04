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
      ExpressionAttributeValues: { ':type': 'FAQ' },
    });

    const faqs = items.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer || '',
      categoryId: item.categoryId || null,
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished ?? false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    faqs.sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number));
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('FAQs GET:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
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
        PK: `FAQ#${id}`,
        SK: 'METADATA',
        entityType: 'FAQ',
        id,
        question: body.question || '',
        answer: body.answer || '',
        categoryId: body.categoryId || undefined,
        sortOrder: body.sortOrder ?? 0,
        isPublished: body.isPublished ?? false,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('FAQs POST:', msg, error);
    return NextResponse.json({ error: `Failed to create FAQ: ${msg}` }, { status: 500 });
  }
}
