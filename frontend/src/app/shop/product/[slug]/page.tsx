import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { PAINT_CATEGORIES, BM_PRODUCT_LINES, FINISH_SHEENS, CONTAINER_SIZES, type Product } from '@/types/store';
import ProductConfigurator from './ProductConfigurator';

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Check if an image URL is valid (external http/https URL)
 * Returns false for broken local paths like '/images/products/...'
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Only accept external URLs that start with http/https
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Fetch a master product (paint can) from DynamoDB by slug/id
 */
async function getProductFromDB(slug: string): Promise<Product | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRODUCT#CAN#${slug}`,
          SK: 'METADATA',
        },
      })
    );

    if (!result.Item) return null;

    const item = result.Item;
    return {
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
    };
  } catch (error) {
    console.error('Error fetching product from DynamoDB:', error);
    return null;
  }
}

/**
 * Fetch all master product slugs for static generation
 */
async function getAllProductSlugs(): Promise<string[]> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix) AND entityType = :entityType',
        ExpressionAttributeValues: {
          ':pkPrefix': 'PRODUCT#CAN#',
          ':entityType': 'PRODUCT',
        },
        ProjectionExpression: 'id',
      })
    );

    return (result.Items || []).map((item) => item.id as string);
  } catch (error) {
    console.error('Error fetching product slugs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductFromDB(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const brandName = product.brand === 'BM' ? 'Benjamin Moore' :
                    product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene';

  return {
    title: product.name,
    description: product.description || `${product.name} from ${brandName}`,
    alternates: {
      canonical: `/shop/product/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      images: isValidImageUrl(product.imageUrl) ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductFromDB(slug);

  if (!product) {
    notFound();
  }

  const productLine = BM_PRODUCT_LINES.find((pl) => pl.id === product.productLine);
  const categoryInfo = PAINT_CATEGORIES.find((c) => c.id === product.category);
  const categorySlug = categoryInfo
    ? PAINT_CATEGORIES.find((c) => c.id === categoryInfo.id)?.slug
    : 'interior';

  // Get finish and size metadata for display
  const availableFinishInfo = FINISH_SHEENS.filter((f) =>
    product.availableFinishes.includes(f.id)
  );
  const availableSizeInfo = CONTAINER_SIZES.filter((s) =>
    product.availableSizes.includes(s.id)
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <nav className="flex items-center gap-2 text-sm text-[#2C2C2C]/50">
            <Link href="/" className="hover:text-[#C9A86C]">Home</Link>
            <span>/</span>
            <Link href={`/shop/paint/${categorySlug}`} className="hover:text-[#C9A86C]">
              {categoryInfo?.name || 'Paint'}
            </Link>
            <span>/</span>
            <span className="text-[#2C2C2C]">{product.name}</span>
          </nav>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl border border-[#E8E2D9] overflow-hidden bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5F1EB]">
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A86C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {isValidImageUrl(product.imageUrl) ? (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {/* Image container with shadow and frame */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Soft shadow behind image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A86C]/5 to-[#2C2C2C]/10 rounded-xl blur-xl transform scale-90" />

                    {/* Image wrapper */}
                    <div className="relative bg-white rounded-lg p-4 shadow-lg ring-1 ring-[#E8E2D9]">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={197}
                        height={193}
                        className="object-contain"
                        style={{ imageRendering: 'crisp-edges' }}
                        priority
                        unoptimized={product.imageUrl.includes('benjaminmoore.com')}
                      />
                    </div>
                  </div>

                  {/* Brand watermark */}
                  <div className="absolute bottom-4 right-4 text-xs text-[#C9A86C]/40 font-medium tracking-wider">
                    {product.brand === 'BM' ? 'BENJAMIN MOORE' : product.brand === 'FB' ? 'FARROW & BALL' : 'LITTLE GREENE'}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {/* Paint Can SVG Placeholder */}
                    <div className="w-32 h-40 mx-auto mb-4 relative">
                      <svg
                        viewBox="0 0 80 100"
                        className="w-full h-full drop-shadow-lg"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Can body */}
                        <rect x="10" y="25" width="60" height="70" rx="4" fill="#E8E2D9" stroke="#C9A86C" strokeWidth="2" />
                        {/* Can lid */}
                        <rect x="5" y="15" width="70" height="15" rx="3" fill="#F5F3F0" stroke="#C9A86C" strokeWidth="2" />
                        {/* Handle */}
                        <path d="M25 15 Q40 0 55 15" stroke="#C9A86C" strokeWidth="3" fill="none" strokeLinecap="round" />
                        {/* Label area */}
                        <rect x="18" y="40" width="44" height="40" rx="2" fill="white" stroke="#E8E2D9" strokeWidth="1" />
                        {/* Brand indicator */}
                        <text x="40" y="58" textAnchor="middle" fontSize="8" fill="#C9A86C" fontWeight="bold">
                          {product.brand}
                        </text>
                        <text x="40" y="72" textAnchor="middle" fontSize="6" fill="#2C2C2C" opacity="0.5">
                          PAINT
                        </text>
                      </svg>
                    </div>
                    <span className="text-sm text-[#2C2C2C]/40 font-medium">
                      {product.brand === 'BM' ? 'Benjamin Moore' : product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
                    </span>
                    <p className="text-xs text-[#2C2C2C]/30 mt-1">
                      Product image coming soon
                    </p>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {productLine && (
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    productLine.tier === 'Premium' ? 'bg-[#C9A86C] text-white' :
                    productLine.tier === 'Professional' ? 'bg-[#2C2C2C] text-white' :
                    'bg-[#4A5240] text-white'
                  }`}>
                    {productLine.tier}
                  </span>
                )}
                {product.inStock && (
                  <span className="text-xs px-3 py-1 bg-[#4A5240] text-white rounded-full">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Features */}
            {productLine && productLine.features.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
                <h3 className="font-medium text-[#2C2C2C] mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {productLine.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-[#2C2C2C]/70">
                      <svg className="w-4 h-4 text-[#C9A86C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Product Info & Configurator */}
          <div className="space-y-6">
            {/* Brand & Product Line */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#2C2C2C]/50">
                {product.brand === 'BM' ? 'Benjamin Moore' : product.brand === 'FB' ? 'Farrow & Ball' : 'Little Greene'}
              </span>
              {productLine && (
                <>
                  <span className="text-[#2C2C2C]/20">•</span>
                  <span className="text-sm text-[#C9A86C]">{productLine.name}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-[#2C2C2C]">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-[#2C2C2C]/70 leading-relaxed">
              {product.description}
            </p>

            {/* Coverage Info */}
            <div className="flex items-center gap-6 py-4 border-y border-[#E8E2D9]">
              <div>
                <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wide">Coverage</p>
                <p className="text-lg font-medium text-[#2C2C2C]">
                  {product.coverageRateM2PerL} m²/L
                </p>
              </div>
              <div className="h-8 w-px bg-[#E8E2D9]" />
              <div>
                <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wide">Sizes</p>
                <p className="text-lg font-medium text-[#2C2C2C]">
                  {product.availableSizes.length} options
                </p>
              </div>
              <div className="h-8 w-px bg-[#E8E2D9]" />
              <div>
                <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wide">Finishes</p>
                <p className="text-lg font-medium text-[#2C2C2C]">
                  {product.availableFinishes.length} sheens
                </p>
              </div>
            </div>

            {/* Product Configurator (Client Component) */}
            <ProductConfigurator
              product={product}
              availableFinishInfo={availableFinishInfo}
              availableSizeInfo={availableSizeInfo}
            />

            {/* Finish Guide */}
            <div className="bg-[#F5F3F0] rounded-xl p-6">
              <h3 className="font-medium text-[#2C2C2C] mb-4">Finish Guide</h3>
              <div className="space-y-3">
                {availableFinishInfo.map((finish) => (
                  <div key={finish.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#2C2C2C]">{finish.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        finish.durability === 'High' ? 'bg-[#4A5240]/10 text-[#4A5240]' :
                        finish.durability === 'Medium' ? 'bg-[#C9A86C]/10 text-[#C9A86C]' :
                        'bg-[#2C2C2C]/10 text-[#2C2C2C]'
                      }`}>
                        {finish.durability} Durability
                      </span>
                    </div>
                    <p className="text-[#2C2C2C]/60 mt-1">{finish.description}</p>
                    <p className="text-xs text-[#2C2C2C]/40 mt-1">
                      Best for: {finish.bestFor.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C2C2C]/8 py-8 text-center">
        <Link
          href={`/shop/paint/${categorySlug}`}
          className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors"
        >
          &larr; Back to {categoryInfo?.name || 'Paint'}
        </Link>
      </footer>
    </div>
  );
}
