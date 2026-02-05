import { Metadata } from 'next';
import { BASE_URL } from '@/lib/utils/env';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Visit BM Decoración at Calle Dublín 21, Marbella. Get in touch for color consultancy, trade accounts, or to plan your visit to our showroom.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | BM Decoración',
    description: 'Visit BM Decoración at Calle Dublín 21, Marbella. Get in touch for color consultancy, trade accounts, or to plan your visit to our showroom.',
  },
};

function ContactPageJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'BM Decoración',
    description: 'Premium paint boutique featuring Benjamin Moore, Farrow & Ball, and Little Greene.',
    url: `${BASE_URL}/contact`,
    telephone: '+34 951 127 003',
    email: 'info@bmdecor.es',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Dublín, 21',
      addressLocality: 'Marbella',
      addressRegion: 'Málaga',
      postalCode: '29670',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.49,
      longitude: -4.98,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+34 951 127 003',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
      areaServed: 'ES',
    },
    hasMap: 'https://www.google.com/maps?q=36.49,-4.98',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ContactPageJsonLd />
      {children}
    </>
  );
}
