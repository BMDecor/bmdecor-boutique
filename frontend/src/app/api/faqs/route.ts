import { NextResponse } from 'next/server';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

export async function GET() {
  try {
    const [faqItems, catItems] = await Promise.all([
      paginatedQuery({
        IndexName: 'GSI-EntityType',
        KeyConditionExpression: 'entityType = :type',
        ExpressionAttributeValues: { ':type': 'FAQ' },
      }),
      paginatedQuery({
        IndexName: 'GSI-EntityType',
        KeyConditionExpression: 'entityType = :type',
        ExpressionAttributeValues: { ':type': 'FAQ_CATEGORY' },
      }),
    ]);

    const publishedFaqs = faqItems
      .filter((f) => f.isPublished)
      .sort((a, b) => ((a.sortOrder as number) ?? 0) - ((b.sortOrder as number) ?? 0));

    const categories = catItems
      .sort((a, b) => ((a.sortOrder as number) ?? 0) - ((b.sortOrder as number) ?? 0))
      .map((cat) => ({
        id: cat.id as string,
        name: cat.name as string,
        slug: cat.slug as string,
      }));

    // Group FAQs by category
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const grouped: { category: { id: string; name: string; slug: string } | null; faqs: { id: string; question: string; answer: string }[] }[] = [];

    // FAQs with categories
    for (const cat of categories) {
      const catFaqs = publishedFaqs
        .filter((f) => f.categoryId === cat.id)
        .map((f) => ({ id: f.id as string, question: f.question as string, answer: (f.answer || '') as string }));
      if (catFaqs.length > 0) {
        grouped.push({ category: cat, faqs: catFaqs });
      }
    }

    // Uncategorized FAQs
    const uncategorized = publishedFaqs
      .filter((f) => !f.categoryId || !catMap.has(f.categoryId as string))
      .map((f) => ({ id: f.id as string, question: f.question as string, answer: (f.answer || '') as string }));
    if (uncategorized.length > 0) {
      grouped.push({ category: null, faqs: uncategorized });
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Public FAQs GET:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
