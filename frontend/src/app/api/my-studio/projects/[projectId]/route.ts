import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { verifyIdToken } from '@/lib/auth/jwt-verify';

export async function GET(
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

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      projectId: result.Item.projectId,
      name: result.Item.name,
      description: result.Item.description,
      colors: result.Item.colors || [],
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt,
    });
  } catch (error) {
    console.error('My-studio project GET:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(
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
    const { name, description } = body;

    const expressionParts: string[] = ['#updatedAt = :updatedAt'];
    const expressionNames: Record<string, string> = { '#updatedAt': 'updatedAt' };
    const expressionValues: Record<string, string> = {
      ':updatedAt': new Date().toISOString(),
    };

    if (name !== undefined) {
      expressionParts.push('#name = :name');
      expressionNames['#name'] = 'name';
      expressionValues[':name'] = name.trim();
    }

    if (description !== undefined) {
      expressionParts.push('#description = :description');
      expressionNames['#description'] = 'description';
      expressionValues[':description'] = description.trim();
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW',
    }));

    return NextResponse.json({
      projectId: result.Attributes?.projectId,
      name: result.Attributes?.name,
      description: result.Attributes?.description,
      colors: result.Attributes?.colors || [],
      createdAt: result.Attributes?.createdAt,
      updatedAt: result.Attributes?.updatedAt,
    });
  } catch (error) {
    console.error('My-studio project PUT:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
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

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `PROJECT#USER_${sub}`,
        SK: `PROJECT#${projectId}`,
      },
    }));

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('My-studio project DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
