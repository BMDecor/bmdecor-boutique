import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ScanCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { PAINT_CATEGORIES, BM_PRODUCT_LINES, FINISH_SHEENS, CONTAINER_SIZES, type Product } from '@/types/store';
import type { ColorItem } from '@/components/shop/ColorPickerModal';
import ProductDetailClient from './ProductDetailClient';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
};

/**
 * Check if an image URL is valid (external http/https URL)
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
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
 * Look up a colour for a brand by its colour code.
 * Used to pre-select a colour when a shopper navigates here from a colour page
 * (e.g. /shop/product/bm-aura-interior?color=HC-1).
 * Returns null if no match.
 */
async function getColorByCode(brand: string, code: string): Promise<ColorItem | null> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI-Brand',
        KeyConditionExpression: 'brand = :brand',
        FilterExpression: 'entityType = :type AND colorCode = :code',
        ExpressionAttributeValues: {
          ':brand': brand,
          ':type': 'PRODUCT',
          ':code': code,
        },
        Limit: 1,
      })
    );
    const item = result.Items?.[0];
    if (!item) return null;
    return {
      id: String(item.id ?? item.colorCode),
      name: String(item.name ?? ''),
      code: String(item.colorCode ?? ''),
      hex: String(item.hexCode ?? ''),
      collection: item.collection ? String(item.collection) : undefined,
    };
  } catch (error) {
    console.error('Error fetching colour by code:', error);
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

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { color: colorParam } = await searchParams;
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

  // Pre-select colour if a ?color=<code> param came in from a colour page
  const initialColor =
    colorParam && product.isTintable
      ? await getColorByCode(product.brand, colorParam)
      : null;

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

      {/* Product Detail - Client Component handles image + configurator */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <ProductDetailClient
          product={product}
          productLine={productLine}
          availableFinishInfo={availableFinishInfo}
          availableSizeInfo={availableSizeInfo}
          initialColor={initialColor}
        />
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
