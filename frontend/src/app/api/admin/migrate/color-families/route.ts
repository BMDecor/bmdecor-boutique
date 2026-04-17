import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';

/**
 * POST /api/admin/migrate/color-families
 *
 * Migrates all color products to have a colorFamily attribute
 * based on HSL color analysis of their hexCode.
 *
 * Query params:
 *   batchLimit - max items to process per request (default: 200)
 *   dryRun - if 'true', only reports what would be changed
 */

// HSL conversion
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Determine color family - improved algorithm
function getColorFamily(hex: string): string {
  if (!hex || hex.length < 6) return 'neutral';
  const { h, s, l } = hexToHSL(hex);

  // Very light colors → white
  if (l > 92) return 'white';

  // Very dark colors → grey
  if (l < 15) return 'grey';

  // Very low saturation (achromatic) → white or grey
  if (s < 8) return l > 75 ? 'white' : 'grey';

  // Low saturation colors - only warm hues become neutrals
  // Cool hues (greens, blues, purples) stay in their hue family even when muted
  if (s < 20) {
    if (l > 85) return 'white';
    if (l < 20) return 'grey';

    // Only warm hues (reds, oranges, yellows: 0-70°) become neutrals when desaturated
    if (h < 70 || h >= 340) {
      return 'neutral';
    }
    // Cool hues with low saturation: classify by hue
    if (h >= 70 && h < 165) return 'green';
    if (h >= 165 && h < 260) return 'blue';
    if (h >= 260 && h < 300) return 'purple';
    if (h >= 300 && h < 340) return 'pink';
  }

  // Light pastel handling
  if (l > 75 && s < 50) {
    if (h < 20 || h >= 345) return 'pink';
    if (h >= 20 && h < 45 && s < 30) return 'neutral';
  }

  // Saturated colors - classify by hue
  if (h < 15 || h >= 345) return 'red';
  if (h >= 15 && h < 40) return 'orange';
  if (h >= 40 && h < 70) return l > 88 && s < 40 ? 'white' : 'yellow';
  if (h >= 70 && h < 165) return 'green';
  if (h >= 165 && h < 260) return 'blue';
  if (h >= 260 && h < 300) return 'purple';
  if (h >= 300 && h < 345) return 'pink';

  return 'neutral';
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const searchParams = request.nextUrl.searchParams;
  const batchLimit = Math.min(parseInt(searchParams.get('batchLimit') || '200', 10), 500);
  const dryRun = searchParams.get('dryRun') === 'true';
  const lastKeyParam = searchParams.get('lastKey');

  let exclusiveStartKey: Record<string, unknown> | undefined;
  if (lastKeyParam) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(lastKeyParam, 'base64').toString('utf-8'));
    } catch {
      // Invalid key, start from beginning
    }
  }

  try {
    // Scan for PRODUCT records
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'entityType = :type',
        ExpressionAttributeValues: {
          ':type': 'PRODUCT',
        },
        ExclusiveStartKey: exclusiveStartKey,
        Limit: batchLimit * 2, // Fetch more since some may not need updates
      })
    );

    const items = result.Items || [];
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    const familyCounts: Record<string, number> = {};
    const examples: { name: string; hex: string; family: string }[] = [];

    for (const item of items) {
      if (processed >= batchLimit) break;

      const hexCode = item.hexCode as string;
      if (!hexCode) {
        skipped++;
        continue;
      }

      const newFamily = getColorFamily(hexCode);
      const currentFamily = item.colorFamily as string | undefined;

      // Track family counts
      familyCounts[newFamily] = (familyCounts[newFamily] || 0) + 1;

      // Only update if family changed or not set
      if (currentFamily !== newFamily) {
        if (!dryRun) {
          await docClient.send(
            new UpdateCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: item.PK,
                SK: item.SK,
              },
              UpdateExpression: 'SET colorFamily = :family',
              ExpressionAttributeValues: {
                ':family': newFamily,
              },
            })
          );
        }
        updated++;

        // Collect examples for review
        if (examples.length < 20) {
          examples.push({
            name: item.name as string,
            hex: hexCode,
            family: newFamily,
          });
        }
      }

      processed++;
    }

    // Encode next key for continuation
    let nextKey: string | null = null;
    if (result.LastEvaluatedKey) {
      nextKey = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return NextResponse.json({
      success: true,
      dryRun,
      processed,
      updated,
      skipped,
      familyCounts,
      examples,
      hasMore: !!result.LastEvaluatedKey,
      nextKey,
      message: dryRun
        ? `Dry run: Would update ${updated} of ${processed} colors`
        : `Updated ${updated} of ${processed} colors with colorFamily attribute`,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}

// GET to check current status
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    // Sample to check how many have colorFamily
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'entityType = :type',
        ExpressionAttributeValues: {
          ':type': 'PRODUCT',
        },
        Limit: 500,
      })
    );

    const items = result.Items || [];
    let withFamily = 0;
    let withoutFamily = 0;
    const familyCounts: Record<string, number> = {};

    for (const item of items) {
      if (item.colorFamily) {
        withFamily++;
        const family = item.colorFamily as string;
        familyCounts[family] = (familyCounts[family] || 0) + 1;
      } else if (item.hexCode) {
        withoutFamily++;
      }
    }

    return NextResponse.json({
      sampled: items.length,
      withFamily,
      withoutFamily,
      familyCounts,
      needsMigration: withoutFamily > 0,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Status check failed' },
      { status: 500 }
    );
  }
}
