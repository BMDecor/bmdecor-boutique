import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

/**
 * GET /api/colors
 *
 * Query params:
 *   brand  — filter by brand (BM, FB, LG)
 *   type   — product type: paint (default), wallpaper, accessory
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brand = searchParams.get('brand');
  const productType = searchParams.get('type') || 'paint';

  console.log('DynamoDB Client Config:', { table: TABLE_NAME, brand, productType });

  try {
    const allItems: Record<string, unknown>[] = [];

    if (brand) {
      // Paginated query by brand using GSI
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
            ExclusiveStartKey: lastKey,
          })
        );
        if (result.Items) allItems.push(...result.Items);
        lastKey = result.LastEvaluatedKey;
      } while (lastKey);
    } else {
      // Paginated scan all products
      let lastKey: Record<string, unknown> | undefined;
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
    const filtered = allItems.filter((item) => {
      const itemType = (item.productType as string) || 'paint';
      return itemType === productType;
    });

    // Shape response based on product type
    if (productType === 'wallpaper') {
      const wallpapers = filtered.map((item) => ({
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
      wallpapers.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return NextResponse.json(wallpapers);
    }

    if (productType === 'accessory') {
      const accessories = filtered.map((item) => ({
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
      accessories.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return NextResponse.json(accessories);
    }

    // Default: paint
    const colors = filtered.map((item) => ({
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

    colors.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json([], { status: 200 });
  }
}
