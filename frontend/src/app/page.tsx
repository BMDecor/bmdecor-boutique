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

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  position: 'hero' | 'secondary';
  sortOrder: number;
}

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative h-full"
    >
      <Link
        href={`/${brand.slug}`}
        className="block h-full"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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
              className="object-cover transition-transform duration-700 group-hover:scale-105"
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
                {colorCount > 0 ? `Explore ${colorCount} ${brand.cta}` : 'Explore Collection'}
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
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function SecondaryBannerContent({ banner }: { banner: Banner }) {
  return (
    <div className="relative overflow-hidden rounded-xl h-48 group-hover:shadow-lg transition-shadow">
      {banner.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A86C]/20 to-[#2C2C2C]/10" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {banner.title && (
          <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white font-medium">
            {banner.title}
          </h3>
        )}
        {banner.subtitle && (
          <p className="text-white/60 text-sm mt-1">{banner.subtitle}</p>
        )}
        {banner.linkText && (
          <span className="text-[#C9A86C] text-sm mt-2 group-hover:text-white transition-colors">
            {banner.linkText} &rarr;
          </span>
        )}
      </div>
    </div>
  );
}

// Main Lobby Page
export default function GrandLobby() {
  const [colorCounts, setColorCounts] = useState<Record<string, number>>({
    BM: 0,
    FB: 0,
    LG: 0,
  });
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetchColorCounts().then(setColorCounts);
    fetch('/api/banners')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => {});
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

      {/* Hero Banners */}
      {banners.filter((b) => b.position === 'hero').length > 0 && (
        <section className="container mx-auto px-6 pb-8">
          <div className="space-y-4">
            {banners
              .filter((b) => b.position === 'hero')
              .map((banner) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-2xl h-[300px] md:h-[400px]"
                >
                  {banner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] to-[#C9A86C]/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/70 via-[#2C2C2C]/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    {banner.title && (
                      <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-white font-semibold tracking-tight">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/70 text-lg mt-2 max-w-xl">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.linkUrl && banner.linkText && (
                      <Link
                        href={banner.linkUrl}
                        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-[#C9A86C] text-[#2C2C2C] text-sm font-medium hover:bg-[#B8975B] transition-colors w-fit"
                      >
                        {banner.linkText}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </section>
      )}

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

        {/* Secondary Banners */}
        {banners.filter((b) => b.position === 'secondary').length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {banners
              .filter((b) => b.position === 'secondary')
              .map((banner) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {banner.linkUrl ? (
                    <Link href={banner.linkUrl} className="group block">
                      <SecondaryBannerContent banner={banner} />
                    </Link>
                  ) : (
                    <SecondaryBannerContent banner={banner} />
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
