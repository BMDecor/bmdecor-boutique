/**
 * DynamoDB Cart Service — server-side CRUD operations for the shopping cart.
 *
 * Uses the BmDecorProducts single-table design:
 *   PK: CART#GUEST_{uuid}  (or CART#USER_{cognitoId} for future auth)
 *   SK: SESSION             (cart session metadata)
 *   SK: ITEM#{compound}     (individual line items)
 *
 * Supports three product types: paint, wallpaper, accessory.
 */

import {
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { getPriceForSize } from './variant-config';
import type {
  CartSessionEntity,
  CartItemEntity,
  CartItemResponse,
  CartResponse,
  AddToCartRequest,
  CartProductType,
} from './types';
import type { ContainerSize } from './variant-config';

function cartPK(cartId: string): string {
  return `CART#GUEST_${cartId}`;
}

export function resolveCartPK(cartId: string, isGuest: boolean): string {
  return isGuest ? `CART#GUEST_${cartId}` : `CART#USER_${cartId}`;
}

function buildItemSK(req: AddToCartRequest): string {
  const type = req.productType || 'paint';
  switch (type) {
    case 'wallpaper':
      return `ITEM#wallpaper#${req.wallpaperId || req.designName}#${req.colourway || 'default'}`;
    case 'accessory':
      return `ITEM#accessory#${req.accessoryId || req.accessoryName}`;
    default:
      return `ITEM#paint#${req.colorNumber}#${req.productLine}#${req.sheen}#${req.size}`;
  }
}

function ttl30Days(): number {
  return Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
}

function toItemResponse(entity: CartItemEntity): CartItemResponse {
  return {
    sk: entity.SK,
    productType: entity.productType || 'paint',
    brand: entity.brand,
    quantity: entity.quantity,
    unitPriceEur: entity.unitPriceEur,
    lineTotalEur: entity.lineTotalEur,
    // Paint
    colorNumber: entity.colorNumber,
    colorName: entity.colorName,
    hexCode: entity.hexCode,
    productLine: entity.productLine,
    productNumber: entity.productNumber,
    sheen: entity.sheen,
    size: entity.size,
    // Wallpaper
    designName: entity.designName,
    colourway: entity.colourway,
    wallpaperId: entity.wallpaperId,
    imageUrl: entity.imageUrl,
    // Accessory
    accessoryId: entity.accessoryId,
    accessoryName: entity.accessoryName,
    accessoryCategory: entity.accessoryCategory,
  };
}

function resolveUnitPrice(req: AddToCartRequest): number {
  const type = req.productType || 'paint';
  switch (type) {
    case 'wallpaper':
    case 'accessory':
      // Use the price passed from the product catalog
      return req.unitPriceEur ?? 0;
    default:
      // Server-side price enforcement for paint (brand + product-line-specific)
      return getPriceForSize(
        req.size as ContainerSize,
        req.productLine,
        req.brand,
      );
  }
}

// ─────────────────────────────────────────────────────────
// GET CART
// ─────────────────────────────────────────────────────────

export async function getCart(cartId: string): Promise<CartResponse> {
  const pk = cartPK(cartId);

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
  const sk = buildItemSK(req);
  const now = new Date().toISOString();
  const ttl = ttl30Days();
  const productType: CartProductType = req.productType || 'paint';

  const unitPrice = resolveUnitPrice(req);

  // Check if item already exists
  const existing = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    })
  );

  if (existing.Item) {
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
    const item: CartItemEntity = {
      PK: pk,
      SK: sk,
      entityType: 'CART_ITEM',
      productType,
      brand: req.brand,
      quantity: req.quantity,
      unitPriceEur: unitPrice,
      lineTotalEur: Math.round(unitPrice * req.quantity * 100) / 100,
      addedAt: now,
      ttl,
      // Paint fields
      colorNumber: req.colorNumber,
      colorName: req.colorName,
      hexCode: req.hexCode,
      productLine: req.productLine,
      productNumber: req.productNumber,
      sheen: req.sheen,
      size: req.size,
      // Wallpaper fields
      designName: req.designName,
      colourway: req.colourway,
      wallpaperId: req.wallpaperId,
      imageUrl: req.imageUrl,
      // Accessory fields
      accessoryId: req.accessoryId,
      accessoryName: req.accessoryName,
      accessoryCategory: req.accessoryCategory,
    };

    await docClient.send(
      new PutCommand({ TableName: TABLE_NAME, Item: item })
    );
  }

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
// AUTH-AWARE CART HELPERS
// ─────────────────────────────────────────────────────────

export async function getCartForUser(userId: string): Promise<CartResponse> {
  const pk = `CART#USER_${userId}`;
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

  return { cartId: userId, itemCount, subtotalEur: Math.round(subtotalEur * 100) / 100, items };
}

export async function recalculateUserSession(userId: string): Promise<void> {
  const pk = `CART#USER_${userId}`;
  const now = new Date().toISOString();
  const ttl = ttl30Days();

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
    PK: pk, SK: 'SESSION', entityType: 'CART_SESSION',
    itemCount, subtotalEur: Math.round(subtotalEur * 100) / 100,
    createdAt: now, updatedAt: now, ttl,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: session }));
}

// ─────────────────────────────────────────────────────────
// MERGE CARTS (activated by /api/auth/merge-cart)
// ─────────────────────────────────────────────────────────

export async function mergeCarts(guestId: string, userId: string): Promise<void> {
  const guestPK = `CART#GUEST_${guestId}`;
  const userPK = `CART#USER_${userId}`;

  const guestItems = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': guestPK, ':prefix': 'ITEM#' },
    })
  );

  if (!guestItems.Items || guestItems.Items.length === 0) return;

  const writeRequests = guestItems.Items.map((item) => ({
    PutRequest: {
      Item: { ...item, PK: userPK },
    },
  }));

  for (let i = 0; i < writeRequests.length; i += 25) {
    const chunk = writeRequests.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: chunk },
      })
    );
  }

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

  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: guestPK, SK: 'SESSION' } })
  );
}
