'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { toast } from 'sonner';
import { ArrowLeft, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
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

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [relatedBrand, setRelatedBrand] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [author, setAuthor] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

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

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) setSlug(slugify(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setAutoSlug(false);
  };

  const toggleTag = (tagName: string) => {
    setTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          content,
          excerpt,
          featuredImage,
          categoryId: categoryId || null,
          relatedBrand: relatedBrand || null,
          tags,
          status,
          author,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success('Article created');
      router.push(`/admin/articles/${data.id}`);
    } catch {
      toast.error('Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
          <Link href="/admin/articles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">New Article</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">Create a new blog post</p>
        </div>
      </div>

      <form onSubmit={handleCreate}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article title..."
                className="text-2xl font-[family-name:var(--font-playfair)] h-auto py-3 border-0 border-b border-[#2C2C2C]/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#C9A86C]"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#2C2C2C]/40">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#2C2C2C]/30">/blog/</span>
                <Input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="text-sm font-mono h-8"
                  placeholder="article-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your article content here..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-4">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Publish</h3>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-[#2C2C2C]/60">Published</Label>
                <Switch
                  checked={status === 'published'}
                  onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Category</h3>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Related Brand</h3>
              <select
                value={relatedBrand}
                onChange={(e) => setRelatedBrand(e.target.value)}
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

            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Tags</h3>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
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
                  .filter((t) => !tags.includes(t.name))
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

            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Author</h3>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="text-sm" />
            </div>

            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Featured Image</h3>
              <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="Image URL" className="text-sm" />
              {featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredImage} alt="Featured" className="w-full h-32 object-cover rounded border border-[#2C2C2C]/10" />
              )}
            </div>

            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#2C2C2C]">Excerpt</h3>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary..." rows={3} className="text-sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-[#2C2C2C]/10">
          <Button type="submit" disabled={saving} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
            {saving ? 'Creating...' : 'Create Article'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/articles">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
