import { getColors, type ColorProduct, type Brand } from './actions/getColors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Brand display configuration
const BRAND_CONFIG: Record<Brand, { name: string; tagline: string; variant: 'default' | 'secondary' | 'outline' }> = {
  BM: { name: 'Benjamin Moore', tagline: 'Professional-Grade Technology', variant: 'default' },
  FB: { name: 'Farrow & Ball', tagline: 'Artisan Heritage', variant: 'secondary' },
  LG: { name: 'Little Greene', tagline: 'Eco-Conscious British Heritage', variant: 'outline' },
};

// Color Card Component
function ColorCard({ color }: { color: ColorProduct }) {
  const brandInfo = BRAND_CONFIG[color.brand];

  // Calculate if text should be light or dark based on hex luminance
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
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Color Swatch */}
      <div
        className="aspect-square w-full relative"
        style={{ backgroundColor: color.hexCode }}
      >
        {/* Color Code Overlay */}
        <div
          className="absolute bottom-3 left-3 font-mono text-sm font-medium opacity-80"
          style={{ color: textColor }}
        >
          {color.colorCode}
        </div>
        {/* Hex Code Overlay */}
        <div
          className="absolute bottom-3 right-3 font-mono text-xs opacity-60"
          style={{ color: textColor }}
        >
          {color.hexCode}
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground leading-tight line-clamp-2">
            {color.name}
          </h3>
          <Badge variant={brandInfo.variant} className="shrink-0 text-xs">
            {color.brand}
          </Badge>
        </div>

        {color.collection && (
          <p className="text-xs text-muted-foreground">
            {color.collection}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-[#C9A86C]">
            €{color.priceEur.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            {color.volume}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Page Component
export default async function Home() {
  const colors = await getColors();

  // Count by brand
  const bmCount = colors.filter((c) => c.brand === 'BM').length;
  const lgCount = colors.filter((c) => c.brand === 'LG').length;
  const fbCount = colors.filter((c) => c.brand === 'FB').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                BM Decoración
              </h1>
              <p className="text-sm text-muted-foreground">
                Premium Paint Boutique · Calle Dublín 21, Marbella
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-[#C9A86C] text-[#C9A86C]">
                {colors.length} Colors
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Brand Filter Bar */}
      <div className="border-b border-border bg-secondary/50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-foreground">Collections:</span>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="cursor-pointer hover:opacity-80">
                Benjamin Moore ({bmCount})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:opacity-80">
                Little Greene ({lgCount})
              </Badge>
              {fbCount > 0 && (
                <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
                  Farrow & Ball ({fbCount})
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">
            The Showroom
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Discover our curated collection of premium paints from three world-class brands.
            Each color is carefully selected to bring timeless elegance to your space.
          </p>
        </div>

        {/* Color Grid */}
        <ScrollArea className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {colors.map((color) => (
              <ColorCard key={color.id} color={color} />
            ))}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-semibold text-[#C9A86C]">{bmCount}</div>
              <div className="text-sm text-muted-foreground">Benjamin Moore</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#C9A86C]">{lgCount}</div>
              <div className="text-sm text-muted-foreground">Little Greene</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#C9A86C]">{colors.length}</div>
              <div className="text-sm text-muted-foreground">Total Colors</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2026 BM Decoración · bmdecor.es
            </div>
            <div className="text-sm text-muted-foreground">
              Calle Dublín 21, Marbella, Spain · IVA Incluido (21%)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
