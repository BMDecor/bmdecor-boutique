import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

/**
 * GET /api/products
 *
 * Fetches Master Products (paint cans) from DynamoDB.
 * These are the actual products you can buy - not colors.
 *
 * Query params:
 *   category  — filter by category (Interior, Exterior, Trim & Door, Primer)
 *   brand     — filter by brand short code (BM, FB, LG)
 *   brandId   — filter by brand slug (benjamin-moore, farrow-ball, little-greene)
 *   type      — filter by product type (base_paint, primer)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const brandId = searchParams.get('brandId');
  const productType = searchParams.get('type');

  try {
    // Build filter expression for master products (PK begins with PRODUCT#CAN#)
    let filterExpression = 'begins_with(PK, :pkPrefix) AND entityType = :entityType';
    const expressionAttributeValues: Record<string, unknown> = {
      ':pkPrefix': 'PRODUCT#CAN#',
      ':entityType': 'PRODUCT',
    };

    // Add optional filters
    if (category) {
      filterExpression += ' AND category = :category';
      expressionAttributeValues[':category'] = category;
    }

    if (brand) {
      filterExpression += ' AND brand = :brand';
      expressionAttributeValues[':brand'] = brand;
    }

    if (brandId) {
      filterExpression += ' AND brandId = :brandId';
      expressionAttributeValues[':brandId'] = brandId;
    }

    if (productType) {
      filterExpression += ' AND productType = :productType';
      expressionAttributeValues[':productType'] = productType;
    }

    // Scan for master products with pagination
    const allItems: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: filterExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ExclusiveStartKey: lastKey,
        })
      );

      if (result.Items) {
        allItems.push(...result.Items);
      }
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    // Shape response
    const products = allItems.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      brandId: item.brandId,
      productLine: item.productLine,
      department: item.department,
      category: item.category,
      type: item.productType,
      tags: item.tags || [],
      basePrice: item.basePrice,
      availableFinishes: item.availableFinishes || [],
      availableSizes: item.availableSizes || [],
      isTintable: item.isTintable ?? true,
      description: item.description,
      imageUrl: item.imageUrl,
      coverageRateM2PerL: item.coverageRateM2PerL,
      inStock: item.inStock ?? true,
    }));

    // Sort by brand then name
    products.sort((a, b) => {
      if (a.brand !== b.brand) {
        return a.brand.localeCompare(b.brand);
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ products: [], total: 0 }, { status: 200 });
  }
}
