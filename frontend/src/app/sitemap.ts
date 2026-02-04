import { MetadataRoute } from 'next';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { createSlug } from '@/lib/utils/slugs';
import { BASE_URL } from '@/lib/utils/env';

interface ProductItem {
  brand: string;
  name: string;
  colorCode: string;
  updatedAt?: string;
}

/**
 * Fetch all products from DynamoDB for sitemap generation.
 */
async function getAllProducts(): Promise<ProductItem[]> {
  try {
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'entityType = :type',
          ExpressionAttributeValues: {
            ':type': 'PRODUCT',
          },
          ProjectionExpression: 'brand, #n, colorCode, updatedAt',
          ExpressionAttributeNames: {
            '#n': 'name',
          },
          ExclusiveStartKey: lastKey,
        })
      );
      if (result.Items) allItems.push(...result.Items);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return allItems.map((item) => ({
      brand: String(item.brand || ''),
      name: String(item.name || ''),
      colorCode: String(item.colorCode || ''),
      updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

/**
 * Generate dynamic sitemap for all products and static pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/benjamin-moore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/farrow-and-ball`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/little-greene`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faqs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.brand && p.name && p.colorCode)
    .map((product) => {
      const slug = createSlug(product);
      return {
        url: `${BASE_URL}/color/${slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      };
    });

  return [...staticPages, ...productPages];
}
