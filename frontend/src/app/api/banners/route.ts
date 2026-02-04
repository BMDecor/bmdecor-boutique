import { NextResponse } from 'next/server';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

export async function GET() {
  try {
    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'BANNER' },
    });

    const banners = items
      .filter((item) => item.isActive)
      .map((item) => ({
        id: item.id,
        title: item.title || '',
        subtitle: item.subtitle || '',
        imageUrl: item.imageUrl || '',
        linkUrl: item.linkUrl || '',
        linkText: item.linkText || '',
        position: item.position || 'hero',
        sortOrder: item.sortOrder ?? 0,
      }))
      .sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number));

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Public banners GET:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
