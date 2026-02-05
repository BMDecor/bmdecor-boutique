import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProductBySlug, getAllProducts } from '@/lib/inventory';
import { PAINT_CATEGORIES, BM_PRODUCT_LINES, FINISH_SHEENS, CONTAINER_SIZES } from '@/types/store';
import ProductConfigurator from './ProductConfigurator';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const productLine = BM_PRODUCT_LINES.find((pl) => pl.id === product.productLine);

  return {
    title: product.name,
    description: product.description || `${product.name} from Benjamin Moore`,
    alternates: {
      canonical: `/shop/product/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({ slug: product.id }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
            <div className="relative aspect-square bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-[#C9A86C]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-[#2C2C2C]/30">
                      Benjamin Moore
                    </span>
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
                {product.brand === 'BM' ? 'Benjamin Moore' : product.brand}
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
