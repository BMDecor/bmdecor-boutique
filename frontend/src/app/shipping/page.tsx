import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Shipping Policy — BM Decoración',
  description: 'Delivery zones, shipping rates, and click & collect information for BM Decoración.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#C9A86C] hover:underline mb-8 inline-block">
          &larr; Back to BM Decoración
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C] mb-2">
          Shipping &amp; Delivery
        </h1>
        <p className="text-sm text-[#2C2C2C]/50 mb-12">Last updated: February 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-[#2C2C2C]/80 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">
              1. Delivery Zones
            </h2>
            <p>
              BM Decoración offers direct delivery across the Costa del Sol region, covering
              a corridor from Sotogrande in the west to Málaga capital in the east. Our primary
              service area includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Zone 1 — Marbella &amp; San Pedro:</strong> Same-day and next-day delivery available</li>
              <li><strong>Zone 2 — Estepona to Fuengirola:</strong> Next-day delivery</li>
              <li><strong>Zone 3 — Sotogrande &amp; Málaga:</strong> 2–3 business days</li>
            </ul>
            <p>
              For deliveries outside these zones, please <Link href="/contact" className="text-[#C9A86C] hover:underline">contact us</Link> for
              a custom quote.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">
              2. Click &amp; Collect
            </h2>
            <p>
              All orders can be collected free of charge from our showroom at:
            </p>
            <p className="font-medium text-[#2C2C2C]">
              Calle Dublín 21, PG. IND. San Pedro de Alcántara, 29670 Marbella
            </p>
            <p>
              Click &amp; Collect orders are typically ready within 24 hours. You will receive an
              email and WhatsApp notification when your order is prepared.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">
              3. Shipping Rates
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Orders over €150:</strong> Free delivery within Zone 1</li>
              <li><strong>Zone 1 (under €150):</strong> €9.95</li>
              <li><strong>Zone 2:</strong> €14.95</li>
              <li><strong>Zone 3:</strong> €19.95</li>
            </ul>
            <p>All prices include 21% IVA.</p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">
              4. Delivery for Trade Professionals
            </h2>
            <p>
              Registered trade accounts benefit from priority scheduling and may qualify for
              reduced or complimentary delivery depending on order volume. Contact your
              account manager or reach us at{' '}
              <a href="tel:+34951127003" className="text-[#C9A86C] hover:underline">+34 951 127 003</a>.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">
              5. Damaged or Incorrect Orders
            </h2>
            <p>
              If your order arrives damaged or incorrect, please contact us within 48 hours of
              receipt. We will arrange collection and replacement at no additional cost. In
              accordance with Spanish consumer protection law (Real Decreto Legislativo 1/2007),
              you have a 14-day withdrawal period from receipt of goods. Custom-mixed paints are
              excluded as they are made to the consumer&apos;s specifications.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">
              6. Contact
            </h2>
            <p>
              For any delivery enquiries, please{' '}
              <Link href="/contact" className="text-[#C9A86C] hover:underline">contact us</Link> or
              call <a href="tel:+34951127003" className="text-[#C9A86C] hover:underline">+34 951 127 003</a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E8E2D9] text-sm text-[#2C2C2C]/40">
          BM Decoración &middot; Calle Dublín 21, Marbella &middot; &copy; 2026 bmdecor.es
        </div>
      </div>

      <Footer />
    </div>
  );
}
