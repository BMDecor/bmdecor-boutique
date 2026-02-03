/**
 * DynamoDB Cart Service — server-side CRUD operations for the shopping cart.
 *
 * Uses the BmDecorProducts single-table design:
 *   PK: CART#GUEST_{uuid}  (or CART#USER_{cognitoId} for future auth)
 *   SK: SESSION             (cart session metadata)
 *   SK: ITEM#{compound}     (individual line items)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { BM_PRICE_LIST } from './variant-config';
import type {
  CartSessionEntity,
  CartItemEntity,
  CartItemResponse,
  CartResponse,
  AddToCartRequest,
} from './types';
import type { ContainerSize } from './variant-config';

const TABLE_NAME = 'BmDecorProducts';

const ddbClient = new DynamoDBClient({
  region: 'eu-west-1',
  credentials: fromIni({ profile: 'bmdecor' }),
});

const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

function cartPK(cartId: string): string {
  return `CART#GUEST_${cartId}`;
}

function itemSK(item: { colorNumber: string; productLine: string; sheen: string; size: string }): string {
  return `ITEM#${item.colorNumber}#${item.productLine}#${item.sheen}#${item.size}`;
}

function ttl30Days(): number {
  return Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
}

function toItemResponse(entity: CartItemEntity): CartItemResponse {
  return {
    sk: entity.SK,
    colorNumber: entity.colorNumber,
    colorName: entity.colorName,
    hexCode: entity.hexCode,
    productLine: entity.productLine,
    productNumber: entity.productNumber,
    sheen: entity.sheen,
    size: entity.size,
    quantity: entity.quantity,
    unitPriceEur: entity.unitPriceEur,
    lineTotalEur: entity.lineTotalEur,
    brand: entity.brand,
  };
}

// ─────────────────────────────────────────────────────────
// GET CART
// ─────────────────────────────────────────────────────────

export async function getCart(cartId: string): Promise<CartResponse> {
  const pk = cartPK(cartId);

  // Query all entities for this cart (session + items)
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': pk },
    })
  );

  const items: CartItemResponse[] = [];
  let itemCount = 0;
  let subtotalEur = 0;

  for (const entity of result.Items || []) {
    if (entity.entityType === 'CART_ITEM') {
      const item = toItemResponse(entity as CartItemEntity);
      items.push(item);
      itemCount += item.quantity;
      subtotalEur += item.lineTotalEur;
    }
  }

  return {
    cartId,
    itemCount,
    subtotalEur: Math.round(subtotalEur * 100) / 100,
    items,
  };
}

// ─────────────────────────────────────────────────────────
// ADD ITEM
// ─────────────────────────────────────────────────────────

export async function addItem(cartId: string, req: AddToCartRequest): Promise<CartResponse> {
  const pk = cartPK(cartId);
  const sk = itemSK(req);
  const now = new Date().toISOString();
  const ttl = ttl30Days();

  // Server-side price enforcement
  const unitPrice = BM_PRICE_LIST[req.size as ContainerSize] || 68.00;

  // Check if item already exists
  const existing = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    })
  );

  if (existing.Item) {
    // Increment quantity
    const newQty = (existing.Item.quantity as number) + req.quantity;
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
        UpdateExpression: 'SET quantity = :qty, lineTotalEur = :total, #ttl = :ttl',
        ExpressionAttributeNames: { '#ttl': 'ttl' },
        ExpressionAttributeValues: {
          ':qty': newQty,
          ':total': Math.round(unitPrice * newQty * 100) / 100,
          ':ttl': ttl,
        },
      })
    );
  } else {
    // Create new item
    const item: CartItemEntity = {
      PK: pk,
      SK: sk,
      entityType: 'CART_ITEM',
      colorNumber: req.colorNumber,
      colorName: req.colorName,
      hexCode: req.hexCode,
      productLine: req.productLine,
      productNumber: req.productNumber,
      sheen: req.sheen,
      size: req.size,
      quantity: req.quantity,
      unitPriceEur: unitPrice,
      lineTotalEur: Math.round(unitPrice * req.quantity * 100) / 100,
      brand: req.brand,
      addedAt: now,
      ttl,
    };

    await docClient.send(
      new PutCommand({ TableName: TABLE_NAME, Item: item })
    );
  }

  // Update session totals
  await recalculateSession(cartId);
  return getCart(cartId);
}

// ─────────────────────────────────────────────────────────
// UPDATE ITEM QUANTITY
// ─────────────────────────────────────────────────────────

export async function updateItemQuantity(
  cartId: string,
  sk: string,
  quantity: number,
): Promise<CartResponse> {
  const pk = cartPK(cartId);
  const ttl = ttl30Days();

  if (quantity <= 0) {
    return removeItem(cartId, sk);
  }

  // Get item to find unit price
  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } })
  );

  if (!existing.Item) {
    return getCart(cartId);
  }

  const unitPrice = existing.Item.unitPriceEur as number;

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
      UpdateExpression: 'SET quantity = :qty, lineTotalEur = :total, #ttl = :ttl',
      ExpressionAttributeNames: { '#ttl': 'ttl' },
      ExpressionAttributeValues: {
        ':qty': quantity,
        ':total': Math.round(unitPrice * quantity * 100) / 100,
        ':ttl': ttl,
      },
    })
  );

  await recalculateSession(cartId);
  return getCart(cartId);
}

// ─────────────────────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────────────────────

export async function removeItem(cartId: string, sk: string): Promise<CartResponse> {
  const pk = cartPK(cartId);

  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } })
  );

  await recalculateSession(cartId);
  return getCart(cartId);
}

// ─────────────────────────────────────────────────────────
// RECALCULATE SESSION
// ─────────────────────────────────────────────────────────

async function recalculateSession(cartId: string): Promise<void> {
  const pk = cartPK(cartId);
  const now = new Date().toISOString();
  const ttl = ttl30Days();

  // Query all items
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': pk, ':prefix': 'ITEM#' },
    })
  );

  let itemCount = 0;
  let subtotalEur = 0;

  for (const item of result.Items || []) {
    itemCount += (item.quantity as number) || 0;
    subtotalEur += (item.lineTotalEur as number) || 0;
  }

  const session: CartSessionEntity = {
    PK: pk,
    SK: 'SESSION',
    entityType: 'CART_SESSION',
    itemCount,
    subtotalEur: Math.round(subtotalEur * 100) / 100,
    createdAt: now,
    updatedAt: now,
    ttl,
  };

  await docClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: session })
  );
}

// ─────────────────────────────────────────────────────────
// MERGE CARTS (dormant — for future Cognito integration)
// ─────────────────────────────────────────────────────────

export async function mergeCarts(guestId: string, userId: string): Promise<void> {
  const guestPK = `CART#GUEST_${guestId}`;
  const userPK = `CART#USER_${userId}`;

  // Query all guest items
  const guestItems = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': guestPK, ':prefix': 'ITEM#' },
    })
  );

  if (!guestItems.Items || guestItems.Items.length === 0) return;

  // Move items to user PK (batch write)
  const writeRequests = guestItems.Items.map((item) => ({
    PutRequest: {
      Item: { ...item, PK: userPK },
    },
  }));

  // Batch write in chunks of 25
  for (let i = 0; i < writeRequests.length; i += 25) {
    const chunk = writeRequests.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: chunk },
      })
    );
  }

  // Delete guest items
  const deleteRequests = guestItems.Items.map((item) => ({
    DeleteRequest: {
      Key: { PK: item.PK, SK: item.SK },
    },
  }));

  for (let i = 0; i < deleteRequests.length; i += 25) {
    const chunk = deleteRequests.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: chunk },
      })
    );
  }

  // Delete guest session
  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: guestPK, SK: 'SESSION' } })
  );
}
