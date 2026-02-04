'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Footer from '@/components/layout/Footer';

// Brand House Configuration with Unsplash imagery
const BRAND_HOUSES = [
  {
    id: 'BM',
    slug: 'benjamin-moore',
    name: 'Benjamin Moore',
    tagline: 'Professional-Grade Excellence',
    cta: 'Historical Colors',
    // Modern luxury villa interior - clean lines, neutral palette
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    overlayColor: 'from-[#2C2C2C]/80 via-[#2C2C2C]/40 to-transparent',
    accentColor: '#C9A86C',
  },
  {
    id: 'FB',
    slug: 'farrow-and-ball',
    name: 'Farrow & Ball',
    tagline: 'Artisan Heritage',
    cta: 'Timeless Shades',
    // Heritage room with classic moldings and rich colors
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    overlayColor: 'from-[#8B7355]/80 via-[#8B7355]/40 to-transparent',
    accentColor: '#F5F1EB',
  },
  {
    id: 'LG',
    slug: 'little-greene',
    name: 'Little Greene',
    tagline: 'British Eco-Heritage',
    cta: 'Sustainable Shades',
    // Natural, eco-conscious interior with plants
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    overlayColor: 'from-[#4A5240]/80 via-[#4A5240]/40 to-transparent',
    accentColor: '#E8E4D9',
  },
];

// Fetch color counts from server
async function fetchColorCounts(): Promise<Record<string, number>> {
  try {
    const response = await fetch('/api/color-counts', { cache: 'no-store' });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Fallback to default counts if API fails
  }
  return { BM: 0, FB: 0, LG: 0 };
}

// Brand House Card Component with Framer Motion
function BrandHouseCard({
  brand,
  colorCount,
  index,
}: {
  brand: (typeof BRAND_HOUSES)[0];
  colorCount: number;
  index: number;
}) {
  const isComingSoon = colorCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative h-full"
    >
      <Link
        href={isComingSoon ? '#' : `/${brand.slug}`}
        className={`block h-full ${isComingSoon ? 'cursor-not-allowed' : ''}`}
      >
        <motion.div
          whileHover={isComingSoon ? {} : { scale: 1.02 }}
          whileTap={isComingSoon ? {} : { scale: 0.98 }}
          className="relative h-full overflow-hidden rounded-2xl group"
          style={{
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Gold Border Glow on Hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: `inset 0 0 0 2px ${brand.accentColor}, 0 0 30px ${brand.accentColor}40`,
            }}
          />

          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={brand.imageUrl}
              alt={`${brand.name} interior showcase`}
              fill
              className={`object-cover transition-transform duration-700 ${
                isComingSoon ? 'grayscale' : 'group-hover:scale-105'
              }`}
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={index === 0}
            />
          </div>

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${brand.overlayColor}`} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            {/* Brand Name - Serif Typography */}
            <motion.h2
              className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.3 }}
            >
              {brand.name}
            </motion.h2>

            {/* Tagline */}
            <p
              className="text-sm md:text-base font-medium mb-4 tracking-wide"
              style={{ color: brand.accentColor }}
            >
              {brand.tagline}
            </p>

            {/* CTA with Color Count */}
            <div className="flex items-center justify-between">
              {isComingSoon ? (
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/70"
                >
                  Coming Soon
                </span>
              ) : (
                <motion.span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: `${brand.accentColor}20`,
                    color: brand.accentColor,
                  }}
                  whileHover={{
                    backgroundColor: brand.accentColor,
                    color: '#2C2C2C',
                  }}
                >
                  Explore {colorCount} {brand.cta}
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Main Lobby Page
export default function GrandLobby() {
  const [colorCounts, setColorCounts] = useState<Record<string, number>>({
    BM: 0,
    FB: 0,
    LG: 0,
  });

  useEffect(() => {
    fetchColorCounts().then(setColorCounts);
  }, []);

  const totalColors = Object.values(colorCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Minimalist Header */}
      <header className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          >
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2C2C2C] tracking-tight">
                BM Decoración
              </h1>
              <p className="text-[#C9A86C] text-lg md:text-xl mt-2 tracking-widest uppercase">
                Marbella
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-semibold text-[#C9A86C]">
                {totalColors}
              </span>
              <span className="text-sm text-[#666666] uppercase tracking-wider">
                Curated Colors
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Gallery Grid - Brand Houses */}
      <main className="container mx-auto px-6 pb-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#666666] text-lg max-w-2xl mb-10"
        >
          Welcome to the Grand Lobby. Three world-class paint houses,
          each with their own heritage and character. Choose your house.
        </motion.p>

        {/* Vertical Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 h-[calc(100vh-300px)] min-h-[600px]">
          {BRAND_HOUSES.map((brand, index) => (
            <BrandHouseCard
              key={brand.id}
              brand={brand}
              colorCount={colorCounts[brand.id] || 0}
              index={index}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
