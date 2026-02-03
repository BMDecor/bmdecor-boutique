/**
 * Benjamin Moore API Integration - DISCOVERY-FIRST SYNC
 *
 * Stage 1: Calls GetPalettesByCategory to discover ALL collections
 *          from the API itself — NO hardcoded list.
 * Stage 2: Iterates the API's own collection catalog.
 * Stage 3: Zero-tolerance logging — full JSON response for any
 *          collection returning 0 colors.
 *
 * API Patterns:
 *   GET /api/{KEY}/color/GetPalettesByCategory?category=collection
 *   GET /api/{KEY}/color/GetPaletteByCode?code={CODE}&colorData=true
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromIni } from '@aws-sdk/credential-providers';

// Types
type Brand = 'BM' | 'FB' | 'LG';
type FinishType =
  | 'Aura Matte'
  | 'Aura Eggshell'
  | 'Aura Satin'
  | 'Aura Semi-Gloss'
  | 'Regal Select Matte'
  | 'Regal Select Eggshell'
  | 'Regal Select Pearl'
  | 'Regal Select Semi-Gloss';
type Volume = '750ml' | '1L' | '2.5L' | '5L' | '10L';

interface UnifiedPaintProduct {
  id: string;
  brand: Brand;
  name: string;
  colorCode: string;
  hexCode: string;
  finishType: FinishType;
  priceEur: number;
  volume: Volume;
  coverageRate: number;
  collection?: string;
  colorFamily?: string;
  bmUrl?: string;
  description?: string;
  inStock: boolean;
  updatedAt: string;
}

/** Shape returned by the BM API per color */
interface BMApiColor {
  number: string;
  name: string;
  family: string;
  url: string;
  shortURL: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  exteriorAvailability: string;
  wetSampleSKU: string;
  drySampleSKU: string;
  eStoreAvailable: boolean;
  productTypesAvailable: string;
  stainOpacitiesAvailable: string | null;
}

/** Shape of a single palette entry from GetPalettesByCategory */
interface BMCatalogPalette {
  name: string;
  category: string;
  colors: BMApiColor[] | null;
  colorList: string[] | null;
  code: string;
  description: string | null;
  url: string | null;
  rows: number;
  totalColors: number;
  eStoreProductCode: string | null;
}

/** Shape returned by GetPalettesByCategory */
interface BMCatalogResponse {
  data: {
    name: string;
    category: string;
    palettes: BMCatalogPalette[];
  } | null;
  error?: string;
  countryCode?: string;
  brand?: string;
}

/** Shape returned by GetPaletteByCode */
interface BMPaletteResponse {
  data: {
    name: string;
    category: string;
    colors: BMApiColor[];
    code?: string;
    totalColors?: number;
  } | null;
  error?: string;
  countryCode?: string;
  brand?: string;
}

interface BMSecrets {
  BM_API_KEY: string;
  BM_API_ENDPOINT: string;
}

interface CollectionStats {
  code: string;
  name: string;
  catalogTotalColors: number;
  apiCount: number;
  loadedCount: number;
  firstFive: string[];
  lastFive: string[];
  error?: string;
}

// Configuration
const CONFIG = {
  AWS_PROFILE: 'bmdecor',
  AWS_REGION: 'eu-west-1',
  TABLE_NAME: 'BmDecorProducts',
  SECRET_NAME: 'BmDecor/BenjaminMoore',
  DEFAULT_PRICE_EUR: 68.0,
  DEFAULT_COVERAGE_RATE: 12,
};

// Initialize AWS clients
const credentials = fromIni({ profile: CONFIG.AWS_PROFILE });

const ddbClient = new DynamoDBClient({
  region: CONFIG.AWS_REGION,
  credentials,
});

const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const secretsClient = new SecretsManagerClient({
  region: CONFIG.AWS_REGION,
  credentials,
});

// ──────────────────────────────────────────────────────────────
// API FUNCTIONS
// ──────────────────────────────────────────────────────────────

async function getSecrets(): Promise<BMSecrets> {
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: CONFIG.SECRET_NAME })
  );
  if (!response.SecretString) throw new Error('Secret value is empty');
  return JSON.parse(response.SecretString) as BMSecrets;
}

/**
 * DISCOVERY CALL: Fetch the API's own catalog of collections.
 * URL: {ENDPOINT}/api/{KEY}/color/GetPalettesByCategory?category=collection
 *
 * Returns every collectionId the API knows about — no hardcoding.
 */
