'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportCard {
  format: 'xlsx' | 'csv';
  title: string;
  description: string;
  icon: string;
  filename: string;
}

const exportCards: ExportCard[] = [
  {
    format: 'xlsx',
    title: 'Download Catalog (XLSX)',
    description:
      'Full product catalog in Excel format with all brands, pricing, stock status, and color data. Ideal for spreadsheet analysis and reporting.',
    icon: '[]',
    filename: 'bmdecor-catalog.xlsx',
  },
  {
    format: 'csv',
    title: 'Download Catalog (CSV)',
    description:
      'Full product catalog in CSV format. Compatible with any spreadsheet application and suitable for data imports and integrations.',
    icon: ',.',
    filename: 'bmdecor-catalog.csv',
  },
];

export default function ExportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (card: ExportCard) => {
    setDownloading(card.format);

    try {
      const res = await fetch(`/api/admin/export?format=${card.format}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = card.filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${card.format.toUpperCase()} catalog downloaded`);
    } catch {
      toast.error(`Failed to download ${card.format.toUpperCase()} catalog`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Export Center
        </h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          Download your complete product catalog in various formats
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {exportCards.map((card) => (
          <div
            key={card.format}
            className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm p-8 flex flex-col items-center text-center"
          >
            {/* Format icon */}
            <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#2C2C2C]/8 flex items-center justify-center mb-5">
              <span className="text-2xl font-mono font-bold text-[#C9A86C]">
                {card.format === 'xlsx' ? '.xlsx' : '.csv'}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C] mb-2">
              {card.title}
            </h2>

            {/* Description */}
            <p className="text-xs text-[#2C2C2C]/50 leading-relaxed mb-6">
              {card.description}
            </p>

            {/* Download button */}
            <Button
              onClick={() => handleDownload(card)}
              disabled={downloading !== null}
              className="w-full bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white disabled:opacity-50"
            >
              {downloading === card.format ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-base">&darr;</span>
                  Download {card.format.toUpperCase()}
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="max-w-3xl">
        <p className="text-xs text-[#2C2C2C]/35 leading-relaxed">
          Exports include all products across Benjamin Moore, Farrow &amp; Ball, and
          Little Greene catalogs with current pricing, stock status, color codes,
          and finish types.
        </p>
      </div>
    </div>
  );
}
