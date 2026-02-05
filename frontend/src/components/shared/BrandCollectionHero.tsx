'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { decodeHtmlEntities } from '@/lib/utils/html-entities';

/**
 * Collection Hero Navigation Component
 *
 * Displays a responsive grid of gradient cards for navigating brand collections.
 * Each card uses elegant CSS gradients representing the collection's color theme.
 */

export interface CollectionCategory {
  id: string;
  name: string;
  description: string;
  gradient: string; // CSS gradient
  count?: number;
}

interface BrandCollectionHeroProps {
  brand: 'BM' | 'FB' | 'LG';
  selectedCollection: string;
  onSelect: (collectionId: string) => void;
  collectionCounts?: Map<string, number>;
  sampleColors?: Map<string, string[]>; // Collection name -> array of hex codes
}

// Brand-specific collection configurations
const BRAND_COLLECTIONS: Record<string, CollectionCategory[]> = {
  BM: [
    {
      id: 'all',
      name: 'All Colors',
      description: 'Complete Benjamin Moore palette',
      gradient: 'linear-gradient(135deg, #C9A86C 0%, #2C2C2C 100%)',
    },
    {
      id: 'Historical Colors',
      name: 'Historical',
      description: 'Timeless heritage shades',
      gradient: 'linear-gradient(135deg, #8B7355 0%, #D4C4B0 50%, #5C4A3D 100%)',
    },
    {
      id: 'Benjamin Moore Classics',
      name: 'Classics',
      description: 'Enduring favorites',
      gradient: 'linear-gradient(135deg, #B8C4B8 0%, #6B8E6B 50%, #3D5C3D 100%)',
    },
    {
      id: 'Off White Collection',
      name: 'Off-White',
      description: 'Subtle warm neutrals',
      gradient: 'linear-gradient(135deg, #FAF8F5 0%, #E8E2D9 50%, #D4C9BC 100%)',
    },
    {
      id: 'Affinity',
      name: 'Affinity',
      description: 'Curated color harmonies',
      gradient: 'linear-gradient(135deg, #A8B4C4 0%, #7B8FA8 50%, #4A5568 100%)',
    },
    {
      id: 'Color Trends',
      name: 'Color Trends',
      description: '2022-2026 designer picks',
      gradient: 'linear-gradient(135deg, #E8B4B8 0%, #C9A86C 50%, #8B7355 100%)',
    },
  ],
  FB: [
    {
      id: 'all',
      name: 'All Colours',
      description: 'Complete Farrow & Ball palette',
      gradient: 'linear-gradient(135deg, #F5F1EB 0%, #8B7355 100%)',
    },
    {
      id: 'Signature Palette',
      name: 'Signature',
      description: 'Iconic F&B favorites',
      gradient: 'linear-gradient(135deg, #7B9B8B 0%, #4A6B5B 50%, #2C4A3C 100%)',
    },
    {
      id: 'Archive',
      name: 'Archive',
      description: 'Historic restoration colors',
      gradient: 'linear-gradient(135deg, #C4A882 0%, #9B7B5B 50%, #6B5A4A 100%)',
    },
    {
      id: 'Carte Blanche',
      name: 'Carte Blanche',
      description: 'Pure whites & neutrals',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5F1EB 50%, #E8E2D9 100%)',
    },
    {
      id: 'New Colours',
      name: 'New Colours',
      description: 'Latest additions',
      gradient: 'linear-gradient(135deg, #B4C4D4 0%, #8BA4B8 50%, #5B7A8B 100%)',
    },
  ],
  LG: [
    {
      id: 'all',
      name: 'All Colours',
      description: 'Complete Little Greene palette',
      gradient: 'linear-gradient(135deg, #E8E4D9 0%, #4A5240 100%)',
    },
    {
      id: 'Colours of England',
      name: 'Colours of England',
      description: 'Historic British heritage',
      gradient: 'linear-gradient(135deg, #8B9B7B 0%, #5B6B4B 50%, #3B4A2B 100%)',
    },
    {
      id: 'Colour Scales',
      name: 'Colour Scales',
      description: 'Tonal gradations',
      gradient: 'linear-gradient(135deg, #A8B8C8 0%, #7B8B9B 50%, #4A5A6A 100%)',
    },
    {
      id: 'Sweet Treats',
      name: 'Sweet Treats',
      description: 'Delicious pastels',
      gradient: 'linear-gradient(135deg, #F0D4C8 0%, #E8B8A8 50%, #D49B8B 100%)',
    },
    {
      id: 'CS-Stone',
      name: 'Stone',
      description: 'Earthy natural tones',
      gradient: 'linear-gradient(135deg, #C8B8A8 0%, #A89888 50%, #887868 100%)',
    },
    {
      id: 'CS-Grey',
      name: 'Grey',
      description: 'Sophisticated neutrals',
      gradient: 'linear-gradient(135deg, #B8B8B8 0%, #8B8B8B 50%, #5B5B5B 100%)',
    },
  ],
};

