import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromIni } from '@aws-sdk/credential-providers';
import { verifyIdToken } from '@/lib/auth/jwt-verify';

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-1', credentials: fromIni({ profile: 'bmdecor' }) }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'eu-west-1',
  credentials: fromIni({ profile: 'bmdecor' }),
});

const TABLE = 'BmDecorProducts';
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;

async function queryAllItems(pk: string, skPrefix: string) {
  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': pk, ':prefix': skPrefix },
      ExclusiveStartKey: lastKey,
    }));
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function batchDelete(items: { PK: string; SK: string }[]) {
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TABLE]: batch.map((key) => ({
          DeleteRequest: { Key: { PK: key.PK, SK: key.SK } },
        })),
      },
    }));
  }
}

export async function DELETE(request: NextRequest) {
  let sub: string;
  let username: string;
  try {
    const token = request.cookies.get('bmdecor_id_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const payload = await verifyIdToken(token);
    sub = payload.sub;
    username = (payload['cognito:username'] as string) || sub;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const now = new Date().toISOString();

    // 1. Anonymize orders (preserve for tax auditing)
    const orders = await queryAllItems(`ORDER#USER_${sub}`, 'ORDER#');
    for (const order of orders) {
      await docClient.send(new UpdateCommand({
        TableName: TABLE,
        Key: { PK: order.PK as string, SK: order.SK as string },
        UpdateExpression: 'SET #name = :rName, email = :rEmail, shippingAddress = :rAddr, updatedAt = :now, gdprErasedAt = :now',
        ExpressionAttributeNames: { '#name': 'customerName' },
        ExpressionAttributeValues: {
          ':rName': 'Redacted User',
          ':rEmail': 'redacted@deleted.bmdecor',
          ':rAddr': 'REDACTED (GDPR Erasure)',
          ':now': now,
        },
      }));
    }

    // 2. Delete all projects
    const projects = await queryAllItems(`PROJECT#USER_${sub}`, 'PROJECT#');
    if (projects.length > 0) {
      await batchDelete(projects.map((p) => ({ PK: p.PK as string, SK: p.SK as string })));
    }

    // 3. Delete cart data
    const cartItems = await queryAllItems(`CART#USER_${sub}`, '');
    if (cartItems.length > 0) {
      await batchDelete(cartItems.map((c) => ({ PK: c.PK as string, SK: c.SK as string })));
    }

    // 4. Delete Cognito user
    await cognitoClient.send(new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    }));

    // 5. Clear cookies
    const response = NextResponse.json({ success: true, message: 'Account deleted and data erased per GDPR Article 17' });
    response.cookies.set('bmdecor_id_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('bmdecor_access_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('bmdecor_refresh_token', '', { maxAge: 0, path: '/' });

    console.log(`GDPR erasure completed for user ${sub} at ${now}`);
    return response;
  } catch (error) {
    console.error('GDPR erasure failed:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
