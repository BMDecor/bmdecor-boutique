import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { verifyIdToken } from '@/lib/auth/jwt-verify';
import { ulid } from 'ulid';

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
      ExpressionAttributeValues: {
        ':pk': `PROJECT#USER_${sub}`,
        ':prefix': 'PROJECT#',
      },
      ScanIndexForward: false,
    }));

    const projects = (result.Items || []).map((item) => ({
      projectId: item.projectId,
      name: item.name,
      description: item.description,
      colorCount: (item.colors || []).length,
      colors: (item.colors || []).slice(0, 5),
      createdAt: item.createdAt,
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error('My-studio projects GET:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const projectId = ulid();
    const now = new Date().toISOString();

    const item = {
      PK: `PROJECT#USER_${sub}`,
      SK: `PROJECT#${projectId}`,
      entityType: 'USER_PROJECT',
      projectId,
      userId: sub,
      name: name.trim(),
      description: description?.trim() || undefined,
      colors: [],
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: item,
    }));

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('My-studio projects POST:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