async function discoverCollections(
  endpoint: string,
  apiKey: string,
  category: string = 'collection',
): Promise<BMCatalogPalette[]> {
  const url = `${endpoint}/api/${apiKey}/color/GetPalettesByCategory?category=${encodeURIComponent(category)}`;

  console.log(`  GET ${url.replace(apiKey, '***')}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  console.log(`  HTTP ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const text = await response.text();
    console.error(`  FULL RESPONSE BODY:\n${text}`);
    throw new Error(`Discovery endpoint returned HTTP ${response.status}`);
  }

  const body = (await response.json()) as BMCatalogResponse;

  if (!body.data || !body.data.palettes) {
    console.error(`  FULL JSON RESPONSE:\n${JSON.stringify(body, null, 2)}`);
    throw new Error(body.error || 'Discovery returned null data');
  }

  return body.data.palettes;
}

/**
 * Fetch a single collection with full color data.
 * URL: {ENDPOINT}/api/{KEY}/color/GetPaletteByCode?code={CODE}&colorData=true
 */
async function fetchCollection(
  endpoint: string,
  apiKey: string,
  collectionCode: string,
): Promise<{ rawResponse: BMPaletteResponse; colors: BMApiColor[]; paletteName: string }> {
  const url = `${endpoint}/api/${apiKey}/color/GetPaletteByCode?code=${encodeURIComponent(collectionCode)}&colorData=true`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  // ZERO-TOLERANCE: Log full response for non-200
  if (!response.ok) {
    const text = await response.text();
    console.error(`    ✗ HTTP ${response.status} ${response.statusText}`);
    console.error(`    FULL RESPONSE BODY:\n${text}`);
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as BMPaletteResponse;

  // ZERO-TOLERANCE: If data is null or colors missing, dump the entire response
  if (!body.data || !body.data.colors) {
    console.error(`    ✗ 200 OK but NO COLOR DATA`);
    console.error(`    FULL JSON RESPONSE:\n${JSON.stringify(body, null, 2)}`);
    return {
      rawResponse: body,
      colors: [],
      paletteName: body.data?.name || collectionCode,
    };
  }

  return {
    rawResponse: body,
    colors: body.data.colors,
    paletteName: body.data.name,
  };
}

// ──────────────────────────────────────────────────────────────
// MAPPING
// ──────────────────────────────────────────────────────────────

function mapToProduct(color: BMApiColor, collectionName: string): UnifiedPaintProduct {
  const now = new Date().toISOString();
  const id = `BM-${color.number}`;

  // Determine finish type by collection
  let finishType: FinishType = 'Regal Select Matte';
  if (collectionName.includes('Stain') || collectionName.includes('Exterior')) {
    finishType = 'Aura Semi-Gloss';
  } else if (collectionName.includes('Color Stories') || collectionName.includes('Affinity')) {
    finishType = 'Aura Matte';
  }

  return {
    id,
    brand: 'BM',
    name: color.name,
    colorCode: color.number,
    hexCode: `#${color.hex}`,
    finishType,
    priceEur: CONFIG.DEFAULT_PRICE_EUR,
    volume: '2.5L',
    coverageRate: CONFIG.DEFAULT_COVERAGE_RATE,
    collection: collectionName,
    colorFamily: color.family || undefined,
    bmUrl: color.url || undefined,
    inStock: color.eStoreAvailable !== false,
    updatedAt: now,
  };
}

// ──────────────────────────────────────────────────────────────
// DYNAMO
// ──────────────────────────────────────────────────────────────

async function loadProduct(product: UnifiedPaintProduct): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: CONFIG.TABLE_NAME,
      Item: {
        PK: `PRODUCT#${product.id}`,
        SK: 'METADATA',
        ...product,
        entityType: 'PRODUCT',
      },
    })
  );
}

async function getDynamoCount(): Promise<number> {
  let total = 0;
  let lastKey: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: CONFIG.TABLE_NAME,
        FilterExpression: 'brand = :brand',
        ExpressionAttributeValues: { ':brand': 'BM' },
        Select: 'COUNT',
        ExclusiveStartKey: lastKey,
      })
    );
    total += result.Count || 0;
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return total;
}

// ──────────────────────────────────────────────────────────────
// REPORTING
// ──────────────────────────────────────────────────────────────

