'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface User {
  sub: string;
  email: string;
  name: string;
  enabled: boolean;
  status: string;
  createdAt: string;
  groups: string[];
}

const allGroups = ['Admin', 'Employee', 'Customer'];

const groupStyles: Record<string, string> = {
  Admin: 'bg-amber-100 text-amber-800 border-amber-200',
  Employee: 'bg-blue-100 text-blue-800 border-blue-200',
  Customer: 'bg-green-100 text-green-800 border-green-200',
};

export default function UserDetailPage() {
  const { sub } = useParams<{ sub: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${sub}`);
      if (!res.ok) throw new Error();
      setUser(await res.json());
    } catch {
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [sub]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const doAction = async (action: string, group?: string) => {
    setActionLoading(action + (group || ''));
    try {
      const res = await fetch(`/api/admin/users/${sub}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, group }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        action === 'addGroup' ? `Added to ${group}` :
        action === 'removeGroup' ? `Removed from ${group}` :
        action === 'enable' ? 'User enabled' : 'User disabled'
      );
      await loadUser();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  if (loading) {
    return <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading user...</div>;
  }

  if (!user) {
    return (
      <div className="p-12 text-center">
        <p className="text-[#2C2C2C]/50 text-sm">User not found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  const availableGroups = allGroups.filter((g) => !user.groups.includes(g));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
          <Link href="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">User Detail</h1>
          <p className="text-[#2C2C2C]/50 text-sm mt-1">{user.email}</p>
        </div>
      </div>

      {/* User info card */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-[#2C2C2C]">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-1">Name</p>
            <p className="text-sm text-[#2C2C2C]">{user.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-1">Cognito Status</p>
            <p className="text-sm text-[#2C2C2C]">{user.status}</p>
          </div>
          <div>
            <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-1">Created</p>
            <p className="text-sm text-[#2C2C2C]">{formatDate(user.createdAt)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#2C2C2C]/40 uppercase tracking-wider mb-1">Sub (ID)</p>
          <p className="text-xs text-[#2C2C2C]/60 font-mono">{user.sub}</p>
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#2C2C2C]">Account Status</h2>
            <p className="text-xs text-[#2C2C2C]/50 mt-0.5">
              {user.enabled ? 'User can sign in and access the platform.' : 'User is blocked from signing in.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label className={user.enabled ? 'text-green-700' : 'text-red-600'}>
              {user.enabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Switch
              checked={user.enabled}
              disabled={actionLoading !== null}
              onCheckedChange={(checked) => doAction(checked ? 'enable' : 'disable')}
            />
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 p-6 space-y-4">
        <h2 className="text-sm font-medium text-[#2C2C2C]">Groups</h2>

        {/* Current groups */}
        <div className="flex gap-2 flex-wrap">
          {user.groups.length > 0 ? user.groups.map((g) => (
            <span key={g} className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium ${groupStyles[g] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {g}
              <button
                onClick={() => doAction('removeGroup', g)}
                disabled={actionLoading !== null}
                className="hover:opacity-70 disabled:opacity-30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )) : (
            <p className="text-sm text-[#2C2C2C]/40">No groups assigned</p>
          )}
        </div>

        {/* Add group */}
        {availableGroups.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-[#2C2C2C]/5">
            <span className="text-xs text-[#2C2C2C]/40 self-center mr-1">Add:</span>
            {availableGroups.map((g) => (
              <Button
                key={g}
                variant="outline"
                size="sm"
                onClick={() => doAction('addGroup', g)}
                disabled={actionLoading !== null}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> {g}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
