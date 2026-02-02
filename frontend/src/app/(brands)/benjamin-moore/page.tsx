import Link from 'next/link';
import { getColorsByBrand, type ColorProduct } from '@/app/actions/getColors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Color Card Component for Benjamin Moore
function BMColorCard({ color }: { color: ColorProduct }) {
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
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Color Swatch */}
      <div
        className="aspect-square w-full relative cursor-pointer"
        style={{ backgroundColor: color.hexCode }}
      >
        {/* Color Code Overlay */}
        <div
          className="absolute bottom-3 left-3 font-mono text-sm font-semibold"
          style={{ color: textColor }}
        >
          {color.colorCode}
        </div>
        {/* Hex Code Overlay */}
        <div
          className="absolute bottom-3 right-3 font-mono text-xs opacity-70"
          style={{ color: textColor }}
        >
          {color.hexCode}
        </div>
      </div>

      {/* Card Content */}
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
          <span className="text-sm font-semibold text-[#C9A86C]">
            €{color.priceEur.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            {color.volume}
          </span>
        </div>

        <button className="w-full mt-2 py-2 px-4 bg-[#2C2C2C] text-white text-sm font-medium rounded-lg hover:bg-[#404040] transition-colors">
          Add to Cart
        </button>
      </CardContent>
    </Card>
  );
}

// Paint Calculator Placeholder
function PaintCalculatorPlaceholder() {
  return (
    <Card className="border-2 border-dashed border-[#C9A86C]/30 bg-[#C9A86C]/5">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#C9A86C]"
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
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Benjamin Moore Paint Calculator
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Calculate exactly how much paint you need for your project.
          Powered by Benjamin Moore API coverage data.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg border">
            <label className="text-xs text-muted-foreground block mb-1">Room Area</label>
            <div className="text-lg font-semibold text-foreground">— m²</div>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <label className="text-xs text-muted-foreground block mb-1">Coats</label>
            <div className="text-lg font-semibold text-foreground">—</div>
          </div>
        </div>
        <Badge variant="outline" className="border-[#C9A86C] text-[#C9A86C]">
          Coming Soon
        </Badge>
      </CardContent>
    </Card>
  );
}

// Benjamin Moore Brand House Page
export default async function BenjaminMoorePage() {
  const colors = await getColorsByBrand('BM');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#2C2C2C] text-white">
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
            <Badge className="bg-[#C9A86C] text-[#2C2C2C] hover:bg-[#C9A86C]">
              {colors.length} Colors
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-[#2C2C2C] text-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-[#C9A86C] rounded-full" />
              <span className="text-[#C9A86C] font-medium uppercase tracking-wider text-sm">
                Brand House
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Benjamin Moore
            </h1>
            <p className="text-xl text-white/80 mb-2">
              Professional-Grade Technology
            </p>
            <p className="text-white/60 max-w-2xl">
              Over 140 years of innovation in paint technology. Benjamin Moore delivers
              premium quality and unmatched color accuracy trusted by professionals worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Paint Calculator */}
            <PaintCalculatorPlaceholder />

            {/* Collection Filter */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Collections</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg bg-[#2C2C2C] text-white">
                    Historical Collection
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary text-muted-foreground">
                    Aura Collection
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary text-muted-foreground">
                    Regal Select
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Finish Types */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Finish Types</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" defaultChecked />
                    <span>Matte</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Eggshell</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Satin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Semi-Gloss</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Color Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Historical Collection
              </h2>
              <span className="text-sm text-muted-foreground">
                {colors.length} colors
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {colors.map((color) => (
                <BMColorCard key={color.id} color={color} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Benjamin Moore® is a registered trademark. Available exclusively at BM Decoración.
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
