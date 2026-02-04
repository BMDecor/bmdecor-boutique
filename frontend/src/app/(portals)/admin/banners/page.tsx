'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirm } from '@/components/admin/delete-confirm';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  position: 'hero' | 'secondary';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    position: 'hero' as 'hero' | 'secondary',
    sortOrder: 0,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) setBanners(await res.json());
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }

  async function createBanner() {
    if (!form.title.trim() && !form.imageUrl.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Banner created');
      setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: '', position: 'hero', sortOrder: 0 });
      setShowCreate(false);
      loadData();
    } catch {
      toast.error('Failed to create banner');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(banner: Banner) {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (!res.ok) throw new Error();
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)),
      );
    } catch {
      toast.error('Failed to update banner');
    }
  }

  async function deleteBanner(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Banner deleted');
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error('Failed to delete banner');
    } finally {
      setDeletingId(null);
    }
  }

  const heroBanners = banners.filter((b) => b.position === 'hero');
  const secondaryBanners = banners.filter((b) => b.position === 'secondary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Banners</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">
            {banners.length} total &middot; {heroBanners.length} hero &middot; {secondaryBanners.length} secondary
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a]"
        >
          {showCreate ? 'Cancel' : 'New Banner'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-4">
          <h2 className="text-sm font-medium text-[#2C2C2C]">Create Banner</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Title</label>
              <input
                type="text"
                placeholder="Banner headline"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Subtitle</label>
              <input
                type="text"
                placeholder="Optional subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-[#2C2C2C]/50">Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Link URL</label>
              <input
                type="text"
                placeholder="/shop or https://..."
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Link Text</label>
              <input
                type="text"
                placeholder="Shop Now"
                value={form.linkText}
                onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Position</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value as 'hero' | 'secondary' })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              >
                <option value="hero">Hero (full-width)</option>
                <option value="secondary">Secondary (feature card)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
          </div>
          <button
            onClick={createBanner}
            disabled={creating || (!form.title.trim() && !form.imageUrl.trim())}
            className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a] disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create Banner'}
          </button>
        </div>
      )}

      {/* Banner Grid */}
      {loading ? (
        <p className="text-center text-[#2C2C2C]/40 text-sm py-12">Loading...</p>
      ) : banners.length === 0 ? (
        <p className="text-center text-[#2C2C2C]/30 py-12 font-[family-name:var(--font-playfair)] text-xl">
          No banners yet
        </p>
      ) : (
        <div className="space-y-8">
          {/* Hero Banners */}
          {heroBanners.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium mb-3">
                Hero Banners
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {heroBanners.map((banner) => (
                  <BannerCard
                    key={banner.id}
                    banner={banner}
                    onToggle={() => toggleActive(banner)}
                    onDelete={() => deleteBanner(banner.id)}
                    deleting={deletingId === banner.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Secondary Banners */}
          {secondaryBanners.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium mb-3">
                Secondary Banners
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {secondaryBanners.map((banner) => (
                  <BannerCard
                    key={banner.id}
                    banner={banner}
                    onToggle={() => toggleActive(banner)}
                    onDelete={() => deleteBanner(banner.id)}
                    deleting={deletingId === banner.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BannerCard({
  banner,
  onToggle,
  onDelete,
  deleting,
}: {
  banner: Banner;
  onToggle: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className={`bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden ${!banner.isActive ? 'opacity-50' : ''}`}>
      {/* Image Preview */}
      {banner.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#C9A86C]/10 to-[#2C2C2C]/5 flex items-center justify-center">
          <span className="text-[#2C2C2C]/20 text-sm">No image</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-[#2C2C2C]">{banner.title || 'Untitled'}</h3>
          {banner.subtitle && (
            <p className="text-xs text-[#2C2C2C]/50 mt-0.5">{banner.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#2C2C2C]/40">
          <span className="px-1.5 py-0.5 rounded bg-[#2C2C2C]/5">
            {banner.position}
          </span>
          <span>Order: {banner.sortOrder}</span>
          {banner.linkUrl && (
            <span className="truncate">{banner.linkUrl}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2C]/5">
          <div className="flex items-center gap-2">
            <Switch checked={banner.isActive} onCheckedChange={onToggle} />
            <span className="text-xs text-[#2C2C2C]/50">
              {banner.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <DeleteConfirm
            title="Delete Banner"
            description="This banner will be permanently deleted."
            onConfirm={onDelete}
            loading={deleting}
            trigger={
              <button className="text-xs text-red-400 hover:text-red-600">Delete</button>
            }
          />
        </div>
      </div>
    </div>
  );
}
