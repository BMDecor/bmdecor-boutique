'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-[#2C2C2C]/40 text-sm">Loading...</p>
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}

function BlogContent() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryFilter = searchParams.get('category');
  const tagFilter = searchParams.get('tag');
  const brandFilter = searchParams.get('brand');

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (categoryFilter) params.set('category', categoryFilter);
        if (tagFilter) params.set('tag', tagFilter);
        if (brandFilter) params.set('brand', brandFilter);
        const qs = params.toString();
        const res = await fetch(`/api/articles${qs ? `?${qs}` : ''}`);
        if (res.ok) setArticles(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryFilter, tagFilter, brandFilter]);

  // Dynamic title based on brand filter
  const pageTitle = brandFilter && BRAND_LABELS[brandFilter]
    ? `Journal: ${BRAND_LABELS[brandFilter]}`
    : 'Journal';

  const accentColor = brandFilter && BRAND_COLORS[brandFilter]
    ? BRAND_COLORS[brandFilter]
    : '#C9A86C';

  const formatDate = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link href="/" className="text-xs tracking-[0.2em] uppercase hover:opacity-70" style={{ color: accentColor }}>
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
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>
                  {categoryFilter}
                </span>
              )}
              {tagFilter && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2C2C2C]/5 text-[#2C2C2C]/60">
                  #{tagFilter}
                </span>
              )}
              <Link href="/blog" className="text-xs text-[#2C2C2C]/30 hover:text-[#2C2C2C] underline underline-offset-2 ml-2">
                View All
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Articles */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-center text-[#2C2C2C]/40 text-sm py-12">Loading articles...</p>
        ) : articles.length === 0 ? (
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
                href={`/blog/${article.slug}`}
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
                          <span key={tag} className="text-xs text-[#2C2C2C]/30">#{tag}</span>
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
