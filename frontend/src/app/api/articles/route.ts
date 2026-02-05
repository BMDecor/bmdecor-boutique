import { NextRequest, NextResponse } from 'next/server';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const brand = searchParams.get('brand');

    const items = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'ARTICLE' },
    });

    let articles = items
      .filter((item) => item.status === 'published')
      .map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || '',
        featuredImage: item.featuredImage || '',
        categoryId: item.categoryId || null,
        relatedBrand: item.relatedBrand || null,
        tags: item.tags || [],
        author: item.author || '',
        publishedAt: item.publishedAt,
        createdAt: item.createdAt,
      }));

    // Filter by category slug if provided
    if (category) {
      const catItems = await paginatedQuery({
        IndexName: 'GSI-EntityType',
        KeyConditionExpression: 'entityType = :type',
        ExpressionAttributeValues: { ':type': 'ARTICLE_CATEGORY' },
      });
      const matchCat = catItems.find((c) => c.slug === category);
      if (matchCat) {
        articles = articles.filter((a) => a.categoryId === matchCat.id);
      } else {
        articles = [];
      }
    }

    // Filter by tag name if provided
    if (tag) {
      articles = articles.filter((a) =>
        (a.tags as string[]).some((t) => t.toLowerCase() === tag.toLowerCase()),
      );
    }

    // Filter by related brand if provided
    if (brand) {
      articles = articles.filter((a) => a.relatedBrand === brand);
    }

    // Sort by publishedAt desc
    articles.sort((a, b) =>
      new Date(b.publishedAt as string).getTime() - new Date(a.publishedAt as string).getTime()
    );

    // Also fetch categories for name resolution
    const catItems = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'ARTICLE_CATEGORY' },
    });
    const catMap = Object.fromEntries(
      catItems.map((c) => [c.id as string, { name: c.name, slug: c.slug }]),
    );

    const enriched = articles.map((a) => ({
      ...a,
      category: a.categoryId ? catMap[a.categoryId as string] || null : null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Public articles GET:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
