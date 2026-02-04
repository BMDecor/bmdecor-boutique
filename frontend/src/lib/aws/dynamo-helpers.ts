import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { ScanCommandInput, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo-client';

/**
 * Build a dynamic DynamoDB UpdateExpression from a request body and allowed field list.
 * Always includes `updatedAt = :now`.
 */
export function buildDynamicUpdate(
  body: Record<string, unknown>,
  allowedFields: string[],
) {
  const now = new Date().toISOString();
  const updates: string[] = ['updatedAt = :now'];
  const values: Record<string, unknown> = { ':now': now };
  const names: Record<string, string> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      names[`#${field}`] = field;
      updates.push(`#${field} = :${field}`);
      values[`:${field}`] = body[field];
    }
  }

  return {
    UpdateExpression: `SET ${updates.join(', ')}`,
    ExpressionAttributeValues: values,
    ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
  };
}

/**
 * Paginated DynamoDB Scan — collects all pages automatically.
 * Pass params without ExclusiveStartKey or TableName (TableName defaults to the shared table).
 */
export async function paginatedScan(
  params: Omit<ScanCommandInput, 'ExclusiveStartKey'>,
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      ...params,
      ExclusiveStartKey: lastKey,
    }));
    if (result.Items) items.push(...result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

/**
 * Paginated DynamoDB Query — collects all pages automatically.
 * Pass params without ExclusiveStartKey or TableName (TableName defaults to the shared table).
 */
export async function paginatedQuery(
  params: Omit<QueryCommandInput, 'ExclusiveStartKey'>,
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      ...params,
      ExclusiveStartKey: lastKey,
    }));
    if (result.Items) items.push(...result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}
