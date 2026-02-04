'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Product {
  id: string;
  brand: 'BM' | 'FB' | 'LG';
  name: string;
  colorCode: string;
  hexCode: string;
  priceEur: number;
  inStock: boolean;
  finishType?: string;
  volume?: string;
}

type BrandFilter = 'ALL' | 'BM' | 'FB' | 'LG';

const brandTabs: { value: BrandFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BM', label: 'BM' },
  { value: 'FB', label: 'FB' },
  { value: 'LG', label: 'LG' },
];

const brandBadgeColors: Record<string, string> = {
  BM: 'bg-blue-100 text-blue-800',
  FB: 'bg-emerald-100 text-emerald-800',
  LG: 'bg-violet-100 text-violet-800',
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchesBrand = brandFilter === 'ALL' || p.brand === brandFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.colorCode && p.colorCode.toLowerCase().includes(q));
    return matchesBrand && matchesSearch;
  });

  const toggleStock = async (product: Product) => {
    const newStock = !product.inStock;
    setTogglingId(product.id);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStock }),
      });
      if (!res.ok) throw new Error('Failed to update');

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, inStock: newStock } : p,
        ),
      );
      toast.success(
        `${product.name} marked as ${newStock ? 'in stock' : 'out of stock'}`,
      );
    } catch {
      toast.error('Failed to update stock status');
    } finally {
      setTogglingId(null);
    }
  };

  const inStockCount = filtered.filter((p) => p.inStock).length;
  const outOfStockCount = filtered.filter((p) => !p.inStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Inventory
        </h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          Manage stock availability across all brands
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C] transition-colors"
          />

          {/* Brand Tabs */}
          <div className="flex gap-1 bg-white border border-[#2C2C2C]/10 rounded-lg p-1">
            {brandTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setBrandFilter(tab.value)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  brandFilter === tab.value
                    ? 'bg-[#2C2C2C] text-white'
                    : 'text-[#2C2C2C]/60 hover:text-[#2C2C2C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock summary */}
        {!loading && (
          <div className="flex gap-4 text-xs text-[#2C2C2C]/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {inStockCount} in stock
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {outOfStockCount} out of stock
            </span>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">
          Loading inventory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg border shadow-sm p-4 transition-all ${
                product.inStock
                  ? 'border-[#2C2C2C]/8'
                  : 'border-red-200 bg-red-50/30'
              }`}
            >
              {/* Top row: badge + toggle */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${brandBadgeColors[product.brand] || 'bg-gray-100 text-gray-700'}`}
                >
                  {product.brand}
                </span>

                {/* Stock toggle */}
                <button
                  onClick={() => toggleStock(product)}
                  disabled={togglingId === product.id}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: product.inStock ? '#C9A86C' : '#D1D5DB',
                  }}
                  title={product.inStock ? 'In Stock - click to toggle' : 'Out of Stock - click to toggle'}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      product.inStock ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Color swatch */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-md border border-[#2C2C2C]/10 shrink-0"
                  style={{ backgroundColor: product.hexCode || '#CCCCCC' }}
                  title={product.hexCode}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#2C2C2C] truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-[#2C2C2C]/40 font-mono">
                    {product.colorCode || '-'}
                  </p>
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2C]/5">
                <span className="text-xs text-[#2C2C2C]/40">
                  {product.finishType || 'Paint'}
                  {product.volume ? ` - ${product.volume}` : ''}
                </span>
                <span
                  className={`text-xs font-medium ${
                    product.inStock ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {!loading && (
        <p className="text-xs text-[#2C2C2C]/40">
          Showing {filtered.length} of {products.length} products
        </p>
      )}
    </div>
  );
}
