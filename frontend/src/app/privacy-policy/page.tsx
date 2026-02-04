import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#C9A86C] hover:underline mb-8 inline-block">
          &larr; Back to BM Decoracion
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#2C2C2C]/50 mb-12">Last updated: February 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-[#2C2C2C]/80 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">1. Data Controller</h2>
            <p>
              BM Decoraci&oacute;n (&ldquo;we&rdquo;, &ldquo;us&rdquo;), located at Calle Dubl&iacute;n 21,
              29660 Marbella, M&aacute;laga, Spain, is the data controller responsible for processing
              your personal data in accordance with the General Data Protection Regulation (EU) 2016/679
              (&ldquo;GDPR&rdquo;) and Spain&apos;s Ley Org&aacute;nica 3/2018 de Protecci&oacute;n de Datos
              Personales y garant&iacute;a de los derechos digitales (&ldquo;LOPDGDD&rdquo;).
            </p>
            <p>Contact: <a href="mailto:privacy@bmdecor.es" className="text-[#C9A86C]">privacy@bmdecor.es</a></p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">2. Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> Name, email address, encrypted password (stored by AWS Cognito)</li>
              <li><strong>Order data:</strong> Shipping address, order items, payment references (processed by Stripe)</li>
              <li><strong>Project data:</strong> Saved color palettes and project names</li>
              <li><strong>Technical data:</strong> Cart session ID (httpOnly cookie), consent preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">3. Purpose & Legal Basis</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Contract performance (Art. 6(1)(b)):</strong> Processing orders, managing your account, providing our services</li>
              <li><strong>Legal obligation (Art. 6(1)(c)):</strong> Tax records retention as required by Spanish fiscal law</li>
              <li><strong>Consent (Art. 6(1)(a)):</strong> Marketing communications and analytics cookies (only with explicit consent)</li>
              <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> Fraud prevention, service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">4. Data Retention</h2>
            <p>
              Account data is retained for the duration of your account. Order records are retained for
              a minimum of 5 years after the transaction date as required by Spanish tax law (Ley General
              Tributaria). Upon account deletion, personal data is erased and order records are anonymized
              to preserve financial audit trails.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">5. Your Rights</h2>
            <p>Under GDPR and LOPDGDD, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>
            <p>
              You can exercise your right to erasure directly from your{' '}
              <Link href="/my-studio/profile" className="text-[#C9A86C] hover:underline">account settings</Link>.
              For other requests, contact <a href="mailto:privacy@bmdecor.es" className="text-[#C9A86C]">privacy@bmdecor.es</a>.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">6. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and shopping cart. Analytics cookies
              are only activated with your explicit consent. You can manage your preferences at any time
              via the cookie banner or by clearing your browser data.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">7. Data Processors</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Amazon Web Services (AWS):</strong> Cloud infrastructure, data storage (EU-West-1, Ireland)</li>
              <li><strong>Stripe:</strong> Payment processing (PCI DSS compliant)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C] mb-3">8. Supervisory Authority</h2>
            <p>
              You have the right to lodge a complaint with the Spanish Data Protection Agency
              (Agencia Espa&ntilde;ola de Protecci&oacute;n de Datos &mdash; AEPD) at{' '}
              <a href="https://www.aepd.es" className="text-[#C9A86C]" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E8E2D9] text-sm text-[#2C2C2C]/40">
          BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella &middot; &copy; 2026 bmdecor.es
        </div>
      </div>
    </div>
  );
}
