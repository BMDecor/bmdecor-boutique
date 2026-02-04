'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirm } from '@/components/admin/delete-confirm';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderEur: number;
  maxUses: number;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

type FilterMode = 'all' | 'active' | 'expired';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderEur: 0,
    maxUses: 0,
    validFrom: '',
    validUntil: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  async function createCoupon() {
    if (!form.code.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase().trim(),
          validFrom: form.validFrom || null,
          validUntil: form.validUntil || null,
        }),
      });
      if (res.status === 409) {
        toast.error('Code already exists');
        return;
      }
      if (!res.ok) throw new Error();
      toast.success('Coupon created');
      setForm({ code: '', discountType: 'percentage', discountValue: 10, minOrderEur: 0, maxUses: 0, validFrom: '', validUntil: '' });
      setShowCreate(false);
      loadData();
    } catch {
      toast.error('Failed to create coupon');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error();
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c)),
      );
    } catch {
      toast.error('Failed to update coupon');
    }
  }

  async function deleteCoupon(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Coupon deleted');
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  }

  const now = new Date();
  const isExpired = (c: Coupon) => c.validUntil && new Date(c.validUntil) < now;

  const filtered = coupons.filter((c) => {
    if (filter === 'active') return c.isActive && !isExpired(c);
    if (filter === 'expired') return isExpired(c) || !c.isActive;
    return true;
  });

  const activeCount = coupons.filter((c) => c.isActive && !isExpired(c)).length;

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Coupons</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">
            {coupons.length} total &middot; {activeCount} active
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a]"
        >
          {showCreate ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-5 space-y-4">
          <h2 className="text-sm font-medium text-[#2C2C2C]">Create Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Code</label>
              <input
                type="text"
                placeholder="SAVE20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30 uppercase font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (&euro;)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">
                Value {form.discountType === 'percentage' ? '(%)' : '(\u20AC)'}
              </label>
              <input
                type="number"
                min={0}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Min. order (&euro;)</label>
              <input
                type="number"
                min={0}
                value={form.minOrderEur}
                onChange={(e) => setForm({ ...form, minOrderEur: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Max uses (0 = unlimited)</label>
              <input
                type="number"
                min={0}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Valid from</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2C2C2C]/50">Valid until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full rounded-md border border-[#2C2C2C]/15 px-3 py-2 text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30"
              />
            </div>
          </div>
          <button
            onClick={createCoupon}
            disabled={creating || !form.code.trim()}
            className="px-4 py-2 bg-[#2C2C2C] text-white text-sm rounded-md hover:bg-[#1a1a1a] disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 bg-[#2C2C2C]/5 rounded-lg p-1 w-fit">
        {(['all', 'active', 'expired'] as FilterMode[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filter === f
                ? 'bg-white text-[#2C2C2C] shadow-sm font-medium'
                : 'text-[#2C2C2C]/50 hover:text-[#2C2C2C]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-[#2C2C2C]/40 text-sm py-12">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#2C2C2C]/30 py-12 font-[family-name:var(--font-playfair)] text-xl">
          {coupons.length === 0 ? 'No coupons yet' : 'No matches'}
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2C2C2C]/8 bg-[#FAF8F5]">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Code</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Discount</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Min Order</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Uses</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Valid</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Active</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-[#2C2C2C]/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2C2C]/5">
              {filtered.map((coupon) => (
                <tr key={coupon.id} className={`hover:bg-[#FAF8F5]/50 ${isExpired(coupon) ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-medium text-[#2C2C2C]">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-[#2C2C2C]/70">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `${coupon.discountValue.toFixed(2)} \u20AC`}
                  </td>
                  <td className="px-4 py-3 text-[#2C2C2C]/50">
                    {coupon.minOrderEur > 0 ? `${coupon.minOrderEur.toFixed(2)} \u20AC` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[#2C2C2C]/50">
                    {coupon.usedCount}{coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : ' / \u221E'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2C2C2C]/50">
                    {formatDate(coupon.validFrom)} — {formatDate(coupon.validUntil)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => toggleActive(coupon)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteConfirm
                      title="Delete Coupon"
                      description={`Delete coupon "${coupon.code}"? This cannot be undone.`}
                      onConfirm={() => deleteCoupon(coupon.id)}
                      loading={deletingId === coupon.id}
                      trigger={
                        <button className="text-xs text-red-400 hover:text-red-600">Delete</button>
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
  );
}
