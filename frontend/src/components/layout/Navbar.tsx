'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import UserMenu from '@/components/auth/UserMenu';
import CartBadge from '@/components/cart/CartBadge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

const NAV_LINKS = [
  { href: '/benjamin-moore', label: 'Benjamin Moore' },
  { href: '/farrow-and-ball', label: 'Farrow & Ball' },
  { href: '/little-greene', label: 'Little Greene' },
];

const SECONDARY_LINKS = [
  { href: '/about', label: 'The Atelier' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Visit Us' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left — Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2C2C2C] tracking-tight">
              BM Decoración
            </span>
          </Link>

          {/* Center — Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Brand dropdown-style group */}
            <div className="relative group">
              <span className="px-3 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors cursor-default">
                Brands
              </span>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-lg py-2 min-w-[200px]">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        isActive(link.href)
                          ? 'text-[#C9A86C] bg-[#C9A86C]/5'
                          : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <span className="w-px h-4 bg-[#E8E2D9]" />

            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-[#C9A86C]'
                    : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2">
            <div className="[&_button]:text-[#2C2C2C]/70 [&_button]:hover:text-[#2C2C2C] [&_svg]:text-[#2C2C2C]/70">
              <UserMenu />
            </div>
            <div className="[&_button]:text-[#2C2C2C]/70 [&_button]:hover:text-[#2C2C2C] [&_svg]:text-[#2C2C2C]/70">
              <CartBadge />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sheet Menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="bg-[#FAF8F5] w-[300px]">
          <SheetHeader>
            <SheetTitle className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]">
              BM Decoración
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-1 px-4 mt-2">
            <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2">Brand Houses</p>
            {NAV_LINKS.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={`py-2.5 text-sm transition-colors ${
                    isActive(link.href) ? 'text-[#C9A86C] font-medium' : 'text-[#2C2C2C]/70'
                  }`}
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}

            <div className="h-px bg-[#E8E2D9] my-3" />

            <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2">Explore</p>
            {SECONDARY_LINKS.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={`py-2.5 text-sm transition-colors ${
                    isActive(link.href) ? 'text-[#C9A86C] font-medium' : 'text-[#2C2C2C]/70'
                  }`}
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}

            <div className="h-px bg-[#E8E2D9] my-3" />

            <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2">Account</p>
            <SheetClose asChild>
              <Link href="/my-studio" className="py-2.5 text-sm text-[#2C2C2C]/70">
                My Design Studio
              </Link>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
