'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/cart/cart-context';
import type { CartItemResponse } from '@/lib/cart/types';

function CartItem({ item }: { item: CartItemResponse }) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantity = async (delta: number) => {
    const next = item.quantity + delta;
    setIsUpdating(true);
    try {
      if (next <= 0) {
        await removeItem(item.sk);
      } else {
        await updateQuantity(item.sk, next);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.sk);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 py-3"
    >
      {/* Color Dollop */}
      <div
        className="w-14 h-14 rounded-lg shrink-0 shadow-sm ring-1 ring-black/5"
        style={{ backgroundColor: item.hexCode }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-foreground leading-tight truncate">
              {item.colorName}
            </h4>
            <p className="text-xs text-muted-foreground font-mono">{item.colorNumber}</p>
          </div>
          <div className="text-sm font-semibold text-foreground shrink-0">
            &euro;{item.lineTotalEur.toFixed(2)}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-0.5">
          {item.productLine} &middot; {item.sheen} &middot; {item.size}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Toggle */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleQuantity(-1)}
              disabled={isUpdating}
              className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              &minus;
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantity(1)}
              disabled={isUpdating}
              className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              +
            </button>
            <span className="text-[11px] text-muted-foreground ml-2">
              &times; &euro;{item.unitPriceEur.toFixed(2)}
            </span>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CartDrawer() {
  const { items, itemCount, subtotalEur, isDrawerOpen, setDrawerOpen } = useCart();

  // IVA calculation (21% included in prices)
  const ivaRate = 0.21;
  const baseEur = subtotalEur / (1 + ivaRate);
  const ivaEur = subtotalEur - baseEur;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-playfair)] text-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Boutique Bag
          </SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? 'Your bag is empty'
              : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} · BM Decoraci\u00f3n`}
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 -mx-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm">Select a color to begin</p>
              <p className="text-xs mt-1">Items added will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem key={item.sk} item={item} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        {items.length > 0 && (
          <SheetFooter className="border-t bg-background">
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal (excl. IVA)</span>
                <span>&euro;{baseEur.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA (21%)</span>
                <span>&euro;{ivaEur.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total (IVA Incluido)</span>
                <span className="text-xl font-semibold text-[#C9A86C]">&euro;{subtotalEur.toFixed(2)}</span>
              </div>
              <button className="w-full mt-2 py-3 bg-[#2C2C2C] text-white font-medium text-sm rounded-lg hover:bg-[#404040] active:scale-[0.98] transition-all">
                Proceed to Checkout
              </button>
              <p className="text-[10px] text-muted-foreground text-center">
                BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
