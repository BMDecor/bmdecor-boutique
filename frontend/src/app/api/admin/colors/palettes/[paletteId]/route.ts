import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';

type Ctx = { params: Promise<{ paletteId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { paletteId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PALETTE#${paletteId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      name: item.name,
      description: item.description || '',
      colors: item.colors || [],
      isPublished: item.isPublished ?? false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Palette GET:', error);
    return NextResponse.json({ error: 'Failed to fetch palette' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { paletteId } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const allowedFields = ['name', 'description', 'colors', 'isPublished'];
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
      Key: { PK: `PALETTE#${paletteId}`, SK: 'METADATA' },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
    }));

    return NextResponse.json({ success: true, id: paletteId });
  } catch (error) {
    console.error('Palette PUT:', error);
    return NextResponse.json({ error: 'Failed to update palette' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { paletteId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PALETTE#${paletteId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Palette DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete palette' }, { status: 500 });
  }
}
