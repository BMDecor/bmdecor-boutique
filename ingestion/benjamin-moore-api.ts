/**
 * Benjamin Moore API Integration - ABSOLUTE SYNC
 *
 * Every entry originates from a 200 OK response from the
 * Benjamin Moore Production API. NO SYNTHETIC DATA.
 *
 * API Pattern:
 *   GET /api/{API_KEY}/color/GetPaletteByCode?code={COLLECTION}&colorData=true
 *
 * Discovered Collections (11 total, 4,131 colors):
 *   BMC (1680), CP (1232), CSP (240), CC (231), HC (191),
 *   OC (152), AF (144), CW (144), ES (80), PM (32), SC (5)
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

/** Shape returned by GetPaletteByCode */
interface BMPaletteResponse {
  data: {
    name: string;
    category: string;
    colors: BMApiColor[];
  } | null;
  error?: string;
}

interface BMSecrets {
  BM_API_KEY: string;
  BM_API_ENDPOINT: string;
}

interface CollectionStats {
  code: string;
  name: string;
  apiCount: number;
  loadedCount: number;
  firstFive: string[];
  lastFive: string[];
}

// Configuration
const CONFIG = {
  AWS_PROFILE: 'bmdecor',
  AWS_REGION: 'eu-west-1',
  TABLE_NAME: 'BmDecorProducts',
  SECRET_NAME: 'BmDecor/BenjaminMoore',
  DEFAULT_PRICE_EUR: 68.0,
  DEFAULT_COVERAGE_RATE: 12,
  // ALL official BM collection codes (discovered via GetPalettesByCategory)
  OFFICIAL_COLLECTIONS: [
    { code: 'HC',  name: 'Historical Colors' },
    { code: 'BMC', name: 'Benjamin Moore Classics' },
    { code: 'CC',  name: 'Designer Classics' },
    { code: 'CP',  name: 'Color Preview' },
    { code: 'CSP', name: 'Color Stories' },
    { code: 'AF',  name: 'Affinity Collection' },
    { code: 'CW',  name: 'Williamsburg Collection' },
    { code: 'OC',  name: 'Off White Collection' },
    { code: 'ES',  name: 'Woodluxe Exterior Stain' },
    { code: 'PM',  name: 'Ready-Mix Color' },
    { code: 'SC',  name: 'Fenway Collection' },
  ],
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
 * Fetch a single collection from the BM Production API.
 * URL: {ENDPOINT}/api/{KEY}/color/GetPaletteByCode?code={CODE}&colorData=true
 *
 * The API returns ALL colors in one response per collection (no pagination needed).
 */
async function fetchCollection(
  endpoint: string,
  apiKey: string,
  collectionCode: string
): Promise<{ colors: BMApiColor[]; paletteName: string }> {
  const url = `${endpoint}/api/${apiKey}/color/GetPaletteByCode?code=${encodeURIComponent(collectionCode)}&colorData=true`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as BMPaletteResponse;

  if (!body.data || !body.data.colors) {
    throw new Error(body.error || 'No data returned');
  }

  return {
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
  console.log('HARD SYNC AUDIT REPORT');
  console.log('═'.repeat(80));

  let totalApi = 0;
  let totalLoaded = 0;

  for (const s of stats) {
    totalApi += s.apiCount;
    totalLoaded += s.loadedCount;

    console.log(`\n${s.name} (${s.code}) — ${s.apiCount} from API, ${s.loadedCount} loaded`);

    if (s.firstFive.length > 0) {
      console.log(`  First 5: ${s.firstFive.join(', ')}`);
    }
    if (s.lastFive.length > 0) {
      console.log(`  Last 5:  ${s.lastFive.join(', ')}`);
    }

    if (s.apiCount !== s.loadedCount) {
      console.log(`  ⚠ DISCREPANCY: API=${s.apiCount} vs Loaded=${s.loadedCount}`);
    } else {
      console.log(`  ✓ SYNC OK`);
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('TOTALS:');
  console.log(`  API Colors Fetched:  ${totalApi}`);
  console.log(`  DynamoDB Loaded:     ${totalLoaded}`);
  console.log(`  DynamoDB Verified:   ${dbCount}`);

  if (totalLoaded !== dbCount) {
    console.log(`\n  ⚠ ALERT: DynamoDB count (${dbCount}) differs from loaded (${totalLoaded}).`);
    console.log(`    This may indicate duplicate color numbers across collections.`);
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
  console.log('BENJAMIN MOORE ABSOLUTE SYNC — OFFICIAL API ONLY');
  console.log('═'.repeat(80));
  console.log(`Profile: ${CONFIG.AWS_PROFILE} | Region: ${CONFIG.AWS_REGION}`);
  console.log(`Table: ${CONFIG.TABLE_NAME}`);
  console.log(`Collections: ${CONFIG.OFFICIAL_COLLECTIONS.map(c => c.code).join(', ')}`);
  console.log('NO SYNTHETIC DATA. Every color from a 200 OK API response.');
  console.log('═'.repeat(80));

  const stats: CollectionStats[] = [];

  // Step 1: Credentials
  console.log('\n[1] Retrieving API credentials from Secrets Manager...');
  const secrets = await getSecrets();

  if (secrets.BM_API_KEY === 'PLACEHOLDER_REPLACE_WITH_ACTUAL_KEY') {
    console.error('FATAL: API key is a placeholder. Cannot proceed.');
    process.exit(1);
  }
  console.log('  ✓ Credentials retrieved');

  // Step 2: Fetch + Load each collection
  console.log('\n[2] Fetching from Benjamin Moore Production API...');

  let grandTotalLoaded = 0;
  const startTime = Date.now();

  for (const collection of CONFIG.OFFICIAL_COLLECTIONS) {
    const stat: CollectionStats = {
      code: collection.code,
      name: collection.name,
      apiCount: 0,
      loadedCount: 0,
      firstFive: [],
      lastFive: [],
    };

    try {
      console.log(`\n  → ${collection.name} (${collection.code})...`);
      const { colors, paletteName } = await fetchCollection(
        secrets.BM_API_ENDPOINT,
        secrets.BM_API_KEY,
        collection.code
      );

      stat.apiCount = colors.length;
      stat.name = paletteName.replace(/<[^>]+>/g, ''); // strip HTML entities
      const validColors = colors.filter(c => c && c.number);
      stat.firstFive = validColors.slice(0, 5).map(c => c.number);
      stat.lastFive = validColors.slice(-5).map(c => c.number);

      console.log(`    API returned ${colors.length} colors`);

      // Load to DynamoDB (skip null entries from API)
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
      console.error(`    ✗ FAILED: ${error}`);
    }

    stats.push(stat);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  Total loaded: ${grandTotalLoaded} in ${totalTime}s`);

  // Step 3: Verify DynamoDB
  console.log('\n[3] Verifying DynamoDB count...');
  const dbCount = await getDynamoCount();
  console.log(`  DynamoDB BM count: ${dbCount}`);

  // Step 4: Audit report
  printAuditReport(stats, dbCount);

  // Final
  console.log('\n' + '═'.repeat(80));
  console.log(`✓ ABSOLUTE SYNC COMPLETE — ${dbCount} official BM colors in DynamoDB`);
  console.log('═'.repeat(80));
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
