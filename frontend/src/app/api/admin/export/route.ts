import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { verifyIdToken, extractGroups } from '@/lib/auth/jwt-verify';
import * as XLSX from 'xlsx';

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-1', credentials: fromIni({ profile: 'bmdecor' }) }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const TABLE = 'BmDecorProducts';

async function getAllProducts() {
  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'entityType = :type',
      ExpressionAttributeValues: { ':type': 'PRODUCT' },
      ExclusiveStartKey: lastKey,
    }));
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

function escapeCSV(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('bmdecor_id_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const payload = await verifyIdToken(token);
    if (!extractGroups(payload).includes('Admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get('format') || 'xlsx';
  const products = await getAllProducts();
  const date = new Date().toISOString().split('T')[0];

  const rows = products.map((p) => ({
    Brand: p.brand as string,
    Name: p.name as string,
    'Color Code': (p.colorCode || '') as string,
    'Hex Code': (p.hexCode || '') as string,
    'Finish Type': (p.finishType || '') as string,
    'Price EUR': (p.priceEur ?? 0) as number,
    Volume: (p.volume || '') as string,
    'In Stock': (p.inStock ?? true) ? 'Yes' : 'No',
    'Product Type': (p.productType || 'paint') as string,
    Collection: (p.collection || '') as string,
  }));

  if (format === 'csv') {
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escapeCSV(row[h as keyof typeof row])).join(',')),
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bmdecor-catalog-${date}.csv"`,
      },
    });
  }

  // Default: XLSX
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BM Decoracion Catalog');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="bmdecor-catalog-${date}.xlsx"`,
    },
  });
}
