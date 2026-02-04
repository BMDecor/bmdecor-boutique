'use client';

import { useState, useEffect } from 'react';
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

function PaintCartItem({ item }: { item: CartItemResponse }) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantity = async (delta: number) => {
    const next = item.quantity + delta;
    setIsUpdating(true);
    try {
      if (next <= 0) await removeItem(item.sk);
      else await updateQuantity(item.sk, next);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try { await removeItem(item.sk); } finally { setIsUpdating(false); }
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
      <div
        className="w-14 h-14 rounded-lg shrink-0 shadow-sm ring-1 ring-black/5"
        style={{ backgroundColor: item.hexCode || '#ccc' }}
      />
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
          <div className="flex items-center gap-0.5">
            <button onClick={() => handleQuantity(-1)} disabled={isUpdating} className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40">&minus;</button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
            <button onClick={() => handleQuantity(1)} disabled={isUpdating} className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40">+</button>
            <span className="text-[11px] text-muted-foreground ml-2">&times; &euro;{item.unitPriceEur.toFixed(2)}</span>
          </div>
          <button onClick={handleRemove} disabled={isUpdating} className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">Remove</button>
        </div>
      </div>
    </motion.div>
  );
}

function WallpaperCartItem({ item }: { item: CartItemResponse }) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantity = async (delta: number) => {
    const next = item.quantity + delta;
    setIsUpdating(true);
    try {
      if (next <= 0) await removeItem(item.sk);
      else await updateQuantity(item.sk, next);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try { await removeItem(item.sk); } finally { setIsUpdating(false); }
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
      <div className="w-14 h-14 rounded-lg shrink-0 shadow-sm ring-1 ring-black/5 bg-muted flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.designName || ''} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-foreground leading-tight truncate">
              {item.designName || 'Wallpaper'}
            </h4>
            {item.colourway && <p className="text-xs text-muted-foreground">{item.colourway}</p>}
          </div>
          <div className="text-sm font-semibold text-foreground shrink-0">
            &euro;{item.lineTotalEur.toFixed(2)}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Wallpaper &middot; per roll</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-0.5">
            <button onClick={() => handleQuantity(-1)} disabled={isUpdating} className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40">&minus;</button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
            <button onClick={() => handleQuantity(1)} disabled={isUpdating} className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40">+</button>
            <span className="text-[11px] text-muted-foreground ml-2">&times; &euro;{item.unitPriceEur.toFixed(2)}</span>
          </div>
          <button onClick={handleRemove} disabled={isUpdating} className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">Remove</button>
        </div>
      </div>
    </motion.div>
  );
}

function AccessoryCartItem({ item }: { item: CartItemResponse }) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantity = async (delta: number) => {
    const next = item.quantity + delta;
    setIsUpdating(true);
    try {
      if (next <= 0) await removeItem(item.sk);
      else await updateQuantity(item.sk, next);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try { await removeItem(item.sk); } finally { setIsUpdating(false); }
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
      <div className="w-14 h-14 rounded-lg shrink-0 shadow-sm ring-1 ring-black/5 bg-muted flex items-center justify-center">
        <svg className="w-6 h-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-foreground leading-tight truncate">
              {item.accessoryName || 'Accessory'}
            </h4>
            {item.accessoryCategory && <p className="text-xs text-muted-foreground capitalize">{item.accessoryCategory}</p>}
          </div>
          <div className="text-sm font-semibold text-foreground shrink-0">
            &euro;{item.lineTotalEur.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-0.5">
            <button onClick={() => handleQuantity(-1)} disabled={isUpdating} className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40">&minus;</button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
            <button onClick={() => handleQuantity(1)} disabled={isUpdating} className="w-7 h-7 rounded-md bg-secondary text-foreground text-sm font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40">+</button>
            <span className="text-[11px] text-muted-foreground ml-2">&times; &euro;{item.unitPriceEur.toFixed(2)}</span>
          </div>
          <button onClick={handleRemove} disabled={isUpdating} className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">Remove</button>
        </div>
      </div>
    </motion.div>
  );
}

function CartItemRow({ item }: { item: CartItemResponse }) {
  const type = item.productType || 'paint';
  switch (type) {
    case 'wallpaper': return <WallpaperCartItem item={item} />;
    case 'accessory': return <AccessoryCartItem item={item} />;
    default: return <PaintCartItem item={item} />;
  }
}

interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderEur: number;
}

export default function CartDrawer() {
  const { items, itemCount, subtotalEur, isDrawerOpen, setDrawerOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        if (data.minOrderEur > 0 && subtotalEur < data.minOrderEur) {
          setCouponError(`Min. order \u20AC${data.minOrderEur.toFixed(2)}`);
        } else {
          setAppliedCoupon(data);
          setCouponError('');
        }
      } else {
        setCouponError(data.reason || 'Invalid code');
      }
    } catch {
      setCouponError('Error validating code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  let discountEur = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountEur = subtotalEur * (appliedCoupon.discountValue / 100);
    } else {
      discountEur = Math.min(appliedCoupon.discountValue, subtotalEur);
    }
  }
  const finalEur = subtotalEur - discountEur;
  const ivaRate = 0.21;
  const baseEur = finalEur / (1 + ivaRate);
  const ivaEur = finalEur - baseEur;

  // Group items by product type for display
  const paintItems = items.filter((i) => (i.productType || 'paint') === 'paint');
  const wallpaperItems = items.filter((i) => i.productType === 'wallpaper');
  const accessoryItems = items.filter((i) => i.productType === 'accessory');

  if (!mounted) return null;

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

        <div className="flex-1 overflow-y-auto px-4 -mx-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm">Select a product to begin</p>
              <p className="text-xs mt-1">Items added will appear here</p>
            </div>
          ) : (
            <div>
              {/* Paint Items */}
              {paintItems.length > 0 && (
                <div>
                  {(wallpaperItems.length > 0 || accessoryItems.length > 0) && (
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-2 mb-1">Paint</p>
                  )}
                  <div className="divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {paintItems.map((item) => <CartItemRow key={item.sk} item={item} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Wallpaper Items */}
              {wallpaperItems.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-4 mb-1">Wallpaper</p>
                  <div className="divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {wallpaperItems.map((item) => <CartItemRow key={item.sk} item={item} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Accessory Items */}
              {accessoryItems.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-4 mb-1">Accessories</p>
                  <div className="divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {accessoryItems.map((item) => <CartItemRow key={item.sk} item={item} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t bg-background">
            <div className="space-y-2 w-full">
              {/* Coupon */}
              {!appliedCoupon ? (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      className="flex-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-mono uppercase bg-background focus:outline-none focus:ring-1 focus:ring-[#C9A86C]/40"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-1.5 text-xs bg-[#2C2C2C] text-white rounded-md hover:bg-[#404040] disabled:opacity-40"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-destructive">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 rounded-md px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-green-700">{appliedCoupon.code}</span>
                    <span className="text-[11px] text-green-600">
                      {appliedCoupon.discountType === 'percentage'
                        ? `-${appliedCoupon.discountValue}%`
                        : `-\u20AC${appliedCoupon.discountValue.toFixed(2)}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-[11px] text-green-700 hover:text-red-500">Remove</button>
                </div>
              )}

              {discountEur > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>&minus;&euro;{discountEur.toFixed(2)}</span>
                </div>
              )}
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
                <span className="text-xl font-semibold text-[#C9A86C]">&euro;{finalEur.toFixed(2)}</span>
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
