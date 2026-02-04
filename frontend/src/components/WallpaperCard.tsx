'use client';

import { motion } from 'framer-motion';

export interface WallpaperData {
  id: string;
  brand: string;
  name: string;
  designName: string;
  colourway?: string;
  collection?: string;
  priceEur: number;
  priceCode?: string;
  description?: string;
  imageUrl?: string;
  lifestyleImageUrl?: string;
  rollWidth?: string;
  repeat?: string;
  drop?: string;
  hangingMethod?: string;
  basePaper?: string;
  washability?: string;
  printingMethod?: string;
  paintReferences?: string[];
  barcode?: string;
  sampleSku?: string;
  inStock?: boolean;
}

interface WallpaperCardProps {
  wallpaper: WallpaperData;
  onClick: (wallpaper: WallpaperData) => void;
  accentColor?: string;
}

export default function WallpaperCard({ wallpaper, onClick, accentColor = '#C9A86C' }: WallpaperCardProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(wallpaper)}
      className="group text-left w-full rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-white/25 transition-all"
    >
      {/* Image / Placeholder */}
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
        {wallpaper.imageUrl ? (
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Price badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md"
          style={{ backgroundColor: `${accentColor}dd`, color: '#1a1a1a' }}
        >
          &euro;{wallpaper.priceEur.toFixed(0)}/roll
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white/90 leading-tight truncate">
          {wallpaper.designName}
        </h3>
        {wallpaper.colourway && (
          <p className="text-xs text-white/50 mt-0.5 truncate">{wallpaper.colourway}</p>
        )}
        <p className="text-[11px] mt-1 truncate" style={{ color: `${accentColor}99` }}>
          {wallpaper.collection}
        </p>
      </div>
    </motion.button>
  );
}
