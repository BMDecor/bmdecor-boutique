'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartResponse, CartItemResponse, AddToCartRequest } from './types';

interface CartContextValue {
  items: CartItemResponse[];
  itemCount: number;
  subtotalEur: number;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart on mount
  useEffect(() => {
    fetch('/api/cart')
      .then((res) => res.json())
      .then((data: CartResponse) => setCart(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const addItem = useCallback(async (req: AddToCartRequest) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart) setCart(data.cart);
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
        addItem,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
