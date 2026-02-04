'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Plus, GripVertical, X } from 'lucide-react';

interface PaletteColor {
  productId: string;
  hexCode: string;
  colorName: string;
  brand: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  colorCode: string;
  hexCode: string;
}

export default function PaletteDetailPage() {
  const { paletteId } = useParams<{ paletteId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    colors: [] as PaletteColor[],
    isPublished: false,
  });

  /* Product search */
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  /* Drag state */
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const loadPalette = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/colors/palettes/${paletteId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm({
        name: data.name || '',
        description: data.description || '',
        colors: data.colors || [],
        isPublished: data.isPublished ?? false,
      });
    } catch {
      toast.error('Failed to load palette');
    } finally {
      setLoading(false);
    }
  }, [paletteId]);

  useEffect(() => {
    loadPalette();
  }, [loadPalette]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/colors/palettes/${paletteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Palette saved');
    } catch {
      toast.error('Failed to save palette');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/colors/palettes/${paletteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Palette deleted');
      router.push('/admin/colors');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const addColor = (product: Product) => {
    const already = form.colors.some((c) => c.productId === product.id);
    if (already) { toast.error('Color already in palette'); return; }
    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, {
        productId: product.id,
        hexCode: product.hexCode,
        colorName: product.name,
        brand: product.brand,
      }],
    }));
    setProductSearch('');
    setShowSearch(false);
  };

  const removeColor = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx),
    }));
  };

  const moveColor = (from: number, to: number) => {
    if (to < 0 || to >= form.colors.length) return;
    setForm((prev) => {
      const colors = [...prev.colors];
      const [item] = colors.splice(from, 1);
      colors.splice(to, 0, item);
      return { ...prev, colors };
    });
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (dragIdx !== null && dragIdx !== targetIdx) {
      moveColor(dragIdx, targetIdx);
    }
    setDragIdx(null);
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      !form.colors.some((c) => c.productId === p.id) &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.colorCode.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()))
  );

  if (loading) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading palette...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
          <Link href="/admin/colors"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Edit Palette</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1 font-mono">{paletteId}</p>
        </div>
      </div>

      {/* Color strip preview */}
      {form.colors.length > 0 && (
        <div className="h-16 rounded-xl overflow-hidden flex shadow-sm border border-[#2C2C2C]/10">
          {form.colors.map((c, i) => (
            <div key={i} className="flex-1 relative group" style={{ backgroundColor: c.hexCode }}>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white">
                {c.hexCode}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label>Palette Name *</Label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <Switch checked={form.isPublished} onCheckedChange={(v) => setForm((prev) => ({ ...prev, isPublished: v }))} />
          <Label>Published</Label>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Colors ({form.colors.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Color
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
                      onClick={() => addColor(p)}
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

          {/* Reorderable color list */}
          {form.colors.length > 0 ? (
            <div className="space-y-1">
              {form.colors.map((c, i) => (
                <div
                  key={`${c.productId}-${i}`}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(i)}
                  className={`flex items-center gap-3 px-3 py-2 bg-white rounded-lg border text-sm transition-all ${
                    dragIdx === i ? 'border-[#C9A86C] shadow-md opacity-70' : 'border-[#2C2C2C]/8'
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-[#2C2C2C]/20 cursor-grab shrink-0" />
                  <div className="w-8 h-8 rounded border border-[#2C2C2C]/15 shrink-0" style={{ backgroundColor: c.hexCode }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[#2C2C2C] block truncate">{c.colorName}</span>
                    <span className="text-xs text-[#2C2C2C]/40 font-mono">{c.hexCode}</span>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#2C2C2C]/5 text-[#2C2C2C]/50">{c.brand}</span>
                  <button type="button" onClick={() => removeColor(i)} className="text-[#2C2C2C]/30 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#2C2C2C]/40 p-6 bg-white rounded-lg border border-[#2C2C2C]/8 text-center">
              No colors added yet. Search and add products to build your palette.
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
            title="Delete Palette"
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
