'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react';

interface ColorFamily {
  id: string;
  name: string;
  description: string;
  brand: string | null;
  hexPreview: string;
  sortOrder: number;
  productIds: string[];
}

interface Product {
  id: string;
  name: string;
  brand: string;
  colorCode: string;
  hexCode: string;
}

export default function FamilyDetailPage() {
  const { familyId } = useParams<{ familyId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '' as string,
    hexPreview: '#CCCCCC',
    sortOrder: 0,
    productIds: [] as string[],
  });

  /* Product search */
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const loadFamily = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/colors/families/${familyId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm({
        name: data.name || '',
        description: data.description || '',
        brand: data.brand || '',
        hexPreview: data.hexPreview || '#CCCCCC',
        sortOrder: data.sortOrder ?? 0,
        productIds: data.productIds || [],
      });
    } catch {
      toast.error('Failed to load color family');
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  /* Load products for search */
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            brand: p.brand as string,
            colorCode: p.colorCode as string,
            hexCode: p.hexCode as string,
          })));
        }
      } catch { /* ignore */ }
    }
    loadProducts();
  }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/colors/families/${familyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          brand: form.brand || null,
          hexPreview: form.hexPreview,
          sortOrder: Number(form.sortOrder),
          productIds: form.productIds,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Color family saved');
    } catch {
      toast.error('Failed to save color family');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/colors/families/${familyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Color family deleted');
      router.push('/admin/colors');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const addProduct = (productId: string) => {
    if (!form.productIds.includes(productId)) {
      set('productIds', [...form.productIds, productId]);
    }
    setProductSearch('');
    setShowSearch(false);
  };

  const removeProduct = (productId: string) => {
    set('productIds', form.productIds.filter((id) => id !== productId));
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      !form.productIds.includes(p.id) &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.colorCode.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const memberProducts = allProducts.filter((p) => form.productIds.includes(p.id));

  if (loading) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading color family...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
            <Link href="/admin/colors"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Edit Color Family</h1>
            <p className="text-[#2C2C2C]/50 text-sm mt-1 font-mono">{familyId}</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl border border-[#2C2C2C]/15 shadow-sm" style={{ backgroundColor: form.hexPreview }} />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name & Brand */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Family Name *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <select
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="">All Brands</option>
              <option value="BM">Benjamin Moore</option>
              <option value="FB">Farrow & Ball</option>
              <option value="LG">Little Greene</option>
            </select>
          </div>
        </div>

        {/* Hex & Sort Order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hex Preview</Label>
            <div className="flex gap-2 items-center">
              <Input value={form.hexPreview} onChange={(e) => set('hexPreview', e.target.value)} className="flex-1" />
              <div className="w-10 h-10 rounded-lg border border-[#2C2C2C]/15 shrink-0" style={{ backgroundColor: form.hexPreview }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
        </div>

        {/* Member Products */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Member Products ({form.productIds.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          </div>

          {showSearch && (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-3 space-y-2">
              <Input
                placeholder="Search products by name, code, or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                autoFocus
              />
              {productSearch && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredProducts.slice(0, 20).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="w-6 h-6 rounded border border-[#2C2C2C]/15 shrink-0" style={{ backgroundColor: p.hexCode }} />
                      <span className="text-[#2C2C2C]">{p.name}</span>
                      <span className="text-xs text-[#2C2C2C]/40">{p.colorCode}</span>
                      <span className="text-xs px-1 py-0.5 rounded bg-[#2C2C2C]/5 text-[#2C2C2C]/50 ml-auto">{p.brand}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-xs text-[#2C2C2C]/40 p-2">No matching products</p>
                  )}
                </div>
              )}
            </div>
          )}

          {memberProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {memberProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#2C2C2C]/8 text-sm">
                  <div className="w-6 h-6 rounded border border-[#2C2C2C]/15 shrink-0" style={{ backgroundColor: p.hexCode }} />
                  <span className="text-[#2C2C2C] truncate flex-1">{p.name}</span>
                  <span className="text-xs text-[#2C2C2C]/40">{p.brand}</span>
                  <button type="button" onClick={() => removeProduct(p.id)} className="text-[#2C2C2C]/30 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#2C2C2C]/40 p-4 bg-white rounded-lg border border-[#2C2C2C]/8 text-center">
              No products assigned to this family yet.
            </p>
          )}

          {/* Show IDs for products not found in loaded list */}
          {form.productIds.filter((id) => !allProducts.find((p) => p.id === id)).length > 0 && (
            <p className="text-xs text-[#2C2C2C]/40">
              + {form.productIds.filter((id) => !allProducts.find((p) => p.id === id)).length} product(s) not in current catalog view
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2C2C2C]/10">
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/colors">Cancel</Link>
            </Button>
          </div>
          <DeleteConfirm
            title="Delete Color Family"
            description={`Are you sure you want to delete "${form.name}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            loading={deleting}
            trigger={
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            }
          />
        </div>
      </form>
    </div>
  );
}
