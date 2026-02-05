'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createSlug } from '@/lib/utils/slugs';
import { decodeHtmlEntities } from '@/lib/utils/html-entities';
import Footer from '@/components/layout/Footer';

interface SearchResult {
  id: string;
  name: string;
  code: string;
  brand: string;
  hexCode: string;
  collection?: string;
  score?: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
  suggestions?: string[];
  error?: string;
}

const BRAND_LABELS: Record<string, string> = {
  BM: 'Benjamin Moore',
  FB: 'Farrow & Ball',
  LG: 'Little Greene',
};

const BRAND_COLORS: Record<string, string> = {
  BM: '#C9A86C',
  FB: '#8B7355',
  LG: '#4A5240',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Search Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-[#2C2C2C] tracking-tight mb-6">
          Search Colors
        </h1>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2C2C2C]/30" />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[#C9A86C] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, code, or collection... (e.g., 'hale navy', 'HC-172')"
            className="pl-12 pr-12 h-14 text-lg bg-white border-[#E8E2D9] rounded-xl focus:ring-[#C9A86C]/30 focus:border-[#C9A86C]"
            autoFocus
          />
        </div>
        <p className="text-sm text-[#2C2C2C]/40 mt-3">
          {loading
            ? 'Searching...'
            : hasSearched
            ? `${results.length} color${results.length !== 1 ? 's' : ''} found`
            : 'Type at least 2 characters to search'}
        </p>
      </section>

      {/* Results Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => performSearch(query)}
              className="mt-4 px-4 py-2 bg-[#C9A86C] text-white rounded-lg hover:bg-[#B89A5C] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-[#E8E2D9]/50" />
                <div className="mt-2 h-3 w-3/4 bg-[#E8E2D9]/50 rounded" />
                <div className="mt-1 h-3 w-1/2 bg-[#E8E2D9]/50 rounded" />
              </div>
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#2C2C2C]/40 text-lg">
              No colors match &ldquo;{query}&rdquo;
            </p>
            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-[#2C2C2C]/30 text-sm">Did you mean:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1 text-sm bg-white border border-[#E8E2D9] rounded-full hover:border-[#C9A86C] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[#2C2C2C]/30 text-sm mt-4">
              Try a different search term or browse by brand
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Link
                href="/benjamin-moore"
                className="px-4 py-2 text-sm border border-[#E8E2D9] rounded-lg hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors"
              >
                Benjamin Moore
              </Link>
              <Link
                href="/farrow-and-ball"
                className="px-4 py-2 text-sm border border-[#E8E2D9] rounded-lg hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors"
              >
                Farrow & Ball
              </Link>
              <Link
                href="/little-greene"
                className="px-4 py-2 text-sm border border-[#E8E2D9] rounded-lg hover:border-[#C9A86C] hover:text-[#C9A86C] transition-colors"
              >
                Little Greene
              </Link>
            </div>
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-20">
            <p className="text-[#2C2C2C]/40 text-lg">
              Start typing to search across all brands
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-sm text-[#2C2C2C]/30">Try:</span>
              {['Hale Navy', 'HC-172', 'Elephant', 'White', 'French Gray'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 text-sm bg-white border border-[#E8E2D9] rounded-full hover:border-[#C9A86C] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((color) => (
              <Link
                key={color.id}
                href={`/color/${createSlug({ brand: color.brand, name: color.name, colorCode: color.code })}`}
                className="group"
              >
                <div
                  className="aspect-square rounded-xl border border-[#E8E2D9] transition-all group-hover:shadow-lg group-hover:scale-[1.02]"
                  style={{ backgroundColor: color.hexCode || '#E8E2D9' }}
                >
                  {/* Color code overlay */}
                  <div className="h-full flex items-end p-2">
                    <span
                      className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#2C2C2C',
                      }}
                    >
                      {color.code}
                    </span>
                  </div>
                </div>
                <div className="mt-2 px-0.5">
                  <p className="text-sm font-medium text-[#2C2C2C] truncate group-hover:text-[#C9A86C] transition-colors">
                    {decodeHtmlEntities(color.name)}
                  </p>
                  <p className="text-xs text-[#2C2C2C]/50">
                    <span style={{ color: BRAND_COLORS[color.brand] }}>
                      {BRAND_LABELS[color.brand] || color.brand}
                    </span>
                    {color.collection && (
                      <span className="text-[#2C2C2C]/30">
                        {' · '}
                        {decodeHtmlEntities(color.collection)}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
