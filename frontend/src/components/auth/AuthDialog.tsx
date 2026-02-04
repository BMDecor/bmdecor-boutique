'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/auth-context';

type Mode = 'signIn' | 'signUp' | 'confirm';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signIn, signUp, confirmSignUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setError('');
    setPassword('');
    setCode('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      onOpenChange(false);
      reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg === 'NEW_PASSWORD_REQUIRED' ? 'Please reset your password first.' : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signUp(email, password, displayName || email.split('@')[0]);
      setMode('confirm');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await confirmSignUp(email, code);
      await signIn(email, password);
      onOpenChange(false);
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FAF8F5]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-2xl text-center">
            {mode === 'signIn' && 'Welcome Back'}
            {mode === 'signUp' && 'Create Account'}
            {mode === 'confirm' && 'Verify Email'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'signIn' && 'Sign in to your BM Decoracion account'}
            {mode === 'signUp' && 'Join our Marbella design community'}
            {mode === 'confirm' && `Enter the code sent to ${email}`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'signIn' && (
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2C2C2C] text-white hover:bg-[#404040]"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  New here?{' '}
                  <button type="button" onClick={() => { reset(); setMode('signUp'); }} className="text-[#C9A86C] hover:underline font-medium">
                    Create account
                  </button>
                </p>
              </form>
            )}

            {mode === 'signUp' && (
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, upper + lower + digit"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C9A86C] text-[#2C2C2C] hover:bg-[#D4B896]"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { reset(); setMode('signIn'); }} className="text-[#C9A86C] hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {mode === 'confirm' && (
              <form onSubmit={handleConfirm} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2C2C2C] text-white hover:bg-[#404040]"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella
        </p>
      </DialogContent>
    </Dialog>
  );
}
