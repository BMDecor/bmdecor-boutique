import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/require-admin';
import { paginatedScan } from '@/lib/aws/dynamo-helpers';
import * as XLSX from 'xlsx';

function escapeCSV(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get('format') || 'xlsx';
  const products = await paginatedScan({
    FilterExpression: 'entityType = :type',
    ExpressionAttributeValues: { ':type': 'PRODUCT' },
  });
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
