import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ faqId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { faqId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FAQ#${faqId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      question: item.question,
      answer: item.answer || '',
      categoryId: item.categoryId || null,
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished ?? false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('FAQ GET:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { faqId } = await params;
    const body = await request.json();

    const updateParams = buildDynamicUpdate(body, [
      'question', 'answer', 'categoryId', 'sortOrder', 'isPublished',
    ]);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FAQ#${faqId}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id: faqId });
  } catch (error) {
    console.error('FAQ PUT:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { faqId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FAQ#${faqId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FAQ DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
