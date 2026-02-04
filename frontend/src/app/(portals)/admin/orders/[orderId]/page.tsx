'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  hexCode?: string;
  quantity: number;
  priceEur: number;
  volume?: string;
}

interface OrderDetail {
  orderId: string;
  userId: string;
  email: string;
  items: OrderItem[];
  subtotalEur: number;
  taxEur: number;
  totalEur: number;
  status: string;
  shippingMethod: string;
  shippingAddress: {
    name?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    province?: string;
    country?: string;
    phone?: string;
  } | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function load() {
      if (!userId) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/admin/orders/${orderId}?userId=${userId}`);
        if (!res.ok) throw new Error();
        setOrder(await res.json());
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId, userId]);

  const updateStatus = async (newStatus: string) => {
    if (!order || newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: order.userId }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const shippingLabel = (method: string) => {
    if (method === 'click_collect') return 'Click & Collect — Calle Dublín 21, Marbella';
    if (method === 'local_delivery') return 'Local Delivery — Costa del Sol';
    return method || '-';
  };

  if (loading) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading order...</div>;
  }

  if (!userId) {
    return (
      <div className="p-12 text-center">
        <p className="text-[#2C2C2C]/50 text-sm">Missing userId parameter.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <p className="text-[#2C2C2C]/50 text-sm">Order not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const subtotal = order.subtotalEur ?? 0;
  const tax = order.taxEur ?? subtotal * 0.21;
  const total = order.totalEur ?? subtotal + tax;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
            <Link href="/admin/orders"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Order Detail</h1>
            <p className="text-[#2C2C2C]/50 text-sm mt-1 font-mono">{order.orderId}</p>
          </div>
        </div>
        <select
          value={order.status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={updatingStatus}
          className={`text-sm font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items card */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2C2C2C]/8">
              <h2 className="text-sm font-medium text-[#2C2C2C]">Items ({order.items.length})</h2>
            </div>
            {order.items.length > 0 ? (
              <div className="divide-y divide-[#2C2C2C]/5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    {item.hexCode && (
                      <div className="w-10 h-10 rounded-lg border border-[#2C2C2C]/15 shrink-0" style={{ backgroundColor: item.hexCode }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2C2C2C] truncate">{item.name}</p>
                      <p className="text-xs text-[#2C2C2C]/40">
                        {item.brand}{item.volume ? ` · ${item.volume}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-[#2C2C2C]">{item.priceEur.toFixed(2)} &euro;</p>
                      <p className="text-xs text-[#2C2C2C]/40">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-sm text-[#2C2C2C]/40 text-center">No item details available</p>
            )}

            {/* Totals */}
            <div className="border-t border-[#2C2C2C]/8 px-4 py-3 space-y-1">
              <div className="flex justify-between text-sm text-[#2C2C2C]/60">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} &euro;</span>
              </div>
              <div className="flex justify-between text-sm text-[#2C2C2C]/60">
                <span>IVA (21%)</span>
                <span>{tax.toFixed(2)} &euro;</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[#2C2C2C] pt-1 border-t border-[#2C2C2C]/5">
                <span>Total</span>
                <span>{total.toFixed(2)} &euro;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — info */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-2">
            <h2 className="text-sm font-medium text-[#2C2C2C]">Customer</h2>
            <p className="text-sm text-[#2C2C2C]">{order.email}</p>
            <p className="text-xs text-[#2C2C2C]/40 font-mono">{order.userId}</p>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-2">
            <h2 className="text-sm font-medium text-[#2C2C2C]">Shipping</h2>
            <p className="text-sm text-[#2C2C2C]/70">{shippingLabel(order.shippingMethod)}</p>
            {order.shippingAddress && (
              <div className="text-sm text-[#2C2C2C]/60 space-y-0.5 pt-1">
                {order.shippingAddress.name && <p>{order.shippingAddress.name}</p>}
                {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                {(order.shippingAddress.postalCode || order.shippingAddress.city) && (
                  <p>{[order.shippingAddress.postalCode, order.shippingAddress.city].filter(Boolean).join(' ')}</p>
                )}
                {order.shippingAddress.province && <p>{order.shippingAddress.province}</p>}
                {order.shippingAddress.phone && <p className="pt-1">{order.shippingAddress.phone}</p>}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-2">
            <h2 className="text-sm font-medium text-[#2C2C2C]">Timeline</h2>
            <div className="text-sm text-[#2C2C2C]/60 space-y-1">
              <p>Created: {formatDate(order.createdAt)}</p>
              {order.updatedAt && <p>Updated: {formatDate(order.updatedAt)}</p>}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-4 space-y-2">
              <h2 className="text-sm font-medium text-[#2C2C2C]">Notes</h2>
              <p className="text-sm text-[#2C2C2C]/60 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
