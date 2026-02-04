import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { buildDynamicUpdate } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ contactId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { contactId } = await params;
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `CONTACT#${contactId}`, SK: 'METADATA' },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      message: item.message || '',
      status: item.status || 'new',
      createdAt: item.createdAt,
    });
  } catch (error) {
    console.error('Contact GET:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { contactId } = await params;
    const body = await request.json();

    const updateParams = buildDynamicUpdate(body, ['status']);

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `CONTACT#${contactId}`, SK: 'METADATA' },
      ...updateParams,
    }));

    return NextResponse.json({ success: true, id: contactId });
  } catch (error) {
    console.error('Contact PUT:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { contactId } = await params;
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `CONTACT#${contactId}`, SK: 'METADATA' },
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
