'use client';

import { useCart } from '@/lib/cart/cart-context';
import type { SelectedVariant } from '@/lib/cart/types';

interface StickySubtotalBarProps {
  variant: SelectedVariant | null;
}

export default function StickySubtotalBar({ variant }: StickySubtotalBarProps) {
  const { subtotalEur, itemCount } = useCart();

  return (
    <div className="border-t bg-background pt-4 mt-4 space-y-3">
      {/* Selected variant summary */}
      {variant && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {variant.productLine} · {variant.sheen} · {variant.size}
          </div>
          <div className="text-xl font-semibold text-[#C9A86C]">
            €{variant.unitPriceEur.toFixed(2)}
          </div>
        </div>
      )}

      {!variant && (
        <div className="text-sm text-muted-foreground text-center">
          Select a product line, finish, and size
        </div>
      )}

      {/* Cart subtotal */}
      {itemCount > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
          <span>Boutique Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-foreground">€{subtotalEur.toFixed(2)}</span>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        IVA Incluido (21%) · BM Decoraci&oacute;n, Marbella
      </p>
    </div>
  );
}
