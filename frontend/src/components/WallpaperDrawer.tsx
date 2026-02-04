'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart/cart-context';
import type { WallpaperData } from './WallpaperCard';

interface WallpaperDrawerProps {
  wallpaper: WallpaperData | null;
  onClose: () => void;
  accentColor?: string;
  bgColor?: string;
}

export default function WallpaperDrawer({
  wallpaper,
  onClose,
  accentColor = '#C9A86C',
  bgColor = '#1a1a1a',
}: WallpaperDrawerProps) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'details' | 'pairings'>('details');
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState<'idle' | 'loading' | 'success'>('idle');

  if (!wallpaper) return null;

  const handleAddToBag = async () => {
    setAddState('loading');
    try {
      await addItem({
        productType: 'wallpaper',
        brand: wallpaper.brand as 'BM' | 'FB' | 'LG',
        quantity,
        wallpaperId: wallpaper.id,
        designName: wallpaper.designName,
        colourway: wallpaper.colourway,
        imageUrl: wallpaper.imageUrl,
        unitPriceEur: wallpaper.priceEur,
      });
      setAddState('success');
      setTimeout(() => setAddState('idle'), 1500);
    } catch {
      setAddState('idle');
    }
  };

  const specs = [
    { label: 'Collection', value: wallpaper.collection },
    { label: 'Roll Width', value: wallpaper.rollWidth },
    { label: 'Repeat', value: wallpaper.repeat },
    { label: 'Drop', value: wallpaper.drop },
    { label: 'Base Paper', value: wallpaper.basePaper },
    { label: 'Hanging', value: wallpaper.hangingMethod },
    { label: 'Washability', value: wallpaper.washability },
    { label: 'Printing', value: wallpaper.printingMethod },
    { label: 'Price Code', value: wallpaper.priceCode },
  ].filter((s) => s.value);

  const hasPairings = wallpaper.paintReferences && wallpaper.paintReferences.length > 0;
  const tabs = [
    { id: 'details' as const, label: 'Details' },
    ...(hasPairings ? [{ id: 'pairings' as const, label: 'Paint Pairings' }] : []),
  ];

  return (
    <AnimatePresence>
      {wallpaper && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] z-50 flex flex-col overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${accentColor}20` }}>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-white truncate">{wallpaper.designName}</h2>
                {wallpaper.colourway && (
                  <p className="text-sm text-white/50">{wallpaper.colourway}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors ml-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image preview */}
            <div className="aspect-[4/3] w-full relative overflow-hidden bg-black/20">
              {wallpaper.lifestyleImageUrl || wallpaper.imageUrl ? (
                <img
                  src={wallpaper.lifestyleImageUrl || wallpaper.imageUrl}
                  alt={wallpaper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 opacity-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Tab navigation */}
            {tabs.length > 1 && (
              <div className="flex gap-1 px-5 pt-3 border-b" style={{ borderColor: `${accentColor}15` }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-3 py-2 text-sm font-medium transition-colors"
                    style={{ color: activeTab === tab.id ? accentColor : 'rgba(255,255,255,0.5)' }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="wp-drawer-tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {wallpaper.description && (
                    <p className="text-sm text-white/70 leading-relaxed">{wallpaper.description}</p>
                  )}

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {specs.map((spec) => (
                      <div key={spec.label} className="bg-white/5 rounded-lg p-3">
                        <dt className="text-[11px] uppercase tracking-wider text-white/40">{spec.label}</dt>
                        <dd className="text-sm text-white/80 mt-0.5">{spec.value}</dd>
                      </div>
                    ))}
                  </div>

                  {wallpaper.sampleSku && (
                    <p className="text-xs text-white/40">
                      Sample SKU: {wallpaper.sampleSku}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'pairings' && hasPairings && (
                <div className="space-y-3">
                  <p className="text-sm text-white/50 mb-4">
                    Recommended companion paint colours for this wallpaper design.
                  </p>
                  {wallpaper.paintReferences!.map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium" style={{ color: accentColor }}>{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white/80">{ref}</p>
                        <p className="text-xs text-white/40">
                          {wallpaper.brand === 'LG' ? 'Little Greene' : 'Farrow & Ball'} Paint
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — Add to bag */}
            <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: `${accentColor}20` }}>
              {/* Price + Quantity */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-semibold" style={{ color: accentColor }}>
                    &euro;{(wallpaper.priceEur * quantity).toFixed(2)}
                  </span>
                  <span className="text-xs text-white/40 ml-2">
                    {quantity > 1 ? `${quantity} rolls` : 'per roll'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    &minus;
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-white tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={handleAddToBag}
                disabled={addState === 'loading'}
                className="w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: addState === 'success' ? '#16a34a' : accentColor,
                  color: bgColor,
                }}
              >
                {addState === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : addState === 'success' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
                <span>
                  {addState === 'loading'
                    ? 'Adding...'
                    : addState === 'success'
                      ? 'Added to Bag'
                      : 'Add to Boutique Bag'}
                </span>
              </button>

              <p className="text-[10px] text-white/30 text-center">IVA incluido</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
