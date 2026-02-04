'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirm } from '@/components/admin/delete-confirm';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

type StatusFilter = 'all' | 'new' | 'read' | 'replied';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/admin/contacts');
      if (res.ok) setContacts(await res.json());
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: status as Contact['status'] } : c)),
      );
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function deleteContact(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Contact deleted');
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      toast.error('Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = contacts.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const newCount = contacts.filter((c) => c.status === 'new').length;

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const statusStyles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-600',
    replied: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Contacts
        </h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">
          {contacts.length} total &middot; {newCount} unread
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-[#2C2C2C]/5 rounded-lg p-1">
          {(['all', 'new', 'read', 'replied'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                filter === s
                  ? 'bg-white text-[#2C2C2C] shadow-sm font-medium'
                  : 'text-[#2C2C2C]/50 hover:text-[#2C2C2C]'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'new' && newCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search name, email, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-[#2C2C2C]/15 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30 w-64"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-[#2C2C2C]/40 text-sm py-12">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#2C2C2C]/30 py-12 font-[family-name:var(--font-playfair)] text-xl">
          {contacts.length === 0 ? 'No contact submissions yet' : 'No matches'}
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden">
          <div className="divide-y divide-[#2C2C2C]/5">
            {filtered.map((contact) => (
              <div key={contact.id}>
                <div
                  className={`px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#FAF8F5]/50 transition-colors ${
                    contact.status === 'new' ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => {
                    setExpandedId(expandedId === contact.id ? null : contact.id);
                    if (contact.status === 'new') updateStatus(contact.id, 'read');
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm text-[#2C2C2C] ${contact.status === 'new' ? 'font-semibold' : 'font-medium'}`}>
                        {contact.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyles[contact.status]}`}>
                        {contact.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#2C2C2C]/50 mt-0.5">{contact.email}</p>
                  </div>
                  <p className="text-sm text-[#2C2C2C]/50 truncate max-w-xs hidden md:block">
                    {contact.message}
                  </p>
                  <span className="text-xs text-[#2C2C2C]/30 whitespace-nowrap">
                    {formatDate(contact.createdAt)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#2C2C2C]/30 shrink-0 transition-transform ${
                      expandedId === contact.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded */}
                {expandedId === contact.id && (
                  <div className="px-5 pb-5 space-y-4 border-t border-[#2C2C2C]/5 bg-[#FAF8F5]/30">
                    <div className="pt-4 space-y-2">
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-[#2C2C2C]/40 text-xs">Name</span>
                          <p className="text-[#2C2C2C]">{contact.name}</p>
                        </div>
                        <div>
                          <span className="text-[#2C2C2C]/40 text-xs">Email</span>
                          <p className="text-[#2C2C2C]">
                            <a href={`mailto:${contact.email}`} className="text-[#C9A86C] hover:text-[#B8975B]">
                              {contact.email}
                            </a>
                          </p>
                        </div>
                        {contact.phone && (
                          <div>
                            <span className="text-[#2C2C2C]/40 text-xs">Phone</span>
                            <p className="text-[#2C2C2C]">{contact.phone}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[#2C2C2C]/40 text-xs">Message</span>
                        <p className="text-sm text-[#2C2C2C]/80 whitespace-pre-wrap mt-1">
                          {contact.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <select
                        value={contact.status}
                        onChange={(e) => updateStatus(contact.id, e.target.value)}
                        className="text-xs rounded-md border border-[#2C2C2C]/15 px-2 py-1 bg-white"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                      <a
                        href={`mailto:${contact.email}?subject=Re: Your message to BM Decoracion`}
                        className="text-xs text-[#C9A86C] hover:text-[#B8975B]"
                      >
                        Reply by email
                      </a>
                      <div className="flex-1" />
                      <DeleteConfirm
                        title="Delete Contact"
                        description="This contact submission will be permanently deleted."
                        onConfirm={() => deleteContact(contact.id)}
                        loading={deletingId === contact.id}
                        trigger={
                          <button className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
