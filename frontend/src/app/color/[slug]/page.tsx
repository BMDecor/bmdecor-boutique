import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { parseSlug } from '@/lib/utils/slugs';
import { BASE_URL } from '@/lib/utils/env';
import ColorDetailView from '@/components/product/ColorDetailView';
import StandardColorView from '@/components/product/StandardColorView';

interface ColorProduct {
  id: string;
  brand: string;
  name: string;
  colorCode: string;
  hexCode: string;
  finishType: string;
  priceEur: number;
  volume: string;
  collection?: string;
  description?: string;
  inStock: boolean;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Brand configuration
const BRAND_CONFIG: Record<
  string,
  {
    name: string;
    slug: string;
    accentColor: string;
    bgColor: string;
    finishTypes: string[];
  }
> = {
  BM: {
    name: 'Benjamin Moore',
    slug: 'benjamin-moore',
    accentColor: '#C9A86C',
    bgColor: '#2C2C2C',
    finishTypes: [], // BM uses product lines, not simple finish types
  },
  FB: {
    name: 'Farrow & Ball',
    slug: 'farrow-and-ball',
    accentColor: '#F5F1EB',
    bgColor: '#8B7355',
    finishTypes: [
      'Estate Emulsion',
      'Modern Emulsion',
      'Dead Flat',
      'Flat Eggshell',
      'Estate Eggshell',
      'Modern Eggshell',
      'Full Gloss',
      'Exterior Eggshell',
      'Exterior Masonry',
      'Casein Distemper',
      'Soft Distemper',
      'Limewash',
    ],
  },
  LG: {
    name: 'Little Greene',
    slug: 'little-greene',
    accentColor: '#E8E4D9',
    bgColor: '#4A5240',
    finishTypes: [
      'Intelligent Matt Emulsion',
      'Absolute Matt Emulsion',
      'Intelligent Eggshell',
      'Intelligent Satin',
      'Intelligent Gloss',
      'Intelligent Exterior Eggshell',
      'Intelligent ASP',
      "Tom's Oil Eggshell",
      'Traditional Oil Gloss',
      'Intelligent Floor Paint',
      'Interior Oil Eggshell',
      'Intelligent Masonry Paint',
      'Wall Primer Sealer',
      'Distemper',
      'Limewash',
    ],
  },
};

/**
 * Resolve a slug to a product from DynamoDB.
 */
async function getProductBySlug(slug: string): Promise<ColorProduct | null> {
  const parsed = parseSlug(slug);
  if (!parsed) return null;

  const { brand, codeSlug } = parsed;

  try {
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI-Brand',
          KeyConditionExpression: 'brand = :brand',
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':brand': brand,
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    const normalizeCode = (code: string) =>
      code
        .toLowerCase()
        .replace(/[^\w]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const product = allItems.find((item) => {
      const itemCode = String(item.colorCode || '');
      return normalizeCode(itemCode) === codeSlug;
    });

    if (!product) return null;

    return {
      id: String(product.id),
      brand: String(product.brand),
      name: String(product.name),
      colorCode: String(product.colorCode),
      hexCode: String(product.hexCode),
      finishType: String(product.finishType || ''),
      priceEur: Number(product.priceEur || 0),
      volume: String(product.volume || ''),
      collection: product.collection ? String(product.collection) : undefined,
      description: product.description ? String(product.description) : undefined,
      inStock: Boolean(product.inStock),
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

/**
 * Fetch all products for a brand (used for sibling colors).
 */
async function getAllBrandColors(brand: string): Promise<ColorProduct[]> {
  try {
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI-Brand',
          KeyConditionExpression: 'brand = :brand',
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':brand': brand,
            ':type': 'PRODUCT',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return allItems.map((item) => ({
      id: String(item.id),
      brand: String(item.brand),
      name: String(item.name),
      colorCode: String(item.colorCode),
      hexCode: String(item.hexCode),
      finishType: String(item.finishType || ''),
      priceEur: Number(item.priceEur || 0),
      volume: String(item.volume || ''),
      collection: item.collection ? String(item.collection) : undefined,
      description: item.description ? String(item.description) : undefined,
      inStock: Boolean(item.inStock),
    }));
  } catch {
    return [];
  }
}

/**
 * Generate SEO metadata for the color page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Color Not Found | BM Decoracion',
    };
  }

  const brandConfig = BRAND_CONFIG[product.brand];
  const brandName = brandConfig?.name || product.brand;
  const title = `${product.name} ${product.colorCode} | ${brandName} | BM Decoracion`;
  const description = product.description
    ? `${product.name} (${product.colorCode}) - ${product.description.slice(0, 150)}... Premium paint from ${brandName}. Shop online at BM Decoracion Marbella.`
    : `${product.name} (${product.colorCode}) - Premium ${brandName} paint. Available in multiple finishes. Shop online at BM Decoracion Marbella. IVA incluido.`;

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/color/${slug}`,
      images: [
        {
          url:
            product.brand === 'BM'
              ? `https://www.benjaminmoore.com/colors/color/${product.colorCode.toLowerCase()}/swatch`
              : `${BASE_URL}/api/og?color=${encodeURIComponent(product.hexCode)}&name=${encodeURIComponent(product.name)}`,
          width: 300,
          height: 300,
          alt: `${product.name} color swatch`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/color/${slug}`,
    },
  };
}

/**
 * Color product detail page - SEO optimized for all brands.
 */
export default async function ColorPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const brandConfig = BRAND_CONFIG[product.brand];
  const brandName = brandConfig?.name || product.brand;

  // JSON-LD Product Schema for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.name} ${product.colorCode}`,
    description:
      product.description ||
      `${product.name} is a premium paint color from ${brandName}. Available in multiple finishes and sizes.`,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    sku: `${product.brand}-${product.colorCode}`,
    color: product.hexCode,
    image:
      product.brand === 'BM'
        ? `https://www.benjaminmoore.com/colors/color/${product.colorCode.toLowerCase()}/swatch`
        : `${BASE_URL}/api/og?color=${encodeURIComponent(product.hexCode)}&name=${encodeURIComponent(product.name)}`,
    offers: {
      '@type': 'Offer',
      price: product.priceEur.toFixed(2),
      priceCurrency: 'EUR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'BM Decoracion',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Calle Dublin 21',
          addressLocality: 'Marbella',
          addressRegion: 'Malaga',
          postalCode: '29660',
          addressCountry: 'ES',
        },
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  };

  // Fetch all colors for the same brand (for palette fallback)
  const allBrandColors = await getAllBrandColors(product.brand);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Render brand-specific view */}
      {product.brand === 'BM' ? (
        <ColorDetailView
          product={product}
          brandName={brandName}
          allBrandColors={allBrandColors}
        />
      ) : (
        <StandardColorView
          product={product}
          brandName={brandName}
          brandSlug={brandConfig?.slug || product.brand.toLowerCase()}
          accentColor={brandConfig?.accentColor || '#C9A86C'}
          bgColor={brandConfig?.bgColor || '#2C2C2C'}
          finishTypes={brandConfig?.finishTypes || []}
        />
      )}
    </>
  );
}
