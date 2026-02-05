/**
 * BM Decoración - Universal Search Hook
 *
 * Powers the Mega Menu and Search Bar with unified product and color search.
 * Supports the 5 Shopping Archetypes through flexible filtering.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Product, Color, BrandId, ColorFamily } from '@/types/store';
import { searchProducts, getAllProducts, getProductsByBrandId, getProductsByTag } from '@/lib/inventory';
import { searchColors, getAllColors, getColorsByBrandId, getColorsByFamily } from '@/lib/colors';

// =============================================================================
// TYPES
// =============================================================================

export interface SearchFilters {
  brandId?: BrandId;
  colorFamily?: ColorFamily;
  productTags?: string[];
  productType?: Product['type'];
}

export interface SearchResults {
  products: Product[];
  colors: Color[];
  totalResults: number;
  query: string;
  filters: SearchFilters;
}

export interface UseSearchReturn {
  /** Current search query */
  query: string;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Current filters */
  filters: SearchFilters;
  /** Update filters */
  setFilters: (filters: SearchFilters) => void;
  /** Update a single filter */
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Search results */
  results: SearchResults;
  /** Whether search is active (has query or filters) */
  isSearchActive: boolean;
  /** Quick search by tag (Problem Solver) */
  searchByProject: (tag: string) => SearchResults;
  /** Quick search by color family (Dreamer) */
  searchByColorFamily: (family: ColorFamily) => SearchResults;
  /** Quick search by brand (Loyalist) */
  searchByBrand: (brandId: BrandId) => SearchResults;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useSearch(initialQuery = '', initialFilters: SearchFilters = {}): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Compute search results
  const results = useMemo<SearchResults>(() => {
    let products: Product[] = [];
    let colors: Color[] = [];

    const hasQuery = query.trim().length > 0;
    const hasFilters = Object.values(filters).some((v) => v !== undefined);

    if (!hasQuery && !hasFilters) {
      // No search active - return empty results
      return {
        products: [],
        colors: [],
        totalResults: 0,
        query,
        filters,
      };
    }

    // Start with all items if filtering, or search results if query exists
    if (hasQuery) {
      products = searchProducts(query);
      colors = searchColors(query);
    } else {
      products = getAllProducts();
      colors = getAllColors();
    }

    // Apply brand filter
    if (filters.brandId) {
      products = products.filter((p) => p.brandId === filters.brandId);
      colors = colors.filter((c) => c.brandId === filters.brandId);
    }

    // Apply color family filter
    if (filters.colorFamily) {
      colors = colors.filter((c) => c.family === filters.colorFamily);
    }

    // Apply product tag filter
    if (filters.productTags && filters.productTags.length > 0) {
      products = products.filter((p) =>
        filters.productTags!.some((tag) =>
          p.tags.some((pTag) => pTag.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }

    // Apply product type filter
    if (filters.productType) {
      products = products.filter((p) => p.type === filters.productType);
    }

    return {
      products,
      colors,
      totalResults: products.length + colors.length,
      query,
      filters,
    };
  }, [query, filters]);

  // Update single filter
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Check if search is active
  const isSearchActive = useMemo(() => {
    return query.trim().length > 0 || Object.values(filters).some((v) => v !== undefined);
  }, [query, filters]);

  // Quick search helpers for shopping archetypes

  // Problem Solver: Search by project/tag
  const searchByProject = useCallback((tag: string): SearchResults => {
    const products = getProductsByTag(tag);
    return {
      products,
      colors: [],
      totalResults: products.length,
      query: tag,
      filters: { productTags: [tag] },
    };
  }, []);

  // Dreamer: Search by color family
  const searchByColorFamily = useCallback((family: ColorFamily): SearchResults => {
    const colors = getColorsByFamily(family);
    return {
      products: [],
      colors,
      totalResults: colors.length,
      query: family,
      filters: { colorFamily: family },
    };
  }, []);

  // Loyalist: Search by brand
  const searchByBrand = useCallback((brandId: BrandId): SearchResults => {
    const products = getProductsByBrandId(brandId);
    const colors = getColorsByBrandId(brandId);
    return {
      products,
      colors,
      totalResults: products.length + colors.length,
      query: '',
      filters: { brandId },
    };
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    results,
    isSearchActive,
    searchByProject,
    searchByColorFamily,
    searchByBrand,
  };
}

// =============================================================================
// STANDALONE SEARCH FUNCTION (for Server Components)
// =============================================================================

/**
 * Perform a search without using the hook (for server-side use)
 */
export function performSearch(
  query: string,
  filters: SearchFilters = {}
): SearchResults {
  let products: Product[] = [];
  let colors: Color[] = [];

  const hasQuery = query.trim().length > 0;
  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  if (!hasQuery && !hasFilters) {
    return {
      products: [],
      colors: [],
      totalResults: 0,
      query,
      filters,
    };
  }

  // Start with search results or all items
  if (hasQuery) {
    products = searchProducts(query);
    colors = searchColors(query);
  } else {
    products = getAllProducts();
    colors = getAllColors();
  }

  // Apply filters
  if (filters.brandId) {
    products = products.filter((p) => p.brandId === filters.brandId);
    colors = colors.filter((c) => c.brandId === filters.brandId);
  }

  if (filters.colorFamily) {
    colors = colors.filter((c) => c.family === filters.colorFamily);
  }

  if (filters.productTags && filters.productTags.length > 0) {
    products = products.filter((p) =>
      filters.productTags!.some((tag) =>
        p.tags.some((pTag) => pTag.toLowerCase().includes(tag.toLowerCase()))
      )
    );
  }

  if (filters.productType) {
    products = products.filter((p) => p.type === filters.productType);
  }

  return {
    products,
    colors,
    totalResults: products.length + colors.length,
    query,
    filters,
  };
}

export default useSearch;
