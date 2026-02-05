import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/aws/dynamo-client';

/**
 * GET /api/search
 *
 * High-performance fuzzy search using Fuse.js with in-memory caching.
 *
 * Query params:
 *   q      — search query (required)
 *   brand  — filter by brand (BM, FB, LG) (optional)
 *   limit  — max results (default: 20, max: 50)
 */

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

interface SearchItem {
  id: string;
  name: string;
  code: string;
  brand: string;
  hexCode: string;
  collection?: string;
}

interface CachedIndex {
  items: SearchItem[];
  fuse: Fuse<SearchItem>;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────
// IN-MEMORY CACHE (persists across hot lambda invocations)
// ─────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cachedIndex: CachedIndex | null = null;

// ─────────────────────────────────────────────────────────
// FUSE.JS CONFIGURATION ("Gold Standard" settings)
// ─────────────────────────────────────────────────────────

const FUSE_OPTIONS: Fuse.IFuseOptions<SearchItem> = {
  keys: [
    { name: 'code', weight: 1.0 },    // Exact code matches weighted highest
    { name: 'name', weight: 0.6 },    // Name matches weighted lower
    { name: 'collection', weight: 0.3 }, // Collection matches weighted lowest
  ],
  threshold: 0.3,          // Allow small typos but filter garbage
  ignoreLocation: true,    // Find matches anywhere in the string
  includeScore: true,      // Include match score for ranking
  includeMatches: true,    // Include match details for highlighting
  minMatchCharLength: 2,   // Minimum characters to match
  shouldSort: true,        // Sort by score
  findAllMatches: false,   // Stop at first match per field
  useExtendedSearch: false,
};

// ─────────────────────────────────────────────────────────
// QUERY NORMALIZATION
// ─────────────────────────────────────────────────────────

function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    // Normalize spaces around hyphens: "HC 172" -> "HC-172" or "HC172"
    .replace(/\s+/g, ' ')
    // Create variations by removing/normalizing separators
    .replace(/[\s-]+/g, (match) => {
      // Keep original but also search without separator
      return match;
    });
}

// Create search variations for better matching
function getSearchVariations(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  const variations = new Set<string>();

  // Original query
  variations.add(normalized);

  // Remove all spaces
  variations.add(normalized.replace(/\s+/g, ''));

  // Replace spaces with hyphens
  variations.add(normalized.replace(/\s+/g, '-'));

  // Remove hyphens
  variations.add(normalized.replace(/-/g, ''));

  // Replace hyphens with spaces
  variations.add(normalized.replace(/-/g, ' '));

  return Array.from(variations);
}

// ─────────────────────────────────────────────────────────
// INDEX BUILDER
// ─────────────────────────────────────────────────────────

async function buildSearchIndex(): Promise<CachedIndex> {
  console.log('[Search] Building search index from DynamoDB...');
  const startTime = Date.now();

  const allItems: SearchItem[] = [];
  let lastKey: Record<string, unknown> | undefined;

  // Fetch all products with minimal fields for search
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'entityType = :type AND (attribute_not_exists(productType) OR productType = :pt)',
        ExpressionAttributeValues: {
          ':type': 'PRODUCT',
          ':pt': 'paint',
        },
        ProjectionExpression: 'id, #n, colorCode, brand, hexCode, #col',
        ExpressionAttributeNames: {
          '#n': 'name',
          '#col': 'collection',
        },
        ExclusiveStartKey: lastKey,
      })
    );

    if (result.Items) {
      for (const item of result.Items) {
        allItems.push({
          id: String(item.id || ''),
          name: String(item.name || ''),
          code: String(item.colorCode || ''),
          brand: String(item.brand || ''),
          hexCode: String(item.hexCode || '#888888'),
          collection: item.collection ? String(item.collection) : undefined,
        });
      }
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  // Build Fuse index
  const fuse = new Fuse(allItems, FUSE_OPTIONS);

  const elapsed = Date.now() - startTime;
  console.log(`[Search] Index built: ${allItems.length} items in ${elapsed}ms`);

  return {
    items: allItems,
    fuse,
    timestamp: Date.now(),
  };
}

async function getSearchIndex(): Promise<CachedIndex> {
  // Check if cache is valid
  if (cachedIndex && Date.now() - cachedIndex.timestamp < CACHE_TTL_MS) {
    return cachedIndex;
  }

  // Rebuild index
  cachedIndex = await buildSearchIndex();
  return cachedIndex;
}

// ─────────────────────────────────────────────────────────
// API HANDLER
// ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const brand = searchParams.get('brand');
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.min(Math.max(limitParam, 1), 50);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      results: [],
      query: query || '',
      total: 0,
      message: 'Query must be at least 2 characters',
    });
  }

  try {
    const index = await getSearchIndex();

    // Get search variations
    const variations = getSearchVariations(query);

    // Search with all variations and collect unique results
    const resultMap = new Map<string, Fuse.FuseResult<SearchItem>>();

    for (const variation of variations) {
      const results = index.fuse.search(variation, { limit: limit * 2 });
      for (const result of results) {
        const existing = resultMap.get(result.item.id);
        // Keep the result with the best (lowest) score
        if (!existing || (result.score && existing.score && result.score < existing.score)) {
          resultMap.set(result.item.id, result);
        }
      }
    }

    // Convert to array and sort by score
    let results = Array.from(resultMap.values())
      .sort((a, b) => (a.score || 0) - (b.score || 0));

    // Filter by brand if specified
    if (brand) {
      results = results.filter((r) => r.item.brand === brand);
    }

    // Limit results
    results = results.slice(0, limit);

    // Format response
    const formattedResults = results.map((r) => ({
      id: r.item.id,
      name: r.item.name,
      code: r.item.code,
      brand: r.item.brand,
      hexCode: r.item.hexCode,
      collection: r.item.collection,
      score: r.score,
      matches: r.matches?.map((m) => ({
        key: m.key,
        indices: m.indices,
      })),
    }));

    // Find suggestions if no results
    let suggestions: string[] = [];
    if (formattedResults.length === 0) {
      // Get all unique names/codes that might be close
      const allNames = index.items.slice(0, 100).map((i) => i.name);
      suggestions = allNames
        .filter((name) => name.toLowerCase().includes(query.toLowerCase().charAt(0)))
        .slice(0, 3);
    }

    return NextResponse.json({
      results: formattedResults,
      query,
      total: formattedResults.length,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      cached: cachedIndex?.timestamp ? true : false,
    });
  } catch (error) {
    console.error('[Search] Error:', error);
    return NextResponse.json(
      {
        results: [],
        query,
        total: 0,
        error: 'Search failed',
      },
      { status: 500 }
    );
  }
}
