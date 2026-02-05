import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers about BM Decoración paints, services, delivery, and ordering. Everything you need to know about Benjamin Moore, Farrow & Ball, and Little Greene.',
  alternates: {
    canonical: '/faqs',
  },
  openGraph: {
    title: 'FAQs | BM Decoración',
    description: 'Find answers about BM Decoración paints, services, delivery, and ordering.',
  },
};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
