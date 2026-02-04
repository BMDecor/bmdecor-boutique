'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { DeleteConfirm } from '@/components/admin/delete-confirm';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryId: string | null;
  sortOrder: number;
  isPublished: boolean;
}

interface FaqCategory {
  id: string;
  name: string;
}

export default function FaqEditorPage() {
  const { faqId } = useParams<{ faqId: string }>();
  const router = useRouter();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [faqRes, catRes] = await Promise.all([
          fetch(`/api/admin/faqs/${faqId}`),
          fetch('/api/admin/faqs/categories'),
        ]);
        if (faqRes.ok) setFaq(await faqRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch {
        toast.error('Failed to load FAQ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [faqId]);

  async function save() {
    if (!faq) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: faq.question,
          answer: faq.answer,
          categoryId: faq.categoryId,
          sortOrder: faq.sortOrder,
          isPublished: faq.isPublished,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('FAQ saved');
    } catch {
      toast.error('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/${faqId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('FAQ deleted');
      router.push('/admin/faqs');
    } catch {
      toast.error('Failed to delete FAQ');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#2C2C2C]/40 text-sm">Loading FAQ...</p>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-[#2C2C2C]/40">FAQ not found</p>
        <Link href="/admin/faqs" className="text-sm text-[#C9A86C] hover:text-[#B8975B]">
          Back to FAQs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            Edit FAQ
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DeleteConfirm
            title="Delete FAQ"
            description="This FAQ will be permanently deleted."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3">
            <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
              Question
            </label>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => setFaq({ ...faq, question: e.target.value })}
              className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
            />
          </div>

          {/* Answer */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3">
            <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
              Answer
            </label>
            <RichTextEditor
              content={faq.answer}
              onChange={(html) => setFaq({ ...faq, answer: html })}
              placeholder="Write the answer..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-4">
            <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
              Status
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#2C2C2C]">
                {faq.isPublished ? 'Published' : 'Draft'}
              </span>
              <Switch
                checked={faq.isPublished}
                onCheckedChange={(val) => setFaq({ ...faq, isPublished: val })}
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3">
            <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
              Category
            </label>
            <select
              value={faq.categoryId || ''}
              onChange={(e) => setFaq({ ...faq, categoryId: e.target.value || null })}
              className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3">
            <label className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">
              Sort Order
            </label>
            <input
              type="number"
              value={faq.sortOrder}
              onChange={(e) => setFaq({ ...faq, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
            />
            <p className="text-xs text-[#2C2C2C]/40">Lower numbers appear first.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