// Brand accent colors for active state
const BRAND_ACCENTS: Record<string, { accent: string; bg: string }> = {
  BM: { accent: '#C9A86C', bg: '#2C2C2C' },
  FB: { accent: '#F5F1EB', bg: '#8B7355' },
  LG: { accent: '#E8E4D9', bg: '#4A5240' },
};

// Brand names for journal link
const BRAND_NAMES: Record<string, string> = {
  BM: 'Benjamin Moore',
  FB: 'Farrow & Ball',
  LG: 'Little Greene',
};

// Generate a gradient from actual hex colors
function generateGradientFromColors(hexCodes: string[]): string {
  if (!hexCodes || hexCodes.length === 0) {
    return 'linear-gradient(135deg, #888 0%, #444 100%)';
  }
  if (hexCodes.length === 1) {
    return `linear-gradient(135deg, ${hexCodes[0]} 0%, ${hexCodes[0]} 100%)`;
  }
  if (hexCodes.length === 2) {
    return `linear-gradient(135deg, ${hexCodes[0]} 0%, ${hexCodes[1]} 100%)`;
  }
  // For 3+ colors, create stops at even intervals
  const stops = hexCodes.map((hex, i) => {
    const percent = Math.round((i / (hexCodes.length - 1)) * 100);
    return `${hex} ${percent}%`;
  });
  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

// Fallback: Generate a gradient based on collection name (deterministic hash)
function generateGradientFallback(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 45%, 55%) 0%, hsl(${hue2}, 35%, 35%) 100%)`;
}

export default function BrandCollectionHero({
  brand,
  selectedCollection,
  onSelect,
  collectionCounts,
  sampleColors,
}: BrandCollectionHeroProps) {
  const predefinedCollections = BRAND_COLLECTIONS[brand] || [];
  const brandColors = BRAND_ACCENTS[brand];

  // Helper to get gradient for a collection (prefer real colors)
  const getCollectionGradient = (colId: string, fallbackGradient: string): string => {
    if (!sampleColors) return fallbackGradient;

    // For 'all', combine samples from all collections
    if (colId === 'all') {
      const allHexes: string[] = [];
      sampleColors.forEach((hexes) => {
        if (hexes.length > 0) allHexes.push(hexes[0]);
      });
      // Take first 5 distinct colors
      const unique = [...new Set(allHexes)].slice(0, 5);
      return unique.length > 0 ? generateGradientFromColors(unique) : fallbackGradient;
    }

    // Handle grouped collections for BM
    if (brand === 'BM') {
      if (colId === 'Color Trends' || colId === 'Affinity' || colId === 'Benjamin Moore Classics') {
        const matchingHexes: string[] = [];
        sampleColors.forEach((hexes, key) => {
          if (key.includes(colId) || (colId === 'Benjamin Moore Classics' && key.includes('Designer Classics'))) {
            matchingHexes.push(...hexes);
          }
        });
        return matchingHexes.length > 0
          ? generateGradientFromColors(matchingHexes.slice(0, 5))
          : fallbackGradient;
      }
    }

    // Handle LG partial matching
    if (brand === 'LG') {
      const matchingHexes: string[] = [];
      sampleColors.forEach((hexes, key) => {
        if (key.includes(colId)) {
          matchingHexes.push(...hexes);
        }
      });
      if (matchingHexes.length > 0) {
        return generateGradientFromColors(matchingHexes.slice(0, 5));
      }
    }

    // Direct match
    const hexes = sampleColors.get(colId);
    return hexes && hexes.length > 0 ? generateGradientFromColors(hexes) : fallbackGradient;
  };

  // Filter predefined collections that have colors
  const visiblePredefined = predefinedCollections.filter((col) => {
    if (col.id === 'all') return true;
    if (!collectionCounts) return true;

    // For BM, check partial matches (e.g., "Color Trends" matches "Color Trends 2024")
    if (brand === 'BM' && col.id === 'Color Trends') {
      return Array.from(collectionCounts.keys()).some((k) => k.includes('Color Trends'));
    }
    if (brand === 'BM' && col.id === 'Affinity') {
      return Array.from(collectionCounts.keys()).some((k) => k.includes('Affinity'));
    }
    if (brand === 'BM' && col.id === 'Benjamin Moore Classics') {
      return Array.from(collectionCounts.keys()).some((k) => k.includes('Benjamin Moore Classics'));
    }

    return (collectionCounts.get(col.id) || 0) > 0;
  });

  // Find additional collections in the data that aren't predefined
  const predefinedIds = new Set(predefinedCollections.map((c) => c.id));
  const dynamicCollections: CollectionCategory[] = [];

  if (collectionCounts) {
    collectionCounts.forEach((count, collectionName) => {
      if (count > 0 && !predefinedIds.has(collectionName)) {
        // Skip if this matches a grouped predefined collection
        if (brand === 'BM') {
          if (collectionName.includes('Color Trends')) return;
          if (collectionName.includes('Affinity')) return;
          if (collectionName.includes('Benjamin Moore Classics') || collectionName.includes('Designer Classics')) return;
        }
        // Add dynamic collection (gradient will be generated from sample colors)
        const hexes = sampleColors?.get(collectionName);
        dynamicCollections.push({
          id: collectionName,
          name: collectionName,
          description: `${count} colors`,
          gradient: hexes && hexes.length > 0
            ? generateGradientFromColors(hexes)
            : generateGradientFallback(collectionName),
        });
      }
    });
  }

  // Sort dynamic collections alphabetically
  dynamicCollections.sort((a, b) => a.name.localeCompare(b.name));

  // Combine predefined and dynamic collections
  const visibleCollections = [...visiblePredefined, ...dynamicCollections];

  // Get count for a collection (handling partial matches for BM)
  const getCount = (colId: string): number => {
    if (!collectionCounts) return 0;
    if (colId === 'all') {
      let total = 0;
      collectionCounts.forEach((v) => (total += v));
      return total;
    }

    // Handle BM partial matches
    if (brand === 'BM') {
      if (colId === 'Color Trends') {
        let sum = 0;
        collectionCounts.forEach((v, k) => {
          if (k.includes('Color Trends')) sum += v;
        });
        return sum;
      }
      if (colId === 'Affinity') {
        let sum = 0;
        collectionCounts.forEach((v, k) => {
          if (k.includes('Affinity')) sum += v;
        });
        return sum;
      }
      if (colId === 'Benjamin Moore Classics') {
        let sum = 0;
        collectionCounts.forEach((v, k) => {
          if (k.includes('Benjamin Moore Classics') || k.includes('Designer Classics')) sum += v;
        });
        return sum;
      }
    }

    // For LG, handle dual-membership collections
    if (brand === 'LG') {
      let sum = 0;
      collectionCounts.forEach((v, k) => {
        if (k.includes(colId)) sum += v;
      });
      return sum;
    }

    return collectionCounts.get(colId) || 0;
  };

  return (
    <section className="py-8">
      {/* Journal Link */}
      <div className="flex justify-end mb-4">
        <Link
          href={`/blog?brand=${brand}`}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: brandColors.bg }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Read {BRAND_NAMES[brand]} Articles
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {visibleCollections.map((collection, index) => {
          const isActive = selectedCollection === collection.id;
          const count = getCount(collection.id);

          return (
            <motion.button
              key={collection.id}
              onClick={() => onSelect(collection.id)}
              className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${
                isActive
                  ? 'ring-2 ring-offset-2 shadow-xl scale-[1.02]'
                  : 'hover:shadow-lg hover:scale-[1.01]'
              }`}
              style={{
                background: getCollectionGradient(collection.id, collection.gradient),
                ringColor: brandColors.accent,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glass overlay for text readability */}
              <div className="absolute inset-0 bg-black/20" />

              {/* Content */}
              <div className="relative z-10 min-h-[80px] flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm leading-tight drop-shadow-md">
                    {decodeHtmlEntities(collection.name)}
                  </h3>
                  <p className="text-white/80 text-xs mt-1 line-clamp-2 drop-shadow">
                    {decodeHtmlEntities(collection.description)}
                  </p>
                </div>

                {count > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-white text-xs font-medium">
                      {count} {count === 1 ? 'color' : 'colors'}
                    </span>
                  </div>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white"
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

// Helper function to check if a collection matches (for filtering)
export function matchesCollection(
  colorCollection: string | undefined,
  selectedId: string,
  brand: 'BM' | 'FB' | 'LG'
): boolean {
  if (selectedId === 'all') return true;
  if (!colorCollection) return false;

  // BM uses partial matching for grouped collections
  if (brand === 'BM') {
    if (selectedId === 'Color Trends') {
      return colorCollection.includes('Color Trends');
    }
    if (selectedId === 'Affinity') {
      return colorCollection.includes('Affinity');
    }
    if (selectedId === 'Benjamin Moore Classics') {
      return colorCollection.includes('Benjamin Moore Classics') || colorCollection.includes('Designer Classics');
    }
  }

  // LG uses includes for dual-membership
  if (brand === 'LG') {
    return colorCollection.includes(selectedId);
  }

  // FB uses exact matching
  return colorCollection === selectedId;
}
