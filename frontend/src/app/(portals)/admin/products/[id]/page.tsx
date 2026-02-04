'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { toast } from 'sonner';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface ProductForm {
  brand: 'BM' | 'FB' | 'LG';
  name: string;
  colorCode: string;
  hexCode: string;
  priceEur: number;
  finishType: string;
  volume: string;
  collection: string;
  productType: string;
  description: string;
  coverageRate: string;
  inStock: boolean;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    brand: 'BM',
    name: '',
    colorCode: '',
    hexCode: '#CCCCCC',
    priceEur: 0,
    finishType: '',
    volume: '',
    collection: '',
    productType: 'paint',
    description: '',
    coverageRate: '',
    inStock: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setForm({
          brand: data.brand || 'BM',
          name: data.name || '',
          colorCode: data.colorCode || '',
          hexCode: data.hexCode || '#CCCCCC',
          priceEur: data.priceEur ?? 0,
          finishType: data.finishType || '',
          volume: data.volume || '',
          collection: data.collection || '',
          productType: data.productType || 'paint',
          description: data.description || '',
          coverageRate: data.coverageRate != null ? String(data.coverageRate) : '',
          inStock: data.inStock ?? true,
        });
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        priceEur: Number(form.priceEur),
        coverageRate: form.coverageRate ? Number(form.coverageRate) : null,
      };
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success('Product updated');
    } catch {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Product deleted');
      router.push('/admin/products');
    } catch {
      toast.error('Failed to delete product');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading product...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
            <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Edit Product</h1>
            <p className="text-[#2C2C2C]/50 text-sm mt-1 font-mono">{id}</p>
          </div>
        </div>
        {/* Hex Preview */}
        <div
          className="w-12 h-12 rounded-xl border border-[#2C2C2C]/15 shadow-sm"
          style={{ backgroundColor: form.hexCode }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <select
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="BM">Benjamin Moore</option>
              <option value="FB">Farrow & Ball</option>
              <option value="LG">Little Greene</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Product Type</Label>
            <select
              value={form.productType}
              onChange={(e) => set('productType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="paint">Paint</option>
              <option value="wallpaper">Wallpaper</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>Product Name *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>

        {/* Color Code & Hex */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Color Code</Label>
            <Input value={form.colorCode} onChange={(e) => set('colorCode', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Hex Code</Label>
            <div className="flex gap-2 items-center">
              <Input value={form.hexCode} onChange={(e) => set('hexCode', e.target.value)} className="flex-1" />
              <div
                className="w-10 h-10 rounded-lg border border-[#2C2C2C]/15 shrink-0"
                style={{ backgroundColor: form.hexCode }}
              />
            </div>
          </div>
        </div>

        {/* Finish & Volume */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Finish Type</Label>
            <Input value={form.finishType} onChange={(e) => set('finishType', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Volume</Label>
            <select
              value={form.volume}
              onChange={(e) => set('volume', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="">Select volume</option>
              <option value="60ml">60ml (Sample)</option>
              <option value="750ml">750ml</option>
              <option value="1L">1L</option>
              <option value="2.5L">2.5L</option>
              <option value="5L">5L</option>
              <option value="10L">10L</option>
            </select>
          </div>
        </div>

        {/* Price & Coverage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price (EUR, IVA incluido)</Label>
            <Input type="number" step="0.01" min="0" value={form.priceEur} onChange={(e) => set('priceEur', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Coverage Rate (m²/L)</Label>
            <Input type="number" step="0.1" min="0" value={form.coverageRate} onChange={(e) => set('coverageRate', e.target.value)} />
          </div>
        </div>

        {/* Collection */}
        <div className="space-y-2">
          <Label>Collection</Label>
          <Input value={form.collection} onChange={(e) => set('collection', e.target.value)} />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
        </div>

        {/* In Stock */}
        <div className="flex items-center gap-3">
          <Switch checked={form.inStock} onCheckedChange={(v) => set('inStock', v)} />
          <Label>In Stock</Label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2C2C2C]/10">
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </div>

          <DeleteConfirm
            title="Delete Product"
            description={`Are you sure you want to delete "${form.name}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            loading={deleting}
            trigger={
              <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            }
          />
        </div>
      </form>
    </div>
  );
}
