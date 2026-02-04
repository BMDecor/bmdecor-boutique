'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  brand: 'BM' | 'FB' | 'LG';
  name: string;
  priceEur: number;
}

interface Order {
  orderId: string;
  email: string;
  status: string;
}

interface BrandBreakdown {
  BM: number;
  FB: number;
  LG: number;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/orders'),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(Array.isArray(data) ? data : []);
        }
        if (ordRes.ok) {
          const data = await ordRes.json();
          setOrders(Array.isArray(data) ? data : []);
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
      title: 'Active Brands',
      value: '3',
      subtitle: 'Benjamin Moore, Farrow & Ball, Little Greene',
    },
    {
      title: 'Location',
      value: 'Marbella',
      subtitle: 'Calle Dublin 21, Costa del Sol',
    },
  ];

  const quickLinks = [
    { href: '/admin/pricing', label: 'Pricing', desc: 'Manage product prices' },
    { href: '/admin/inventory', label: 'Inventory', desc: 'Stock control' },
    { href: '/admin/orders', label: 'Orders', desc: 'Order management' },
    { href: '/admin/exports', label: 'Exports', desc: 'Download catalog' },
  ];

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

      {/* Quick Links */}
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
