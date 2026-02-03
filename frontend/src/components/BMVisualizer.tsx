'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoomScene } from '@/lib/api/benjamin-moore';

interface BMVisualizerProps {
  color: {
    name: string;
    colorCode: string;
    hexCode: string;
  };
  roomScenes: RoomScene[];
  isLoading: boolean;
  lrv: number;
  rgb: { r: number; g: number; b: number };
}

function getTextColor(hex: string): string {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
  const [r, g, b] = rgb.map((c) => c / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? '#2C2C2C' : '#FFFFFF';
}

/**
 * BMVisualizer — "Marbella Room Set"
 *
 * Uses CSS mix-blend-mode: multiply to composite the selected paint color
 * onto architectural room scene illustrations. White/light wall areas
 * take on the paint color; darker furniture and details are preserved.
 *
 * Fallback hierarchy:
 *   1. BM Photo API room images (if ever available)
 *   2. Marbella Room Set with blend-mode compositing (current)
 *   3. Studio Swatch (if room scenes fail to load)
 */
export default function BMVisualizer({
  color,
  roomScenes,
  isLoading,
  lrv,
  rgb,
}: BMVisualizerProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const textColor = getTextColor(color.hexCode);
  const textMuted = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.6)' : 'rgba(44,44,44,0.6)';
  const textSubtle = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.35)' : 'rgba(44,44,44,0.35)';

  const activeScene = selectedScene
    ? roomScenes.find((s) => s.id === selectedScene) || roomScenes[0]
    : roomScenes[0];

  return (
    <motion.div
      key="visualizer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-[#C9A86C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <h3 className="text-sm font-semibold">Marbella Room Set</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="aspect-[3/2] bg-secondary rounded-xl animate-pulse" />
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/2] bg-secondary rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      ) : roomScenes.length > 0 ? (
        /* ─── Marbella Room Set with CSS Blend Mode ─── */
        <div className="space-y-3">
          {/* Hero scene — large preview with blend mode */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[3/2] rounded-xl overflow-hidden shadow-lg group"
            >
              {/* Base room illustration */}
              <img
                src={activeScene?.imageUrl}
                alt={activeScene?.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Color overlay with multiply blend */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: color.hexCode,
                  mixBlendMode: 'multiply',
                }}
              />

              {/* Subtle luminosity pass for richness */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundColor: color.hexCode,
                  mixBlendMode: 'color',
                }}
              />

              {/* Scene label */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <p className="text-white text-sm font-medium">
                  {activeScene?.name}
                </p>
                <p className="text-white/60 text-xs">
                  {color.name} · {color.colorCode}
                </p>
              </div>

              {/* Color info badge */}
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  <span className="text-white text-xs font-mono">{color.hexCode}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Room selector thumbnails */}
          <div className="grid grid-cols-6 gap-2">
            {roomScenes.slice(0, 6).map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.id)}
                className={`relative aspect-[3/2] rounded-md overflow-hidden transition-all ${
                  (selectedScene || roomScenes[0]?.id) === scene.id
                    ? 'ring-2 ring-[#C9A86C] ring-offset-1'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* Thumbnail room image */}
                <img
                  src={scene.imageUrl}
                  alt={scene.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Thumbnail color blend */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color.hexCode,
                    mixBlendMode: 'multiply',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ─── Fallback: Studio Swatch (no scenes available) ─── */
        <div className="rounded-xl overflow-hidden shadow-lg">
          <div
            className="relative w-full aspect-[4/3] flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: color.hexCode }}
          >
            <div
              className="absolute top-4 left-4 flex items-center gap-2"
              style={{ color: textMuted }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-medium">
                Studio Swatch
              </span>
            </div>
            <div className="text-center">
              <h2
                className="text-2xl font-semibold tracking-tight mb-1"
                style={{ color: textColor, fontFamily: 'var(--font-playfair)' }}
              >
                {color.name}
              </h2>
              <p className="text-sm font-mono tracking-wide" style={{ color: textMuted }}>
                {color.colorCode}
              </p>
            </div>
            <div className="absolute bottom-4 right-4 text-xs font-mono" style={{ color: textSubtle }}>
              {color.hexCode}
            </div>
          </div>

          <div className="bg-[#2C2C2C] text-white px-5 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">LRV</div>
                <div className="text-xl font-semibold text-[#C9A86C]">{lrv}</div>
                <div className="text-[10px] text-white/40">
                  {lrv > 70 ? 'Very Light' : lrv > 50 ? 'Light' : lrv > 30 ? 'Medium' : lrv > 15 ? 'Dark' : 'Very Dark'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">RGB</div>
                <div className="text-sm font-mono text-white/90">{rgb.r} {rgb.g} {rgb.b}</div>
                <div className="flex justify-center gap-1 mt-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgb(${rgb.r},0,0)` }} />
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgb(0,${rgb.g},0)` }} />
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgb(0,0,${rgb.b})` }} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">HEX</div>
                <div className="text-sm font-mono text-white/90">{color.hexCode}</div>
                <div className="w-5 h-5 rounded-full mx-auto mt-1 border border-white/20" style={{ backgroundColor: color.hexCode }} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-widest">
                BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {roomScenes.length > 0
          ? 'Marbella Room Set — CSS blend-mode compositing on architectural scenes'
          : 'Studio Swatch — Room scene data unavailable'}
      </p>
    </motion.div>
  );
}
