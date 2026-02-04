import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'ORDER' },
      ScanIndexForward: false,
    }));

    const orders = (result.Items || []).map((item) => ({
      orderId: item.orderId,
      userId: item.userId,
      email: item.email,
      itemCount: item.itemCount,
      subtotalEur: item.subtotalEur,
      status: item.status,
      shippingMethod: item.shippingMethod,
      createdAt: item.createdAt,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Admin orders GET:', error);
    return NextResponse.json([], { status: 200 });
  }
}
