import { NextResponse } from 'next/server';
import { paginatedScan } from '@/lib/aws/dynamo-helpers';

export async function GET() {
  try {
    const items = await paginatedScan({
      FilterExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'PRODUCT' },
      ProjectionExpression: 'brand',
    });

    const counts: Record<string, number> = { BM: 0, FB: 0, LG: 0 };
    for (const item of items) {
      const brand = item.brand as string;
      if (brand in counts) counts[brand]++;
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching color counts:', error);
    return NextResponse.json({ BM: 0, FB: 0, LG: 0 });
  }
}
