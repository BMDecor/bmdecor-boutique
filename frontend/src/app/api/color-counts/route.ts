import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

/**
 * GET /api/color-counts
 *
 * Returns collection counts for colors.
 *
 * Query params:
 *   brand — filter by brand (BM, FB, LG). If omitted, returns counts for all brands.
 *
 * Returns:
 *   Without brand param: { BM: number, FB: number, LG: number }
 *   With brand param: { total: number, collections: { [name]: count } }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brand = searchParams.get('brand');

  try {
    if (brand) {
      // Return collection breakdown for a specific brand
      const allItems: Record<string, unknown>[] = [];
      let lastKey: Record<string, unknown> | undefined;

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
            ExpressionAttributeNames: {
              '#col': 'collection',
            },
            ProjectionExpression: '#col, productType',
            ExclusiveStartKey: lastKey,
          })
        );
        if (result.Items) allItems.push(...result.Items);
        lastKey = result.LastEvaluatedKey;
      } while (lastKey);

      // Filter to paint products only (in memory since productType may not be in GSI)
      const paintItems = allItems.filter((item) => {
        const pt = item.productType as string | undefined;
        return !pt || pt === 'paint';
      });

      // Build collection counts
      const collections: Record<string, number> = {};
      for (const item of paintItems) {
        const col = String(item.collection || 'Unknown');
        collections[col] = (collections[col] || 0) + 1;
      }

      return NextResponse.json({
        total: paintItems.length,
        collections,
      });
    }

    // Return brand totals (no specific brand requested)
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'entityType = :type AND (attribute_not_exists(productType) OR productType = :pt)',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
            ':pt': 'paint',
          },
          ProjectionExpression: 'brand',
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    const counts: Record<string, number> = { BM: 0, FB: 0, LG: 0 };
    for (const item of allItems) {
      const itemBrand = item.brand as string;
      if (itemBrand in counts) counts[itemBrand]++;
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching color counts:', error);
    return NextResponse.json(
      brand ? { total: 0, collections: {} } : { BM: 0, FB: 0, LG: 0 },
      { status: 200 }
    );
  }
}
