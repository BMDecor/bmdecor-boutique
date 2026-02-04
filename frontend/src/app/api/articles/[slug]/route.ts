import { NextRequest, NextResponse } from 'next/server';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { slug } = await params;

    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'ARTICLE' },
    });

    const article = items.find(
      (item) => item.slug === slug && item.status === 'published',
    );

    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Resolve category
    let category = null;
    if (article.categoryId) {
      const catItems = await paginatedQuery({
        IndexName: 'GSI-EntityType',
        KeyConditionExpression: 'entityType = :type',
        ExpressionAttributeValues: { ':type': 'ARTICLE_CATEGORY' },
      });
      const cat = catItems.find((c) => c.id === article.categoryId);
      if (cat) category = { name: cat.name, slug: cat.slug };
    }

    return NextResponse.json({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content || '',
      excerpt: article.excerpt || '',
      featuredImage: article.featuredImage || '',
      category,
      tags: article.tags || [],
      author: article.author || '',
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
    });
  } catch (error) {
    console.error('Public article GET:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
