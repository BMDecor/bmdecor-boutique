import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FarrowAndBallPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#8B7355] text-white">
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
            <Badge className="bg-[#F5F1EB] text-[#8B7355] hover:bg-[#F5F1EB]">
              Coming Soon
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-[#8B7355] text-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-[#F5F1EB] rounded-full" />
              <span className="text-[#F5F1EB] font-medium uppercase tracking-wider text-sm">
                Brand House
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Farrow & Ball
            </h1>
            <p className="text-xl text-white/80 mb-2">
              Artisan Heritage
            </p>
            <p className="text-white/60 max-w-2xl">
              Handcrafted paints with extraordinary depth of colour since 1946.
              Each shade is made with the finest pigments in Dorset, England.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Content */}
      <main className="container mx-auto px-6 py-16">
        <Card className="max-w-2xl mx-auto border-2 border-dashed border-[#8B7355]/30 bg-[#8B7355]/5">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#8B7355]/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#8B7355]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Coming Soon
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're preparing the Farrow & Ball collection for you.
              Integration via Trade Portal CSV/Excel exports is in progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="px-6 py-3 bg-white rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Data Source</div>
                <div className="font-medium text-foreground">Trade Portal Export</div>
              </div>
              <div className="px-6 py-3 bg-white rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Expected</div>
                <div className="font-medium text-foreground">Q1 2026</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Farrow & Ball® is a registered trademark. Coming to BM Decoración.
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
