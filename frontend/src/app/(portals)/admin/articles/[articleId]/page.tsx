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
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface ArticleForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  relatedBrand: string;
  tags: string[];
  status: 'draft' | 'published';
  author: string;
  publishedAt: string | null;
}

const BRAND_OPTIONS = [
  { value: '', label: 'General (No Brand)' },
  { value: 'BM', label: 'Benjamin Moore' },
  { value: 'FB', label: 'Farrow & Ball' },
  { value: 'LG', label: 'Little Greene' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function EditArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [form, setForm] = useState<ArticleForm>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    relatedBrand: '',
    tags: [],
    status: 'draft',
    author: '',
    publishedAt: null,
  });

  const loadArticle = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        featuredImage: data.featuredImage || '',
        categoryId: data.categoryId || '',
        relatedBrand: data.relatedBrand || '',
        tags: data.tags || [],
        status: data.status || 'draft',
        author: data.author || '',
        publishedAt: data.publishedAt || null,
      });
    } catch {
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { loadArticle(); }, [loadArticle]);

  useEffect(() => {
    async function loadMeta() {
      const [catRes, tagRes] = await Promise.all([
        fetch('/api/admin/articles/categories'),
        fetch('/api/admin/articles/tags'),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (tagRes.ok) setAllTags(await tagRes.json());
    }
    loadMeta();
  }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleTitleChange = (title: string) => {
    set('title', title);
    if (autoSlug || !form.slug) {
      set('slug', slugify(title));
      setAutoSlug(true);
    }
  };

  const handleSlugChange = (slug: string) => {
    set('slug', slug);
    setAutoSlug(false);
  };

  const toggleTag = (tagName: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((t) => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
          relatedBrand: form.relatedBrand || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Article saved');
    } catch {
      toast.error('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Article deleted');
      router.push('/admin/articles');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading article...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
          <Link href="/admin/articles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Edit Article</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1 font-mono">{articleId}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {form.status}
        </span>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content area */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article title..."
                className="text-2xl font-[family-name:var(--font-playfair)] h-auto py-3 border-0 border-b border-[#2C2C2C]/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#C9A86C]"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <Label className="text-xs text-[#2C2C2C]/40">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#2C2C2C]/30">/blog/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="text-sm font-mono h-8"
                  placeholder="article-slug"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={form.content}
                onChange={(html) => set('content', html)}
                placeholder="Write your article content here..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-4">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Publish</h3>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-[#2C2C2C]/60">Published</Label>
                <Switch
                  checked={form.status === 'published'}
                  onCheckedChange={(checked) => set('status', checked ? 'published' : 'draft')}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              {form.publishedAt && (
                <p className="text-xs text-[#2C2C2C]/40">
                  Published: {new Date(form.publishedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Category</h3>
              <select
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Related Brand */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Related Brand</h3>
              <select
                value={form.relatedBrand}
                onChange={(e) => set('relatedBrand', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
              >
                {BRAND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-[#2C2C2C]/40">
                Tag this article to appear on a brand&apos;s journal page.
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Tags</h3>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C9A86C]/10 text-[#C9A86C] text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => toggleTag(tag)} className="hover:text-[#2C2C2C]">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {allTags
                  .filter((t) => !form.tags.includes(t.name))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className="px-2 py-0.5 rounded-full border border-[#2C2C2C]/10 text-xs text-[#2C2C2C]/50 hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors"
                    >
                      + {tag.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Author */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Author</h3>
              <Input
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Author name"
                className="text-sm"
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Featured Image</h3>
              <Input
                value={form.featuredImage}
                onChange={(e) => set('featuredImage', e.target.value)}
                placeholder="Image URL"
                className="text-sm"
              />
              {form.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.featuredImage}
                  alt="Featured"
                  className="w-full h-32 object-cover rounded border border-[#2C2C2C]/10"
                />
              )}
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Excerpt</h3>
              <Textarea
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="Brief summary for article listings..."
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#2C2C2C]/10">
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/articles">Cancel</Link>
            </Button>
          </div>
          <DeleteConfirm
            title="Delete Article"
            description={`Are you sure you want to delete "${form.title}"? This action cannot be undone.`}
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
