'use client';

import { motion } from 'framer-motion';
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
 * BMVisualizer — "Marbella Fallback"
 *
 * When BM Photo API scenes are available, renders the room preview grid.
 * When scenes are empty (API unavailable), renders a premium Studio Swatch
 * showing a large color field with LRV, RGB, and hex technical data
 * so the page remains premium and never shows blank space.
 */
export default function BMVisualizer({
  color,
  roomScenes,
  isLoading,
  lrv,
  rgb,
}: BMVisualizerProps) {
  const textColor = getTextColor(color.hexCode);
  const textMuted = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.6)' : 'rgba(44,44,44,0.6)';
  const textSubtle = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.35)' : 'rgba(44,44,44,0.35)';

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
        <h3 className="text-sm font-semibold">Room Preview</h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : roomScenes.length > 0 ? (
        /* Standard room scene grid */
        <div className="grid grid-cols-2 gap-3">
          {roomScenes.slice(0, 6).map((scene) => (
            <div key={scene.id} className="relative group">
              <div
                className="aspect-video rounded-lg overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: color.hexCode }}
              >
                <span
                  className="text-xs font-medium px-2 text-center"
                  style={{ color: textColor }}
                >
                  {scene.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── Marbella Fallback: Studio Swatch ─── */
        <div className="rounded-xl overflow-hidden shadow-lg">
          {/* Large color field */}
          <div
            className="relative w-full aspect-[4/3] flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: color.hexCode }}
          >
            {/* Studio label */}
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

            {/* Color name centered */}
            <div className="text-center">
              <h2
                className="text-2xl font-semibold tracking-tight mb-1"
                style={{ color: textColor, fontFamily: 'var(--font-playfair)' }}
              >
                {color.name}
              </h2>
              <p
                className="text-sm font-mono tracking-wide"
                style={{ color: textMuted }}
              >
                {color.colorCode}
              </p>
            </div>

            {/* Bottom bar with hex */}
            <div
              className="absolute bottom-4 right-4 text-xs font-mono"
              style={{ color: textSubtle }}
            >
              {color.hexCode}
            </div>
          </div>

          {/* Technical data strip */}
          <div className="bg-[#2C2C2C] text-white px-5 py-4">
            <div className="grid grid-cols-3 gap-4">
              {/* LRV */}
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">LRV</div>
                <div className="text-xl font-semibold text-[#C9A86C]">{lrv}</div>
                <div className="text-[10px] text-white/40">
                  {lrv > 70 ? 'Very Light' : lrv > 50 ? 'Light' : lrv > 30 ? 'Medium' : lrv > 15 ? 'Dark' : 'Very Dark'}
                </div>
              </div>

              {/* RGB */}
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">RGB</div>
                <div className="text-sm font-mono text-white/90">
                  {rgb.r} {rgb.g} {rgb.b}
                </div>
                <div className="flex justify-center gap-1 mt-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgb(${rgb.r},0,0)` }} />
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgb(0,${rgb.g},0)` }} />
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgb(0,0,${rgb.b})` }} />
                </div>
              </div>

              {/* Hex */}
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">HEX</div>
                <div className="text-sm font-mono text-white/90">{color.hexCode}</div>
                <div
                  className="w-5 h-5 rounded-full mx-auto mt-1 border border-white/20"
                  style={{ backgroundColor: color.hexCode }}
                />
              </div>
            </div>

            {/* Marbella signature */}
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
          ? 'Color-tinted previews — BM Photo API not available'
          : 'Studio Swatch — Room scene API unavailable'}
      </p>
    </motion.div>
  );
}
