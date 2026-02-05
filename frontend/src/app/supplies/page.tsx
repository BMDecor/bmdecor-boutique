import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Supplies',
  description: 'Professional brushes, rollers, and application tools for premium paint finishes.',
  alternates: {
    canonical: '/supplies',
  },
};

export default function SuppliesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm text-[#2C2C2C]/50 mb-4">
            <Link href="/" className="hover:text-[#C9A86C]">Home</Link>
            <span>/</span>
            <span className="text-[#2C2C2C]">Supplies</span>
          </nav>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C]">
            Supplies
          </h1>
          <p className="text-[#2C2C2C]/60 mt-2 max-w-2xl">
            Professional brushes, rollers, and application tools for achieving the perfect finish.
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
            Our selection of professional-grade application tools and accessories
            is being curated for the boutique.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-8 px-6 py-3 bg-[#2C2C2C] text-white text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            Contact Us for Supplies
          </Link>
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
