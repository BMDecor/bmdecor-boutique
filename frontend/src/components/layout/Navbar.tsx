'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef, useEffect } from 'react';
import { Search, User, Menu, ChevronDown } from 'lucide-react';
import CartBadge from '@/components/cart/CartBadge';
import AuthDialog from '@/components/auth/AuthDialog';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const BRAND_LINKS = [
  { href: '/benjamin-moore', label: 'Benjamin Moore' },
  { href: '/farrow-and-ball', label: 'Farrow & Ball' },
  { href: '/little-greene', label: 'Little Greene' },
];

const NAV_LINKS = [
  { href: '/about', label: 'The Atelier' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/contact', label: 'Visit Us' },
];

export default function Navbar() {
  return (
    <Suspense fallback={<NavbarShell />}>
      <NavbarInner />
    </Suspense>
  );
}

function NavbarShell() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 shrink-0">
          <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2C2C2C] tracking-tight">
            BM Decoración
          </span>
        </Link>
      </div>
    </header>
  );
}

function NavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const brandsRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Auto-open auth dialog when ?authRequired is present
  const authRequired = searchParams.get('authRequired');
  useEffect(() => {
    if (authRequired && !isAuthenticated) {
      setAuthOpen(true);
    }
  }, [authRequired, isAuthenticated]);

  // After sign-in, redirect to the intended destination
  useEffect(() => {
    if (isAuthenticated && authRequired) {
      setAuthOpen(false);
      if (authRequired === 'admin' && isAdmin) {
        router.replace('/admin');
      } else if (authRequired === 'studio') {
        router.replace('/my-studio');
      } else {
        router.replace(pathname);
      }
    }
  }, [isAuthenticated, isAdmin, authRequired, pathname, router]);

  // Close brands dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandsRef.current && !brandsRef.current.contains(e.target as Node)) {
        setBrandsOpen(false);
      }
    }
    if (brandsOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [brandsOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Left — Logo */}
        <Link href="/" className="mr-6 shrink-0">
          <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2C2C2C] tracking-tight">
            BM Decoración
          </span>
        </Link>

        {/* Center — Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {/* Brands Dropdown */}
          <div ref={brandsRef} className="relative">
            <button
              onClick={() => setBrandsOpen(!brandsOpen)}
              className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                BRAND_LINKS.some((l) => isActive(l.href))
                  ? 'text-[#C9A86C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Brands
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${brandsOpen ? 'rotate-180' : ''}`} />
            </button>
            {brandsOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg border border-[#E8E2D9] shadow-lg py-1 z-50">
                {BRAND_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setBrandsOpen(false)}
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
            )}
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(link.href)
                  ? 'text-[#C9A86C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — Functional Wing */}
        <div className="ml-auto flex items-center gap-1">
          {/* Search */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
            <Link href="/search" aria-label="Search colors">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {/* Account */}
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/my-studio" aria-label="My Studio">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setAuthOpen(true)}
              aria-label="Sign in"
            >
              <User className="h-5 w-5" />
            </Button>
          )}

          {/* Cart */}
          <div className="[&_button]:text-muted-foreground [&_button]:hover:text-foreground">
            <CartBadge />
          </div>

          {/* Mobile hamburger — visible only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Sheet Menu */}
      {mobileOpen && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="bg-[#FAF8F5] w-[300px] z-[100]">
            <SheetHeader>
              <SheetTitle className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]">
                BM Decoración
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 px-4 mt-4">
              <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2">Brand Houses</p>
              {BRAND_LINKS.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={`py-2.5 text-sm transition-colors ${
                      isActive(link.href) ? 'text-[#C9A86C] font-medium' : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}

              <div className="h-px bg-[#E8E2D9] my-3" />

              <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2">Explore</p>
              {NAV_LINKS.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={`py-2.5 text-sm transition-colors ${
                      isActive(link.href) ? 'text-[#C9A86C] font-medium' : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}

              <div className="h-px bg-[#E8E2D9] my-3" />

              <p className="text-xs uppercase tracking-widest text-[#2C2C2C]/40 mb-2">Account</p>
              {isAuthenticated ? (
                <SheetClose asChild>
                  <Link href="/my-studio" className="py-2.5 text-sm text-[#2C2C2C]/70 hover:text-[#2C2C2C]">
                    My Studio
                  </Link>
                </SheetClose>
              ) : (
                <SheetClose asChild>
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="py-2.5 text-sm text-[#2C2C2C]/70 hover:text-[#2C2C2C] text-left"
                  >
                    Sign In
                  </button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Auth Dialog */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
