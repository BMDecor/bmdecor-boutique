import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { paginatedQuery } from '@/lib/aws/dynamo-helpers';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaDescription?: string;
  featuredImage: string;
  category: { name: string; slug: string } | null;
  tags: string[];
  author: string;
  publishedAt: string;
  createdAt: string;
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string): Promise<Article | null> {
  const items = await paginatedQuery({
    IndexName: 'GSI-EntityType',
    KeyConditionExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'ARTICLE' },
  });

  const article = items.find(
    (item) => item.slug === slug && item.status === 'published',
  );

  if (!article) return null;

  // Resolve category
  let category = null;
  if (article.categoryId) {
    const catItems = await paginatedQuery({
      IndexName: 'GSI-EntityType',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'ARTICLE_CATEGORY' },
    });
    const cat = catItems.find((c) => c.id === article.categoryId);
    if (cat) category = { name: cat.name as string, slug: cat.slug as string };
  }

  return {
    id: article.id as string,
    title: article.title as string,
    slug: article.slug as string,
    content: (article.content as string) || '',
    excerpt: (article.excerpt as string) || '',
    metaDescription: article.metaDescription as string | undefined,
    featuredImage: (article.featuredImage as string) || '',
    category,
    tags: (article.tags as string[]) || [],
    author: (article.author as string) || '',
    publishedAt: article.publishedAt as string,
    createdAt: article.createdAt as string,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found | BM Decoracion',
    };
  }

  const description = article.metaDescription || article.excerpt || `Read ${article.title} on BM Decoracion Journal`;

  return {
    title: `${article.title} | BM Decoracion`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author] : undefined,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  };
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

function BlogPostingJsonLd({ article }: { article: Article }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.featuredImage || undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'BM Decoracion',
      url: 'https://bmdecor.es',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bmdecor.es/journal/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <BlogPostingJsonLd article={article} />

      {/* Hero */}
      {article.featuredImage && (
        <div className="w-full h-[400px] relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/60 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <header className={`${article.featuredImage ? '-mt-24 relative z-10' : 'pt-12'} pb-8`}>
          <div className={`${article.featuredImage ? 'bg-white rounded-xl p-8 shadow-lg' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/journal" className="text-xs text-[#C9A86C] tracking-[0.15em] uppercase hover:text-[#B8975B]">
                Journal
              </Link>
              {article.category && (
                <>
                  <span className="text-[#2C2C2C]/20">/</span>
                  <Link
                    href={`/journal?category=${article.category.slug}`}
                    className="text-xs text-[#C9A86C] tracking-[0.15em] uppercase hover:text-[#B8975B]"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
            </div>

            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#2C2C2C] leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 mt-6 text-sm text-[#2C2C2C]/50">
              {article.author && <span>By {article.author}</span>}
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-[#2C2C2C] pb-12
            [&_h2]:font-[family-name:var(--font-playfair)] [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:font-[family-name:var(--font-playfair)] [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-[#2C2C2C]/80 [&_p]:leading-relaxed [&_p]:my-4
            [&_a]:text-[#C9A86C] [&_a]:underline [&_a]:underline-offset-2
            [&_blockquote]:border-l-2 [&_blockquote]:border-[#C9A86C] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-[#2C2C2C]/60
            [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-8
            [&_code]:bg-[#2C2C2C]/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
            [&_ul]:my-4 [&_ol]:my-4 [&_li]:text-[#2C2C2C]/80"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 py-6 border-t border-[#2C2C2C]/8">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/journal?tag=${tag}`}
                className="text-xs px-3 py-1 rounded-full border border-[#2C2C2C]/10 text-[#2C2C2C]/50 hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Back */}
        <div className="py-8 border-t border-[#2C2C2C]/8">
          <Link href="/journal" className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors">
            &larr; Back to Journal
          </Link>
        </div>
      </article>
    </div>
  );
}
