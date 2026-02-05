import { Metadata } from 'next';
import Link from 'next/link';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  author: string;
  publishedAt: string;
  relatedBrand: string | null;
  category: { name: string; slug: string } | null;
}

const BRAND_LABELS: Record<string, string> = {
  BM: 'Benjamin Moore',
  FB: 'Farrow & Ball',
  LG: 'Little Greene',
};

const BRAND_COLORS: Record<string, string> = {
  BM: '#C9A86C',
  FB: '#8B7355',
  LG: '#4A5240',
};

type PageProps = {
  searchParams: Promise<{ category?: string; tag?: string; brand?: string }>;
};

export const metadata: Metadata = {
  title: 'Journal | BM Decoracion',
  description: 'Design inspiration, paint guides, and the latest from our Marbella atelier.',
  openGraph: {
    title: 'Journal | BM Decoracion',
    description: 'Design inspiration, paint guides, and the latest from our Marbella atelier.',
    type: 'website',
  },
};

async function getArticles(filters: { category?: string; tag?: string; brand?: string }): Promise<Article[]> {
  const items = await paginatedQuery({
    IndexName: 'GSI-EntityType',
    KeyConditionExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'ARTICLE' },
  });

  let articles = items
    .filter((item) => item.status === 'published')
    .map((item) => ({
      id: item.id as string,
      title: item.title as string,
      slug: item.slug as string,
      excerpt: (item.excerpt as string) || '',
      featuredImage: (item.featuredImage as string) || '',
      categoryId: item.categoryId as string | null,
      relatedBrand: (item.relatedBrand as string) || null,
      tags: (item.tags as string[]) || [],
      author: (item.author as string) || '',
      publishedAt: item.publishedAt as string,
    }));

  // Fetch categories for name resolution
  const catItems = await paginatedQuery({
    IndexName: 'GSI-EntityType',
    KeyConditionExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'ARTICLE_CATEGORY' },
  });
  const catMap = Object.fromEntries(
    catItems.map((c) => [c.id as string, { name: c.name as string, slug: c.slug as string }]),
  );

  // Filter by category slug if provided
  if (filters.category) {
    const matchCat = catItems.find((c) => c.slug === filters.category);
    if (matchCat) {
      articles = articles.filter((a) => a.categoryId === matchCat.id);
    } else {
      articles = [];
    }
  }

  // Filter by tag name if provided
  if (filters.tag) {
    articles = articles.filter((a) =>
      a.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase()),
    );
  }

  // Filter by related brand if provided
  if (filters.brand) {
    articles = articles.filter((a) => a.relatedBrand === filters.brand);
  }

  // Sort by publishedAt desc
  articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  // Enrich with category info
  return articles.map((a) => ({
    ...a,
    category: a.categoryId ? catMap[a.categoryId] || null : null,
  }));
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default async function JournalPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const articles = await getArticles(filters);

  const brandFilter = filters.brand;
  const categoryFilter = filters.category;
  const tagFilter = filters.tag;

  // Dynamic title based on brand filter
  const pageTitle =
    brandFilter && BRAND_LABELS[brandFilter]
      ? `Journal: ${BRAND_LABELS[brandFilter]}`
      : 'Journal';

  const accentColor =
    brandFilter && BRAND_COLORS[brandFilter] ? BRAND_COLORS[brandFilter] : '#C9A86C';

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="text-xs tracking-[0.2em] uppercase hover:opacity-70"
            style={{ color: accentColor }}
          >
            BM Decoracion
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C] mt-4">
            {pageTitle}
          </h1>
          <p className="text-[#2C2C2C]/50 mt-2 max-w-xl">
            {brandFilter && BRAND_LABELS[brandFilter]
              ? `Design inspiration, guides, and the latest from ${BRAND_LABELS[brandFilter]}.`
              : 'Design inspiration, paint guides, and the latest from our Marbella atelier.'}
          </p>
          {(categoryFilter || tagFilter || brandFilter) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-[#2C2C2C]/40">Filtered by:</span>
              {brandFilter && BRAND_LABELS[brandFilter] && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  {BRAND_LABELS[brandFilter]}
                </span>
              )}
              {categoryFilter && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                >
                  {categoryFilter}
                </span>
              )}
              {tagFilter && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2C2C2C]/5 text-[#2C2C2C]/60">
                  #{tagFilter}
                </span>
              )}
              <Link
                href="/journal"
                className="text-xs text-[#2C2C2C]/30 hover:text-[#2C2C2C] underline underline-offset-2 ml-2"
              >
                View All
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Articles */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]/20">
              No articles yet
            </p>
            <p className="text-sm text-[#2C2C2C]/40 mt-2">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/journal/${article.slug}`}
                className="group bg-white rounded-xl border border-[#2C2C2C]/8 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-[#C9A86C]/10 to-[#2C2C2C]/5" />
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    {article.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A86C]/10 text-[#C9A86C] font-medium">
                        {article.category.name}
                      </span>
                    )}
                    <span className="text-xs text-[#2C2C2C]/30">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  <h2
                    className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] transition-colors"
                    style={{ '--hover-color': accentColor } as React.CSSProperties}
                  >
                    <span className="group-hover:text-[var(--hover-color)]">{article.title}</span>
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-[#2C2C2C]/60 line-clamp-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    {article.author && (
                      <span className="text-xs text-[#2C2C2C]/40">By {article.author}</span>
                    )}
                    {article.tags.length > 0 && (
                      <div className="flex gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-[#2C2C2C]/30">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer link */}
      <footer className="border-t border-[#2C2C2C]/8 py-8 text-center">
        <Link href="/" className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors">
          &larr; Back to BM Decoracion
        </Link>
      </footer>
    </div>
  );
}
