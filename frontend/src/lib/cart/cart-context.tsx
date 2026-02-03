'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartResponse, CartItemResponse, AddToCartRequest } from './types';

interface CartContextValue {
  items: CartItemResponse[];
  itemCount: number;
  subtotalEur: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (req: AddToCartRequest) => Promise<void>;
  removeItem: (sk: string) => Promise<void>;
  updateQuantity: (sk: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse>({
    cartId: '',
    itemCount: 0,
    subtotalEur: 0,
    items: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe mount flag
  useEffect(() => { setMounted(true); }, []);

  // Fetch cart on mount — never blocks initial render
  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    setIsLoading(true);
    fetch('/api/cart', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Cart fetch ${res.status}`);
        return res.json();
      })
      .then((data: CartResponse) => setCart(data))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Cart load failed:', err);
      })
      .finally(() => {
        clearTimeout(timeout);
        setIsLoading(false);
      });

    return () => { controller.abort(); clearTimeout(timeout); };
  }, [mounted]);

  const addItem = useCallback(async (req: AddToCartRequest) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart) {
        setCart(data.cart);
        setDrawerOpen(true);
      }
    }
  }, []);

  const removeItem = useCallback(async (sk: string) => {
    const res = await fetch(`/api/cart/${encodeURIComponent(sk)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart) setCart(data.cart);
    }
  }, []);

  const updateQuantity = useCallback(async (sk: string, quantity: number) => {
    const res = await fetch(`/api/cart/${encodeURIComponent(sk)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart) setCart(data.cart);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        itemCount: cart.itemCount,
        subtotalEur: cart.subtotalEur,
        isLoading,
        isDrawerOpen,
        setDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
