'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import type { ColorFamily } from '@/types/store';

interface StudioMenuProps {
  onNavigate: () => void;
}

// Color families with visual representation
const COLOR_FAMILIES: { id: ColorFamily; name: string; hex: string }[] = [
  { id: 'white', name: 'Whites', hex: '#F9F7F3' },
  { id: 'grey', name: 'Greys', hex: '#9A9A8E' },
  { id: 'blue', name: 'Blues', hex: '#2C4251' },
  { id: 'green', name: 'Greens', hex: '#4A5240' },
  { id: 'neutral', name: 'Neutrals', hex: '#B5A99A' },
  { id: 'dark', name: 'Darks', hex: '#2B2B2B' },
];

// Collections
const COLLECTIONS = [
  { id: 'historical', label: 'Historical Collection', description: 'Timeless heritage colors', href: '/search?collection=historical' },
  { id: 'designer', label: 'Designer Classics', description: 'Curated favorites', href: '/search?collection=designer' },
  { id: 'trends', label: '2026 Trends', description: 'This year\'s palettes', href: '/search?tag=trending' },
];

/**
 * StudioMenu - The "Color Studio" content for the Mega Menu
 * Features search bar, color families, and collections
 */
export default function StudioMenu({ onNavigate }: StudioMenuProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const { results } = useSearch(searchInput);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate();
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }, [searchInput, onNavigate, router]);

  const handleFamilyClick = useCallback((family: ColorFamily) => {
    onNavigate();
    router.push(`/search?family=${family}`);
  }, [onNavigate, router]);

  const handleNavigation = useCallback((href: string) => {
    onNavigate();
    router.push(href);
  }, [onNavigate, router]);

  // Show quick results preview
  const hasResults = results.colors.length > 0 || results.products.length > 0;
  const previewColors = results.colors.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Search Bar (Top) */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/30" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search any color name or code (e.g., 'Hale Navy' or 'HC-154')..."
            className="w-full pl-12 pr-4 py-4 text-base bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30 focus:border-[#C9A86C] transition-all"
          />
          {searchInput && (
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#2C2C2C] text-white text-sm rounded-lg hover:bg-[#C9A86C] transition-colors"
            >
              Search
            </button>
          )}
        </form>

        {/* Quick Results Preview */}
        {searchInput && hasResults && (
          <div className="mt-2 p-3 bg-white border border-[#E8E2D9] rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#2C2C2C]/50">
                Found {results.colors.length} colors, {results.products.length} products
              </span>
              <button
                onClick={handleSearch}
                className="text-xs text-[#C9A86C] hover:text-[#B8975B] flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {previewColors.length > 0 && (
              <div className="flex gap-2">
                {previewColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleNavigation(`/color/${color.id}`)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-[#E8E2D9]"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-left">
                      <span className="block text-xs font-medium text-[#2C2C2C]">{color.name}</span>
                      <span className="block text-[10px] text-[#2C2C2C]/40">{color.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-8">
        {/* Column 1: Color Families */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C2C2C]/40 mb-4">
            Browse by Family
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_FAMILIES.map((family) => (
              <button
                key={family.id}
                onClick={() => handleFamilyClick(family.id)}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#FAF8F5] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: family.hex }}
                />
                <span className="text-xs font-medium text-[#2C2C2C]/70 group-hover:text-[#2C2C2C]">
                  {family.name}
                </span>
              </button>
            ))}
          </div>

          {/* Browse All Link */}
          <button
            onClick={() => handleNavigation('/search')}
            className="mt-4 text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors flex items-center gap-1"
          >
            Browse all colors
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Column 2: Collections */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C2C2C]/40 mb-4">
            Collections
          </h3>
          <ul className="space-y-2">
            {COLLECTIONS.map((collection) => (
              <li key={collection.id}>
                <button
                  onClick={() => handleNavigation(collection.href)}
                  className="group block w-full p-3 rounded-xl hover:bg-[#FAF8F5] transition-colors text-left"
                >
                  <span className="block text-sm font-medium text-[#2C2C2C] group-hover:text-[#C9A86C] transition-colors">
                    {collection.label}
                  </span>
                  <span className="block text-xs text-[#2C2C2C]/50">
                    {collection.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Popular Searches */}
          <div className="mt-6 pt-4 border-t border-[#E8E2D9]">
            <p className="text-xs text-[#2C2C2C]/40 mb-2">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['White Dove', 'Hale Navy', 'Revere Pewter'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchInput(term);
                  }}
                  className="px-3 py-1 text-xs bg-[#FAF8F5] text-[#2C2C2C]/70 rounded-full hover:bg-[#C9A86C]/10 hover:text-[#C9A86C] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Inspiration */}
        <div>
          <div className="relative h-full min-h-[240px] rounded-xl overflow-hidden bg-gradient-to-br from-[#2C3E50] via-[#3D5A6B] to-[#5D8A8E]">
            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                Color Inspiration
              </span>
              <h4 className="font-[family-name:var(--font-playfair)] text-xl text-white mt-1">
                The Art of Atmosphere
              </h4>
              <p className="text-xs text-white/70 mt-2">
                Discover how color transforms spaces. Explore curated palettes from our design experts.
              </p>
              <button
                onClick={() => handleNavigation('/journal')}
                className="mt-4 w-full py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
              >
                Explore Inspiration
              </button>
            </div>

            {/* Decorative Color Swatches */}
            <div className="absolute top-4 right-4 flex gap-1">
              {['#F3EFE7', '#B5A99A', '#5D8A8E'].map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
