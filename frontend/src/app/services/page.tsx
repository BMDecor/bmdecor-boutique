import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Services',
  description: 'Color consultancy, trade professional support, and reliable delivery across the Costa del Sol.',
  alternates: {
    canonical: '/services',
  },
};

const SERVICES = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Color Consultancy',
    tagline: 'Expert guidance to harmonize your palette with Marbella\u2019s natural light.',
    details: [
      'On-site color assessment for villas and estates',
      'Digital palette creation via My Design Studio',
      'Large-format test samples for live evaluation',
      'Coordination with architects and interior designers',
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Trade Professionals',
    tagline: 'Dedicated accounts, volume pricing, and technical support for Architects & Designers.',
    details: [
      'Trade pricing on all three brand houses',
      'Bulk ordering with dedicated account manager',
      'Technical data sheets and specification support',
      'Priority delivery scheduling for project timelines',
    ],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    title: 'Logistics & Delivery',
    tagline: 'Reliable delivery across the Costa del Sol, from Sotogrande to Málaga.',
    details: [
      'Direct delivery to your project site',
      'Click & Collect from Calle Dublín 21, Marbella',
      'Coverage from Sotogrande to Málaga capital',
      'Scheduled delivery windows for active projects',
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-8 lg:px-16 pt-16 pb-8">
        <p className="text-[#C9A86C] text-sm tracking-[0.2em] uppercase mb-4">What We Offer</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-[#2C2C2C] tracking-tight mb-4">
          Services
        </h1>
        <p className="text-[#2C2C2C]/60 text-lg max-w-2xl">
          From initial color selection to final delivery, we support every stage of your project
          with the care and precision that premium finishes demand.
        </p>
      </section>

      {/* 3-Column Grid */}
      <section className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl border border-[#E8E2D9] p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-[#C9A86C] mb-5">{service.icon}</div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-2">
                {service.title}
              </h2>
              <p className="text-[#2C2C2C]/60 text-sm mb-6">{service.tagline}</p>
              <ul className="space-y-2.5">
                {service.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2.5 text-sm text-[#2C2C2C]/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C9A86C] shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Trade CTA */}
      <section className="bg-[#2C2C2C] py-16 mt-8">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-4">
            Are You a Trade Professional?
          </h2>
          <p className="text-white/60 mb-8">
            Register for a trade account to access volume pricing, dedicated project support,
            and priority delivery scheduling across all three brand houses.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-[#C9A86C] text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-[#D4B896] transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
