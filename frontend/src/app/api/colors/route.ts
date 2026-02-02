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
    let result;

    if (brand) {
      // Query by brand using GSI
      result = await docClient.send(
        new QueryCommand({
          TableName: CONFIG.TABLE_NAME,
          IndexName: 'GSI-Brand',
          KeyConditionExpression: 'brand = :brand',
          ExpressionAttributeValues: {
            ':brand': brand,
          },
        })
      );
    } else {
      // Scan all products
      result = await docClient.send(
        new ScanCommand({
          TableName: CONFIG.TABLE_NAME,
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
          },
        })
      );
    }

    const colors = result.Items?.map((item) => ({
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
    })) || [];

    // Sort by name
    colors.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json([], { status: 500 });
  }
}
