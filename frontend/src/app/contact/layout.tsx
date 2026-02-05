import { Metadata } from 'next';

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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
