import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { PAINT_CATEGORIES, BM_PRODUCT_LINES, type PaintCategory, type Product } from '@/types/store';
import { calculatePrice } from '@/lib/inventory';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

type PageProps = {
  params: Promise<{ category: string }>;
};

/**
 * Check if an image URL is valid (external http/https URL)
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

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

/**
 * Fetch master products (paint cans) from DynamoDB by category
 */
async function getProductsFromDB(category: string): Promise<Product[]> {
  const categoryName = CATEGORY_MAP[category];
  if (!categoryName) return [];

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix) AND entityType = :entityType AND category = :category',
        ExpressionAttributeValues: {
          ':pkPrefix': 'PRODUCT#CAN#',
          ':entityType': 'PRODUCT',
          ':category': categoryName,
        },
      })
    );

    return (result.Items || []).map((item) => ({
      id: item.id as string,
      name: item.name as string,
      brand: item.brand as string,
      brandId: item.brandId as Product['brandId'],
      productLine: item.productLine as string,
      department: item.department as string,
      category: item.category as string,
      type: (item.productType as Product['type']) || 'paint',
      tags: (item.tags as string[]) || [],
      basePrice: item.basePrice as number,
      availableFinishes: (item.availableFinishes as Product['availableFinishes']) || [],
      availableSizes: (item.availableSizes as Product['availableSizes']) || [],
      isTintable: (item.isTintable as boolean) ?? true,
      description: item.description as string,
      imageUrl: item.imageUrl as string,
      coverageRateM2PerL: item.coverageRateM2PerL as number,
      inStock: (item.inStock as boolean) ?? true,
      updatedAt: item.updatedAt as string,
    }));
  } catch (error) {
    console.error('Error fetching products from DynamoDB:', error);
    return [];
  }
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

  // Get products for this category from DynamoDB
  const products = await getProductsFromDB(category);

  // Get product lines for this category (for reference info)
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

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
                Products
              </h2>
              <p className="text-sm text-[#2C2C2C]/50">
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const productLine = BM_PRODUCT_LINES.find((pl) => pl.id === product.productLine);
                const startingPrice = calculatePrice(
                  product.basePrice,
                  product.availableSizes[0],
                  product.availableFinishes[0]
                );

                return (
                  <article
                    key={product.id}
                    className="group bg-white rounded-xl border border-[#E8E2D9] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F1EB]">
                      {/* Subtle pattern */}
                      <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A86C' fill-opacity='1'%3E%3Cpath d='M20 20h-4v-4h4v4zm0-20h-4v4h4V0zM0 20h4v-4H0v4z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />

                      {isValidImageUrl(product.imageUrl) ? (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          {/* Framed image */}
                          <div className="relative bg-white rounded-lg p-3 shadow-md ring-1 ring-[#E8E2D9]/50 group-hover:shadow-lg transition-shadow">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={140}
                              height={137}
                              className="object-contain"
                              style={{ imageRendering: 'crisp-edges' }}
                              unoptimized={product.imageUrl.includes('benjaminmoore.com')}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            {/* Paint Can SVG Placeholder */}
                            <svg
                              viewBox="0 0 80 100"
                              className="w-16 h-20 mx-auto mb-2 drop-shadow-md"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect x="10" y="25" width="60" height="70" rx="4" fill="#E8E2D9" stroke="#C9A86C" strokeWidth="2" />
                              <rect x="5" y="15" width="70" height="15" rx="3" fill="#F5F3F0" stroke="#C9A86C" strokeWidth="2" />
                              <path d="M25 15 Q40 0 55 15" stroke="#C9A86C" strokeWidth="3" fill="none" strokeLinecap="round" />
                              <rect x="18" y="40" width="44" height="40" rx="2" fill="white" stroke="#E8E2D9" strokeWidth="1" />
                              <text x="40" y="58" textAnchor="middle" fontSize="8" fill="#C9A86C" fontWeight="bold">
                                {product.brand}
                              </text>
                              <text x="40" y="72" textAnchor="middle" fontSize="6" fill="#2C2C2C" opacity="0.5">
                                PAINT
                              </text>
                            </svg>
                            <span className="text-xs text-[#2C2C2C]/30">
                              {product.brand === 'BM' ? 'Benjamin Moore' : product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Stock Badge */}
                      {product.inStock && (
                        <span className="absolute top-3 right-3 text-xs px-2 py-1 bg-[#4A5240] text-white rounded-full">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {/* Tier & Product Line */}
                      <div className="flex items-center justify-between mb-2">
                        {productLine && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            productLine.tier === 'Premium' ? 'bg-[#C9A86C]/10 text-[#C9A86C]' :
                            productLine.tier === 'Professional' ? 'bg-[#2C2C2C]/10 text-[#2C2C2C]' :
                            'bg-[#4A5240]/10 text-[#4A5240]'
                          }`}>
                            {productLine.tier}
                          </span>
                        )}
                        <span className="text-xs text-[#2C2C2C]/40">
                          {product.brand === 'BM' ? 'Benjamin Moore' : product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C] mb-2">
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[#2C2C2C]/60 mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Available Finishes */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.availableFinishes.map((finish) => (
                          <span
                            key={finish}
                            className="text-xs text-[#2C2C2C]/50 bg-[#FAF8F5] px-2 py-1 rounded"
                          >
                            {finish}
                          </span>
                        ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
                        <div>
                          <p className="text-xs text-[#2C2C2C]/40">Starting at</p>
                          <p className="text-lg font-semibold text-[#2C2C2C]">
                            €{startingPrice.toFixed(2)}
                          </p>
                        </div>
                        <Link
                          href={`/shop/product/${product.id}`}
                          className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors group-hover:bg-[#C9A86C]"
                        >
                          Configure
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]/20">
              Coming Soon
            </p>
            <p className="text-sm text-[#2C2C2C]/40 mt-2">
              Products for {categoryInfo.name} paint are being added.
            </p>
            <Link
              href="/search"
              className="inline-block mt-6 px-6 py-2 bg-[#2C2C2C] text-white text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              Browse All Colors
            </Link>
          </div>
        )}

        {/* Product Lines Reference (if any exist for this category) */}
        {productLines.length > 0 && (
          <section className="mt-16 pt-8 border-t border-[#2C2C2C]/8">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-6">
              Product Lines in {categoryInfo.name}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productLines.map((line) => (
                <div
                  key={line.id}
                  className="bg-white rounded-lg border border-[#E8E2D9] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      line.tier === 'Premium' ? 'bg-[#C9A86C]/10 text-[#C9A86C]' :
                      line.tier === 'Professional' ? 'bg-[#2C2C2C]/10 text-[#2C2C2C]' :
                      'bg-[#4A5240]/10 text-[#4A5240]'
                    }`}>
                      {line.tier}
                    </span>
                  </div>
                  <h3 className="font-medium text-[#2C2C2C]">{line.name}</h3>
                  <p className="text-sm text-[#2C2C2C]/60 mt-1">{line.description}</p>
                </div>
              ))}
            </div>
          </section>
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
