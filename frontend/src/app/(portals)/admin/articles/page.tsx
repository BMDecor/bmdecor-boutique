'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FileText, FolderOpen, Tags } from 'lucide-react';

/* ───── Types ───── */

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryId: string | null;
  tags: string[];
  status: 'draft' | 'published';
  author: string;
  publishedAt: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

type Tab = 'articles' | 'categories' | 'tags';
type StatusFilter = 'all' | 'draft' | 'published';

/* ───── Page ───── */

export default function ArticlesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  /* Filters */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  /* New category form */
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  /* New tag form */
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [savingTag, setSavingTag] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [artRes, catRes, tagRes] = await Promise.all([
        fetch('/api/admin/articles'),
        fetch('/api/admin/articles/categories'),
        fetch('/api/admin/articles/tags'),
      ]);
      if (artRes.ok) setArticles(await artRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (tagRes.ok) setTags(await tagRes.json());
    } catch {
      toast.error('Failed to load articles data');
    } finally {
      setLoading(false);
    }
  }

  /* ── Article CRUD ── */

  async function deleteArticle(id: string) {
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success('Article deleted');
    } catch {
      toast.error('Failed to delete article');
    }
  }

  const filteredArticles = articles.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && a.categoryId !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
    }
    return true;
  });

  /* ── Category CRUD ── */

  async function createCategory() {
    if (!newCategoryName.trim()) { toast.error('Name is required'); return; }
    setSavingCategory(true);
    try {
      const res = await fetch('/api/admin/articles/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!res.ok) throw new Error();
      toast.success('Category created');
      setShowNewCategory(false);
      setNewCategoryName('');
      loadData();
    } catch {
      toast.error('Failed to create category');
    } finally {
      setSavingCategory(false);
    }
  }

  async function deleteCategory(id: string) {
    try {
      const res = await fetch(`/api/admin/articles/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  }

  /* ── Tag CRUD ── */

  async function createTag() {
    if (!newTagName.trim()) { toast.error('Name is required'); return; }
    setSavingTag(true);
    try {
      const res = await fetch('/api/admin/articles/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName }),
      });
      if (!res.ok) throw new Error();
      toast.success('Tag created');
      setShowNewTag(false);
      setNewTagName('');
      loadData();
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setSavingTag(false);
    }
  }

  async function deleteTag(id: string) {
    try {
      const res = await fetch(`/api/admin/articles/tags/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setTags((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    }
  }

  /* ── Helpers ── */

  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || '—';

  const articleCountForCategory = (catId: string) =>
    articles.filter((a) => a.categoryId === catId).length;

  const articleCountForTag = (tagName: string) =>
    articles.filter((a) => a.tags.includes(tagName)).length;

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  /* ── Render ── */

  const tabItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'articles', label: 'Articles', icon: <FileText className="h-4 w-4" /> },
    { key: 'categories', label: 'Categories', icon: <FolderOpen className="h-4 w-4" /> },
    { key: 'tags', label: 'Tags', icon: <Tags className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Articles</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">Blog content, categories, and tags</p>
        </div>
        {tab === 'articles' && (
          <Button asChild className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
            <Link href="/admin/articles/new">
              <Plus className="h-4 w-4 mr-2" /> New Article
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#2C2C2C]/5 p-1 rounded-lg w-fit">
        {tabItems.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              tab === t.key
                ? 'bg-white text-[#2C2C2C] shadow-sm'
                : 'text-[#2C2C2C]/50 hover:text-[#2C2C2C]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading...</div>
      ) : tab === 'articles' ? (
        /* ── Articles Tab ── */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C] transition-colors"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 text-xs border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="text-xs text-[#2C2C2C]/40 ml-auto">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
                <p className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]/30">No articles yet</p>
                <p className="text-sm text-[#2C2C2C]/40 mt-1">Create your first article to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#2C2C2C]/8">
                    <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Title</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Category</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Author</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Date</TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((a) => (
                    <TableRow
                      key={a.id}
                      className="border-b border-[#2C2C2C]/5 hover:bg-[#FAF8F5]/50 cursor-pointer"
                      onClick={() => router.push(`/admin/articles/${a.id}`)}
                    >
                      <TableCell className="text-sm text-[#2C2C2C]">
                        <div>
                          <p className="font-medium">{a.title}</p>
                          {a.excerpt && (
                            <p className="text-xs text-[#2C2C2C]/40 mt-0.5 line-clamp-1">{a.excerpt}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#2C2C2C]/50">{categoryName(a.categoryId)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#2C2C2C]/50">{a.author || '—'}</TableCell>
                      <TableCell className="text-xs text-[#2C2C2C]/50">
                        {formatDate(a.publishedAt || a.createdAt)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" asChild className="h-7 w-7 p-0 text-[#2C2C2C]/50 hover:text-[#C9A86C]">
                            <Link href={`/admin/articles/${a.id}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <DeleteConfirm
                            title="Delete Article"
                            description={`Are you sure you want to delete "${a.title}"? This action cannot be undone.`}
                            onConfirm={() => deleteArticle(a.id)}
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
        </div>
      ) : tab === 'categories' ? (
        /* ── Categories Tab ── */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#2C2C2C]/50">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
            <Button onClick={() => setShowNewCategory(!showNewCategory)} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white" size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Category
            </Button>
          </div>

          {showNewCategory && (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createCategory(); }}
              />
              <div className="flex gap-2">
                <Button onClick={createCategory} disabled={savingCategory} size="sm" className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
                  {savingCategory ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewCategory(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-lg border border-[#2C2C2C]/8">
              <FolderOpen className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
              <p className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]/30">No categories yet</p>
              <p className="text-sm text-[#2C2C2C]/40 mt-1">Create categories to organize your articles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-2 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#2C2C2C]">{cat.name}</h3>
                      <p className="text-xs text-[#2C2C2C]/40 font-mono">/{cat.slug}</p>
                    </div>
                    <span className="text-xs text-[#2C2C2C]/40">
                      {articleCountForCategory(cat.id)} article{articleCountForCategory(cat.id) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-[#2C2C2C]/50 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
                      <Link href={`/admin/articles/categories/${cat.id}`}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Link>
                    </Button>
                    <DeleteConfirm
                      title={`Delete "${cat.name}"?`}
                      description="This action cannot be undone. Articles in this category will not be deleted."
                      onConfirm={() => deleteCategory(cat.id)}
                      trigger={
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Tags Tab ── */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#2C2C2C]/50">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>
            <Button onClick={() => setShowNewTag(!showNewTag)} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white" size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Tag
            </Button>
          </div>

          {showNewTag && (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createTag(); }}
              />
              <div className="flex gap-2">
                <Button onClick={createTag} disabled={savingTag} size="sm" className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
                  {savingTag ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewTag(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {tags.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-lg border border-[#2C2C2C]/8">
              <Tags className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
              <p className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]/30">No tags yet</p>
              <p className="text-sm text-[#2C2C2C]/40 mt-1">Create tags to label and organize articles.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2C2C2C]/10 bg-[#FAF8F5] text-sm group"
                  >
                    <span className="text-[#2C2C2C]">{tag.name}</span>
                    <span className="text-xs text-[#2C2C2C]/30">{articleCountForTag(tag.name)}</span>
                    <DeleteConfirm
                      title={`Delete tag "${tag.name}"?`}
                      description="This action cannot be undone. Articles using this tag will not be affected."
                      onConfirm={() => deleteTag(tag.id)}
                      trigger={
                        <button className="text-[#2C2C2C]/20 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
