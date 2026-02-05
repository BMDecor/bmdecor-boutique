'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { createSlug } from '@/lib/utils/slugs';
import { decodeHtmlEntities } from '@/lib/utils/html-entities';

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
}

interface BrandSearchBarProps {
  brand: string;
  brandName: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  accentColor?: string;
}

/**
 * Fuzzy search bar with instant results dropdown.
 * Uses Fuse.js-powered /api/search endpoint for typo-tolerant matching.
 */
export default function BrandSearchBar({
  brand,
  brandName,
  onSearch,
  debounceMs = 300,
  accentColor = '#C9A86C',
}: BrandSearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fuzzy search API call
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&brand=${brand}&limit=8`
      );
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [brand]);

  // Debounced search effect
  useEffect(() => {
    if (inputValue.length === 0) {
      setResults([]);
      setSuggestions([]);
      setShowDropdown(false);
      onSearch('');
      return;
    }

    setShowDropdown(true);
    const timer = setTimeout(() => {
      performSearch(inputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, performSearch, onSearch]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          // Navigate to selected color
          const result = results[selectedIndex];
          window.location.href = `/color/${createSlug({ brand: result.brand, name: result.name, colorCode: result.code })}`;
        } else {
          // Trigger grid search
          onSearch(inputValue);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = useCallback(() => {
    setInputValue('');
    setResults([]);
    setSuggestions([]);
    setShowDropdown(false);
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleViewAll = () => {
    onSearch(inputValue);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Icon / Spinner */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {isSearching ? (
          <div
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: accentColor, borderTopColor: 'transparent' }}
          />
        ) : (
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      {/* Input */}
      <Input
        ref={inputRef}
        type="text"
        placeholder={`Search ${brandName} colors...`}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setSelectedIndex(-1);
        }}
        onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-1"
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        autoComplete="off"
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Clear search"
        >
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Results Dropdown */}
      {showDropdown && inputValue.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
        >
          {isSearching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <div
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                style={{ borderColor: accentColor, borderTopColor: 'transparent' }}
              />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <Link
                      href={`/color/${createSlug({ brand: result.brand, name: result.name, colorCode: result.code })}`}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        index === selectedIndex ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      {/* Color Swatch */}
                      <div
                        className="w-10 h-10 rounded-lg shadow-sm flex-shrink-0"
                        style={{ backgroundColor: result.hexCode }}
                      />
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {result.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="font-mono">{result.code}</span>
                          {result.collection && (
                            <>
                              <span>·</span>
                              <span className="truncate">{decodeHtmlEntities(result.collection)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Arrow */}
                      <svg
                        className="w-4 h-4 text-muted-foreground flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* View All Results */}
              <button
                onClick={handleViewAll}
                className="w-full p-3 text-sm font-medium text-center border-t border-gray-100 hover:bg-gray-50 transition-colors"
                style={{ color: accentColor }}
              >
                View all results for &ldquo;{inputValue}&rdquo;
              </button>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                We couldn&apos;t find &ldquo;{inputValue}&rdquo;
              </p>
              {suggestions.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span>Did you mean: </span>
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setInputValue(s)}
                      className="text-foreground hover:underline"
                    >
                      {s}
                      {i < suggestions.length - 1 ? ', ' : ''}
                    </button>
                  ))}
                  <span>?</span>
                </div>
              )}
              <button
                onClick={handleViewAll}
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: accentColor }}
              >
                Search in grid view
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
