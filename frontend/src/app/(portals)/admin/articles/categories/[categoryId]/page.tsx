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
import { ArrowLeft, Trash2 } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function EditCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
  });

  const loadCategory = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/articles/categories/${categoryId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        sortOrder: data.sortOrder ?? 0,
      });
    } catch {
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { loadCategory(); }, [loadCategory]);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (name: string) => {
    set('name', name);
    if (autoSlug || !form.slug) {
      set('slug', slugify(name));
      setAutoSlug(true);
    }
  };

  const handleSlugChange = (slug: string) => {
    set('slug', slug);
    setAutoSlug(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description,
          sortOrder: Number(form.sortOrder),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Category saved');
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Category deleted');
      router.push('/admin/articles');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading category...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
          <Link href="/admin/articles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Edit Category</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1 font-mono">{categoryId}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category Name *</Label>
            <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} className="font-mono" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
        </div>

        <div className="space-y-2 max-w-[200px]">
          <Label>Sort Order</Label>
          <Input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2C2C2C]/10">
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/articles">Cancel</Link>
            </Button>
          </div>
          <DeleteConfirm
            title="Delete Category"
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
