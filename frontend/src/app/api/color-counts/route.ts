import { NextResponse } from 'next/server';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

export async function GET() {
  try {
    const counts: Record<string, number> = { BM: 0, FB: 0, LG: 0 };
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
          },
          ProjectionExpression: 'brand',
          ExclusiveStartKey: lastKey,
        })
      );

      result.Items?.forEach((item) => {
        const brand = item.brand as string;
        if (brand in counts) {
          counts[brand]++;
        }
      });

      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching color counts:', error);
    // Return fallback counts on error
    return NextResponse.json({ BM: 0, FB: 0, LG: 0 });
  }
}
