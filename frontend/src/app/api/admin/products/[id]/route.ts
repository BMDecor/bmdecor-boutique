import { NextRequest, NextResponse } from 'next/server';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { verifyIdToken, extractGroups } from '@/lib/auth/jwt-verify';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('bmdecor_id_token')?.value;
  if (!token) throw new Error('Not authenticated');
  const payload = await verifyIdToken(token);
  if (!extractGroups(payload).includes('Admin')) throw new Error('Not admin');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const updates: string[] = ['updatedAt = :now'];
    const values: Record<string, unknown> = { ':now': now };

    if (body.priceEur !== undefined) {
      updates.push('priceEur = :price');
      values[':price'] = body.priceEur;
    }
    if (body.inStock !== undefined) {
      updates.push('inStock = :stock');
      values[':stock'] = body.inStock;
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PRODUCT#${id}`, SK: 'METADATA' },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
    }));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin product PUT:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
