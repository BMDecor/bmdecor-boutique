import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';

const CONFIG = {
  AWS_PROFILE: 'bmdecor',
  AWS_REGION: 'eu-west-1',
  TABLE_NAME: 'BmDecorProducts',
};

const ddbClient = new DynamoDBClient({
  region: CONFIG.AWS_REGION,
  credentials: fromIni({ profile: CONFIG.AWS_PROFILE }),
});

const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brand = searchParams.get('brand');

  try {
    const allItems: Record<string, unknown>[] = [];

    if (brand) {
      // Paginated query by brand using GSI
      let lastKey: Record<string, unknown> | undefined;
      do {
        const result = await docClient.send(
          new QueryCommand({
            TableName: CONFIG.TABLE_NAME,
            IndexName: 'GSI-Brand',
            KeyConditionExpression: 'brand = :brand',
            ExpressionAttributeValues: {
              ':brand': brand,
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
            TableName: CONFIG.TABLE_NAME,
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

    const colors = allItems.map((item) => ({
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

    // Sort by name
    colors.sort((a, b) => String(a.name).localeCompare(String(b.name)));

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json([], { status: 500 });
  }
}
