'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  brand: 'BM' | 'FB' | 'LG';
  name: string;
  colorCode: string;
  hexCode: string;
  priceEur: number;
  createdAt: string;
}

interface Order {
  orderId: string;
  email: string;
  status: string;
  subtotalEur: number;
  shippingMethod: string;
  createdAt: string;
}

interface Palette {
  id: string;
  name: string;
  isPublished: boolean;
}

interface BrandBreakdown {
  BM: number;
  FB: number;
  LG: number;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, ordRes, palRes, userRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/orders'),
          fetch('/api/admin/colors/palettes'),
          fetch('/api/admin/users?limit=1'),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(Array.isArray(data) ? data : []);
        }
        if (ordRes.ok) {
          const data = await ordRes.json();
          setOrders(Array.isArray(data) ? data : []);
        }
        if (palRes.ok) {
          const data = await palRes.json();
          setPalettes(Array.isArray(data) ? data : []);
        }
        if (userRes.ok) {
          const data = await userRes.json();
          setUserCount(data.users?.length ?? 0);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const brandBreakdown: BrandBreakdown = products.reduce(
    (acc, p) => {
      if (p.brand === 'BM' || p.brand === 'FB' || p.brand === 'LG') {
        acc[p.brand]++;
      }
      return acc;
    },
    { BM: 0, FB: 0, LG: 0 } as BrandBreakdown,
  );

  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const revenue = deliveredOrders.reduce((sum, o) => sum + (o.subtotalEur ?? 0), 0);
  const publishedPalettes = palettes.filter((p) => p.isPublished).length;

  const recentOrders = [...orders].slice(0, 5);
  const recentProducts = [...products]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5);

  const kpiCards = [
    {
      title: 'Total Products',
      value: loading ? '...' : products.length.toLocaleString(),
      subtitle: loading
        ? 'Loading'
        : `BM ${brandBreakdown.BM} / FB ${brandBreakdown.FB} / LG ${brandBreakdown.LG}`,
    },
    {
      title: 'Total Orders',
      value: loading ? '...' : orders.length.toLocaleString(),
      subtitle: loading
        ? 'Loading'
        : `${orders.filter((o) => o.status === 'pending').length} pending`,
    },
    {
      title: 'Revenue (Delivered)',
      value: loading ? '...' : `${revenue.toFixed(2)} \u20AC`,
      subtitle: loading
        ? 'Loading'
        : `${deliveredOrders.length} delivered order${deliveredOrders.length !== 1 ? 's' : ''}`,
    },
    {
      title: 'Palettes',
      value: loading ? '...' : palettes.length.toString(),
      subtitle: loading
        ? 'Loading'
        : `${publishedPalettes} published`,
    },
  ];

  const quickLinks = [
    { href: '/admin/products', label: 'Products', desc: 'Catalog, pricing & stock' },
    { href: '/admin/colors', label: 'Colors', desc: 'Families & palettes' },
    { href: '/admin/articles', label: 'Articles', desc: 'Blog & content' },
    { href: '/admin/faqs', label: 'FAQs', desc: 'Frequently asked questions' },
    { href: '/admin/orders', label: 'Orders', desc: 'Order management' },
    { href: '/admin/contacts', label: 'Contacts', desc: 'Form submissions' },
    { href: '/admin/coupons', label: 'Coupons', desc: 'Promo codes & discounts' },
    { href: '/admin/users', label: 'Users', desc: `${userCount !== null ? userCount : '...'} registered` },
    { href: '/admin/images', label: 'Images', desc: 'Product gallery' },
    { href: '/admin/banners', label: 'Banners', desc: 'Homepage hero & features' },
    { href: '/admin/settings', label: 'Settings', desc: 'Company config' },
    { href: '/admin/exports', label: 'Exports', desc: 'Download catalog' },
  ];

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short',
      });
    } catch { return iso; }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Command Center
        </h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          Overview of your BM Decoracion boutique
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-[#2C2C2C]/40 mb-2">
              {card.title}
            </p>
            <p className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
              {card.value}
            </p>
            <p className="text-xs text-[#2C2C2C]/50 mt-2">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2C2C2C]/5 flex justify-between items-center">
              <h2 className="text-sm font-medium text-[#2C2C2C]">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-[#C9A86C] hover:text-[#B8975B]">View all</Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-[#2C2C2C]/5">
                {recentOrders.map((o) => (
                  <div key={o.orderId} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2C2C2C] truncate">{o.email}</p>
                      <p className="text-xs text-[#2C2C2C]/40">{formatDate(o.createdAt)}</p>
                    </div>
                    <span className="text-sm text-[#2C2C2C]/70">{(o.subtotalEur ?? 0).toFixed(2)} &euro;</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[o.status] || 'bg-gray-100 text-gray-700'}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-[#2C2C2C]/30 text-center">No orders yet</p>
            )}
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2C2C2C]/5 flex justify-between items-center">
              <h2 className="text-sm font-medium text-[#2C2C2C]">Recently Added Products</h2>
              <Link href="/admin/products" className="text-xs text-[#C9A86C] hover:text-[#B8975B]">View all</Link>
            </div>
            {recentProducts.length > 0 ? (
              <div className="divide-y divide-[#2C2C2C]/5">
                {recentProducts.map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-[#2C2C2C]/15 shrink-0"
                      style={{ backgroundColor: p.hexCode || '#CCCCCC' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2C2C2C] truncate">{p.name}</p>
                      <p className="text-xs text-[#2C2C2C]/40">{p.colorCode}</p>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#2C2C2C]/5 text-[#2C2C2C]/50">{p.brand}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-[#2C2C2C]/30 text-center">No products yet</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-lg border border-[#2C2C2C]/8 p-5 shadow-sm hover:border-[#C9A86C]/40 hover:shadow-md transition-all"
            >
              <p className="text-sm font-medium text-[#2C2C2C] group-hover:text-[#C9A86C] transition-colors">
                {link.label}
              </p>
              <p className="text-xs text-[#2C2C2C]/40 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
