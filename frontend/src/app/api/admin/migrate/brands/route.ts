import { NextRequest, NextResponse } from 'next/server';
import { BatchWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedScan } from '@/lib/aws/dynamo-helpers';
import type { BrandId } from '@/types/store';

/**
 * POST /api/admin/migrate/brands
 *
 * Scans all PRODUCT entities and adds brandId field based on color code heuristics.
 * This is a one-time migration script to normalize brand identification.
 *
 * Brand Detection Heuristics:
 * - Benjamin Moore: HC-, OC-, CSP-, AF-, CC-, PM-, BM-, or purely numeric (e.g., 2121-10)
 * - Farrow & Ball: Contains "No." or matches F&B naming patterns
 * - Little Greene: LG patterns, often purely numerical names or specific codes
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    // Fetch all products
    const items = await paginatedScan({
      FilterExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'PRODUCT' },
    });

    console.log(`[Migration] Found ${items.length} items to process`);

    // Analyze and categorize items
    const results = {
      total: items.length,
      updated: 0,
      skipped: 0,
      errors: 0,
      byBrand: {
        'benjamin-moore': 0,
        'farrow-ball': 0,
        'little-greene': 0,
        'unknown': 0,
      } as Record<string, number>,
      samples: [] as { code: string; name: string; detectedBrand: string; existingBrand: string }[],
    };

    // Process items
    const updates: { PK: string; SK: string; brandId: BrandId }[] = [];

    for (const item of items) {
      const colorCode = String(item.colorCode || '');
      const name = String(item.name || '');
      const existingBrand = String(item.brand || '');
      const existingBrandId = item.brandId as string | undefined;

      // Skip if already has brandId
      if (existingBrandId && existingBrandId !== 'unknown') {
        results.skipped++;
        continue;
      }

      // Detect brand from color code patterns
      const detectedBrandId = detectBrandFromCode(colorCode, name, existingBrand);

      results.byBrand[detectedBrandId]++;

      // Store sample for review
      if (results.samples.length < 20) {
        results.samples.push({
          code: colorCode,
          name: name.substring(0, 50),
          detectedBrand: detectedBrandId,
          existingBrand,
        });
      }

      if (detectedBrandId !== 'unknown') {
        updates.push({
          PK: item.PK as string,
          SK: item.SK as string,
          brandId: detectedBrandId as BrandId,
        });
      }
    }

    console.log(`[Migration] Detected brands:`, results.byBrand);
    console.log(`[Migration] Updates to apply: ${updates.length}`);

    // Apply updates if not dry run
    if (!dryRun && updates.length > 0) {
      // Process in batches of 25 (DynamoDB limit)
      const BATCH_SIZE = 25;
      let batchCount = 0;

      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        batchCount++;

        // Use individual updates for better error handling
        for (const update of batch) {
          try {
            await docClient.send(
              new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                  PK: update.PK,
                  SK: update.SK,
                },
                UpdateExpression: 'SET brandId = :brandId, updatedAt = :now',
                ExpressionAttributeValues: {
                  ':brandId': update.brandId,
                  ':now': new Date().toISOString(),
                },
              })
            );
            results.updated++;
          } catch (error) {
            console.error(`[Migration] Failed to update ${update.PK}:`, error);
            results.errors++;
          }
        }

        // Log progress
        if (batchCount % 10 === 0) {
          console.log(`[Migration] Processed ${batchCount * BATCH_SIZE} updates...`);
        }
      }
    } else if (dryRun) {
      results.updated = updates.length;
    }

    return NextResponse.json({
      success: true,
      dryRun,
      results,
      message: dryRun
        ? `Dry run complete. Would update ${updates.length} items.`
        : `Migration complete. Updated ${results.updated} items.`,
    });
  } catch (error) {
    console.error('[Migration] Error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Detect brand from color code using heuristics
 */
