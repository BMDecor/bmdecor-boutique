'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Order {
  orderId: string;
  userId: string;
  email: string;
  itemCount: number;
  subtotalEur: number;
  status: string;
  shippingMethod: string;
  createdAt: string;
}

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateStatus = async (order: Order, newStatus: string) => {
    if (newStatus === order.status) return;
    setUpdatingId(order.orderId);

    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: order.userId }),
      });
      if (!res.ok) throw new Error('Failed to update');

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId ? { ...o, status: newStatus } : o,
        ),
      );
      toast.success(`Order ${order.orderId.slice(0, 8)}... updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const shippingLabel = (method: string) => {
    if (method === 'click_collect') return 'Click & Collect';
    if (method === 'local_delivery') return 'Local Delivery';
    return method || '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Orders
        </h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          Manage customer orders and fulfillment
        </p>
      </div>

      {/* Summary */}
      {!loading && orders.length > 0 && (
        <div className="flex gap-4 text-xs text-[#2C2C2C]/50">
          {statusOptions.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            if (count === 0) return null;
            return (
              <span key={s} className="flex items-center gap-1.5 capitalize">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    s === 'pending'
                      ? 'bg-yellow-500'
                      : s === 'confirmed'
                        ? 'bg-blue-500'
                        : s === 'shipped'
                          ? 'bg-purple-500'
                          : s === 'delivered'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                  }`}
                />
                {count} {s}
              </span>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C]/30 mb-2">
              No orders yet
            </p>
            <p className="text-sm text-[#2C2C2C]/40">
              Orders will appear here once customers complete purchases.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2C2C2C]/8">
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Order ID
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Customer
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Items
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Total (EUR)
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Shipping
                </TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.orderId}
                  className="border-b border-[#2C2C2C]/5 hover:bg-[#FAF8F5]/50 cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.orderId}?userId=${order.userId}`)}
                >
                  <TableCell className="text-xs font-mono text-[#2C2C2C]/60">
                    {order.orderId.slice(0, 12)}...
                  </TableCell>
                  <TableCell className="text-sm text-[#2C2C2C]">
                    {order.email}
                  </TableCell>
                  <TableCell className="text-sm text-[#2C2C2C]/70 text-center">
                    {order.itemCount}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#2C2C2C]">
                    {(order.subtotalEur ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order, e.target.value)}
                      disabled={updatingId === order.orderId}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-xs text-[#2C2C2C]/50">
                    {shippingLabel(order.shippingMethod)}
                  </TableCell>
                  <TableCell className="text-xs text-[#2C2C2C]/50 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Count */}
      {!loading && orders.length > 0 && (
        <p className="text-xs text-[#2C2C2C]/40">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  );
}
