import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coming Soon — BM Decoración',
  description:
    'BM Decoración abrirá pronto. Soluciones premium de decoración para tu hogar en Marbella, España.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
};

/**
 * Fallback coming-soon page served by the Next.js app when a visitor hits
 * the preview domain without a bypass.
 *
 * The primary public coming-soon page is the existing static S3+CloudFront
 * site at bmdecor.es (unrelated to this Next.js deploy). This page exists
 * so the preview subdomain has a branded landing state in the rare case
 * someone lands on it without the bypass token — rather than seeing the
 * full boutique prematurely.
 */
export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-[#C9A86C] text-sm uppercase tracking-[0.3em] mb-6">
          Marbella
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl font-semibold text-[#2C2C2C] tracking-tight mb-6">
          BM Decoración
        </h1>
        <p className="text-lg text-[#2C2C2C]/70 leading-relaxed mb-10">
          Boutique premium de pinturas y revestimientos en la Costa del Sol —
          Benjamin Moore, Farrow &amp; Ball, Little Greene y más. Próxima apertura.
        </p>
        <p className="text-sm text-[#2C2C2C]/50">
          Calle Dublín 21, Marbella · info@bmdecor.es
        </p>
      </div>
    </main>
  );
}
