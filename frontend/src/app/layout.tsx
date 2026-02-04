import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { CartDrawerLazy } from "@/components/cart/CartDrawerLazy";
import CookieConsent from "@/components/privacy/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
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
  title: "BM Decoración — Premium Paint Boutique | Marbella",
  description: "Curated collections from Benjamin Moore, Farrow & Ball, and Little Greene. Premium paints for discerning homes in Marbella and Costa del Sol.",
  keywords: ["paint", "Marbella", "Benjamin Moore", "Farrow & Ball", "Little Greene", "interior design", "premium paint"],
};

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
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawerLazy />
            <CookieConsent />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
