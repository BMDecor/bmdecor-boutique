import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';
import { ulid } from 'ulid';

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'PALETTE' },
    });

    const palettes = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      colors: item.colors || [],
      isPublished: item.isPublished ?? false,
      createdAt: item.createdAt,
    }));

    palettes.sort((a, b) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );
    return NextResponse.json(palettes);
  } catch (error) {
    console.error('Palettes GET:', error);
    return NextResponse.json({ error: 'Failed to fetch palettes' }, { status: 500 });
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
        PK: `PALETTE#${id}`,
        SK: 'METADATA',
        entityType: 'PALETTE',
        id,
        name: body.name,
        description: body.description || '',
        colors: body.colors || [],
        isPublished: body.isPublished ?? false,
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Palettes POST:', error);
    return NextResponse.json({ error: 'Failed to create palette' }, { status: 500 });
  }
}
