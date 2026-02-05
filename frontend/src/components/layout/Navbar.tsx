'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Search, User, Menu, ChevronDown, ShoppingBag, Palette } from 'lucide-react';
import CartBadge from '@/components/cart/CartBadge';
import AuthDialog from '@/components/auth/AuthDialog';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { MegaDrawer, ShopMenu, StudioMenu, MobileMenu } from './nav';

// Secondary navigation links
const SECONDARY_NAV = [
  { href: '/services', label: 'Services' },
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

  // Menu states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isShopActive = pathname.startsWith('/shop') || pathname.startsWith('/benjamin-moore') || pathname.startsWith('/farrow') || pathname.startsWith('/little-greene');
  const isStudioActive = pathname.startsWith('/search') || pathname.startsWith('/color');

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

  // Close mega menus when navigating
  useEffect(() => {
    setShopOpen(false);
    setStudioOpen(false);
  }, [pathname]);

  // Handle mega menu toggling
  const toggleShop = () => {
    setShopOpen(!shopOpen);
    setStudioOpen(false);
  };

  const toggleStudio = () => {
    setStudioOpen(!studioOpen);
    setShopOpen(false);
  };

  const closeMenus = () => {
    setShopOpen(false);
    setStudioOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative">
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Left — Logo */}
          <Link href="/" className="mr-8 shrink-0">
            <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#2C2C2C] tracking-tight">
              BM Decoración
            </span>
          </Link>

          {/* Center — Desktop Navigation (Twin Engines) */}
          <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Main navigation">
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              {/* Shop Engine Trigger */}
              <li>
                <button
                  onClick={toggleShop}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    shopOpen || isShopActive
                      ? 'text-[#C9A86C] bg-[#C9A86C]/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  aria-expanded={shopOpen}
                  aria-haspopup="true"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
                </button>
              </li>

              {/* Color Studio Engine Trigger */}
              <li>
                <button
                  onClick={toggleStudio}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    studioOpen || isStudioActive
                      ? 'text-[#C9A86C] bg-[#C9A86C]/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  aria-expanded={studioOpen}
                  aria-haspopup="true"
                >
                  <Palette className="w-4 h-4" />
                  Color Studio
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studioOpen ? 'rotate-180' : ''}`} />
                </button>
              </li>

              {/* Divider */}
              <li className="w-px h-5 bg-[#E8E2D9] mx-2" aria-hidden="true" />

              {/* Secondary Nav */}
              {SECONDARY_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(link.href)
                        ? 'text-[#C9A86C]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right — Functional Wing */}
          <div className="ml-auto flex items-center gap-1">
            {/* Search (links to color studio) */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                closeMenus();
                router.push('/search');
              }}
              aria-label="Search colors"
            >
              <Search className="h-5 w-5" />
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

        {/* Mega Drawer — Shop Engine */}
        <MegaDrawer isOpen={shopOpen} onClose={closeMenus}>
          <ShopMenu onNavigate={closeMenus} />
        </MegaDrawer>

        {/* Mega Drawer — Color Studio Engine */}
        <MegaDrawer isOpen={studioOpen} onClose={closeMenus}>
          <StudioMenu onNavigate={closeMenus} />
        </MegaDrawer>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onAuthClick={() => setAuthOpen(true)}
      />

      {/* Auth Dialog */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