function detectBrandFromCode(
  colorCode: string,
  name: string,
  existingBrand: string
): BrandId | 'unknown' {
  const code = colorCode.toUpperCase().trim();
  const nameLower = name.toLowerCase();

  // First, check existing brand field
  if (existingBrand === 'BM' || existingBrand === 'Benjamin Moore') {
    return 'benjamin-moore';
  }
  if (existingBrand === 'FB' || existingBrand === 'Farrow & Ball' || existingBrand === 'Farrow and Ball') {
    return 'farrow-ball';
  }
  if (existingBrand === 'LG' || existingBrand === 'Little Greene') {
    return 'little-greene';
  }

  // Benjamin Moore patterns:
  // - Prefixed codes: HC-XXX, OC-XXX, CSP-XXX, AF-XXX, CC-XXX, PM-XXX, BM-XXX, CW-XXX
  // - Numeric codes: 2121-10, 2163-40, 1479, etc.
  // - Era colors: 2000s+, AC-XX
  const bmPrefixes = /^(HC|OC|CSP|AF|CC|PM|BM|CW|AC|HC|CSP)-?\d/i;
  const bmNumeric = /^\d{3,4}(-\d+)?$/; // Pure numeric codes like 2121-10, 1479
  const bmEra = /^20\d{2}-/; // 2000s era codes like 2163-10

  if (bmPrefixes.test(code) || bmNumeric.test(code) || bmEra.test(code)) {
    return 'benjamin-moore';
  }

  // Farrow & Ball patterns:
  // - "No.XX" or "No. XX" format
  // - Short numeric with F&B naming conventions
  const fbPattern = /^(No\.?\s*\d+|\d{1,3})$/i;
  const fbNamePatterns = [
    'elephant', 'breath', 'bone', 'mouse', 'skimming', 'stone', 'railings',
    'hague', 'stiffkey', 'pointing', 'wimborne', 'pavilion', 'cornforth',
    'hardwick', 'ammonite', 'pigeon', 'charleston', 'purbeck', 'oxford',
    'calamine', 'sulking', 'churlish', 'pitch', 'tanner', 'dead',
  ];

  if (code.startsWith('NO.') || code.startsWith('NO ')) {
    return 'farrow-ball';
  }
  if (fbNamePatterns.some((p) => nameLower.includes(p))) {
    return 'farrow-ball';
  }

  // Little Greene patterns:
  // - Often purely numeric (3-digit)
  // - Specific naming patterns
  const lgNamePatterns = [
    'hicks', 'slaked', 'lime', 'french grey', 'portland', 'invisible',
    'atomic', 'trumpet', 'pink slip', 'arquerite', 'heat', 'joy',
    'lute', 'gauge', 'pale', 'celestial', 'adventurer', 'air force',
  ];

  if (lgNamePatterns.some((p) => nameLower.includes(p))) {
    return 'little-greene';
  }

  // If code is a simple 2-3 digit number without dashes, could be LG or FB
  if (/^\d{2,3}$/.test(code)) {
    // Check name for hints
    if (fbNamePatterns.some((p) => nameLower.includes(p))) {
      return 'farrow-ball';
    }
    if (lgNamePatterns.some((p) => nameLower.includes(p))) {
      return 'little-greene';
    }
    // Default to unknown for ambiguous short codes
    return 'unknown';
  }

  return 'unknown';
}

/**
 * GET /api/admin/migrate/brands
 * Returns migration status / statistics
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Sample query to check current state
    const items = await paginatedScan({
      FilterExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'PRODUCT' },
      Limit: 1000, // Sample size
    });

    const stats = {
      total: items.length,
      withBrandId: 0,
      withoutBrandId: 0,
      byBrand: {} as Record<string, number>,
      byBrandId: {} as Record<string, number>,
    };

    for (const item of items) {
      const brand = String(item.brand || 'unknown');
      const brandId = item.brandId as string | undefined;

      stats.byBrand[brand] = (stats.byBrand[brand] || 0) + 1;

      if (brandId) {
        stats.withBrandId++;
        stats.byBrandId[brandId] = (stats.byBrandId[brandId] || 0) + 1;
      } else {
        stats.withoutBrandId++;
      }
    }

    return NextResponse.json({
      status: 'ready',
      stats,
      message: `${stats.withoutBrandId} items need brandId migration`,
    });
  } catch (error) {
    console.error('[Migration] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status', details: String(error) },
      { status: 500 }
    );
  }
}
