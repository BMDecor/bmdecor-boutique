'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirm } from '@/components/admin/delete-confirm';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Palette, Layers } from 'lucide-react';

/* ───── Types ───── */

interface ColorFamily {
  id: string;
  name: string;
  description: string;
  brand: string | null;
  hexPreview: string;
  sortOrder: number;
  productIds: string[];
  createdAt: string;
}

interface PaletteItem {
  id: string;
  name: string;
  description: string;
  colors: { productId: string; hexCode: string; colorName: string; brand: string }[];
  isPublished: boolean;
  createdAt: string;
}

type Tab = 'families' | 'palettes';

/* ───── Page ───── */

export default function ColorsPage() {
  const [tab, setTab] = useState<Tab>('families');
  const [families, setFamilies] = useState<ColorFamily[]>([]);
  const [palettes, setPalettes] = useState<PaletteItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* New family form */
  const [showNewFamily, setShowNewFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyHex, setNewFamilyHex] = useState('#CCCCCC');
  const [newFamilyBrand, setNewFamilyBrand] = useState('');
  const [savingFamily, setSavingFamily] = useState(false);

  /* New palette form */
  const [showNewPalette, setShowNewPalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [savingPalette, setSavingPalette] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [famRes, palRes] = await Promise.all([
        fetch('/api/admin/colors/families'),
        fetch('/api/admin/colors/palettes'),
      ]);
      if (famRes.ok) setFamilies(await famRes.json());
      if (palRes.ok) setPalettes(await palRes.json());
    } catch {
      toast.error('Failed to load color data');
    } finally {
      setLoading(false);
    }
  }

  /* ── Family CRUD ── */

  async function createFamily() {
    if (!newFamilyName.trim()) { toast.error('Name is required'); return; }
    setSavingFamily(true);
    try {
      const res = await fetch('/api/admin/colors/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFamilyName,
          hexPreview: newFamilyHex,
          brand: newFamilyBrand || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Color family created');
      setShowNewFamily(false);
      setNewFamilyName('');
      setNewFamilyHex('#CCCCCC');
      setNewFamilyBrand('');
      loadData();
    } catch {
      toast.error('Failed to create color family');
    } finally {
      setSavingFamily(false);
    }
  }

  async function deleteFamily(id: string) {
    try {
      const res = await fetch(`/api/admin/colors/families/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setFamilies((prev) => prev.filter((f) => f.id !== id));
      toast.success('Color family deleted');
    } catch {
      toast.error('Failed to delete color family');
    }
  }

  /* ── Palette CRUD ── */

  async function createPalette() {
    if (!newPaletteName.trim()) { toast.error('Name is required'); return; }
    setSavingPalette(true);
    try {
      const res = await fetch('/api/admin/colors/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPaletteName }),
      });
      if (!res.ok) throw new Error();
      toast.success('Palette created');
      setShowNewPalette(false);
      setNewPaletteName('');
      loadData();
    } catch {
      toast.error('Failed to create palette');
    } finally {
      setSavingPalette(false);
    }
  }

  async function deletePalette(id: string) {
    try {
      const res = await fetch(`/api/admin/colors/palettes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPalettes((prev) => prev.filter((p) => p.id !== id));
      toast.success('Palette deleted');
    } catch {
      toast.error('Failed to delete palette');
    }
  }

  /* ── Render ── */

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'families', label: 'Color Families', icon: <Layers className="h-4 w-4" /> },
    { key: 'palettes', label: 'Palettes', icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Colors</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">Manage color families and curated palettes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#2C2C2C]/5 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
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
        <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading colors...</div>
      ) : tab === 'families' ? (
        /* ── Families Tab ── */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#2C2C2C]/50">{families.length} color {families.length === 1 ? 'family' : 'families'}</p>
            <Button
              onClick={() => setShowNewFamily(!showNewFamily)}
              className="bg-[#C9A86C] hover:bg-[#B8975B] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Family
            </Button>
          </div>

          {/* New family inline form */}
          {showNewFamily && (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Family name"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="#CCCCCC"
                    value={newFamilyHex}
                    onChange={(e) => setNewFamilyHex(e.target.value)}
                    className="flex-1"
                  />
                  <div className="w-8 h-8 rounded border border-[#2C2C2C]/15 shrink-0" style={{ backgroundColor: newFamilyHex }} />
                </div>
                <select
                  value={newFamilyBrand}
                  onChange={(e) => setNewFamilyBrand(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
                >
                  <option value="">All Brands</option>
                  <option value="BM">Benjamin Moore</option>
                  <option value="FB">Farrow & Ball</option>
                  <option value="LG">Little Greene</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createFamily} disabled={savingFamily} size="sm" className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
                  {savingFamily ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewFamily(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Families grid */}
          {families.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-lg border border-[#2C2C2C]/8">
              <Layers className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
              <p className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]/30">No color families yet</p>
              <p className="text-sm text-[#2C2C2C]/40 mt-1">Create families to group related colors together.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {families.map((fam) => (
                <div key={fam.id} className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="h-16 w-full" style={{ backgroundColor: fam.hexPreview }} />
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#2C2C2C]">{fam.name}</h3>
                        {fam.brand && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#2C2C2C]/5 text-[#2C2C2C]/60">{fam.brand}</span>
                        )}
                      </div>
                      <span className="text-xs text-[#2C2C2C]/40 font-mono">{fam.hexPreview}</span>
                    </div>
                    {fam.description && (
                      <p className="text-xs text-[#2C2C2C]/50 line-clamp-2">{fam.description}</p>
                    )}
                    <p className="text-xs text-[#2C2C2C]/40">
                      {fam.productIds.length} product{fam.productIds.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
                        <Link href={`/admin/colors/families/${fam.id}`}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Link>
                      </Button>
                      <DeleteConfirm
                        title={`Delete "${fam.name}"?`}
                        description="This action cannot be undone."
                        onConfirm={() => deleteFamily(fam.id)}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Palettes Tab ── */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#2C2C2C]/50">{palettes.length} palette{palettes.length === 1 ? '' : 's'}</p>
            <Button
              onClick={() => setShowNewPalette(!showNewPalette)}
              className="bg-[#C9A86C] hover:bg-[#B8975B] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Palette
            </Button>
          </div>

          {/* New palette inline form */}
          {showNewPalette && (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-3">
              <Input
                placeholder="Palette name"
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={createPalette} disabled={savingPalette} size="sm" className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
                  {savingPalette ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewPalette(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Palettes grid */}
          {palettes.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-lg border border-[#2C2C2C]/8">
              <Palette className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
              <p className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]/30">No palettes yet</p>
              <p className="text-sm text-[#2C2C2C]/40 mt-1">Create palettes to curate color combinations for clients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palettes.map((pal) => (
                <div key={pal.id} className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Color strip preview */}
                  <div className="h-12 flex">
                    {pal.colors.length > 0 ? (
                      pal.colors.map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c.hexCode }} />
                      ))
                    ) : (
                      <div className="flex-1 bg-gradient-to-r from-[#2C2C2C]/5 to-[#2C2C2C]/10 flex items-center justify-center">
                        <span className="text-xs text-[#2C2C2C]/30">No colors</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-[#2C2C2C]">{pal.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${pal.isPublished ? 'bg-green-100 text-green-700' : 'bg-[#2C2C2C]/5 text-[#2C2C2C]/40'}`}>
                        {pal.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {pal.description && (
                      <p className="text-xs text-[#2C2C2C]/50 line-clamp-2">{pal.description}</p>
                    )}
                    <p className="text-xs text-[#2C2C2C]/40">
                      {pal.colors.length} color{pal.colors.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
                        <Link href={`/admin/colors/palettes/${pal.id}`}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Link>
                      </Button>
                      <DeleteConfirm
                        title={`Delete "${pal.name}"?`}
                        description="This action cannot be undone."
                        onConfirm={() => deletePalette(pal.id)}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                    </div>
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
