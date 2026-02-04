import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Terms of Service — BM Decoración',
  description: 'Terms and conditions for using the BM Decoración online boutique.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#C9A86C] hover:underline mb-8 inline-block">
          &larr; Back to BM Decoración
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C] mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-[#2C2C2C]/50 mb-12">Last updated: February 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-[#2C2C2C]/80 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">1. Identification</h2>
            <p>
              In compliance with Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
              Informaci&oacute;n y de Comercio Electr&oacute;nico (LSSI-CE), the following information
              is provided:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Business name:</strong> BM Decoraci&oacute;n</li>
              <li><strong>Address:</strong> Calle Dubl&iacute;n 21, 29670 Marbella, M&aacute;laga, Spain</li>
              <li><strong>Contact:</strong> <a href="mailto:info@bmdecor.es" className="text-[#C9A86C]">info@bmdecor.es</a></li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">2. Services</h2>
            <p>
              BM Decoraci&oacute;n operates an online boutique offering premium paints and decorating
              products from Benjamin Moore, Farrow &amp; Ball, and Little Greene. We provide product
              browsing, color palette creation, online ordering, and local delivery within the
              Marbella and Costa del Sol area, as well as click-and-collect from our Calle Dubl&iacute;n 21 location.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">3. Pricing &amp; Tax</h2>
            <p>
              All prices displayed on bmdecor.es include 21% Spanish Value Added Tax (IVA) as required
              by law. Prices are quoted in Euros (&euro;). We reserve the right to modify prices at any
              time, though orders placed at a given price will be honored at that price.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">4. Orders &amp; Payment</h2>
            <p>
              Orders are processed upon receipt of payment via Stripe. You will receive an order
              confirmation email. We reserve the right to cancel orders in cases of pricing errors,
              stock unavailability, or suspected fraud.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">5. Delivery &amp; Collection</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Local delivery:</strong> Available within the Marbella and Costa del Sol region</li>
              <li><strong>Click &amp; Collect:</strong> Orders can be collected from Calle Dubl&iacute;n 21, Marbella</li>
            </ul>
            <p>
              For full delivery zone information, see our{' '}
              <Link href="/shipping" className="text-[#C9A86C] hover:underline">Shipping Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">6. Consumer Rights</h2>
            <p>
              In accordance with Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los
              Consumidores y Usuarios), consumers have a 14-day withdrawal period from receipt of goods.
              Custom-mixed paints are excluded from this right as they are made to the consumer&apos;s
              specifications.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">7. Intellectual Property</h2>
            <p>
              All content on bmdecor.es, including text, images, and design, is the property of
              BM Decoraci&oacute;n or its licensors. Brand names Benjamin Moore, Farrow &amp; Ball,
              and Little Greene are trademarks of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">8. Data Protection</h2>
            <p>
              Personal data is processed in accordance with our{' '}
              <Link href="/privacy-policy" className="text-[#C9A86C] hover:underline">Privacy Policy</Link>,
              GDPR (EU 2016/679), and Spain&apos;s LOPDGDD (Ley Org&aacute;nica 3/2018).
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">9. Jurisdiction</h2>
            <p>
              These terms are governed by Spanish law. Any disputes arising from the use of this
              website or the services provided shall be subject to the jurisdiction of the courts
              of Marbella, M&aacute;laga, Spain.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E8E2D9] text-sm text-[#2C2C2C]/40">
          BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella &middot; &copy; 2026 bmdecor.es
        </div>
      </div>

      <Footer />
    </div>
  );
}
