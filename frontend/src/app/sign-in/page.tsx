'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import AuthDialog from '@/components/auth/AuthDialog';

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Redirect authenticated users to My Studio
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/my-studio');
    }
  }, [isAuthenticated, isLoading, router]);

  // Open dialog automatically for guests
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setDialogOpen(true);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[#2C2C2C]/50 text-sm tracking-wide">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[#2C2C2C]/50 text-sm tracking-wide">Redirecting to My Design Studio...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] items-center justify-center bg-[#FAF8F5]">
      <div className="text-center space-y-4">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
          Welcome to BM Decoración
        </h1>
        <p className="text-[#2C2C2C]/60 text-sm">
          Sign in to access your Design Studio, saved palettes, and order history.
        </p>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-block px-6 py-2.5 bg-[#2C2C2C] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          Sign In
        </button>
      </div>
      <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