function printAuditReport(stats: CollectionStats[], dbCount: number): void {
  console.log('\n' + '═'.repeat(80));
  console.log('DISCOVERY SYNC AUDIT REPORT');
  console.log('═'.repeat(80));

  let totalCatalog = 0;
  let totalApi = 0;
  let totalLoaded = 0;
  let zeroCollections: string[] = [];

  for (const s of stats) {
    totalCatalog += s.catalogTotalColors;
    totalApi += s.apiCount;
    totalLoaded += s.loadedCount;

    const status = s.error
      ? `✗ ERROR`
      : s.apiCount === 0
      ? `⚠ ZERO COLORS`
      : s.apiCount === s.loadedCount
      ? `✓ SYNC OK`
      : `⚠ DISCREPANCY`;

    console.log(`\n${s.name} (${s.code})`);
    console.log(`  Catalog claims: ${s.catalogTotalColors} | API returned: ${s.apiCount} | Loaded: ${s.loadedCount} | ${status}`);

    if (s.firstFive.length > 0) {
      console.log(`  First 5: ${s.firstFive.join(', ')}`);
    }
    if (s.lastFive.length > 0) {
      console.log(`  Last 5:  ${s.lastFive.join(', ')}`);
    }
    if (s.error) {
      console.log(`  Error: ${s.error}`);
    }
    if (s.apiCount === 0) {
      zeroCollections.push(`${s.code} (${s.name})`);
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('TOTALS:');
  console.log(`  Collections Discovered: ${stats.length}`);
  console.log(`  Catalog Claims Total:   ${totalCatalog}`);
  console.log(`  API Colors Fetched:     ${totalApi}`);
  console.log(`  DynamoDB Loaded:        ${totalLoaded}`);
  console.log(`  DynamoDB Verified:      ${dbCount}`);

  if (zeroCollections.length > 0) {
    console.log(`\n  ⚠ ZERO-COLOR COLLECTIONS (${zeroCollections.length}):`);
    for (const z of zeroCollections) {
      console.log(`    - ${z}`);
    }
  }

  if (totalLoaded !== dbCount) {
    console.log(`\n  ⚠ ALERT: DynamoDB count (${dbCount}) differs from loaded (${totalLoaded}).`);
    console.log(`    Likely due to duplicate color numbers across collections.`);
    console.log(`    Unique PKs written = ${dbCount} (DynamoDB de-duplication).`);
  } else {
    console.log(`\n  ✓ Perfect sync — all counts match.`);
  }

  console.log('═'.repeat(80));
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('═'.repeat(80));
  console.log('BENJAMIN MOORE DISCOVERY-FIRST SYNC');
  console.log('═'.repeat(80));
  console.log(`Profile: ${CONFIG.AWS_PROFILE} | Region: ${CONFIG.AWS_REGION}`);
  console.log(`Table: ${CONFIG.TABLE_NAME}`);
  console.log('NO HARDCODED COLLECTIONS. Catalog sourced from API discovery.');
  console.log('═'.repeat(80));

  const stats: CollectionStats[] = [];

  // ── Step 1: Credentials ──
  console.log('\n[1] Retrieving API credentials from Secrets Manager...');
  const secrets = await getSecrets();

  if (secrets.BM_API_KEY === 'PLACEHOLDER_REPLACE_WITH_ACTUAL_KEY') {
    console.error('FATAL: API key is a placeholder. Cannot proceed.');
    process.exit(1);
  }
  console.log(`  ✓ Credentials retrieved`);
  console.log(`  Endpoint: ${secrets.BM_API_ENDPOINT}`);

  // ── Step 2: DISCOVERY CALL ──
  console.log('\n[2] Discovery: Calling GetPalettesByCategory for all categories...');

  const CATEGORIES = ['collection', 'trend'];
  const catalog: BMCatalogPalette[] = [];

  for (const category of CATEGORIES) {
    console.log(`\n  Category: "${category}"`);
    try {
      const palettes = await discoverCollections(secrets.BM_API_ENDPOINT, secrets.BM_API_KEY, category);
      console.log(`    → ${palettes.length} palettes found`);
      catalog.push(...palettes);
    } catch (err) {
      console.error(`    ✗ Failed: ${err}`);
    }
  }

  // De-duplicate by code (SC appears in both collection and trend)
  const seen = new Set<string>();
  const uniqueCatalog: BMCatalogPalette[] = [];
  for (const p of catalog) {
    const code = p.code || '';
    if (!seen.has(code)) {
      seen.add(code);
      uniqueCatalog.push(p);
    } else {
      console.log(`  (duplicate code "${code}" from second category — skipped)`);
    }
  }

  console.log(`\n  ✓ API returned ${uniqueCatalog.length} unique palettes:\n`);
  console.log('  ' + '─'.repeat(76));
  console.log(`  ${'Code'.padEnd(8)} ${'Name'.padEnd(40)} ${'Category'.padEnd(14)} Colors`);
  console.log('  ' + '─'.repeat(76));

  for (const palette of uniqueCatalog) {
    const code = (palette.code || '???').padEnd(8);
    const name = (palette.name || 'unnamed').replace(/<[^>]+>/g, '').padEnd(40).slice(0, 40);
    const cat = (palette.category || '').padEnd(14);
    const total = palette.totalColors;
    console.log(`  ${code} ${name} ${cat} ${total}`);
  }
  console.log('  ' + '─'.repeat(76));

  // ── Step 3: AUTO-MAP — Iterate the API's own list ──
  console.log('\n[3] Fetching color data for each discovered collection...');

  let grandTotalLoaded = 0;
  const startTime = Date.now();

  for (const palette of uniqueCatalog) {
    const code = palette.code;
    const displayName = (palette.name || code).replace(/<[^>]+>/g, '');

    const stat: CollectionStats = {
      code: code || 'UNKNOWN',
      name: displayName,
      catalogTotalColors: palette.totalColors || 0,
      apiCount: 0,
      loadedCount: 0,
      firstFive: [],
      lastFive: [],
    };

    if (!code) {
      stat.error = 'No collection code in catalog entry';
      console.error(`\n  → ${displayName} — ✗ No code, skipping`);
      stats.push(stat);
      continue;
    }

    try {
      console.log(`\n  → ${displayName} (${code}) — catalog claims ${palette.totalColors} colors`);
      const { colors, paletteName } = await fetchCollection(
        secrets.BM_API_ENDPOINT,
        secrets.BM_API_KEY,
        code,
      );

      stat.apiCount = colors.length;
      stat.name = paletteName.replace(/<[^>]+>/g, '');

      const validColors = colors.filter(c => c && c.number);
      stat.firstFive = validColors.slice(0, 5).map(c => c.number);
      stat.lastFive = validColors.slice(-5).map(c => c.number);

      // ZERO-TOLERANCE: Log if 0 colors returned on 200 OK
      if (colors.length === 0) {
        console.log(`    ⚠ 0 colors returned (see full JSON response logged above)`);
        const nullCount = colors.filter(c => c === null).length;
        if (nullCount > 0) {
          console.log(`    (${nullCount} null entries in colors array)`);
        }
      } else {
        console.log(`    API returned ${colors.length} colors`);
      }

      // Count valid vs null
      const nullEntries = colors.filter(c => c === null).length;
      if (nullEntries > 0) {
        console.log(`    ⚠ ${nullEntries} null color entries (API returns null objects for some colors)`);
      }

      // Load to DynamoDB (skip null entries)
      for (const color of colors) {
        if (!color || !color.number || !color.hex) continue;
        const product = mapToProduct(color, stat.name);
        await loadProduct(product);
        stat.loadedCount++;

        if (stat.loadedCount % 200 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`    Progress: ${stat.loadedCount}/${colors.length} (${elapsed}s elapsed)`);
        }
      }

      console.log(`    ✓ Loaded ${stat.loadedCount} colors`);
      grandTotalLoaded += stat.loadedCount;
    } catch (error) {
      stat.error = String(error);
      console.error(`    ✗ FAILED: ${error}`);
    }

    stats.push(stat);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Total loaded: ${grandTotalLoaded} in ${totalTime}s`);

  // ── Step 4: Verify DynamoDB ──
  console.log('\n[4] Verifying DynamoDB count...');
  const dbCount = await getDynamoCount();
  console.log(`  DynamoDB BM count: ${dbCount}`);

  // ── Step 5: Audit report ──
  printAuditReport(stats, dbCount);

  // Final
  console.log('\n' + '═'.repeat(80));
  console.log(`✓ DISCOVERY SYNC COMPLETE — ${dbCount} official BM colors in DynamoDB`);
  console.log('═'.repeat(80));
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
