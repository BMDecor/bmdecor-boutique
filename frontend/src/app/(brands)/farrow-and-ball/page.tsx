'use client';

import dynamicImport from 'next/dynamic';

const FarrowAndBallPage = dynamicImport(() => import('./FarrowAndBallClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <p className="text-[#8B7355]/50 text-sm tracking-wide animate-pulse">Loading Farrow &amp; Ball...</p>
    </div>
  ),
});

export default function Page() {
  return <FarrowAndBallPage />;
}
