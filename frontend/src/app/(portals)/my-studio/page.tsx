'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

export default function MyStudioOverview() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState<number>(0);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [ordersRes, projectsRes] = await Promise.all([
          fetch('/api/my-studio/orders'),
          fetch('/api/my-studio/projects'),
        ]);

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setOrderCount(Array.isArray(orders) ? orders.length : 0);
        }

        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          setProjectCount(Array.isArray(projects) ? projects.length : 0);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">
          Welcome back, {user?.displayName || 'Designer'}
        </h2>
        <p className="text-[#2C2C2C]/60 text-sm mt-2">
          Your personal design workspace at BM Decoracion.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-[#E8E2D9] p-6">
          <p className="text-[#2C2C2C]/50 text-xs uppercase tracking-[0.15em]">Orders</p>
          {loading ? (
            <p className="text-[#2C2C2C]/40 text-2xl mt-2 font-[family-name:var(--font-playfair)]">
              --
            </p>
          ) : (
            <p className="text-[#2C2C2C] text-3xl mt-2 font-[family-name:var(--font-playfair)]">
              {orderCount}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[#E8E2D9] p-6">
          <p className="text-[#2C2C2C]/50 text-xs uppercase tracking-[0.15em]">Projects</p>
          {loading ? (
            <p className="text-[#2C2C2C]/40 text-2xl mt-2 font-[family-name:var(--font-playfair)]">
              --
            </p>
          ) : (
            <p className="text-[#2C2C2C] text-3xl mt-2 font-[family-name:var(--font-playfair)]">
              {projectCount}
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="group bg-white rounded-lg border border-[#E8E2D9] p-6 hover:border-[#C9A86C] transition-colors"
          >
            <p className="text-[#C9A86C] text-xs uppercase tracking-[0.15em] mb-2">Explore</p>
            <p className="text-[#2C2C2C] font-medium group-hover:text-[#C9A86C] transition-colors">
              Browse Colors
            </p>
            <p className="text-[#2C2C2C]/50 text-sm mt-1">
              Discover curated palettes from our three brand houses.
            </p>
          </Link>

          <Link
            href="/my-studio/orders"
            className="group bg-white rounded-lg border border-[#E8E2D9] p-6 hover:border-[#C9A86C] transition-colors"
          >
            <p className="text-[#C9A86C] text-xs uppercase tracking-[0.15em] mb-2">Track</p>
            <p className="text-[#2C2C2C] font-medium group-hover:text-[#C9A86C] transition-colors">
              View Orders
            </p>
            <p className="text-[#2C2C2C]/50 text-sm mt-1">
              Check the status of your paint orders.
            </p>
          </Link>

          <Link
            href="/my-studio/projects"
            className="group bg-white rounded-lg border border-[#E8E2D9] p-6 hover:border-[#C9A86C] transition-colors"
          >
            <p className="text-[#C9A86C] text-xs uppercase tracking-[0.15em] mb-2">Create</p>
            <p className="text-[#2C2C2C] font-medium group-hover:text-[#C9A86C] transition-colors">
              My Projects
            </p>
            <p className="text-[#2C2C2C]/50 text-sm mt-1">
              Organise your saved colors into design projects.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
