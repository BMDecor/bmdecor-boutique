'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Droplets, Paintbrush, Palette, FlaskConical } from 'lucide-react';

interface ShopMenuProps {
  onNavigate: () => void;
}

// Surface-based navigation (Problem Solver archetype)
const SURFACES = [
  {
    href: '/shop/paint/interior',
    label: 'Interior Walls',
    description: 'Living rooms, bedrooms, hallways',
    icon: Paintbrush,
  },
  {
    href: '/shop/product/bm-aura-bath-spa-532',
    label: 'Kitchen & Bath',
    description: 'High-humidity resistant',
    icon: Droplets,
  },
  {
    href: '/shop/paint/trim-door',
    label: 'Trim & Doors',
    description: 'Furniture-grade finish',
    icon: Palette,
  },
  {
    href: '/shop/paint/exterior',
    label: 'Exterior Facade',
    description: 'Weather-resistant',
    icon: FlaskConical,
  },
];

// Brand navigation (Loyalist archetype)
const BRANDS = [
  {
    id: 'benjamin-moore',
    href: '/benjamin-moore',
    label: 'Benjamin Moore',
    color: '#C9A86C',
    description: 'Professional-Grade Innovation',
  },
  {
    id: 'farrow-ball',
    href: '/farrow-and-ball',
    label: 'Farrow & Ball',
    color: '#8B7355',
    description: 'British Heritage',
  },
  {
    id: 'little-greene',
    href: '/little-greene',
    label: 'Little Greene',
    color: '#4A5240',
    description: 'Eco-Conscious Excellence',
  },
];

// Essentials (The Pro archetype)
const ESSENTIALS = [
  { href: '/shop/paint/primer', label: 'Primers', description: 'Surface preparation' },
  { href: '/supplies', label: 'Tools & Supplies', description: 'Brushes, rollers, trays' },
  { href: '/search?type=sample', label: 'Color Samples', description: 'Test before you commit' },
];

/**
 * ShopMenu - The "Shop Engine" content for the Mega Menu
 * 4-column layout for Problem Solver, Loyalist, and Pro archetypes
 */
export default function ShopMenu({ onNavigate }: ShopMenuProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    onNavigate();
    router.push(href);
  };

  return (
    <div className="grid grid-cols-4 gap-8">
      {/* Column 1: By Surface (Problem Solver) */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C2C2C]/40 mb-4">
          By Surface
        </h3>
        <ul className="space-y-1">
          {SURFACES.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleNavigation(item.href)}
                className="group flex items-start gap-3 w-full p-2 rounded-lg hover:bg-[#FAF8F5] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[#C9A86C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#C9A86C]/20 transition-colors">
                  <item.icon className="w-4 h-4 text-[#C9A86C]" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-[#2C2C2C] group-hover:text-[#C9A86C] transition-colors">
                    {item.label}
                  </span>
                  <span className="block text-xs text-[#2C2C2C]/50">
                    {item.description}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 2: By Brand (Loyalist) */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C2C2C]/40 mb-4">
          Brand Houses
        </h3>
        <ul className="space-y-1">
          {BRANDS.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => handleNavigation(brand.href)}
                className="group flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#FAF8F5] transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: brand.color }}
                />
                <div>
                  <span className="block text-sm font-medium text-[#2C2C2C] group-hover:text-[#C9A86C] transition-colors">
                    {brand.label}
                  </span>
                  <span className="block text-xs text-[#2C2C2C]/50">
                    {brand.description}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Column 3: Essentials (The Pro) */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2C2C2C]/40 mb-4">
          Essentials
        </h3>
        <ul className="space-y-1">
          {ESSENTIALS.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleNavigation(item.href)}
                className="group block w-full p-2 rounded-lg hover:bg-[#FAF8F5] transition-colors text-left"
              >
                <span className="block text-sm font-medium text-[#2C2C2C] group-hover:text-[#C9A86C] transition-colors">
                  {item.label}
                </span>
                <span className="block text-xs text-[#2C2C2C]/50">
                  {item.description}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Quick Links */}
        <div className="mt-6 pt-4 border-t border-[#E8E2D9]">
          <button
            onClick={() => handleNavigation('/services')}
            className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors flex items-center gap-1"
          >
            Color Consultation
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Column 4: Featured Product */}
      <div>
        <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F5F3F0] rounded-xl p-5 h-full flex flex-col">
          <span className="text-xs font-medium text-[#C9A86C] uppercase tracking-wide">
            Featured Solution
          </span>
          <h4 className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C] mt-2">
            Aura Bath & Spa
          </h4>
          <p className="text-xs text-[#2C2C2C]/60 mt-2 flex-1">
            Formulated for high-humidity environments. Mildew-resistant with Color Lock® technology.
          </p>

          {/* Color Preview */}
          <div className="flex gap-1 my-4">
            {['#E8E2D9', '#B5A99A', '#5D8A8E', '#2C3E50'].map((color) => (
              <div
                key={color}
                className="w-6 h-6 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <button
            onClick={() => handleNavigation('/shop/product/bm-aura-bath-spa-532')}
            className="w-full py-2.5 bg-[#2C2C2C] text-white text-sm font-medium rounded-lg hover:bg-[#C9A86C] transition-colors"
          >
            Shop Solution
          </button>
        </div>
      </div>
    </div>
  );
}
