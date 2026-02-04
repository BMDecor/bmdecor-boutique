'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Footer from '@/components/layout/Footer';

interface PaintColor {
  id: string;
  brand: string;
  name: string;
  colorCode?: string;
  hexCode?: string;
  finishType?: string;
  priceEur?: number;
  volume?: string;
  collection?: string;
  inStock?: boolean;
}

const BRAND_LABELS: Record<string, string> = {
  BM: 'Benjamin Moore',
  FB: 'Farrow & Ball',
  LG: 'Little Greene',
};

const BRAND_SLUGS: Record<string, string> = {
  BM: '/benjamin-moore',
  FB: '/farrow-and-ball',
  LG: '/little-greene',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [colors, setColors] = useState<PaintColor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('/api/colors');
        if (res.ok) {
          const data = await res.json();
          setColors(data);
        }
      } catch (err) {
        console.error('Search: failed to load colors', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return colors;
    const q = query.toLowerCase();
    return colors.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.colorCode?.toLowerCase().includes(q) ||
        c.brand?.toLowerCase().includes(q) ||
        c.collection?.toLowerCase().includes(q) ||
        BRAND_LABELS[c.brand]?.toLowerCase().includes(q)
    );
  }, [query, colors]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Search Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-[#2C2C2C] tracking-tight mb-6">
          Search
        </h1>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2C2C2C]/30" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for colors, brands, collections..."
            className="pl-12 h-14 text-lg bg-white border-[#E8E2D9] rounded-xl focus:ring-[#C9A86C]/30 focus:border-[#C9A86C]"
            autoFocus
          />
        </div>
        <p className="text-sm text-[#2C2C2C]/40 mt-3">
          {loading ? 'Loading catalog...' : `${filtered.length} color${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </section>

      {/* Results Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-[#E8E2D9]/50" />
                <div className="mt-2 h-3 w-3/4 bg-[#E8E2D9]/50 rounded" />
                <div className="mt-1 h-3 w-1/2 bg-[#E8E2D9]/50 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#2C2C2C]/40 text-lg">No colors match &ldquo;{query}&rdquo;</p>
            <p className="text-[#2C2C2C]/30 text-sm mt-2">Try a different search term or browse by brand</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((color) => (
              <Link
                key={color.id}
                href={BRAND_SLUGS[color.brand] || '/'}
                className="group"
              >
                <div
                  className="aspect-square rounded-xl border border-[#E8E2D9] transition-shadow group-hover:shadow-lg"
                  style={{ backgroundColor: color.hexCode || '#E8E2D9' }}
                />
                <div className="mt-2 px-0.5">
                  <p className="text-sm font-medium text-[#2C2C2C] truncate group-hover:text-[#C9A86C] transition-colors">
                    {color.name}
                  </p>
                  <p className="text-xs text-[#2C2C2C]/50">
                    {BRAND_LABELS[color.brand] || color.brand}
                    {color.colorCode ? ` · ${color.colorCode}` : ''}
                  </p>
                  {color.priceEur != null && (
                    <p className="text-xs text-[#C9A86C] mt-0.5">
                      €{color.priceEur.toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
