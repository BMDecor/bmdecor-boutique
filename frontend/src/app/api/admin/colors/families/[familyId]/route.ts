import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';

type Ctx = { params: Promise<{ familyId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { familyId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `COLOR_FAMILY#${familyId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      name: item.name,
      description: item.description || '',
      brand: item.brand || null,
      hexPreview: item.hexPreview || '#CCCCCC',
      sortOrder: item.sortOrder ?? 0,
      productIds: item.productIds || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Color family GET:', error);
    return NextResponse.json({ error: 'Failed to fetch color family' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { familyId } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const allowedFields = ['name', 'description', 'brand', 'hexPreview', 'sortOrder', 'productIds'];
    const updates: string[] = ['updatedAt = :now'];
    const values: Record<string, unknown> = { ':now': now };
    const names: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        names[`#${field}`] = field;
        updates.push(`#${field} = :${field}`);
        values[`:${field}`] = body[field];
      }
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `COLOR_FAMILY#${familyId}`, SK: 'METADATA' },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
    }));

    return NextResponse.json({ success: true, id: familyId });
  } catch (error) {
    console.error('Color family PUT:', error);
    return NextResponse.json({ error: 'Failed to update color family' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { familyId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `COLOR_FAMILY#${familyId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Color family DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete color family' }, { status: 500 });
  }
}
