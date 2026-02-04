import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { orderId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId query param required' }, { status: 400 });
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ORDER#USER_${userId}`, SK: `ORDER#${orderId}` },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = result.Item;
    return NextResponse.json({
      orderId: item.orderId,
      userId: item.userId,
      email: item.email,
      items: item.items || [],
      subtotalEur: item.subtotalEur,
      taxEur: item.taxEur,
      totalEur: item.totalEur,
      status: item.status,
      shippingMethod: item.shippingMethod,
      shippingAddress: item.shippingAddress || null,
      notes: item.notes || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Admin order GET:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Ctx
) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { orderId } = await params;
    const { status, userId } = await request.json();

    if (!status || !userId) {
      return NextResponse.json({ error: 'Missing status or userId' }, { status: 400 });
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ORDER#USER_${userId}`, SK: `ORDER#${orderId}` },
      UpdateExpression: 'SET #s = :status, updatedAt = :now',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin order PATCH:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
