'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '□' },
  { href: '/admin/products', label: 'Products', icon: '◈' },
  { href: '/admin/colors', label: 'Colors', icon: '◉' },
  { href: '/admin/articles', label: 'Articles', icon: '◊' },
  { href: '/admin/orders', label: 'Orders', icon: '▤' },
  { href: '/admin/users', label: 'Users', icon: '◆' },
  { href: '/admin/images', label: 'Images', icon: '▣' },
  { href: '/admin/exports', label: 'Exports', icon: '↓' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <p className="text-[#2C2C2C]/60 text-sm tracking-wide">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-4">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
            Access Restricted
          </h1>
          <p className="text-[#2C2C2C]/60 text-sm">
            Admin credentials required.
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
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2C2C2C] text-white flex flex-col shrink-0">
        {/* Brand header */}
        <div className="px-6 py-8 border-b border-white/10">
          <h1 className="font-[family-name:var(--font-playfair)] text-xl tracking-wide">
            BM Decoracion
          </h1>
          <p className="text-[#C9A86C] text-xs tracking-[0.2em] uppercase mt-1">
            Admin
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                      active
                        ? 'text-[#C9A86C] border-l-2 border-[#C9A86C] bg-white/5'
                        : 'text-white/70 border-l-2 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-white/10">
          <p className="text-white/40 text-xs mb-3">
            {user.email}
          </p>
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-[#C9A86C] transition-colors"
          >
            &larr; Back to Grand Lobby
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[#FAF8F5] overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
