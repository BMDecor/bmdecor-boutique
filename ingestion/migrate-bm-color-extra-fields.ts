/**
 * Migration: Backfill BM colour records with palette-level API fields.
 *
 * Adds to every existing BM PRODUCT record in DynamoDB:
 *   - exteriorAvailability ("Available" | "Not Available" | "")
 *   - eStoreAvailable      (boolean — can the colour be ordered online)
 *   - productTypesAvailable (string, comma-separated product lines)
 *   - wetSampleSKU / drySampleSKU (sample ordering — future use)
 *
 * These fields come for free in the GetPaletteByCode response so we don't
 * need 4k GetColorDetail calls. Closes #61 + #69 once the UI reads them.
 *
 * Run: npx ts-node migrate-bm-color-extra-fields.ts
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromIni } from '@aws-sdk/credential-providers';

const AWS_PROFILE = 'bmdecor';
const AWS_REGION = 'eu-west-1';
const TABLE_NAME = 'BmDecorProducts';
const SECRET_NAME = 'BmDecor/BenjaminMoore';

interface BMApiColor {
  number: string;
  name: string;
  hex: string;
  exteriorAvailability: string;
  wetSampleSKU: string;
  drySampleSKU: string;
  eStoreAvailable: boolean;
  productTypesAvailable: string;
}

interface BMPaletteCatalogEntry {
  code: string;
  name: string;
}

const credentials = fromIni({ profile: AWS_PROFILE });
const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: AWS_REGION, credentials }),
  { marshallOptions: { removeUndefinedValues: true } }
);
const secrets = new SecretsManagerClient({ region: AWS_REGION, credentials });

async function getBMSecrets(): Promise<{ BM_API_KEY: string; BM_API_ENDPOINT: string }> {
  const res = await secrets.send(new GetSecretValueCommand({ SecretId: SECRET_NAME }));
  if (!res.SecretString) throw new Error('Empty secret');
  return JSON.parse(res.SecretString);
}

async function discoverPalettes(endpoint: string, apiKey: string): Promise<BMPaletteCatalogEntry[]> {
  const url = `${endpoint}/api/${apiKey}/color/GetPalettesByCategory?category=collection`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`Discovery HTTP ${r.status}`);
  const body = await r.json();
  if (!body?.data?.palettes) throw new Error('No palettes in response');
  return body.data.palettes.map((p: any) => ({ code: p.code, name: p.name }));
}

async function fetchPaletteColors(endpoint: string, apiKey: string, code: string): Promise<BMApiColor[]> {
  const url = `${endpoint}/api/${apiKey}/color/GetPaletteByCode?code=${encodeURIComponent(code)}&colorData=true`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`Palette ${code}: HTTP ${r.status}`);
  const body = await r.json();
  return (body?.data?.colors ?? []) as BMApiColor[];
}

async function scanBMProducts(): Promise<Array<{ PK: string; SK: string; colorCode: string }>> {
  const items: Array<{ PK: string; SK: string; colorCode: string }> = [];
  let lastKey: Record<string, unknown> | undefined;
  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'brand = :b AND entityType = :t',
        ExpressionAttributeValues: { ':b': 'BM', ':t': 'PRODUCT' },
        ProjectionExpression: 'PK, SK, colorCode',
        ExclusiveStartKey: lastKey,
      })
    );
    for (const it of res.Items ?? []) {
      if (it.PK && it.SK && it.colorCode) {
        items.push({ PK: String(it.PK), SK: String(it.SK), colorCode: String(it.colorCode) });
      }
    }
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function updateColor(
  pk: string,
  sk: string,
  data: Partial<BMApiColor>
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
      UpdateExpression:
        'SET exteriorAvailability = :ea, eStoreAvailable = :es, productTypesAvailable = :pt, wetSampleSKU = :ws, drySampleSKU = :ds',
      ExpressionAttributeValues: {
        ':ea': data.exteriorAvailability ?? '',
        ':es': data.eStoreAvailable ?? false,
        ':pt': data.productTypesAvailable ?? '',
        ':ws': data.wetSampleSKU ?? '',
        ':ds': data.drySampleSKU ?? '',
      },
    })
  );
}

async function main(): Promise<void> {
  console.log('→ Loading BM secrets…');
  const { BM_API_KEY, BM_API_ENDPOINT } = await getBMSecrets();

  console.log('→ Discovering palettes…');
  const palettes = await discoverPalettes(BM_API_ENDPOINT, BM_API_KEY);
  console.log(`  ${palettes.length} palettes in catalog`);

  console.log('→ Fetching palette colors…');
  const colorByCode = new Map<string, BMApiColor>();
  for (const p of palettes) {
    const colors = await fetchPaletteColors(BM_API_ENDPOINT, BM_API_KEY, p.code);
    for (const c of colors) {
      // Later palette wins if a color appears in multiple — pragmatic
      colorByCode.set(c.number, c);
    }
    console.log(`  ${p.code.padEnd(20)} ${colors.length} colors  (total distinct: ${colorByCode.size})`);
  }
  console.log(`  ${colorByCode.size} distinct colors from BM API`);

  console.log('→ Scanning DynamoDB BM PRODUCT records…');
  const items = await scanBMProducts();
  console.log(`  ${items.length} records to check`);

  let updated = 0;
  let missing = 0;
  const missingCodes: string[] = [];
  for (const it of items) {
    const c = colorByCode.get(it.colorCode);
    if (!c) {
      missing++;
      if (missingCodes.length < 10) missingCodes.push(it.colorCode);
      continue;
    }
    await updateColor(it.PK, it.SK, c);
    updated++;
    if (updated % 250 === 0) console.log(`  …updated ${updated}/${items.length}`);
  }
  console.log(`\n✓ Updated: ${updated}`);
  console.log(`  Missing from API: ${missing}${missing > 0 ? ` (sample: ${missingCodes.join(', ')})` : ''}`);
}

main().catch((e) => {
  console.error('✗ Migration failed:', e);
  process.exit(1);
});
