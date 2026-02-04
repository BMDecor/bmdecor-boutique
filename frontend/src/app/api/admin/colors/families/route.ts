import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { ulid } from 'ulid';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI-EntityType',
        KeyConditionExpression: 'entityType = :type',
        ExpressionAttributeValues: { ':type': 'COLOR_FAMILY' },
        ExclusiveStartKey: lastKey,
      }));
      if (result.Items) items.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    const families = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      brand: item.brand || null,
      hexPreview: item.hexPreview || '#CCCCCC',
      sortOrder: item.sortOrder ?? 0,
      productIds: item.productIds || [],
      createdAt: item.createdAt,
    }));

    families.sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number));
    return NextResponse.json(families);
  } catch (error) {
    console.error('Color families GET:', error);
    return NextResponse.json({ error: 'Failed to fetch color families' }, { status: 500 });
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
        PK: `COLOR_FAMILY#${id}`,
        SK: 'METADATA',
        entityType: 'COLOR_FAMILY',
        id,
        name: body.name,
        description: body.description || '',
        brand: body.brand || null,
        hexPreview: body.hexPreview || '#CCCCCC',
        sortOrder: body.sortOrder ?? 0,
        productIds: body.productIds || [],
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Color families POST:', error);
    return NextResponse.json({ error: 'Failed to create color family' }, { status: 500 });
  }
}
