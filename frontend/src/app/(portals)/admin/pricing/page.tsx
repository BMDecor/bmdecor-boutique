'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  id: string;
  brand: 'BM' | 'FB' | 'LG';
  name: string;
  colorCode: string;
  hexCode: string;
  priceEur: number;
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

const brandColors: Record<string, string> = {
  BM: 'bg-blue-100 text-blue-800',
  FB: 'bg-emerald-100 text-emerald-800',
  LG: 'bg-violet-100 text-violet-800',
};

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

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

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.priceEur.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const savePrice = async (productId: string) => {
    const priceEur = parseFloat(editValue);
    if (isNaN(priceEur) || priceEur < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceEur }),
      });
      if (!res.ok) throw new Error('Failed to update');

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, priceEur } : p)),
      );
      toast.success('Price updated successfully');
      setEditingId(null);
      setEditValue('');
    } catch {
      toast.error('Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Pricing
        </h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          Manage product pricing across all brands
        </p>
      </div>

      {/* Filters */}
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">
            No products found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2C2C2C]/8">
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Brand
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Name
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Color Code
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Price (EUR)
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-b border-[#2C2C2C]/5 hover:bg-[#FAF8F5]/50"
                >
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${brandColors[product.brand] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {product.brand}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-[#2C2C2C]">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.finishType && (
                        <p className="text-xs text-[#2C2C2C]/40 mt-0.5">
                          {product.finishType}
                          {product.volume ? ` - ${product.volume}` : ''}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#2C2C2C]/60 font-mono">
                    {product.colorCode || '-'}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePrice(product.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        className="w-24 px-2 py-1 text-sm border border-[#C9A86C] rounded bg-white focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(product)}
                        className="text-sm text-[#2C2C2C] hover:text-[#C9A86C] transition-colors cursor-pointer"
                        title="Click to edit price"
                      >
                        {product.priceEur.toFixed(2)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => savePrice(product.id)}
                          disabled={saving}
                          className="h-7 px-3 text-xs bg-[#C9A86C] hover:bg-[#B8975B] text-white"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="h-7 px-3 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(product)}
                        className="h-7 px-3 text-xs border-[#2C2C2C]/15 text-[#2C2C2C]/60 hover:text-[#C9A86C] hover:border-[#C9A86C]/30"
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-[#2C2C2C]/40">
          Showing {filtered.length} of {products.length} products
        </p>
      )}
    </div>
  );
}
