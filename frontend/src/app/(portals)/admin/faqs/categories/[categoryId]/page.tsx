'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { DeleteConfirm } from '@/components/admin/delete-confirm';

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function FaqCategoryEditorPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();
  const [cat, setCat] = useState<FaqCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/faqs/categories/${categoryId}`);
        if (res.ok) setCat(await res.json());
      } catch {
        toast.error('Failed to load category');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryId]);

  async function save() {
    if (!cat) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faqs/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sortOrder,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Category saved');
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Category deleted');
      router.push('/admin/faqs');
    } catch {
      toast.error('Failed to delete category');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#2C2C2C]/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-[#2C2C2C]/40">Category not found</p>
        <Link href="/admin/faqs" className="text-sm text-[#C9A86C] hover:text-[#B8975B]">
          Back to FAQs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/faqs"
            className="text-xs text-[#C9A86C] tracking-[0.15em] uppercase hover:text-[#B8975B]"
          >
            &larr; FAQs
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mt-2">
            Edit FAQ Category
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DeleteConfirm
            title="Delete Category"
            description="FAQs in this category will become uncategorized."
            onConfirm={handleDelete}
            loading={deleting}
            trigger={
              <button className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-md hover:bg-red-50">
                Delete
              </button>
            }
          />
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
            Name
          </label>
          <input
            type="text"
            value={cat.name}
            onChange={(e) => {
              const name = e.target.value;
              setCat({
                ...cat,
                name,
                slug: slugManual ? cat.slug : slugify(name),
              });
            }}
            className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
              Slug
            </label>
            <button
              type="button"
              onClick={() => setSlugManual(!slugManual)}
              className="text-xs text-[#C9A86C] hover:text-[#B8975B]"
            >
              {slugManual ? 'Auto-generate' : 'Edit manually'}
            </button>
          </div>
          <input
            type="text"
            value={cat.slug}
            onChange={(e) => setCat({ ...cat, slug: e.target.value })}
            disabled={!slugManual}
            className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30 disabled:opacity-50"
          />
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
            Sort Order
          </label>
          <input
            type="number"
            value={cat.sortOrder}
            onChange={(e) => setCat({ ...cat, sortOrder: parseInt(e.target.value) || 0 })}
            className="w-32 rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
          />
          <p className="text-xs text-[#2C2C2C]/40">Lower numbers appear first on the public FAQ page.</p>
        </div>
      </div>
    </div>
  );
}
