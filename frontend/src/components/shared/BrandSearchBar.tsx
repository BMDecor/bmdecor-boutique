'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface BrandSearchBarProps {
  brand: string;
  brandName: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  accentColor?: string;
}

/**
 * Debounced search bar for brand color pages.
 *
 * Triggers onSearch callback after user stops typing for debounceMs.
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

  // Debounced search effect
  useEffect(() => {
    if (inputValue.length === 0) {
      onSearch('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      onSearch(inputValue);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onSearch]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative w-full max-w-md">
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {isSearching ? (
          <div
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${accentColor}40`, borderTopColor: 'transparent' }}
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
        type="text"
        placeholder={`Search ${brandName} colors...`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10 pr-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-1"
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
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
    </div>
  );
}
