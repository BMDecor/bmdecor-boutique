import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { CartDrawerLazy } from "@/components/cart/CartDrawerLazy";
import Navbar from "@/components/layout/Navbar";
import CookieConsent from "@/components/privacy/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
import { BASE_URL } from "@/lib/utils/env";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | BM Decoración',
    default: 'BM Decoración — Premium Paint Boutique',
  },
  description: "Curated collections from Benjamin Moore, Farrow & Ball, and Little Greene. Premium paints for discerning homes in Marbella and Costa del Sol.",
  keywords: ["paint", "Marbella", "Benjamin Moore", "Farrow & Ball", "Little Greene", "interior design", "premium paint"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "BM Decoración",
  },
  twitter: {
    card: "summary_large_image",
  },
};

function HomeGoodsStoreJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HomeGoodsStore',
    name: 'BM Decoración',
    description: 'Premium paint boutique featuring Benjamin Moore, Farrow & Ball, and Little Greene in Marbella, Spain.',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/storefront.jpg`,
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
    ],
    priceRange: '€€€',
    paymentAccepted: 'Cash, Credit Card',
    currenciesAccepted: 'EUR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <HomeGoodsStoreJsonLd />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <CartDrawerLazy />
            <CookieConsent />
            <Toaster />
          </CartProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
