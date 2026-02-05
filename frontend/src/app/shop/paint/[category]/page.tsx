import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PAINT_CATEGORIES, BM_PRODUCT_LINES, type PaintCategory } from '@/types/store';

type PageProps = {
  params: Promise<{ category: string }>;
};

// Map URL slugs to PaintCategory types
const CATEGORY_MAP: Record<string, PaintCategory> = {
  'interior': 'Interior',
  'exterior': 'Exterior',
  'trim-door': 'Trim & Door',
  'primer': 'Primer',
  'specialty': 'Specialty',
};

function getCategoryInfo(slug: string) {
  const categoryId = CATEGORY_MAP[slug];
  if (!categoryId) return null;
  return PAINT_CATEGORIES.find((c) => c.id === categoryId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${categoryInfo.name} Paint`,
    description: categoryInfo.description,
    alternates: {
      canonical: `/shop/paint/${category}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((category) => ({ category }));
}

export default async function PaintCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    notFound();
  }

  // Filter product lines by this category
  // TODO: Replace with DynamoDB fetch when products are seeded
  const productLines = BM_PRODUCT_LINES.filter((pl) => pl.category === categoryInfo.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm text-[#2C2C2C]/50 mb-4">
            <Link href="/" className="hover:text-[#C9A86C]">Home</Link>
            <span>/</span>
            <Link href="/shop/paint/interior" className="hover:text-[#C9A86C]">Paint</Link>
            <span>/</span>
            <span className="text-[#2C2C2C]">{categoryInfo.name}</span>
          </nav>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C]">
            {categoryInfo.name} Paint
          </h1>
          <p className="text-[#2C2C2C]/60 mt-2 max-w-2xl">
            {categoryInfo.description}
          </p>
        </div>
      </header>

      {/* Product Lines Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {productLines.length > 0 ? (
          <>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-6">
              Product Lines
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productLines.map((line) => (
                <Link
                  key={line.id}
                  href={`/shop/paint/${category}/${line.slug}`}
                  className="group bg-white rounded-xl border border-[#E8E2D9] p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      line.tier === 'Premium' ? 'bg-[#C9A86C]/10 text-[#C9A86C]' :
                      line.tier === 'Professional' ? 'bg-[#2C2C2C]/10 text-[#2C2C2C]' :
                      'bg-[#4A5240]/10 text-[#4A5240]'
                    }`}>
                      {line.tier}
                    </span>
                    <span className="text-xs text-[#2C2C2C]/40">
                      {line.brand === 'BM' ? 'Benjamin Moore' : line.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] group-hover:text-[#C9A86C] transition-colors">
                    {line.name}
                  </h3>
                  <p className="text-sm text-[#2C2C2C]/60 mt-2 mb-4">
                    {line.description}
                  </p>

                  <ul className="flex flex-wrap gap-2">
                    {line.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="text-xs text-[#2C2C2C]/50 bg-[#FAF8F5] px-2 py-1 rounded">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]/20">
              Coming Soon
            </p>
            <p className="text-sm text-[#2C2C2C]/40 mt-2">
              Product lines for {categoryInfo.name} paint are being added.
            </p>
            <Link
              href="/search"
              className="inline-block mt-6 px-6 py-2 bg-[#2C2C2C] text-white text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              Browse All Colors
            </Link>
          </div>
        )}

        {/* Brand Filter Section */}
        <section className="mt-16 pt-8 border-t border-[#2C2C2C]/8">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-4">
            Shop by Brand
          </h2>
          <div className="flex flex-wrap gap-4">
            {['Benjamin Moore', 'Farrow & Ball', 'Little Greene'].map((brand) => (
              <Link
                key={brand}
                href={`/${brand.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')}`}
                className="px-4 py-2 bg-white border border-[#E8E2D9] rounded-lg text-sm text-[#2C2C2C]/70 hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-[#2C2C2C]/8 py-8 text-center">
        <Link href="/" className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors">
          &larr; Back to Home
        </Link>
      </footer>
    </div>
  );
}
