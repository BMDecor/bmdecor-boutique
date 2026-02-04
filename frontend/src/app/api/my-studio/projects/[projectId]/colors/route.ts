import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { verifyIdToken } from '@/lib/auth/jwt-verify';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
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
    const { projectId } = await params;
    const body = await request.json();
    const { brand, colorCode, colorName, hexCode, notes } = body;

    if (!brand || !colorCode || !colorName || !hexCode) {
      return NextResponse.json({ error: 'brand, colorCode, colorName, and hexCode are required' }, { status: 400 });
    }

    // Verify project exists and belongs to user
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
    }));

    if (!existing.Item) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const newColor = { brand, colorCode, colorName, hexCode, notes };

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
      UpdateExpression: 'SET colors = list_append(colors, :newColor), updatedAt = :now',
      ExpressionAttributeValues: {
        ':newColor': [newColor],
        ':now': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    }));

    return NextResponse.json({
      projectId: result.Attributes?.projectId,
      colors: result.Attributes?.colors || [],
      updatedAt: result.Attributes?.updatedAt,
    }, { status: 201 });
  } catch (error) {
    console.error('My-studio project colors POST:', error);
    return NextResponse.json({ error: 'Failed to add color' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
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
    const { projectId } = await params;
    const body = await request.json();
    const { colorCode, brand } = body;

    if (!colorCode || !brand) {
      return NextResponse.json({ error: 'colorCode and brand are required' }, { status: 400 });
    }

    // Get current project to filter colors
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
    }));

    if (!existing.Item) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const currentColors = existing.Item.colors || [];
    const filtered = currentColors.filter(
      (c: { colorCode: string; brand: string }) =>
        !(c.colorCode === colorCode && c.brand === brand)
    );

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
      UpdateExpression: 'SET colors = :filtered, updatedAt = :now',
      ExpressionAttributeValues: {
        ':filtered': filtered,
        ':now': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    }));

    return NextResponse.json({
      projectId: result.Attributes?.projectId,
      colors: result.Attributes?.colors || [],
      updatedAt: result.Attributes?.updatedAt,
    });
  } catch (error) {
    console.error('My-studio project colors DELETE:', error);
    return NextResponse.json({ error: 'Failed to remove color' }, { status: 500 });
  }
}
