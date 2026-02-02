import Link from 'next/link';
import { getColors } from './actions/getColors';

// Brand House Configuration
const BRAND_HOUSES = [
  {
    id: 'BM',
    slug: 'benjamin-moore',
    name: 'Benjamin Moore',
    tagline: 'Professional-Grade Technology',
    description: 'Over 140 years of innovation. Premium paints trusted by professionals worldwide.',
    heroColor: '#2C2C2C',
    accentColor: '#C9A86C',
    textColor: '#FFFFFF',
  },
  {
    id: 'LG',
    slug: 'little-greene',
    name: 'Little Greene',
    tagline: 'Eco-Conscious British Heritage',
    description: 'Historically-inspired colours crafted with environmental responsibility.',
    heroColor: '#4A5240',
    accentColor: '#E8E4D9',
    textColor: '#FFFFFF',
  },
  {
    id: 'FB',
    slug: 'farrow-and-ball',
    name: 'Farrow & Ball',
    tagline: 'Artisan Heritage',
    description: 'Handcrafted paints with extraordinary depth of colour since 1946.',
    heroColor: '#8B7355',
    accentColor: '#F5F1EB',
    textColor: '#FFFFFF',
  },
];

// Hero Brand Card Component
function BrandHeroCard({
  brand,
  colorCount,
}: {
  brand: (typeof BRAND_HOUSES)[0];
  colorCount: number;
}) {
  const isComingSoon = colorCount === 0;

  return (
    <Link
      href={isComingSoon ? '#' : `/${brand.slug}`}
      className={`group relative block overflow-hidden rounded-2xl transition-all duration-500 ${
        isComingSoon ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.02] hover:shadow-2xl'
      }`}
    >
      {/* Background */}
      <div
        className="aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] w-full"
        style={{ backgroundColor: brand.heroColor }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
          style={{ backgroundColor: brand.accentColor }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          {/* Color Count Badge */}
          <div className="mb-4">
            {isComingSoon ? (
              <span
                className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: brand.accentColor, color: brand.heroColor }}
              >
                Coming Soon
              </span>
            ) : (
              <span
                className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: brand.accentColor, color: brand.heroColor }}
              >
                {colorCount} Colors
              </span>
            )}
          </div>

          {/* Brand Name */}
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-2"
            style={{ color: brand.textColor }}
          >
            {brand.name}
          </h2>

          {/* Tagline */}
          <p
            className="text-sm md:text-base font-medium mb-3 opacity-90"
            style={{ color: brand.accentColor }}
          >
            {brand.tagline}
          </p>

          {/* Description */}
          <p
            className="text-sm opacity-80 line-clamp-2 mb-4"
            style={{ color: brand.textColor }}
          >
            {brand.description}
          </p>

          {/* CTA */}
          {!isComingSoon && (
            <div
              className="flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
              style={{ color: brand.accentColor }}
            >
              <span>Explore Collection</span>
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
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Main Lobby Page
export default async function Home() {
  const colors = await getColors();

  // Count by brand
  const brandCounts: Record<string, number> = {
    BM: colors.filter((c) => c.brand === 'BM').length,
    LG: colors.filter((c) => c.brand === 'LG').length,
    FB: colors.filter((c) => c.brand === 'FB').length,
  };

  const totalColors = colors.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                BM Decoración
              </h1>
              <p className="text-muted-foreground mt-1">
                Premium Paint Boutique · Marbella
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-semibold text-[#C9A86C]">{totalColors}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Curated Colors
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-secondary/30 py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Three World-Class Brand Houses
            </h2>
            <p className="text-muted-foreground text-lg">
              Welcome to the Grand Lobby. Choose your brand house to explore curated collections
              of premium paints, each with their own heritage and character.
            </p>
          </div>

          {/* Brand House Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {BRAND_HOUSES.map((brand) => (
              <BrandHeroCard
                key={brand.id}
                brand={brand}
                colorCount={brandCounts[brand.id] || 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C9A86C]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Paint Calculator</h3>
              <p className="text-sm text-muted-foreground">
                Calculate exactly how much paint you need for your project.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C9A86C]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Click & Collect</h3>
              <p className="text-sm text-muted-foreground">
                Pick up your order at Calle Dublín 21, Marbella.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C9A86C]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">IVA Incluido</h3>
              <p className="text-sm text-muted-foreground">
                All prices include 21% Spanish VAT. No surprises at checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-foreground">BM Decoración</div>
              <div className="text-sm text-muted-foreground">
                Calle Dublín 21, Marbella, Spain
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 bmdecor.es · Premium Paint Boutique
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
