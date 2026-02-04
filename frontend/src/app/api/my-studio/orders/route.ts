import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { verifyIdToken } from '@/lib/auth/jwt-verify';

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-1', credentials: fromIni({ profile: 'bmdecor' }) }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const TABLE = 'BmDecorProducts';

export async function GET(request: NextRequest) {
  let sub: string;
  try {
    const token = request.cookies.get('bmdecor_id_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const payload = await verifyIdToken(token);
    sub = payload.sub;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': `ORDER#USER_${sub}`, ':prefix': 'ORDER#' },
      ScanIndexForward: false,
    }));

    const orders = (result.Items || []).map((item) => ({
      orderId: item.orderId,
      itemCount: item.itemCount,
      subtotalEur: item.subtotalEur,
      status: item.status,
      createdAt: item.createdAt,
      items: item.items || [],
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('My-studio orders GET:', error);
    return NextResponse.json([], { status: 200 });
  }
}
