'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface Product {
  id: string;
  brand: 'BM' | 'FB' | 'LG';
  name: string;
  colorCode: string;
  hexCode: string;
  priceEur: number;
  productType: string;
  inStock: boolean;
  finishType?: string;
  volume?: string;
  collection?: string;
}

type BrandFilter = 'ALL' | 'BM' | 'FB' | 'LG';
type TypeFilter = 'all' | 'paint' | 'wallpaper' | 'accessory';
type StockFilter = 'all' | 'in-stock' | 'out-of-stock';

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

const ITEMS_PER_PAGE = 50;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);

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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, brandFilter, typeFilter, stockFilter]);

  const filtered = products.filter((p) => {
    if (brandFilter !== 'ALL' && p.brand !== brandFilter) return false;
    if (typeFilter !== 'all' && p.productType !== typeFilter) return false;
    if (stockFilter === 'in-stock' && !p.inStock) return false;
    if (stockFilter === 'out-of-stock' && p.inStock) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q)
        || (p.colorCode && p.colorCode.toLowerCase().includes(q))
        || (p.collection && p.collection.toLowerCase().includes(q));
    }
    return true;
  });

  const inStockCount = filtered.filter((p) => p.inStock).length;
  const outOfStockCount = filtered.length - inStockCount;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const updateProduct = async (id: string, fields: Partial<Product>) => {
    setSavingField(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...fields } : p)),
      );
      return true;
    } catch {
      toast.error('Failed to update product');
      return false;
    } finally {
      setSavingField(null);
    }
  };

  const handlePriceSave = async (id: string) => {
    const parsed = parseFloat(priceValue);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Invalid price');
      return;
    }
    const ok = await updateProduct(id, { priceEur: parsed });
    if (ok) {
      setEditingPrice(null);
      toast.success('Price updated');
    }
  };

  const handleStockToggle = async (id: string, checked: boolean) => {
    const ok = await updateProduct(id, { inStock: checked });
    if (ok) toast.success(checked ? 'Marked in stock' : 'Marked out of stock');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
            Products
          </h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">
            Manage all products across brands
          </p>
        </div>
        <Button asChild className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, code, or collection..."
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

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="px-3 py-2 text-xs border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
        >
          <option value="all">All Types</option>
          <option value="paint">Paint</option>
          <option value="wallpaper">Wallpaper</option>
          <option value="accessory">Accessory</option>
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="px-3 py-2 text-xs border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
        >
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        {/* Stock Summary */}
        {!loading && (
          <span className="text-xs text-[#2C2C2C]/50 ml-auto">
            <span className="text-green-600 font-medium">{inStockCount}</span> in stock
            {' / '}
            <span className="text-red-500 font-medium">{outOfStockCount}</span> out of stock
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading products...</div>
        ) : paged.length === 0 ? (
          <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">No products found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2C2C2C]/8">
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40 w-10" />
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Brand</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Code</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Volume</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Price</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Stock</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((p) => (
                <TableRow key={p.id} className="border-b border-[#2C2C2C]/5 hover:bg-[#FAF8F5]/50">
                  {/* Swatch */}
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded-full border border-[#2C2C2C]/10"
                      style={{ backgroundColor: p.hexCode || '#ccc' }}
                    />
                  </TableCell>
                  {/* Brand */}
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${brandColors[p.brand] || 'bg-gray-100 text-gray-700'}`}>
                      {p.brand}
                    </span>
                  </TableCell>
                  {/* Name */}
                  <TableCell className="text-sm text-[#2C2C2C]">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.finishType && (
                        <p className="text-xs text-[#2C2C2C]/40 mt-0.5">{p.finishType}</p>
                      )}
                    </div>
                  </TableCell>
                  {/* Code */}
                  <TableCell className="text-sm text-[#2C2C2C]/60 font-mono">{p.colorCode || '-'}</TableCell>
                  {/* Type */}
                  <TableCell className="text-xs text-[#2C2C2C]/50 capitalize">{p.productType}</TableCell>
                  {/* Volume */}
                  <TableCell className="text-xs text-[#2C2C2C]/50">{p.volume || '-'}</TableCell>
                  {/* Price — inline editable */}
                  <TableCell>
                    {editingPrice === p.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[#2C2C2C]/40">&euro;</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={priceValue}
                          onChange={(e) => setPriceValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePriceSave(p.id);
                            if (e.key === 'Escape') setEditingPrice(null);
                          }}
                          autoFocus
                          className="w-20 px-1.5 py-0.5 text-sm border border-[#C9A86C] rounded bg-white focus:outline-none"
                        />
                        <button
                          onClick={() => handlePriceSave(p.id)}
                          disabled={savingField === p.id}
                          className="text-green-600 hover:text-green-700 p-0.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPrice(null)}
                          className="text-[#2C2C2C]/40 hover:text-[#2C2C2C] p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPrice(p.id);
                          setPriceValue((p.priceEur ?? 0).toFixed(2));
                        }}
                        className="text-sm text-[#2C2C2C] font-medium hover:text-[#C9A86C] transition-colors cursor-pointer"
                        title="Click to edit price"
                      >
                        &euro;{(p.priceEur ?? 0).toFixed(2)}
                      </button>
                    )}
                  </TableCell>
                  {/* Stock — toggle switch */}
                  <TableCell>
                    <Switch
                      checked={p.inStock}
                      onCheckedChange={(checked) => handleStockToggle(p.id, checked)}
                      disabled={savingField === p.id}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </TableCell>
                  {/* Actions */}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" asChild className="h-7 w-7 p-0 text-[#2C2C2C]/50 hover:text-[#C9A86C]">
                        <Link href={`/admin/products/${p.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <DeleteConfirm
                        title="Delete Product"
                        description={`Are you sure you want to delete "${p.name}"? This action cannot be undone.`}
                        onConfirm={() => handleDelete(p.id)}
                        loading={deleting === p.id}
                        trigger={
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[#2C2C2C]/50 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination + Count */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#2C2C2C]/40">
            Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
            {filtered.length !== products.length && ` (${products.length} total)`}
          </p>
          {totalPages > 1 && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 px-3 text-xs"
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-xs text-[#2C2C2C]/60">
                {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-3 text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
