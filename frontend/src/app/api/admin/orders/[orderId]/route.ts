import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { verifyIdToken, extractGroups } from '@/lib/auth/jwt-verify';

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-1', credentials: fromIni({ profile: 'bmdecor' }) }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const TABLE = 'BmDecorProducts';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const token = request.cookies.get('bmdecor_id_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const payload = await verifyIdToken(token);
    if (!extractGroups(payload).includes('Admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { orderId } = await params;
    const { status, userId } = await request.json();

    if (!status || !userId) {
      return NextResponse.json({ error: 'Missing status or userId' }, { status: 400 });
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE,
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
