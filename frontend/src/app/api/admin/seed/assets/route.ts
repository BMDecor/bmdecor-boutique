import { NextRequest, NextResponse } from 'next/server';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { fetchProductList, type BMProductListItem } from '@/lib/api/benjamin-moore';

/**
 * POST /api/admin/seed/assets
 *
 * Fetches official product images from Benjamin Moore API and updates
 * our Master Products in DynamoDB with the real CDN URLs.
 *
 * Only updates BM products - FB and LG products are left unchanged.
 */

// Mapping our product IDs to BM product numbers
// Using the most common/representative variant for each product line
const PRODUCT_MAPPING: Record<string, string[]> = {
  // Our ID → BM Product Numbers (will try in order until found)
  'bm-aura-interior': ['N524', 'N522', 'N526'], // Aura Interior (Eggshell preferred)
  'bm-regal-select': ['N549', 'N548', 'N547'], // Regal Select (Eggshell preferred)
  'bm-aura-bath-spa': ['532'], // Aura Bath & Spa
  'bm-advance': ['792', '794', '793'], // Advance Interior
  'bm-aura-exterior': ['N631', 'N629', 'N634'], // Aura Exterior (Satin preferred)
};

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    console.log('[Asset Fetcher] Fetching BM product catalog...');

    // Fetch all products from BM API
    let bmProducts: BMProductListItem[];
    try {
      bmProducts = await fetchProductList();
      console.log(`[Asset Fetcher] Fetched ${bmProducts.length} products from BM API`);
    } catch (error) {
      console.error('[Asset Fetcher] Failed to fetch BM products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch BM product catalog', details: String(error) },
        { status: 500 }
      );
    }

    // Build a lookup map by product number
    const bmProductMap = new Map<string, BMProductListItem>();
    for (const product of bmProducts) {
      if (product && product.number) {
        bmProductMap.set(product.number, product);
      }
    }

    console.log(`[Asset Fetcher] Built lookup map with ${bmProductMap.size} products`);

    // Results tracking
    const results = {
      total: Object.keys(PRODUCT_MAPPING).length,
      updated: 0,
      skipped: 0,
      notFound: 0,
      errors: 0,
      updates: [] as { ourId: string; bmNumber: string; imageUrl: string }[],
      missing: [] as { ourId: string; triedNumbers: string[] }[],
    };

    const now = new Date().toISOString();

    // Process each of our products
    for (const [ourId, bmNumbers] of Object.entries(PRODUCT_MAPPING)) {
      let foundProduct: BMProductListItem | undefined;

      // Try each BM product number until we find one
      for (const bmNumber of bmNumbers) {
        foundProduct = bmProductMap.get(bmNumber);
        if (foundProduct) break;
      }

      if (!foundProduct) {
        console.log(`[Asset Fetcher] No BM product found for ${ourId} (tried: ${bmNumbers.join(', ')})`);
        results.notFound++;
        results.missing.push({ ourId, triedNumbers: bmNumbers });
        continue;
      }

      // Get the best available image (prefer 2x for good quality)
      let imageUrl = foundProduct.image2x || foundProduct.image1x || foundProduct.image3x;

      if (!imageUrl) {
        console.log(`[Asset Fetcher] BM product ${foundProduct.number} has no image URLs`);
        results.skipped++;
        continue;
      }

      // Ensure URL has https:// protocol
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `https://${imageUrl}`;
      }

      console.log(`[Asset Fetcher] Found image for ${ourId}: ${foundProduct.number} → ${imageUrl}`);

      results.updates.push({
        ourId,
        bmNumber: foundProduct.number,
        imageUrl,
      });

      if (!dryRun) {
        try {
          await docClient.send(
            new UpdateCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `PRODUCT#CAN#${ourId}`,
                SK: 'METADATA',
              },
              UpdateExpression: 'SET imageUrl = :imageUrl, bmProductNumber = :bmNum, updatedAt = :now',
              ExpressionAttributeValues: {
                ':imageUrl': imageUrl,
                ':bmNum': foundProduct.number,
                ':now': now,
              },
            })
          );
          results.updated++;
        } catch (error) {
          console.error(`[Asset Fetcher] Failed to update ${ourId}:`, error);
          results.errors++;
        }
      } else {
        results.updated++;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      results,
      bmCatalogSize: bmProducts.length,
      message: dryRun
        ? `Dry run complete. Would update ${results.updated} products with images.`
        : `Asset fetch complete. Updated ${results.updated} products, ${results.notFound} not found in BM catalog.`,
    });
  } catch (error) {
    console.error('[Asset Fetcher] Error:', error);
    return NextResponse.json(
      { error: 'Asset fetch failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed/assets
 * Returns the current mapping and status
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({
    status: 'ready',
    mapping: PRODUCT_MAPPING,
    description: 'Maps our product IDs to Benjamin Moore product numbers',
    usage: 'POST to this endpoint to fetch and update images from BM API',
  });
}
