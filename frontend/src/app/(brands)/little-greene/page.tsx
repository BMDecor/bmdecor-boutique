import Link from 'next/link';
import { getColorsByBrand, type ColorProduct } from '@/app/actions/getColors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Color Card Component for Little Greene
function LGColorCard({ color }: { color: ColorProduct }) {
  const hexToLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const isLightColor = hexToLuminance(color.hexCode) > 0.5;
  const textColor = isLightColor ? '#2C2C2C' : '#FFFFFF';

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div
        className="aspect-square w-full relative cursor-pointer"
        style={{ backgroundColor: color.hexCode }}
      >
        <div
          className="absolute bottom-3 left-3 font-mono text-sm font-semibold"
          style={{ color: textColor }}
        >
          {color.colorCode}
        </div>
        <div
          className="absolute bottom-3 right-3 font-mono text-xs opacity-70"
          style={{ color: textColor }}
        >
          {color.hexCode}
        </div>
      </div>

      <CardContent className="p-4 space-y-2 bg-white">
        <h3 className="font-medium text-foreground leading-tight line-clamp-2">
          {color.name}
        </h3>

        {color.collection && (
          <p className="text-xs text-muted-foreground">
            {color.collection}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-[#4A5240]">
            €{color.priceEur.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            {color.volume}
          </span>
        </div>

        <button className="w-full mt-2 py-2 px-4 bg-[#4A5240] text-white text-sm font-medium rounded-lg hover:bg-[#5A6250] transition-colors">
          Add to Cart
        </button>
      </CardContent>
    </Card>
  );
}

export default async function LittleGreenePage() {
  const colors = await getColorsByBrand('LG');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#4A5240] text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lobby
            </Link>
            <Badge className="bg-[#E8E4D9] text-[#4A5240] hover:bg-[#E8E4D9]">
              {colors.length} Colors
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-[#4A5240] text-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-[#E8E4D9] rounded-full" />
              <span className="text-[#E8E4D9] font-medium uppercase tracking-wider text-sm">
                Brand House
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Little Greene
            </h1>
            <p className="text-xl text-white/80 mb-2">
              Eco-Conscious British Heritage
            </p>
            <p className="text-white/60 max-w-2xl">
              Historically-inspired colours crafted with environmental responsibility.
              Every shade tells a story of British design heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Colour Collection
          </h2>
          <span className="text-sm text-muted-foreground">
            {colors.length} colors
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {colors.map((color) => (
            <LGColorCard key={color.id} color={color} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Little Greene® is a registered trademark. Available at BM Decoración.
            </div>
            <div className="text-sm text-muted-foreground">
              IVA Incluido (21%) · Prices in EUR
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
