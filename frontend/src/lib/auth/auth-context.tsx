'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, consentTimestamp?: string, consentVersion?: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          return;
        }
      }
    } catch {}
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const { signIn } = await import('./cognito-client');
    const authUser = await signIn(email, password);
    setUser(authUser);
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, displayName: string, consentTimestamp?: string, consentVersion?: string) => {
    const { signUp } = await import('./cognito-client');
    await signUp(email, password, displayName, consentTimestamp, consentVersion);
  }, []);

  const handleConfirmSignUp = useCallback(async (email: string, code: string) => {
    const { confirmSignUp } = await import('./cognito-client');
    await confirmSignUp(email, code);
  }, []);

  const handleSignOut = useCallback(async () => {
    const { signOut } = await import('./cognito-client');
    await signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.groups.includes('Admin') ?? false,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
