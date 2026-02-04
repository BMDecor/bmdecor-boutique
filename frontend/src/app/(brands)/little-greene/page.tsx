'use client';

import dynamicImport from 'next/dynamic';

const LittleGreenePage = dynamicImport(() => import('./LittleGreeneClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <p className="text-[#4A5240]/50 text-sm tracking-wide animate-pulse">Loading Little Greene...</p>
    </div>
  ),
});

export default function Page() {
  return <LittleGreenePage />;
}
