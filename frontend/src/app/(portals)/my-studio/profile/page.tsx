'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      toast.success('Account deleted. Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch {
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-1">
          Account Settings
        </h2>
        <p className="text-sm text-[#2C2C2C]/50">Manage your profile and data preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 space-y-4">
        <h3 className="font-medium text-[#2C2C2C]">Profile Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#2C2C2C]/50 block mb-1">Display Name</span>
            <span className="text-[#2C2C2C]">{user?.displayName || '—'}</span>
          </div>
          <div>
            <span className="text-[#2C2C2C]/50 block mb-1">Email</span>
            <span className="text-[#2C2C2C]">{user?.email || '—'}</span>
          </div>
          <div>
            <span className="text-[#2C2C2C]/50 block mb-1">Account Type</span>
            <span className="text-[#2C2C2C]">{user?.groups.join(', ') || 'Customer'}</span>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 space-y-4">
        <h3 className="font-medium text-[#2C2C2C]">Data & Privacy</h3>
        <p className="text-sm text-[#2C2C2C]/60">
          Your data is processed in accordance with the General Data Protection Regulation (GDPR)
          and Spain&apos;s Ley Org&aacute;nica de Protecci&oacute;n de Datos (LOPDGDD).
        </p>
        <div className="flex gap-4 text-sm">
          <a href="/privacy-policy" className="text-[#C9A86C] hover:underline">Privacy Policy</a>
          <a href="/terms" className="text-[#C9A86C] hover:underline">Terms of Service</a>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border-2 border-red-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="font-medium text-red-700">Danger Zone</h3>
        </div>
        <p className="text-sm text-[#2C2C2C]/60">
          Permanently delete your account and all associated data. Your order history will be
          anonymized for tax compliance, but all personal information will be erased.
        </p>
        <Button
          variant="outline"
          onClick={() => setDeleteOpen(true)}
          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Delete My Account
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5]">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Account</DialogTitle>
            <DialogDescription className="text-[#2C2C2C]/60">
              This action is irreversible. Your orders will be anonymized, and your access
              will be revoked immediately. All projects, saved colors, and personal data will
              be permanently erased.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-[#2C2C2C]/70">
                Type <strong>DELETE</strong> to confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setDeleteOpen(false); setConfirmText(''); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
