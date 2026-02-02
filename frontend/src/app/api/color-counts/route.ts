import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
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

const docClient = DynamoDBDocumentClient.from(ddbClient);

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: CONFIG.TABLE_NAME,
        FilterExpression: 'entityType = :type',
        ExpressionAttributeValues: {
          ':type': 'PRODUCT',
        },
        ProjectionExpression: 'brand',
      })
    );

    const counts: Record<string, number> = { BM: 0, FB: 0, LG: 0 };

    result.Items?.forEach((item) => {
      const brand = item.brand as string;
      if (brand in counts) {
        counts[brand]++;
      }
    });

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching color counts:', error);
    // Return fallback counts on error
    return NextResponse.json({ BM: 25, FB: 0, LG: 10 });
  }
}
