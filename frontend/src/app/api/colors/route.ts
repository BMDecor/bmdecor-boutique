import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

/**
 * GET /api/colors
 *
 * Query params:
 *   brand      — filter by brand (BM, FB, LG)
 *   type       — product type: paint (default), wallpaper, accessory
 *   limit      — max items per page (default: 48, max: 100)
 *   cursor     — base64-encoded lastEvaluatedKey for pagination
 *   search     — search term for name/colorCode filtering
 *   collection — filter by collection name (partial match)
 *   sortBy     — sort field: 'name' (default), 'code', 'price'
 *   sortOrder  — 'asc' (default) or 'desc'
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brand = searchParams.get('brand');
  const productType = searchParams.get('type') || 'paint';
  const limitParam = parseInt(searchParams.get('limit') || '48', 10);
  const cursor = searchParams.get('cursor');
  const search = searchParams.get('search')?.toLowerCase().trim();
  const collection = searchParams.get('collection');
  const sortBy = searchParams.get('sortBy') || 'code';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  // Clamp limit between 1 and 100
  const limit = Math.min(Math.max(limitParam, 1), 100);

  // Decode cursor if provided
  let exclusiveStartKey: Record<string, unknown> | undefined;
  if (cursor) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      // Invalid cursor, start from beginning
    }
  }

  try {
    // For search queries, we need to fetch all matching items since DynamoDB
    // doesn't support LIKE queries natively. We'll filter in memory.
    // For non-search queries, we use proper pagination.

    if (search) {
      // Search mode: fetch all items for the brand, filter in memory, then paginate results
      const allItems = await fetchAllItemsForBrand(brand, productType);

      // Filter by search term
      const filtered = allItems.filter((item) => {
        const name = String(item.name || '').toLowerCase();
        const code = String(item.colorCode || '').toLowerCase();
        return name.includes(search) || code.includes(search);
      });

      // Apply collection filter if provided
      const collectionFiltered = collection
        ? filtered.filter((item) => {
            const itemCol = String(item.collection || '');
            return itemCol.includes(collection);
          })
        : filtered;

      // Sort results
      const sorted = sortItems(collectionFiltered, sortBy, sortOrder);

      // Apply cursor-based pagination on filtered results
      const cursorIndex = cursor ? parseInt(cursor, 10) || 0 : 0;
      const paginatedItems = sorted.slice(cursorIndex, cursorIndex + limit);
      const nextCursorIndex = cursorIndex + limit;
      const hasMore = nextCursorIndex < sorted.length;

      return NextResponse.json({
        items: shapeItems(paginatedItems, productType),
        nextCursor: hasMore ? String(nextCursorIndex) : null,
        total: sorted.length,
      });
    }

    // Non-search mode: use DynamoDB pagination
    const allItems: Record<string, unknown>[] = [];
    let lastKey = exclusiveStartKey;
    let fetchedCount = 0;
    const fetchLimit = limit * 3; // Fetch more to account for filtering

    if (brand) {
      // Query by brand using GSI
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI-Brand',
          KeyConditionExpression: 'brand = :brand',
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':brand': brand,
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
          Limit: fetchLimit,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
      fetchedCount = result.Items?.length || 0;

      // Continue fetching if we don't have enough items after filtering
      while (lastKey && fetchedCount < limit * 2) {
        const moreResult = await docClient.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'GSI-Brand',
            KeyConditionExpression: 'brand = :brand',
            FilterExpression: 'entityType = :type',
            ExpressionAttributeValues: {
              ':brand': brand,
              ':type': 'PRODUCT',
            },
            ExclusiveStartKey: lastKey,
            Limit: fetchLimit,
          })
        );
        if (moreResult.Items) allItems.push(...moreResult.Items);
        lastKey = moreResult.LastEvaluatedKey;
        fetchedCount += moreResult.Items?.length || 0;
      }
    } else {
      // Scan all products
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
          Limit: fetchLimit,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    }

    // Filter by product type
    let filtered = allItems.filter((item) => {
      const itemType = (item.productType as string) || 'paint';
      return itemType === productType;
    });

    // Apply collection filter if provided
    if (collection) {
      filtered = filtered.filter((item) => {
        const itemCol = String(item.collection || '');
        return itemCol.includes(collection);
      });
    }

    // Sort results
    const sorted = sortItems(filtered, sortBy, sortOrder);

    // Take only the requested limit
    const paginatedItems = sorted.slice(0, limit);

    // Encode next cursor
    let nextCursor: string | null = null;
    if (lastKey && paginatedItems.length === limit) {
      nextCursor = Buffer.from(JSON.stringify(lastKey)).toString('base64');
    }

    return NextResponse.json({
      items: shapeItems(paginatedItems, productType),
      nextCursor,
      total: null, // Unknown for DynamoDB pagination
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ items: [], nextCursor: null, total: 0 }, { status: 200 });
  }
}

// Helper: Fetch all items for a brand (for search)
async function fetchAllItemsForBrand(
  brand: string | null,
  productType: string
): Promise<Record<string, unknown>[]> {
  const allItems: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;

  if (brand) {
    do {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI-Brand',
          KeyConditionExpression: 'brand = :brand',
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':brand': brand,
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);
  } else {
    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);
  }

  // Filter by product type
  return allItems.filter((item) => {
    const itemType = (item.productType as string) || 'paint';
    return itemType === productType;
  });
}

// Helper: Sort items
function sortItems(
  items: Record<string, unknown>[],
  sortBy: string,
  sortOrder: string
): Record<string, unknown>[] {
  const sorted = [...items];
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  sorted.sort((a, b) => {
    if (sortBy === 'price') {
      const aPrice = Number(a.priceEur) || 0;
      const bPrice = Number(b.priceEur) || 0;
      return (aPrice - bPrice) * multiplier;
    }
    if (sortBy === 'code') {
      // Sort by numeric code for gradient flow
      const aCode = String(a.colorCode || '');
      const bCode = String(b.colorCode || '');
      const aNum = parseInt(aCode.replace(/\D/g, ''), 10) || 0;
      const bNum = parseInt(bCode.replace(/\D/g, ''), 10) || 0;
      const aPrefix = aCode.replace(/[0-9-]/g, '');
      const bPrefix = bCode.replace(/[0-9-]/g, '');
      if (aPrefix !== bPrefix) {
        return aPrefix.localeCompare(bPrefix) * multiplier;
      }
      return (aNum - bNum) * multiplier;
    }
    // Default: sort by name
    const aName = String(a.name || '');
    const bName = String(b.name || '');
    return aName.localeCompare(bName) * multiplier;
  });

  return sorted;
}

// Helper: Shape items based on product type
function shapeItems(items: Record<string, unknown>[], productType: string) {
  if (productType === 'wallpaper') {
    return items.map((item) => ({
      id: item.id,
      brand: item.brand,
      name: item.name,
      designName: item.designName,
      colourway: item.colourway,
      collection: item.collection,
      priceEur: item.priceEur,
      priceCode: item.priceCode,
      description: item.description,
      imageUrl: item.imageUrl,
      lifestyleImageUrl: item.lifestyleImageUrl,
      rollWidth: item.rollWidth,
      repeat: item.repeat,
      drop: item.drop,
      hangingMethod: item.hangingMethod,
      basePaper: item.basePaper,
      washability: item.washability,
      printingMethod: item.printingMethod,
      paintReferences: item.paintReferences,
      barcode: item.barcode,
      sampleSku: item.sampleSku,
      inStock: item.inStock,
    }));
  }

  if (productType === 'accessory') {
    return items.map((item) => ({
      id: item.id,
      brand: item.brand,
      name: item.name,
      priceEur: item.priceEur,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
      size: item.size,
      inStock: item.inStock,
    }));
  }

  // Default: paint colors
  return items.map((item) => ({
    id: item.id,
    brand: item.brand,
    name: item.name,
    colorCode: item.colorCode,
    hexCode: item.hexCode,
    finishType: item.finishType,
    priceEur: item.priceEur,
    volume: item.volume,
    collection: item.collection,
    description: item.description,
    inStock: item.inStock,
  }));
}
