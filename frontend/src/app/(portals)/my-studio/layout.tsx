'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

const tabs = [
  { href: '/my-studio', label: 'Overview' },
  { href: '/my-studio/orders', label: 'Orders' },
  { href: '/my-studio/projects', label: 'Projects' },
];

export default function MyStudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <p className="text-[#2C2C2C]/60 text-sm tracking-wide">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-4">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
            Sign In Required
          </h1>
          <p className="text-[#2C2C2C]/60 text-sm">
            Please sign in to access your Design Studio.
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-[#C9A86C] hover:text-[#B8975B] underline underline-offset-4"
          >
            Return to Grand Lobby
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/my-studio') return pathname === '/my-studio';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] tracking-wide">
            My Design Studio
          </h1>
          <Link
            href="/"
            className="text-sm text-[#2C2C2C]/50 hover:text-[#C9A86C] transition-colors"
          >
            &larr; Back to Grand Lobby
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-8">
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`pb-3 text-sm tracking-wide transition-colors border-b-2 ${
                    active
                      ? 'text-[#2C2C2C] border-[#C9A86C]'
                      : 'text-[#2C2C2C]/50 border-transparent hover:text-[#2C2C2C]/80'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
