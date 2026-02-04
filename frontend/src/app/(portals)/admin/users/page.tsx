'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';

interface User {
  sub: string;
  email: string;
  name: string;
  enabled: boolean;
  status: string;
  createdAt: string;
  groups: string[];
}

const groupStyles: Record<string, string> = {
  Admin: 'bg-amber-100 text-amber-800',
  Employee: 'bg-blue-100 text-blue-800',
  Customer: 'bg-green-100 text-green-800',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationToken, setPaginationToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers(token?: string) {
    if (token) setLoadingMore(true); else setLoading(true);
    try {
      const url = `/api/admin/users?limit=60${token ? `&token=${encodeURIComponent(token)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (token) {
        setUsers((prev) => [...prev, ...data.users]);
      } else {
        setUsers(data.users);
      }
      setPaginationToken(data.paginationToken);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = !groupFilter || u.groups.includes(groupFilter);
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Users</h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">Manage Cognito user accounts and permissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#2C2C2C]/15 rounded-lg bg-white focus:outline-none focus:border-[#C9A86C]"
        >
          <option value="">All Groups</option>
          <option value="Admin">Admin</option>
          <option value="Employee">Employee</option>
          <option value="Customer">Customer</option>
        </select>
        <p className="text-xs text-[#2C2C2C]/40 ml-auto">
          {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#2C2C2C]/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#2C2C2C]/40 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C]/30 mb-2">No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2C2C2C]/8">
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Email</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Groups</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.1em] text-[#2C2C2C]/40">Created</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.sub} className="border-b border-[#2C2C2C]/5 hover:bg-[#FAF8F5]/50">
                  <TableCell className="text-sm text-[#2C2C2C]">{user.email}</TableCell>
                  <TableCell className="text-sm text-[#2C2C2C]/70">{user.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.groups.length > 0 ? user.groups.map((g) => (
                        <span key={g} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${groupStyles[g] || 'bg-gray-100 text-gray-600'}`}>
                          {g}
                        </span>
                      )) : (
                        <span className="text-xs text-[#2C2C2C]/30">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${user.enabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {user.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-[#2C2C2C]/50 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="text-[#2C2C2C]/30 hover:text-[#2C2C2C]">
                      <Link href={`/admin/users/${user.sub}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Load more */}
      {paginationToken && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(paginationToken)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More Users'}
          </Button>
        </div>
      )}
    </div>
  );
}
