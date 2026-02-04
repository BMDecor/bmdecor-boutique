'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

interface ShippingZone {
  name: string;
  price: number;
  description: string;
}

interface Settings {
  companyName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  phone: string;
  email: string;
  vatNumber: string;
  taxRate: number;
  currency: string;
  shippingZones: ShippingZone[];
  clickCollectEnabled: boolean;
  clickCollectAddress: string;
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) setSettings(await res.json());
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const save = async (section: string) => {
    if (!settings) return;
    setSaving(section);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success(`${section} saved`);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  const set = (path: string, value: unknown) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = clone;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const addZone = () => {
    if (!settings) return;
    set('shippingZones', [...settings.shippingZones, { name: '', price: 0, description: '' }]);
  };

  const removeZone = (idx: number) => {
    if (!settings) return;
    set('shippingZones', settings.shippingZones.filter((_, i) => i !== idx));
  };

  const updateZone = (idx: number, field: string, value: unknown) => {
    if (!settings) return;
    const zones = [...settings.shippingZones];
    zones[idx] = { ...zones[idx], [field]: value };
    set('shippingZones', zones);
  };

  if (loading || !settings) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Settings</h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">Company configuration and business rules</p>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-4">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]">Company Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={settings.companyName} onChange={(e) => set('companyName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>VAT Number (CIF/NIF)</Label>
            <Input value={settings.vatNumber} onChange={(e) => set('vatNumber', e.target.value)} placeholder="e.g., B12345678" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={settings.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+34 ..." />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={settings.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="info@bmdecor.es" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Street</Label>
          <Input value={settings.address.street} onChange={(e) => set('address.street', e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Postal Code</Label>
            <Input value={settings.address.postalCode} onChange={(e) => set('address.postalCode', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={settings.address.city} onChange={(e) => set('address.city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Province</Label>
            <Input value={settings.address.province} onChange={(e) => set('address.province', e.target.value)} />
          </div>
        </div>
        <Button onClick={() => save('Company info')} disabled={saving === 'Company info'} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
          {saving === 'Company info' ? 'Saving...' : 'Save Company Info'}
        </Button>
      </div>

      {/* Tax & Currency */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-4">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]">Tax & Currency</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" step="0.1" min="0" value={settings.taxRate} onChange={(e) => set('taxRate', Number(e.target.value))} />
            <p className="text-xs text-[#2C2C2C]/40">Spanish IVA rate applied to all orders</p>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              value={settings.currency}
              onChange={(e) => set('currency', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
            >
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
        </div>
        <Button onClick={() => save('Tax & currency')} disabled={saving === 'Tax & currency'} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
          {saving === 'Tax & currency' ? 'Saving...' : 'Save Tax & Currency'}
        </Button>
      </div>

      {/* Shipping Zones */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]">Shipping Zones</h2>
          <Button variant="outline" size="sm" onClick={addZone}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Zone
          </Button>
        </div>

        {settings.shippingZones.map((zone, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_80px_1fr_32px] gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Zone Name</Label>
              <Input value={zone.name} onChange={(e) => updateZone(idx, 'name', e.target.value)} placeholder="e.g., Costa del Sol" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input type="number" step="0.01" min="0" value={zone.price} onChange={(e) => updateZone(idx, 'price', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input value={zone.description} onChange={(e) => updateZone(idx, 'description', e.target.value)} />
            </div>
            <button onClick={() => removeZone(idx)} className="pb-2 text-[#2C2C2C]/30 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Click & Collect */}
        <div className="pt-3 border-t border-[#2C2C2C]/5 space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={settings.clickCollectEnabled} onCheckedChange={(v) => set('clickCollectEnabled', v)} />
            <Label>Click & Collect</Label>
          </div>
          {settings.clickCollectEnabled && (
            <div className="space-y-1 pl-12">
              <Label className="text-xs">Pickup Address</Label>
              <Input value={settings.clickCollectAddress} onChange={(e) => set('clickCollectAddress', e.target.value)} />
            </div>
          )}
        </div>

        <Button onClick={() => save('Shipping')} disabled={saving === 'Shipping'} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
          {saving === 'Shipping' ? 'Saving...' : 'Save Shipping'}
        </Button>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-4">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]">Business Hours</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Weekdays (Mon–Fri)</Label>
            <Input value={settings.businessHours.weekdays} onChange={(e) => set('businessHours.weekdays', e.target.value)} placeholder="10:00 – 14:00, 17:00 – 20:00" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Saturday</Label>
            <Input value={settings.businessHours.saturday} onChange={(e) => set('businessHours.saturday', e.target.value)} placeholder="10:00 – 14:00" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sunday</Label>
            <Input value={settings.businessHours.sunday} onChange={(e) => set('businessHours.sunday', e.target.value)} placeholder="Closed" />
          </div>
        </div>
        <Button onClick={() => save('Business hours')} disabled={saving === 'Business hours'} className="bg-[#C9A86C] hover:bg-[#B8975B] text-white">
          {saving === 'Business hours' ? 'Saving...' : 'Save Business Hours'}
        </Button>
      </div>
    </div>
  );
}
