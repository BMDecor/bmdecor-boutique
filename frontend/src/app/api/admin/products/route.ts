import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { verifyIdToken, extractGroups } from '@/lib/auth/jwt-verify';

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-1', credentials: fromIni({ profile: 'bmdecor' }) }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const TABLE = 'BmDecorProducts';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('bmdecor_id_token')?.value;
  if (!token) throw new Error('Not authenticated');
  const payload = await verifyIdToken(token);
  if (!extractGroups(payload).includes('Admin')) throw new Error('Not admin');
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE,
        FilterExpression: 'entityType = :type',
        ExpressionAttributeValues: { ':type': 'PRODUCT' },
        ExclusiveStartKey: lastKey,
      }));
      for (const item of result.Items || []) {
        items.push({
          id: item.id,
          brand: item.brand,
          name: item.name,
          colorCode: item.colorCode,
          hexCode: item.hexCode,
          priceEur: item.priceEur ?? 0,
          productType: item.productType || 'paint',
          inStock: item.inStock ?? true,
          finishType: item.finishType,
          volume: item.volume,
          collection: item.collection,
        });
      }
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return NextResponse.json(items);
  } catch (error) {
    console.error('Admin products GET:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
