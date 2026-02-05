import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Wallpaper',
  description: 'Designer wallcoverings and artisan papers from Farrow & Ball and Little Greene.',
  alternates: {
    canonical: '/wallpaper',
  },
};

export default function WallpaperPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm text-[#2C2C2C]/50 mb-4">
            <Link href="/" className="hover:text-[#C9A86C]">Home</Link>
            <span>/</span>
            <span className="text-[#2C2C2C]">Wallpaper</span>
          </nav>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C]">
            Wallpaper
          </h1>
          <p className="text-[#2C2C2C]/60 mt-2 max-w-2xl">
            Designer wallcoverings and artisan papers from world-renowned heritage brands.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-20">
          <p className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]/20">
            Coming Soon
          </p>
          <p className="text-[#2C2C2C]/50 mt-4 max-w-md mx-auto">
            Our curated wallpaper collection from Farrow & Ball and Little Greene
            is being prepared for the boutique.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/farrow-and-ball"
              className="px-6 py-3 bg-[#8B7355] text-white text-sm rounded-lg hover:bg-[#7a6549] transition-colors"
            >
              Farrow & Ball
            </Link>
            <Link
              href="/little-greene"
              className="px-6 py-3 bg-[#4A5240] text-white text-sm rounded-lg hover:bg-[#3d4435] transition-colors"
            >
              Little Greene
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C2C2C]/8 py-8 text-center">
        <Link href="/" className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors">
          &larr; Back to Home
        </Link>
      </footer>
    </div>
  );
}
