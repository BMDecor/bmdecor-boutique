import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { ulid } from 'ulid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 },
      );
    }

    const id = ulid();
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `CONTACT#${id}`,
        SK: 'METADATA',
        entityType: 'CONTACT',
        id,
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        message: body.message,
        status: 'new',
        createdAt: now,
        updatedAt: now,
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact POST:', error);
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }
}
