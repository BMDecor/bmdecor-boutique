'use client';

import dynamicImport from 'next/dynamic';

const BenjaminMoorePage = dynamicImport(() => import('./BenjaminMooreClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <p className="text-[#2C2C2C]/50 text-sm tracking-wide animate-pulse">Loading Benjamin Moore...</p>
    </div>
  ),
});

export default function Page() {
  return <BenjaminMoorePage />;
}
