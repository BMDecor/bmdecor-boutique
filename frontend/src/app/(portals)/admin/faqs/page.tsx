'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirm } from '@/components/admin/delete-confirm';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryId: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

type Tab = 'faqs' | 'categories';

export default function AdminFaqsPage() {
  const [tab, setTab] = useState<Tab>('faqs');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New FAQ form
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [creatingFaq, setCreatingFaq] = useState(false);

  // New Category form
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [faqRes, catRes] = await Promise.all([
        fetch('/api/admin/faqs'),
        fetch('/api/admin/faqs/categories'),
      ]);
      if (faqRes.ok) setFaqs(await faqRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {
      toast.error('Failed to load FAQ data');
    } finally {
      setLoading(false);
    }
  }

  async function createFaq() {
    if (!newQuestion.trim()) return;
    setCreatingFaq(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion.trim(),
          categoryId: newCategoryId || undefined,
          sortOrder: faqs.length,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast.success('FAQ created');
      setNewQuestion('');
      setNewCategoryId('');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create FAQ');
    } finally {
      setCreatingFaq(false);
    }
  }

  async function createCategory() {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await fetch('/api/admin/faqs/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          sortOrder: categories.length,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Category created');
      setNewCatName('');
      loadData();
    } catch {
      toast.error('Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  }

  async function togglePublished(faq: FAQ) {
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !faq.isPublished }),
      });
      if (!res.ok) throw new Error();
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isPublished: !f.isPublished } : f)),
      );
    } catch {
      toast.error('Failed to update FAQ');
    }
  }

  async function deleteFaq(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('FAQ deleted');
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch {
      toast.error('Failed to delete FAQ');
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteCategory(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/faqs/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const faqCountByCat = faqs.reduce<Record<string, number>>((acc, f) => {
    const key = f.categoryId || '_none';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">FAQs</h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          Manage frequently asked questions &middot; {faqs.length} total &middot; {faqs.filter((f) => f.isPublished).length} published
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#2C2C2C]/5 rounded-lg p-1 w-fit">
        {(['faqs', 'categories'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t
                ? 'bg-white text-[#2C2C2C] shadow-sm font-medium'
                : 'text-[#2C2C2C]/50 hover:text-[#2C2C2C]'
            }`}
          >
            {t === 'faqs' ? 'FAQs' : 'Categories'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-[#2C2C2C]/40 text-sm py-12">Loading...</p>
      ) : tab === 'faqs' ? (
        <div className="space-y-6">
          {/* Create FAQ */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3">
            <h2 className="text-sm font-medium text-[#2C2C2C]">Add New FAQ</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createFaq()}
                className="flex-1 rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={createFaq}
                disabled={creatingFaq || !newQuestion.trim()}
                className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a] disabled:opacity-40"
              >
                {creatingFaq ? 'Creating...' : 'Add'}
              </button>
            </div>
            <p className="text-xs text-[#2C2C2C]/40">
              Add the question here, then click through to edit the answer with the rich text editor.
            </p>
          </div>

          {/* FAQ Table */}
          {faqs.length === 0 ? (
            <p className="text-center text-[#2C2C2C]/30 py-12 font-[family-name:var(--font-playfair)] text-xl">
              No FAQs yet
            </p>
          ) : (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2C2C2C]/8 bg-[#FAF8F5]">
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Question</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium w-36">Category</th>
                    <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium w-20">Order</th>
                    <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium w-24">Published</th>
                    <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2C2C]/5">
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-[#FAF8F5]/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/faqs/${faq.id}`}
                          className="text-[#2C2C2C] hover:text-[#C9A86C] transition-colors font-medium"
                        >
                          {faq.question || 'Untitled'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#2C2C2C]/50">
                        {faq.categoryId ? catMap[faq.categoryId] || '—' : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-[#2C2C2C]/40">
                        {faq.sortOrder}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Switch
                            checked={faq.isPublished}
                            onCheckedChange={() => togglePublished(faq)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteConfirm
                          title="Delete FAQ"
                          description={`Delete "${faq.question}"? This cannot be undone.`}
                          onConfirm={() => deleteFaq(faq.id)}
                          loading={deletingId === faq.id}
                          trigger={
                            <button className="text-xs text-red-400 hover:text-red-600">
                              Delete
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Create Category */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3">
            <h2 className="text-sm font-medium text-[#2C2C2C]">Add New Category</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createCategory()}
                className="flex-1 rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
              <button
                onClick={createCategory}
                disabled={creatingCat || !newCatName.trim()}
                className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a] disabled:opacity-40"
              >
                {creatingCat ? 'Creating...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Category Grid */}
          {categories.length === 0 ? (
            <p className="text-center text-[#2C2C2C]/30 py-12 font-[family-name:var(--font-playfair)] text-xl">
              No categories yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-3"
                >
                  <div>
                    <h3 className="text-sm font-medium text-[#2C2C2C]">{cat.name}</h3>
                    <p className="text-xs text-[#2C2C2C]/40 mt-0.5">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#2C2C2C]/50">
                      {faqCountByCat[cat.id] || 0} FAQ{(faqCountByCat[cat.id] || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[#2C2C2C]/30">Order: {cat.sortOrder}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#2C2C2C]/5">
                    <Link
                      href={`/admin/faqs/categories/${cat.id}`}
                      className="text-xs text-[#C9A86C] hover:text-[#B8975B]"
                    >
                      Edit
                    </Link>
                    <DeleteConfirm
                      title="Delete Category"
                      description={`Delete "${cat.name}"? FAQs in this category will become uncategorized.`}
                      onConfirm={() => deleteCategory(cat.id)}
                      loading={deletingId === cat.id}
                      trigger={
                        <button className="text-xs text-red-400 hover:text-red-600">Delete</button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
