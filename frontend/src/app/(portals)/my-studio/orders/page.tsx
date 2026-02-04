'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  colorName?: string;
  hexCode?: string;
  brand?: string;
  volume?: string;
  quantity?: number;
  priceEur?: number;
}

interface Order {
  orderId: string;
  itemCount: number;
  subtotalEur: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/my-studio/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#2C2C2C]/60 text-sm tracking-wide">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-3">
          No orders yet
        </h2>
        <p className="text-[#2C2C2C]/60 text-sm max-w-md mx-auto">
          Browse our curated collections to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
        Order History
      </h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order.orderId;
          const displayId = order.orderId.length > 12
            ? `${order.orderId.slice(0, 6)}...${order.orderId.slice(-4)}`
            : order.orderId;
          const date = new Date(order.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={order.orderId}
              className="bg-white rounded-lg border border-[#E8E2D9] overflow-hidden"
            >
              {/* Order summary row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF8F5]/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[#2C2C2C] text-sm font-medium font-mono">
                      {displayId}
                    </p>
                    <p className="text-[#2C2C2C]/50 text-xs mt-0.5">{date}</p>
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-[#2C2C2C]/50 text-xs uppercase tracking-[0.1em]">Items</p>
                    <p className="text-[#2C2C2C] text-sm">{order.itemCount}</p>
                  </div>

                  <div>
                    <p className="text-[#2C2C2C]/50 text-xs uppercase tracking-[0.1em]">Subtotal</p>
                    <p className="text-[#2C2C2C] text-sm font-medium">
                      {order.subtotalEur.toFixed(2)} EUR
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      statusStyles[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-[#2C2C2C]/30 text-sm">
                    {isExpanded ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
              </button>

              {/* Expanded items */}
              {isExpanded && order.items.length > 0 && (
                <div className="border-t border-[#E8E2D9] px-6 py-4 bg-[#FAF8F5]/30">
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        {/* Color swatch */}
                        <div
                          className="w-8 h-8 rounded border border-[#E8E2D9] shrink-0"
                          style={{ backgroundColor: item.hexCode || '#ccc' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2C2C2C] text-sm truncate">
                            {item.colorName || 'Unknown color'}
                          </p>
                          <p className="text-[#2C2C2C]/50 text-xs">
                            {item.brand} {item.volume && `/ ${item.volume}`}
                            {item.quantity && ` x${item.quantity}`}
                          </p>
                        </div>
                        {item.priceEur !== undefined && (
                          <p className="text-[#2C2C2C] text-sm font-medium shrink-0">
                            {item.priceEur.toFixed(2)} EUR
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
